import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  uploadString 
} from "firebase/storage";
import { db, storage } from "./firebase.js";

/**
 * 1. Formata o nickname para minúsculas e sem nenhum espaço,
 * garantindo consistência no ID do documento do Firestore.
 * 
 * Exemplo: " Maria Silva " -> "mariasilva"
 *
 * @param {string} rawNickname
 * @returns {string}
 */
export function formatNickname(rawNickname) {
  if (!rawNickname || typeof rawNickname !== "string") {
    throw new Error("Nickname inválido fornecido.");
  }
  return rawNickname
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/**
 * Faz o upload da assinatura digital para o Firebase Storage.
 * Respeita a regra de segurança: imagens <= 2MB e tipos de imagem permitidos.
 * 
 * Observação: Como a regra de segurança bloqueia leitura pública (allow read: if false),
 * armazenamos a URI de referência do Storage (ex: assinaturas/mariasilva_1710000000.png)
 * que pode ser auditada e visualizada diretamente pelo pesquisador no Console do Firebase.
 *
 * @param {string|Blob} signatureData - Data URL em base64 (canvas) ou Blob da imagem
 * @param {string} formattedNickname - Nickname já formatado
 * @returns {Promise<string>} Caminho de referência do arquivo gravado
 */
export async function uploadAssinatura(signatureData, formattedNickname) {
  const timestamp = Date.now();
  const filePath = `assinaturas/${formattedNickname}_${timestamp}.png`;
  const storageRef = ref(storage, filePath);

  if (typeof signatureData === "string" && signatureData.startsWith("data:")) {
    // Validação de tamanho no cliente para Data URL base64 (< 2MB)
    const base64Length = signatureData.length - (signatureData.indexOf(",") + 1);
    const approximateBytes = (base64Length * 3) / 4;
    if (approximateBytes > 2 * 1024 * 1024) {
      throw new Error("O arquivo de assinatura ultrapassa o limite máximo permitido de 2MB.");
    }

    // Upload via uploadString no formato data_url
    await uploadString(storageRef, signatureData, "data_url", {
      contentType: "image/png"
    });
  } else if (signatureData instanceof Blob) {
    if (signatureData.size > 2 * 1024 * 1024) {
      throw new Error("O arquivo de assinatura ultrapassa o limite máximo permitido de 2MB.");
    }
    await uploadBytes(storageRef, signatureData, {
      contentType: signatureData.type || "image/png"
    });
  } else {
    throw new Error("Formato de assinatura inválido. Esperado Data URL base64 ou Blob.");
  }

  return filePath;
}

/**
 * 2. Salva o documento do jogador no Firestore.
 * - Utiliza o nickname formatado (minúsculas, sem espaço) como ID do documento.
 * - Garante estritamente os campos: nickname, assinaturaUrl, pontuacao, tempoSegundos.
 * - Evita duplicatas: Se o ID já existir, a Security Rule ou a checagem local recusam a gravação.
 *
 * @param {Object} params
 * @param {string} params.nickname - Nickname digitado pelo usuário
 * @param {string} params.assinaturaUrl - Caminho ou URL da assinatura armazenada
 * @param {number} params.pontuacao - Pontuação atingida no quiz
 * @param {number} params.tempoSegundos - Tempo total decorrido em segundos (> 0)
 * @returns {Promise<{ id: string, message: string }>}
 */
export async function salvarJogador({ nickname, assinaturaUrl, pontuacao, tempoSegundos }) {
  const idDocumento = formatNickname(nickname);

  // Validação dos tipos de dados exigidos pelas Security Rules
  if (!idDocumento) {
    throw new Error("O nickname não pode ser vazio.");
  }
  if (typeof assinaturaUrl !== "string" || !assinaturaUrl) {
    throw new Error("A assinaturaUrl deve ser uma string não vazia.");
  }
  const pontuacaoNum = Number(pontuacao);
  if (Number.isNaN(pontuacaoNum)) {
    throw new Error("A pontuação deve ser um número válido.");
  }
  const tempoNum = Number(tempoSegundos);
  if (Number.isNaN(tempoNum) || tempoNum <= 0) {
    throw new Error("O tempoSegundos deve ser um número maior que zero.");
  }

  const docRef = doc(db, "jogadores", idDocumento);

  // Opcional: verificação prévia no cliente para feedback mais amigável e imediato
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      throw new Error(`O nickname "${idDocumento}" já está em uso por outro participante. Por favor, escolha um nickname diferente.`);
    }
  } catch (err) {
    // Se o erro já foi a detecção de existência, repassa
    if (err.message.includes("já está em uso")) {
      throw err;
    }
    // Caso contrário continua para tentar salvar via regra do Firestore
  }

  // Prepara estritamente os campos autorizados pelas Security Rules
  const payload = {
    nickname: nickname.trim(),
    assinaturaUrl,
    pontuacao: pontuacaoNum,
    tempoSegundos: tempoNum
  };

  try {
    // setDoc grava com o ID personalizado (o próprio nickname formatado)
    await setDoc(docRef, payload);
    return {
      id: idDocumento,
      message: "Registro gravado com sucesso no ranking!"
    };
  } catch (error) {
    // Se a regra de segurança bloquear por existência de ID (allow create: if !exists)
    if (error.code === "permission-denied") {
      throw new Error(
        `Não foi possível registrar: o nickname "${idDocumento}" já existe ou os campos enviados violaram as regras de segurança.`
      );
    }
    throw error;
  }
}

