import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase.js";
import { CATEGORIES, QUIZ_QUESTIONS, BONUS_QUESTIONS } from "../data/questions.js";
import { formatNickname } from "./jogadorService.js";

const COLLECTION_SESSOES = "sessoes_pesquisa";

/**
 * Gera um identificador único e determinístico para cada sessão de utilização,
 * combinando timestamp em milissegundos e sufixo aleatório alfanumérico.
 * Não utiliza dados pessoais identificáveis.
 *
 * @returns {string} Ex: "sessao_1730764800000_k9x2m4p1"
 */
export function gerarSessionId() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `sessao_${timestamp}_${randomPart}`;
}

/**
 * Calcula o desempenho detalhado geral e agrupado por categoria temática
 * a partir do mapa de respostas do participante.
 *
 * @param {Object} userAnswers - Mapa { [questionId]: { selectedOpt, isCorrect, tempoRespostaMs, respondidaEm } }
 * @returns {Object} Estrutura consolidada de desempenho e tempos do quiz
 */
export function consolidarMetricasQuiz(userAnswers = {}) {
  const porCategoria = {};

  Object.entries(CATEGORIES).forEach(([catKey, catInfo]) => {
    const totalNaCategoria = QUIZ_QUESTIONS.filter((q) => q.category === catKey).length;
    porCategoria[catKey] = {
      id: catInfo.id,
      nome: catInfo.name,
      totalQuestoes: totalNaCategoria,
      respondidas: 0,
      acertos: 0,
      erros: 0,
      percentualAcerto: 0,
      tempoTotalMs: 0,
      tempoMedioMs: 0
    };
  });

  const respostasDetalhadas = {};
  let totalRespondidas = 0;
  let totalAcertos = 0;
  let totalErros = 0;
  let somaTempoQuizMs = 0;

  QUIZ_QUESTIONS.forEach((question) => {
    const ans = userAnswers[question.id];
    if (!ans || !ans.selectedOpt) return;

    const acertou = Boolean(ans.isCorrect);
    const tempoMs = Math.max(1, Number(ans.tempoRespostaMs) || 0);

    totalRespondidas += 1;
    if (acertou) totalAcertos += 1;
    else totalErros += 1;
    somaTempoQuizMs += tempoMs;

    respostasDetalhadas[String(question.id)] = {
      questaoId: question.id,
      categoria: question.category,
      alternativaEscolhida: String(ans.selectedOpt),
      alternativaCorreta: question.correctAnswer,
      acertou,
      tempoRespostaMs: tempoMs,
      respondidaEm: ans.respondidaEm || null
    };

    const catStats = porCategoria[question.category];
    if (catStats) {
      catStats.respondidas += 1;
      if (acertou) catStats.acertos += 1;
      else catStats.erros += 1;
      catStats.tempoTotalMs += tempoMs;
    }
  });

  Object.values(porCategoria).forEach((catStats) => {
    if (catStats.respondidas > 0) {
      catStats.percentualAcerto = Math.round((catStats.acertos / catStats.respondidas) * 100);
      catStats.tempoMedioMs = Math.round(catStats.tempoTotalMs / catStats.respondidas);
    }
  });

  const totalQuestoes = QUIZ_QUESTIONS.length;
  const percentualAcerto =
    totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  const tempoMedioPorQuestaoMs =
    totalRespondidas > 0 ? Math.round(somaTempoQuizMs / totalRespondidas) : 0;

  return {
    respostasQuiz: respostasDetalhadas,
    desempenho: {
      questoesRespondidas: totalRespondidas,
      totalQuestoes,
      acertos: totalAcertos,
      erros: totalErros,
      percentualAcerto,
      porCategoria
    },
    temposQuiz: {
      duracaoQuizSegundos: Math.round(somaTempoQuizMs / 1000),
      tempoTotalQuizMs: somaTempoQuizMs,
      tempoMedioPorQuestaoMs
    }
  };
}

/**
 * Formata o mapa de respostas das perguntas bônus reflexivas.
 *
 * @param {Object} bonusAnswers - Mapa { [bonusId]: { selectedOpt, tempoRespostaMs, respondidaEm } | string }
 * @returns {Object}
 */
export function consolidarRespostasBonus(bonusAnswers = {}) {
  const resultado = {};

  BONUS_QUESTIONS.forEach((bonus) => {
    const raw = bonusAnswers[bonus.id];
    if (!raw) return;

    if (typeof raw === "string") {
      resultado[bonus.id] = {
        perguntaId: bonus.id,
        alternativaEscolhida: raw,
        tempoRespostaMs: 0,
        respondidaEm: null
      };
    } else if (typeof raw === "object" && raw.selectedOpt) {
      resultado[bonus.id] = {
        perguntaId: bonus.id,
        alternativaEscolhida: String(raw.selectedOpt),
        tempoRespostaMs: Math.max(0, Number(raw.tempoRespostaMs) || 0),
        respondidaEm: raw.respondidaEm || null
      };
    }
  });

  return resultado;
}

/**
 * Constrói o documento completo e validado de métricas de uma sessão
 * para persistência na coleção 'sessoes_pesquisa' e para exportação JSON.
 *
 * @param {Object} params
 * @returns {Object} Payload estruturado da sessão
 */
export function construirPayloadSessao({
  sessionId,
  status,
  nickname,
  assinaturaUrl = null,
  consentRecord = null,
  userAnswers = {},
  bonusAnswers = {},
  dropoutData = null,
  timestamps = {},
  engajamento = {}
}) {
  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("sessionId é obrigatório para registrar métricas da sessão.");
  }

  const statusValidos = ["concluida", "desistencia"];
  const statusFinal = statusValidos.includes(status) ? status : "concluida";

  const agoraIso = new Date().toISOString();
  const inicioIso = timestamps.sessaoIniciadaEm || agoraIso;
  const fimIso = timestamps.sessaoFinalizadaEm || agoraIso;

  const duracaoTotalSegundos = Math.max(
    1,
    Math.round((new Date(fimIso).getTime() - new Date(inicioIso).getTime()) / 1000)
  );

  const { respostasQuiz, desempenho, temposQuiz } = consolidarMetricasQuiz(userAnswers);
  const respostasBonus = consolidarRespostasBonus(bonusAnswers);

  let jogadorId = null;
  let nicknameLimpo = null;
  if (nickname && typeof nickname === "string" && nickname.trim().length > 0) {
    nicknameLimpo = nickname.trim();
    try {
      jogadorId = formatNickname(nicknameLimpo);
    } catch {
      jogadorId = null;
    }
  }

  const consentimento = consentRecord
    ? {
        aceito: true,
        caae: consentRecord.caae || "94717525.4.0000.5690",
        aceitoEm: consentRecord.acceptedAt || timestamps.tcleAceitoEm || null
      }
    : {
        aceito: false,
        caae: "94717525.4.0000.5690",
        aceitoEm: null
      };

  const desistencia = dropoutData
    ? {
        motivoId: String(dropoutData.reasonId || "no_comment"),
        motivoLabel: String(dropoutData.reasonLabel || "Nada a declarar"),
        telaOuQuestaoDeSaida: String(dropoutData.screenAtExit || "UNKNOWN"),
        questaoAtualIdx:
          typeof dropoutData.questionIdx === "number" ? dropoutData.questionIdx : null,
        questoesRespondidasAteSaida: desempenho.questoesRespondidas,
        tempoAteSaidaSegundos: duracaoTotalSegundos,
        registradaEm: dropoutData.timestamp || fimIso
      }
    : null;

  return {
    sessionId,
    status: statusFinal,
    jogadorId,
    nickname: nicknameLimpo,
    assinaturaUrl: assinaturaUrl || null,
    consentimento,
    sessaoFinalizadaEm: fimIso,
    timestamps: {
      sessaoIniciadaEm: inicioIso,
      avisoConteudoAceitoEm: timestamps.avisoConteudoAceitoEm || null,
      tcleAceitoEm: consentimento.aceitoEm,
      quizIniciadoEm: timestamps.quizIniciadoEm || null,
      bonusIniciadoEm: timestamps.bonusIniciadoEm || null,
      sessaoFinalizadaEm: fimIso,
      atualizadoEm: agoraIso
    },
    tempos: {
      duracaoTotalSegundos,
      duracaoQuizSegundos: temposQuiz.duracaoQuizSegundos,
      tempoTotalQuizMs: temposQuiz.tempoTotalQuizMs,
      tempoMedioPorQuestaoMs: temposQuiz.tempoMedioPorQuestaoMs
    },
    desempenho,
    respostasQuiz,
    respostasBonus,
    desistencia,
    engajamento: {
      tentativasSaidaCanceladas: Number(engajamento.tentativasSaidaCanceladas) || 0,
      alteracoesAudioMute: Number(engajamento.alteracoesAudioMute) || 0,
      abriuRevisaoGabarito: Number(engajamento.abriuRevisaoGabarito) || 0,
      filtrosRevisaoUtilizados: Array.isArray(engajamento.filtrosRevisaoUtilizados)
        ? engajamento.filtrosRevisaoUtilizados
        : [],
      abriuRanking: Number(engajamento.abriuRanking) || 0,
      exportouJson: Number(engajamento.exportouJson) || 0
    }
  };
}

/**
 * Salva as métricas completas da sessão na coleção 'sessoes_pesquisa' do Firestore.
 * Previne duplicidade utilizando o `sessionId` como chave determinística do documento,
 * validada pelas Security Rules (`!exists(...)`).
 *
 * @param {Object} params - Mesmos parâmetros de construirPayloadSessao
 * @returns {Promise<{ sessionId: string, payload: Object }>}
 */
export async function salvarSessaoPesquisa(params) {
  const payload = construirPayloadSessao(params);
  const docRef = doc(db, COLLECTION_SESSOES, payload.sessionId);

  await setDoc(docRef, payload);
  return {
    sessionId: payload.sessionId,
    payload
  };
}