/**
 * 3. Query do ranking buscando a coleção 'jogadores'
 * - Ordenada por pontuacao (decrescente: maior para menor)
 * - Desempate por tempoSegundos (crescente: menor tempo primeiro)
 *
 * NOTA: Requer índice composto no Firestore (pontuacao DESC, tempoSegundos ASC).
 * O arquivo firestore.indexes.json já inclui a definição deste índice.
 *
 * @param {number} maxResults - Quantidade máxima de posições retornadas (padrão: 50)
 * @returns {Promise<Array<{ id: string, nickname: string, pontuacao: number, tempoSegundos: number, posicao: number }>>}
 */
export async function buscarRanking(maxResults = 50) {
  const rankingQuery = query(
    collection(db, "jogadores"),
    orderBy("pontuacao", "desc"),
    orderBy("tempoSegundos", "asc"),
    limit(maxResults)
  );

  const querySnapshot = await getDocs(rankingQuery);
  const ranking = [];

  let posicao = 1;
  querySnapshot.forEach((docSnap) => {
    ranking.push({
      id: docSnap.id,
      ...docSnap.data(),
      posicao: posicao++
    });
  });

  return ranking;
}

/**
 * 4. Assinatura em tempo real (Realtime Listener) do ranking
 * Permite que a tela do ranking se atualize automaticamente conforme novos jogadores finalizam.
 *
 * @param {function(Array): void} onUpdate - Callback disparado a cada atualização
 * @param {function(Error): void} onError - Callback disparado em caso de erro
 * @param {number} maxResults - Quantidade máxima de registros
 * @returns {function(): void} Função de unsubscribe para desmontar o listener
 */
export function ouvirRankingEmTempoReal(onUpdate, onError, maxResults = 50) {
  const rankingQuery = query(
    collection(db, "jogadores"),
    orderBy("pontuacao", "desc"),
    orderBy("tempoSegundos", "asc"),
    limit(maxResults)
  );

  return onSnapshot(
    rankingQuery,
    (querySnapshot) => {
      const ranking = [];
      let posicao = 1;
      querySnapshot.forEach((docSnap) => {
        ranking.push({
          id: docSnap.id,
          ...docSnap.data(),
          posicao: posicao++
        });
      });
      onUpdate(ranking);
    },
    (error) => {
      if (onError) onError(error);
      else console.error("Erro ao escutar ranking em tempo real:", error);
    }
  );
}