/**
 * Atualiza de forma assíncrona e não-bloqueante os indicadores de engajamento pós-jogo
 * (ex: abrir revisão de gabarito, consultar ranking ou exportar JSON na tela de conclusão).
 *
 * @param {string} sessionId
 * @param {Object} engajamentoAtualizado
 * @returns {Promise<void>}
 */
export async function atualizarEngajamentoSessao(sessionId, engajamentoAtualizado) {
  if (!sessionId || typeof sessionId !== "string") return;

  try {
    const docRef = doc(db, COLLECTION_SESSOES, sessionId);
    await updateDoc(docRef, {
      engajamento: {
        tentativasSaidaCanceladas: Number(engajamentoAtualizado.tentativasSaidaCanceladas) || 0,
        alteracoesAudioMute: Number(engajamentoAtualizado.alteracoesAudioMute) || 0,
        abriuRevisaoGabarito: Number(engajamentoAtualizado.abriuRevisaoGabarito) || 0,
        filtrosRevisaoUtilizados: Array.isArray(engajamentoAtualizado.filtrosRevisaoUtilizados)
          ? engajamentoAtualizado.filtrosRevisaoUtilizados
          : [],
        abriuRanking: Number(engajamentoAtualizado.abriuRanking) || 0,
        exportouJson: Number(engajamentoAtualizado.exportouJson) || 0
      },
      "timestamps.atualizadoEm": new Date().toISOString()
    });
  } catch (err) {
    console.warn("Aviso ao atualizar métricas de engajamento da sessão:", err);
  }
}

/**
 * Consulta sessões registradas na coleção 'sessoes_pesquisa' para análises futuras.
 * Requer autenticação administrativa conforme definido em firestore.rules.
 *
 * @param {Object} options
 * @param {string} [options.status] - Filtrar opcionalmente por 'concluida' ou 'desistencia'
 * @param {number} [options.maxResults=200] - Limite máximo de documentos retornados
 * @returns {Promise<Array<Object>>}
 */
export async function buscarSessoesPesquisa({ status = null, maxResults = 200 } = {}) {
  const colRef = collection(db, COLLECTION_SESSOES);
  let q;

  if (status) {
    q = query(
      colRef,
      where("status", "==", status),
      orderBy("sessaoFinalizadaEm", "desc"),
      limit(maxResults)
    );
  } else {
    q = query(colRef, orderBy("sessaoFinalizadaEm", "desc"), limit(maxResults));
  }

  const snapshot = await getDocs(q);
  const sessoes = [];
  snapshot.forEach((docSnap) => {
    sessoes.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  return sessoes;
}

/**
 * Escuta em tempo real (Realtime Listener) os registros da coleção 'sessoes_pesquisa'.
 * Atualiza automaticamente o Painel Administrativo quando novas sessões são gravadas.
 *
 * @param {function(Array<Object>): void} onUpdate
 * @param {function(Error): void} [onError]
 * @param {number} [maxResults=500]
 * @returns {function(): void} Função de unsubscribe
 */
export function ouvirSessoesPesquisaEmTempoReal(onUpdate, onError, maxResults = 500) {
  const colRef = collection(db, COLLECTION_SESSOES);
  const q = query(colRef, orderBy("sessaoFinalizadaEm", "desc"), limit(maxResults));

  return onSnapshot(
    q,
    (snapshot) => {
      const sessoes = [];
      snapshot.forEach((docSnap) => {
        sessoes.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      onUpdate(sessoes);
    },
    (error) => {
      if (onError) onError(error);
      else console.error("Erro ao escutar sessoes_pesquisa em tempo real:", error);
    }
  );
}

/**
 * Busca uma sessão específica pelo seu identificador único (`sessionId`).
 *
 * @param {string} sessionId
 * @returns {Promise<Object|null>}
 */
export async function buscarSessaoPorId(sessionId) {
  if (!sessionId) return null;
  const docRef = doc(db, COLLECTION_SESSOES, sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Calcula estatísticas agregadas resumidas a partir de uma lista de sessões.
 *
 * @param {Array<Object>} sessoes
 * @returns {Object} Resumo analítico das sessões
 */
export function calcularResumoMetricas(sessoes = []) {
  const totalSessoes = sessoes.length;
  const concluidas = sessoes.filter((s) => s.status === "concluida");
  const desistencias = sessoes.filter((s) => s.status === "desistencia");

  const motivosDesistencia = {};
  desistencias.forEach((s) => {
    const motivo = s.desistencia?.motivoId || "nao_informado";
    motivosDesistencia[motivo] = (motivosDesistencia[motivo] || 0) + 1;
  });

  const mediaPontuacao =
    concluidas.length > 0
      ? Number(
          (
            concluidas.reduce((acc, s) => acc + (s.desempenho?.acertos || 0), 0) /
            concluidas.length
          ).toFixed(2)
        )
      : 0;

  const mediaDuracaoSegundos =
    concluidas.length > 0
      ? Math.round(
          concluidas.reduce((acc, s) => acc + (s.tempos?.duracaoTotalSegundos || 0), 0) /
            concluidas.length
        )
      : 0;

  return {
    totalSessoes,
    totalConcluidas: concluidas.length,
    totalDesistencias: desistencias.length,
    taxaConclusaoPercentual:
      totalSessoes > 0 ? Math.round((concluidas.length / totalSessoes) * 100) : 0,
    mediaPontuacaoConcluidas: mediaPontuacao,
    mediaDuracaoConcluidasSegundos: mediaDuracaoSegundos,
    motivosDesistencia
  };
}

/**
 * Calcula o conjunto analítico completo para renderização dos gráficos, KPIs,
 * tabelas e indicadores de proporção do Painel Administrativo, utilizando
 * estritamente os registros reais armazenados no banco de dados.
 *
 * @param {Array<Object>} sessoes - Documentos reais da coleção 'sessoes_pesquisa'
 * @param {string} [filtroCategoria='ALL'] - Chave de categoria opcional para filtrar questões
 * @returns {Object}
 */
export function calcularAnaliticoCompleto(sessoes = [], filtroCategoria = "ALL") {
  const totalSessoes = sessoes.length;
  const concluidas = sessoes.filter((s) => s.status === "concluida");
  const desistencias = sessoes.filter((s) => s.status === "desistencia");

  const taxaConclusao =
    totalSessoes > 0 ? Math.round((concluidas.length / totalSessoes) * 100) : 0;
  const taxaDesistencia = totalSessoes > 0 ? 100 - taxaConclusao : 0;

  // Pontuação e tempos nas sessões concluídas
  const somaAcertosConcluidas = concluidas.reduce(
    (acc, s) => acc + (Number(s.desempenho?.acertos) || 0),
    0
  );
  const mediaPontuacao =
    concluidas.length > 0 ? Number((somaAcertosConcluidas / concluidas.length).toFixed(1)) : 0;
  const percentualMedioAcerto =
    concluidas.length > 0
      ? Math.round((mediaPontuacao / QUIZ_QUESTIONS.length) * 100)
      : 0;

  const somaDuracaoConcluidas = concluidas.reduce(
    (acc, s) => acc + (Number(s.tempos?.duracaoTotalSegundos) || 0),
    0
  );
  const mediaDuracaoSegundos =
    concluidas.length > 0 ? Math.round(somaDuracaoConcluidas / concluidas.length) : 0;

  // Tempo médio por questão considerando todas as sessões que responderam ao menos 1 questão
  let totalQuestoesRespondidasGlobal = 0;
  let somaTempoRespostasGlobalMs = 0;
  sessoes.forEach((s) => {
    const qResp = Number(s.desempenho?.questoesRespondidas) || 0;
    const tTotalMs = Number(s.tempos?.tempoTotalQuizMs) || 0;
    totalQuestoesRespondidasGlobal += qResp;
    somaTempoRespostasGlobalMs += tTotalMs;
  });
  const tempoMedioPorQuestaoMs =
    totalQuestoesRespondidasGlobal > 0
      ? Math.round(somaTempoRespostasGlobalMs / totalQuestoesRespondidasGlobal)
      : 0;

  // Consentimento TCLE
  const totalTcleAceito = sessoes.filter((s) => s.consentimento?.aceito === true).length;
  const taxaAceiteTcle =
    totalSessoes > 0 ? Math.round((totalTcleAceito / totalSessoes) * 100) : 0;

  // 1. Evolução Temporal (agrupada por dia YYYY-MM-DD)
  const mapaPorDia = {};
  sessoes.forEach((s) => {
    const dataIso =
      s.sessaoFinalizadaEm ||
      s.timestamps?.sessaoFinalizadaEm ||
      s.timestamps?.sessaoIniciadaEm;
    if (!dataIso) return;
    const diaKey = dataIso.substring(0, 10); // YYYY-MM-DD
    if (!mapaPorDia[diaKey]) {
      mapaPorDia[diaKey] = {
        diaKey,
        dataFormatada: diaKey.split("-").reverse().join("/"),
        total: 0,
        concluidas: 0,
        desistencias: 0,
        somaAcertos: 0,
        mediaAcertos: 0
      };
    }
    mapaPorDia[diaKey].total += 1;
    if (s.status === "concluida") {
      mapaPorDia[diaKey].concluidas += 1;
      mapaPorDia[diaKey].somaAcertos += Number(s.desempenho?.acertos) || 0;
    } else {
      mapaPorDia[diaKey].desistencias += 1;
    }
  });

  const evolucaoTemporal = Object.values(mapaPorDia)
    .sort((a, b) => a.diaKey.localeCompare(b.diaKey))
    .map((item) => ({
      ...item,
      mediaAcertos:
        item.concluidas > 0 ? Number((item.somaAcertos / item.concluidas).toFixed(1)) : 0
    }));

  // 2. Desempenho por Categoria Temática
  const desempenhoPorCategoria = Object.entries(CATEGORIES).map(([catKey, catInfo]) => {
    let respondidas = 0;
    let acertos = 0;
    let erros = 0;
    let tempoTotalMs = 0;

    sessoes.forEach((s) => {
      const catData = s.desempenho?.porCategoria?.[catKey];
      if (catData) {
        respondidas += Number(catData.respondidas) || 0;
        acertos += Number(catData.acertos) || 0;
        erros += Number(catData.erros) || 0;
        tempoTotalMs += Number(catData.tempoTotalMs) || 0;
      }
    });

    const percentualAcerto = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;
    const tempoMedioMs = respondidas > 0 ? Math.round(tempoTotalMs / respondidas) : 0;

    return {
      key: catKey,
      id: catInfo.id,
      nome: catInfo.name,
      badge: catInfo.badge,
      icon: catInfo.icon,
      color: catInfo.color,
      respondidas,
      acertos,
      erros,
      percentualAcerto,
      tempoMedioMs,
      tempoMedioSegundos: Number((tempoMedioMs / 1000).toFixed(1))
    };
  });

  // 3. Estatísticas Detalhadas por Questão (1 a 24)
  const questoesFiltradas =
    filtroCategoria && filtroCategoria !== "ALL"
      ? QUIZ_QUESTIONS.filter((q) => q.category === filtroCategoria)
      : QUIZ_QUESTIONS;

  const estatisticasPorQuestao = questoesFiltradas.map((q) => {
    let respondidas = 0;
    let acertos = 0;
    let erros = 0;
    let somaTempoMs = 0;
    const contagemOpcoes = { A: 0, B: 0, C: 0 };

    sessoes.forEach((s) => {
      const resp = s.respostasQuiz?.[String(q.id)];
      if (!resp || !resp.alternativaEscolhida) return;

      respondidas += 1;
      if (resp.acertou) acertos += 1;
      else erros += 1;
      somaTempoMs += Number(resp.tempoRespostaMs) || 0;

      const opt = String(resp.alternativaEscolhida).toUpperCase();
      if (contagemOpcoes[opt] !== undefined) {
        contagemOpcoes[opt] += 1;
      }
    });

    const taxaAcerto = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;
    const tempoMedioMs = respondidas > 0 ? Math.round(somaTempoMs / respondidas) : 0;

    return {
      id: q.id,
      pergunta: q.question,
      categoriaKey: q.category,
      categoriaNome: CATEGORIES[q.category]?.name || q.category,
      categoriaBadge: CATEGORIES[q.category]?.badge || q.category,
      categoriaColor: CATEGORIES[q.category]?.color || "#3b82f6",
      correta: q.correctAnswer,
      respondidas,
      acertos,
      erros,
      taxaAcerto,
      tempoMedioMs,
      tempoMedioSegundos: Number((tempoMedioMs / 1000).toFixed(1)),
      contagemOpcoes,
      percentualOpcoes: {
        A: respondidas > 0 ? Math.round((contagemOpcoes.A / respondidas) * 100) : 0,
        B: respondidas > 0 ? Math.round((contagemOpcoes.B / respondidas) * 100) : 0,
        C: respondidas > 0 ? Math.round((contagemOpcoes.C / respondidas) * 100) : 0
      }
    };
  });

  // 4. Estatísticas das Perguntas Bônus Reflexivas
  const estatisticasBonus = BONUS_QUESTIONS.map((bonus) => {
    let totalRespostas = 0;
    let somaTempoMs = 0;
    const contagemOpcoes = { A: 0, B: 0, C: 0 };

    sessoes.forEach((s) => {
      const bResp = s.respostasBonus?.[bonus.id];
      if (!bResp || !bResp.alternativaEscolhida) return;
      totalRespostas += 1;
      somaTempoMs += Number(bResp.tempoRespostaMs) || 0;
      const opt = String(bResp.alternativaEscolhida).toUpperCase();
      if (contagemOpcoes[opt] !== undefined) {
        contagemOpcoes[opt] += 1;
      }
    });

    const tempoMedioMs = totalRespostas > 0 ? Math.round(somaTempoMs / totalRespostas) : 0;

    return {
      id: bonus.id,
      titulo: bonus.title,
      pergunta: bonus.question,
      totalRespostas,
      tempoMedioSegundos: Number((tempoMedioMs / 1000).toFixed(1)),
      opcoes: bonus.options.map((opt) => {
        const qtd = contagemOpcoes[opt.id] || 0;
        const pct = totalRespostas > 0 ? Math.round((qtd / totalRespostas) * 100) : 0;
        return {
          id: opt.id,
          texto: opt.text,
          quantidade: qtd,
          percentual: pct
        };
      })
    };
  });

  // 5. Análise de Desistências (Motivos Emocionais e Telas de Saída)
  const catalogoMotivos = {
    felt_bad: { id: "felt_bad", label: "Me senti mal", color: "#f59e0b", emoji: "🥺" },
    disliked_topic: {
      id: "disliked_topic",
      label: "Não gostei do assunto",
      color: "#3b82f6",
      emoji: "😒"
    },
    heavy_topic: {
      id: "heavy_topic",
      label: "Achei um tema pesado",
      color: "#8b5cf6",
      emoji: "😰"
    },
    no_comment: {
      id: "no_comment",
      label: "Nada a declarar",
      color: "#64748b",
      emoji: "😐"
    }
  };

  const contagemMotivos = {
    felt_bad: 0,
    disliked_topic: 0,
    heavy_topic: 0,
    no_comment: 0
  };
  const contagemTelasSaida = {};
  let somaTempoAteSaida = 0;

  desistencias.forEach((s) => {
    const mId = s.desistencia?.motivoId || "no_comment";
    if (contagemMotivos[mId] !== undefined) {
      contagemMotivos[mId] += 1;
    } else {
      contagemMotivos.no_comment += 1;
    }

    const tela = s.desistencia?.telaOuQuestaoDeSaida || "DESCONHECIDO";
    contagemTelasSaida[tela] = (contagemTelasSaida[tela] || 0) + 1;
    somaTempoAteSaida += Number(s.desistencia?.tempoAteSaidaSegundos || s.tempos?.duracaoTotalSegundos) || 0;
  });

  const motivosDesistenciaDetalhados = Object.values(catalogoMotivos).map((info) => {
    const quantidade = contagemMotivos[info.id] || 0;
    const percentual =
      desistencias.length > 0 ? Math.round((quantidade / desistencias.length) * 100) : 0;
    return {
      ...info,
      quantidade,
      percentual
    };
  });

  const telasDeSaidaOrdenadas = Object.entries(contagemTelasSaida)
    .map(([tela, quantidade]) => ({
      tela,
      quantidade,
      percentual:
        desistencias.length > 0 ? Math.round((quantidade / desistencias.length) * 100) : 0
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // 6. Funil de Retenção da Jornada
  const aceitaramAviso = sessoes.filter(
    (s) => Boolean(s.timestamps?.avisoConteudoAceitoEm) || Boolean(s.consentimento?.aceito)
  ).length;
  const assinaramTcle = totalTcleAceito;
  const responderamAoMenosUma = sessoes.filter(
    (s) => (Number(s.desempenho?.questoesRespondidas) || 0) >= 1
  ).length;
  const chegaramAoBonus = sessoes.filter(
    (s) =>
      Boolean(s.timestamps?.bonusIniciadoEm) ||
      Object.keys(s.respostasBonus || {}).length > 0 ||
      s.status === "concluida"
  ).length;

  const funilRetencao = [
    { etapa: "1. Iniciaram a Sessão", quantidade: totalSessoes },
    { etapa: "2. Aceitaram Aviso de Conteúdo", quantidade: aceitaramAviso },
    { etapa: "3. Assinaram o TCLE Digital", quantidade: assinaramTcle },
    { etapa: "4. Responderam ao Quiz (≥ 1 questão)", quantidade: responderamAoMenosUma },
    { etapa: "5. Alcançaram Perguntas Bônus", quantidade: chegaramAoBonus },
    { etapa: "6. Concluíram Toda a Jornada", quantidade: concluidas.length }
  ].map((step) => ({
    ...step,
    percentual: totalSessoes > 0 ? Math.round((step.quantidade / totalSessoes) * 100) : 0
  }));

  // 7. Engajamento Consolidado
  const engajamentoConsolidado = {
    abriuRevisaoGabarito: 0,
    abriuRanking: 0,
    exportouJson: 0,
    tentativasSaidaCanceladas: 0,
    alteracoesAudioMute: 0,
    filtrosRevisao: { ALL: 0, CORRECT: 0, INCORRECT: 0 }
  };

  sessoes.forEach((s) => {
    const eng = s.engajamento || {};
    engajamentoConsolidado.abriuRevisaoGabarito += Number(eng.abriuRevisaoGabarito) || 0;
    engajamentoConsolidado.abriuRanking += Number(eng.abriuRanking) || 0;
    engajamentoConsolidado.exportouJson += Number(eng.exportouJson) || 0;
    engajamentoConsolidado.tentativasSaidaCanceladas += Number(eng.tentativasSaidaCanceladas) || 0;
    engajamentoConsolidado.alteracoesAudioMute += Number(eng.alteracoesAudioMute) || 0;

    if (Array.isArray(eng.filtrosRevisaoUtilizados)) {
      eng.filtrosRevisaoUtilizados.forEach((f) => {
        if (engajamentoConsolidado.filtrosRevisao[f] !== undefined) {
          engajamentoConsolidado.filtrosRevisao[f] += 1;
        }
      });
    }
  });

  const totalInteracoesPosJogo =
    engajamentoConsolidado.abriuRevisaoGabarito +
    engajamentoConsolidado.abriuRanking +
    engajamentoConsolidado.exportouJson;

  return {
    kpis: {
      totalSessoes,
      totalConcluidas: concluidas.length,
      totalDesistencias: desistencias.length,
      taxaConclusao,
      taxaDesistencia,
      mediaPontuacao,
      percentualMedioAcerto,
      mediaDuracaoSegundos,
      tempoMedioPorQuestaoMs,
      tempoMedioPorQuestaoSegundos: Number((tempoMedioPorQuestaoMs / 1000).toFixed(1)),
      totalTcleAceito,
      taxaAceiteTcle,
      totalInteracoesPosJogo
    },
    evolucaoTemporal,
    desempenhoPorCategoria,
    estatisticasPorQuestao,
    estatisticasBonus,
    analiseDesistencias: {
      totalDesistencias: desistencias.length,
      tempoMedioAteSaidaSegundos:
        desistencias.length > 0 ? Math.round(somaTempoAteSaida / desistencias.length) : 0,
      motivos: motivosDesistenciaDetalhados,
      telasDeSaida: telasDeSaidaOrdenadas
    },
    funilRetencao,
    engajamentoConsolidado
  };
}

/**
 * Escapa valores para células CSV seguras.
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/"/g, '""');
  if (/[",\n;]/.test(str)) {
    return `"${str}"`;
  }
  return str;
}

/**
 * Dispara o download de um arquivo no navegador com BOM UTF-8 (compatível com Microsoft Excel).
 */
function downloadTextFile(content, filename, mimeType = "text/csv;charset=utf-8;") {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exporta o resumo das sessões filtradas para CSV (preservando a privacidade quando solicitado).
 *
 * @param {Array<Object>} sessoes
 * @param {Object} [options]
 * @param {boolean} [options.anonimizarNickname=true]
 */
export function exportarSessoesCSV(sessoes = [], { anonimizarNickname = true } = {}) {
  const headers = [
    "ID_Sessao",
    "Status",
    "Participante",
    "TCLE_Aceito",
    "Data_Inicio",
    "Data_Fim",
    "Duracao_Total_Segundos",
    "Duracao_Quiz_Segundos",
    "Tempo_Medio_Questao_Ms",
    "Questoes_Respondidas",
    "Total_Questoes",
    "Acertos",
    "Erros",
    "Percentual_Acerto",
    "Bonus_1_Escolha",
    "Bonus_2_Escolha",
    "Motivo_Desistencia_ID",
    "Motivo_Desistencia_Texto",
    "Tela_Saida",
    "Abriu_Revisao",
    "Abriu_Ranking",
    "Exportou_JSON"
  ];

  const rows = sessoes.map((s, idx) => {
    const participanteLabel = anonimizarNickname
      ? `Participante_${String(idx + 1).padStart(3, "0")}`
      : s.nickname || "Anonimo";

    return [
      s.sessionId || s.id,
      s.status,
      participanteLabel,
      s.consentimento?.aceito ? "Sim" : "Nao",
      s.timestamps?.sessaoIniciadaEm || "",
      s.sessaoFinalizadaEm || s.timestamps?.sessaoFinalizadaEm || "",
      s.tempos?.duracaoTotalSegundos ?? 0,
      s.tempos?.duracaoQuizSegundos ?? 0,
      s.tempos?.tempoMedioPorQuestaoMs ?? 0,
      s.desempenho?.questoesRespondidas ?? 0,
      s.desempenho?.totalQuestoes ?? 24,
      s.desempenho?.acertos ?? 0,
      s.desempenho?.erros ?? 0,
      s.desempenho?.percentualAcerto ?? 0,
      s.respostasBonus?.bonus_1?.alternativaEscolhida || "",
      s.respostasBonus?.bonus_2?.alternativaEscolhida || "",
      s.desistencia?.motivoId || "",
      s.desistencia?.motivoLabel || "",
      s.desistencia?.telaOuQuestaoDeSaida || "",
      s.engajamento?.abriuRevisaoGabarito ?? 0,
      s.engajamento?.abriuRanking ?? 0,
      s.engajamento?.exportouJson ?? 0
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadTextFile(csvContent, `legacy_quiz_sessoes_${Date.now()}.csv`);
}

/**
 * Exporta todas as respostas individuais por questão (formato longo/tabular ideal para R, SPSS, Python e Excel).
 *
 * @param {Array<Object>} sessoes
 * @param {Object} [options]
 * @param {boolean} [options.anonimizarNickname=true]
 */
export function exportarRespostasDetalhadasCSV(sessoes = [], { anonimizarNickname = true } = {}) {
  const headers = [
    "ID_Sessao",
    "Status_Sessao",
    "Participante",
    "Tipo_Item",
    "Questao_ID",
    "Categoria",
    "Alternativa_Escolhida",
    "Alternativa_Correta",
    "Resultado",
    "Tempo_Resposta_Ms",
    "Respondida_Em"
  ];

  const rows = [];

  sessoes.forEach((s, idx) => {
    const participanteLabel = anonimizarNickname
      ? `Participante_${String(idx + 1).padStart(3, "0")}`
      : s.nickname || "Anonimo";

    // Respostas do Quiz Principal
    Object.values(s.respostasQuiz || {}).forEach((r) => {
      rows.push(
        [
          s.sessionId || s.id,
          s.status,
          participanteLabel,
          "QUIZ_PRINCIPAL",
          r.questaoId,
          r.categoria,
          r.alternativaEscolhida,
          r.alternativaCorreta,
          r.acertou ? "ACERTO" : "ERRO",
          r.tempoRespostaMs ?? 0,
          r.respondidaEm || ""
        ]
          .map(escapeCsvCell)
          .join(",")
      );
    });

    // Respostas das Perguntas Bônus
    Object.values(s.respostasBonus || {}).forEach((b) => {
      rows.push(
        [
          s.sessionId || s.id,
          s.status,
          participanteLabel,
          "PERGUNTA_BONUS",
          b.perguntaId,
          "REFLEXAO_PESSOAL",
          b.alternativaEscolhida,
          "N/A",
          "REFLEXIVA",
          b.tempoRespostaMs ?? 0,
          b.respondidaEm || ""
        ]
          .map(escapeCsvCell)
          .join(",")
      );
    });
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadTextFile(csvContent, `legacy_quiz_respostas_por_questao_${Date.now()}.csv`);
}

/**
 * Exporta uma planilha formatada compatível com Microsoft Excel (.xls via SpreadsheetML XML)
 * contendo múltiplas abas: Resumo das Sessões, Desempenho por Questão e Desempenho por Categoria.
 *
 * @param {Array<Object>} sessoes
 * @param {Object} analitico - Objeto retornado por calcularAnaliticoCompleto(sessoes)
 * @param {Object} [options]
 * @param {boolean} [options.anonimizarNickname=true]
 */
export function exportarPlanilhaExcel(sessoes = [], analitico, { anonimizarNickname = true } = {}) {
  const escapeXml = (val) =>
    String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const buildRowXml = (cells, isHeader = false) => {
    const cellsXml = cells
      .map((cell) => {
        const isNum = typeof cell === "number" && !Number.isNaN(cell);
        const type = isNum ? "Number" : "String";
        const styleAttr = isHeader ? ' ss:StyleID="Header"' : "";
        return `<Cell${styleAttr}><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
      })
      .join("");
    return `<Row>${cellsXml}</Row>`;
  };

  // Aba 1: Sessões
  const sessoesHeader = [
    "ID Sessão",
    "Status",
    "Participante",
    "TCLE Aceito",
    "Data Início",
    "Data Fim",
    "Duração Total (s)",
    "Questões Respondidas",
    "Acertos",
    "Erros",
    "Aproveitamento (%)",
    "Tempo Médio/Questão (ms)",
    "Bônus 1",
    "Bônus 2",
    "Motivo Desistência",
    "Tela de Saída"
  ];
  const sessoesRows = sessoes.map((s, idx) => [
    s.sessionId || s.id,
    s.status,
    anonimizarNickname ? `Participante_${String(idx + 1).padStart(3, "0")}` : s.nickname || "Anônimo",
    s.consentimento?.aceito ? "Sim" : "Não",
    s.timestamps?.sessaoIniciadaEm || "",
    s.sessaoFinalizadaEm || "",
    Number(s.tempos?.duracaoTotalSegundos) || 0,
    Number(s.desempenho?.questoesRespondidas) || 0,
    Number(s.desempenho?.acertos) || 0,
    Number(s.desempenho?.erros) || 0,
    Number(s.desempenho?.percentualAcerto) || 0,
    Number(s.tempos?.tempoMedioPorQuestaoMs) || 0,
    s.respostasBonus?.bonus_1?.alternativaEscolhida || "",
    s.respostasBonus?.bonus_2?.alternativaEscolhida || "",
    s.desistencia?.motivoLabel || "",
    s.desistencia?.telaOuQuestaoDeSaida || ""
  ]);

  // Aba 2: Estatísticas por Questão
  const questoesHeader = [
    "ID Questão",
    "Enunciado",
    "Categoria",
    "Gabarito",
    "Total Respostas",
    "Acertos",
    "Erros",
    "Taxa de Acerto (%)",
    "Tempo Médio (s)",
    "Escolhas A",
    "Escolhas B",
    "Escolhas C"
  ];
  const questoesRows = (analitico?.estatisticasPorQuestao || []).map((q) => [
    q.id,
    q.pergunta,
    q.categoriaNome,
    q.correta,
    q.respondidas,
    q.acertos,
    q.erros,
    q.taxaAcerto,
    q.tempoMedioSegundos,
    q.contagemOpcoes.A,
    q.contagemOpcoes.B,
    q.contagemOpcoes.C
  ]);

  // Aba 3: Desempenho por Categoria
  const categoriasHeader = [
    "Categoria ID",
    "Nome da Categoria",
    "Respostas Totais",
    "Acertos",
    "Erros",
    "Taxa de Acerto (%)",
    "Tempo Médio (s)"
  ];
  const categoriasRows = (analitico?.desempenhoPorCategoria || []).map((c) => [
    c.id,
    c.nome,
    c.respondidas,
    c.acertos,
    c.erros,
    c.percentualAcerto,
    c.tempoMedioSegundos
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E2952" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sessoes_Pesquisa">
  <Table>
   ${buildRowXml(sessoesHeader, true)}
   ${sessoesRows.map((r) => buildRowXml(r)).join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Desempenho_Questoes">
  <Table>
   ${buildRowXml(questoesHeader, true)}
   ${questoesRows.map((r) => buildRowXml(r)).join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Desempenho_Categorias">
  <Table>
   ${buildRowXml(categoriasHeader, true)}
   ${categoriasRows.map((r) => buildRowXml(r)).join("\n   ")}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadTextFile(
    xml,
    `legacy_quiz_relatorio_completo_${Date.now()}.xls`,
    "application/vnd.ms-excel;charset=utf-8;"
  );
}
