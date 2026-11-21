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
 * @param {Object} userAnswers - Mapa { [questionId]: { selectedOpt, isCorrect, tempoRespostaMs, respondidaEm, emotionScore, emotionLabel } }
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
  let currentStreak = 0;
  let computedMaxStreak = 0;
  let somaTempoQuizMs = 0;
  let somaTempoQuizSegundos = 0;
  const startTimestampsMs = [];
  const endTimestampsMs = [];

  QUIZ_QUESTIONS.forEach((question) => {
    const ans = userAnswers[question.id];
    const chosenOpt = ans?.selectedOption || ans?.selectedOpt;
    if (!ans || !chosenOpt) return;

    const isReflection = question.tipo === "reflexao" || ans.tipo === "reflexao";
    const acertou = isReflection ? null : Boolean(ans.isCorrect);

    if (isReflection || acertou === true) {
      currentStreak += 1;
      if (currentStreak > computedMaxStreak) {
        computedMaxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }

    const tempoMs =
      typeof ans.tempoRespostaMs === "number" && ans.tempoRespostaMs > 0
        ? ans.tempoRespostaMs
        : Math.max(1, Math.round((Number(ans.timeSpentSeconds) || 0) * 1000));
    const timeSpentSeconds =
      typeof ans.timeSpentSeconds === "number" && !Number.isNaN(ans.timeSpentSeconds)
        ? Number(ans.timeSpentSeconds.toFixed(2))
        : Number((tempoMs / 1000).toFixed(2));

    const startedAt = ans.startedAt || null;
    const answeredAt = ans.answeredAt || ans.respondidaEm || null;

    if (startedAt) {
      const sMs = new Date(startedAt).getTime();
      if (!Number.isNaN(sMs)) startTimestampsMs.push(sMs);
    }
    if (answeredAt) {
      const eMs = new Date(answeredAt).getTime();
      if (!Number.isNaN(eMs)) endTimestampsMs.push(eMs);
    }

    totalRespondidas += 1;
    if (!isReflection) {
      if (acertou) totalAcertos += 1;
      else totalErros += 1;
    }
    somaTempoQuizMs += tempoMs;
    somaTempoQuizSegundos += timeSpentSeconds;

    const emotionScore =
      typeof ans.emotionScore === "number" ? ans.emotionScore : null;
    const emotionLabel = ans.emotionLabel || null;

    respostasDetalhadas[String(question.id)] = {
      questionId: ans.questionId || `q${question.id}`,
      selectedOption: String(chosenOpt),
      timeSpentSeconds,
      startedAt,
      answeredAt,
      tipo: question.tipo || "conhecimento",
      questaoId: question.id,
      categoria: question.category,
      categoriaNome: question.categoria || question.category,
      alternativaEscolhida: String(chosenOpt),
      alternativaCorreta: isReflection ? null : question.correctAnswer,
      acertou,
      tempoRespostaMs: tempoMs,
      respondidaEm: answeredAt,
      medirEmocao: Boolean(question.medirEmocao),
      emotionScore,
      emotionLabel
    };

    const catStats = porCategoria[question.category];
    if (catStats) {
      catStats.respondidas += 1;
      if (!isReflection) {
        if (acertou) catStats.acertos += 1;
        else catStats.erros += 1;
      }
      catStats.tempoTotalMs += tempoMs;
    }
  });

  Object.values(porCategoria).forEach((catStats) => {
    if (catStats.respondidas > 0) {
      const totalPontuaveisCat = catStats.acertos + catStats.erros;
      catStats.percentualAcerto =
        totalPontuaveisCat > 0
          ? Math.round((catStats.acertos / totalPontuaveisCat) * 100)
          : 100;
      catStats.tempoMedioMs = Math.round(catStats.tempoTotalMs / catStats.respondidas);
    }
  });

  const totalQuestoesConhecimento = QUIZ_QUESTIONS.filter(
    (q) => q.tipo !== "reflexao"
  ).length;
  const totalQuestoes =
    totalQuestoesConhecimento > 0 ? totalQuestoesConhecimento : QUIZ_QUESTIONS.length;
  const percentualAcerto =
    totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  const tempoMedioPorQuestaoMs =
    totalRespondidas > 0 ? Math.round(somaTempoQuizMs / totalRespondidas) : 0;

  let totalQuizDurationSeconds = Number(somaTempoQuizSegundos.toFixed(2));
  if (totalQuizDurationSeconds <= 0 && startTimestampsMs.length > 0 && endTimestampsMs.length > 0) {
    const firstStart = Math.min(...startTimestampsMs);
    const lastEnd = Math.max(...endTimestampsMs);
    totalQuizDurationSeconds = Number((Math.max(0, lastEnd - firstStart) / 1000).toFixed(2));
  }

  return {
    respostasQuiz: respostasDetalhadas,
    desempenho: {
      questoesRespondidas: totalRespondidas,
      totalQuestoes,
      acertos: totalAcertos,
      erros: totalErros,
      percentualAcerto,
      maxStreak: computedMaxStreak,
      porCategoria
    },
    temposQuiz: {
      totalQuizDurationSeconds,
      duracaoQuizSegundos: Math.round(somaTempoQuizMs / 1000),
      tempoTotalQuizMs: somaTempoQuizMs,
      tempoMedioPorQuestaoMs,
      tempoMedioPorQuestaoSegundos: Number((tempoMedioPorQuestaoMs / 1000).toFixed(2))
    }
  };
}

/**
 * Formata o mapa de respostas das perguntas bônus reflexivas.
 *
 * @param {Object} bonusAnswers - Mapa { [bonusId]: { selectedOpt, timeSpentSeconds, startedAt, answeredAt, tempoRespostaMs, respondidaEm, emotionScore, emotionLabel } | string }
 * @returns {Object}
 */
export function consolidarRespostasBonus(bonusAnswers = {}, userAnswers = {}) {
  const resultado = {};

  BONUS_QUESTIONS.forEach((bonus) => {
    const raw =
      bonusAnswers[bonus.id] ||
      (bonus.questionIdNumeric ? userAnswers[bonus.questionIdNumeric] : null);
    if (!raw) return;

    if (typeof raw === "string") {
      resultado[bonus.id] = {
        questionId: bonus.id,
        selectedOption: raw,
        timeSpentSeconds: 0,
        startedAt: null,
        answeredAt: null,
        perguntaId: bonus.id,
        alternativaEscolhida: raw,
        tempoRespostaMs: 0,
        respondidaEm: null,
        emotionScore: null,
        emotionLabel: null
      };
    } else if (typeof raw === "object" && (raw.selectedOption || raw.selectedOpt)) {
      const chosen = String(raw.selectedOption || raw.selectedOpt);
      const tempoMs = Math.max(0, Number(raw.tempoRespostaMs) || 0);
      const timeSpentSeconds =
        typeof raw.timeSpentSeconds === "number" && !Number.isNaN(raw.timeSpentSeconds)
          ? Number(raw.timeSpentSeconds.toFixed(2))
          : Number((tempoMs / 1000).toFixed(2));
      const answeredAt = raw.answeredAt || raw.respondidaEm || null;
      const numericAns = bonus.questionIdNumeric ? userAnswers[bonus.questionIdNumeric] : null;
      const emotionScore =
        typeof raw.emotionScore === "number"
          ? raw.emotionScore
          : typeof numericAns?.emotionScore === "number"
            ? numericAns.emotionScore
            : null;
      const emotionLabel = raw.emotionLabel || numericAns?.emotionLabel || null;

      resultado[bonus.id] = {
        questionId: raw.questionId || bonus.id,
        selectedOption: chosen,
        timeSpentSeconds,
        startedAt: raw.startedAt || null,
        answeredAt,
        perguntaId: bonus.id,
        alternativaEscolhida: chosen,
        tempoRespostaMs: tempoMs,
        respondidaEm: answeredAt,
        emotionScore,
        emotionLabel
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
  maxStreak = null,
  totalQuizDurationSeconds = null,
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
  if (typeof maxStreak === "number" && maxStreak > (desempenho.maxStreak || 0)) {
    desempenho.maxStreak = maxStreak;
  }
  const respostasBonus = consolidarRespostasBonus(bonusAnswers, userAnswers);

  const resolvedQuizDurationSeconds =
    typeof totalQuizDurationSeconds === "number" && totalQuizDurationSeconds > 0
      ? Number(totalQuizDurationSeconds.toFixed(2))
      : temposQuiz.totalQuizDurationSeconds;

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

  const faixaEtaria =
    consentRecord?.ageGroup ||
    consentRecord?.faixaEtaria ||
    null;
  const maiorDeIdade =
    typeof consentRecord?.isAdult === "boolean"
      ? consentRecord.isAdult
      : typeof consentRecord?.maiorDeIdade === "boolean"
        ? consentRecord.maiorDeIdade
        : faixaEtaria === "maior_idade"
          ? true
          : faixaEtaria === "menor_idade"
            ? false
            : null;
  const faixaEtariaLabel =
    consentRecord?.ageGroupLabel ||
    consentRecord?.faixaEtariaLabel ||
    (faixaEtaria === "maior_idade"
      ? "Maior de idade (18 anos ou mais)"
      : faixaEtaria === "menor_idade"
        ? "Menor de idade (menos de 18 anos)"
        : null);

  const consentimento = consentRecord
    ? {
      aceito: true,
      caae: consentRecord.caae || "94717525.4.0000.5690",
      aceitoEm: consentRecord.acceptedAt || timestamps.tcleAceitoEm || null,
      faixaEtaria,
      faixaEtariaLabel,
      maiorDeIdade
    }
    : {
      aceito: false,
      caae: "94717525.4.0000.5690",
      aceitoEm: null,
      faixaEtaria: null,
      faixaEtariaLabel: null,
      maiorDeIdade: null
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
      totalQuizDurationSeconds: resolvedQuizDurationSeconds,
      duracaoTotalSegundos,
      duracaoQuizSegundos: temposQuiz.duracaoQuizSegundos,
      tempoTotalQuizMs: temposQuiz.tempoTotalQuizMs,
      tempoMedioPorQuestaoMs: temposQuiz.tempoMedioPorQuestaoMs,
      tempoMedioPorQuestaoSegundos: temposQuiz.tempoMedioPorQuestaoSegundos
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
 * Atualiza de forma assíncrona e não-bloqueante os indicadores de engajamento pós-jogo.
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
 * tabelas e indicadores de proporção do Painel Administrativo.
 */
export function calcularAnaliticoCompleto(sessoes = [], filtroCategoria = "ALL") {
  const totalSessoes = sessoes.length;
  const concluidas = sessoes.filter((s) => s.status === "concluida");
  const desistencias = sessoes.filter((s) => s.status === "desistencia");

  const taxaConclusao =
    totalSessoes > 0 ? Math.round((concluidas.length / totalSessoes) * 100) : 0;
  const taxaDesistencia = totalSessoes > 0 ? 100 - taxaConclusao : 0;

  const somaAcertosConcluidas = concluidas.reduce(
    (acc, s) => acc + (Number(s.desempenho?.acertos) || 0),
    0
  );
  const mediaPontuacao =
    concluidas.length > 0 ? Number((somaAcertosConcluidas / concluidas.length).toFixed(1)) : 0;
  const totalQuestoesConhecimento =
    QUIZ_QUESTIONS.filter((q) => q.tipo !== "reflexao").length || QUIZ_QUESTIONS.length;
  const percentualMedioAcerto =
    concluidas.length > 0
      ? Math.round((mediaPontuacao / totalQuestoesConhecimento) * 100)
      : 0;

  const somaDuracaoConcluidas = concluidas.reduce(
    (acc, s) => acc + (Number(s.tempos?.duracaoTotalSegundos) || 0),
    0
  );
  const mediaDuracaoSegundos =
    concluidas.length > 0 ? Math.round(somaDuracaoConcluidas / concluidas.length) : 0;

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

  const totalTcleAceito = sessoes.filter((s) => s.consentimento?.aceito === true).length;
  const taxaAceiteTcle =
    totalSessoes > 0 ? Math.round((totalTcleAceito / totalSessoes) * 100) : 0;

  // 1. Evolução Temporal
  const mapaPorDia = {};
  sessoes.forEach((s) => {
    const dataIso =
      s.sessaoFinalizadaEm ||
      s.timestamps?.sessaoFinalizadaEm ||
      s.timestamps?.sessaoIniciadaEm;
    if (!dataIso) return;
    const diaKey = dataIso.substring(0, 10);
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

  // 3. Estatísticas Detalhadas por Questão (inclui média e contagem do Termômetro Emocional)
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
    const contagemEmocoes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let somaEmocoes = 0;
    let totalEmocoes = 0;

    const isReflection = q.tipo === "reflexao";
    sessoes.forEach((s) => {
      const resp = s.respostasQuiz?.[String(q.id)];
      if (!resp || !resp.alternativaEscolhida) return;

      respondidas += 1;
      if (!isReflection) {
        if (resp.acertou) acertos += 1;
        else erros += 1;
      }
      somaTempoMs += Number(resp.tempoRespostaMs) || 0;

      const opt = String(resp.alternativaEscolhida).toUpperCase();
      if (contagemOpcoes[opt] !== undefined) {
        contagemOpcoes[opt] += 1;
      }

      if (typeof resp.emotionScore === "number" && contagemEmocoes[resp.emotionScore] !== undefined) {
        contagemEmocoes[resp.emotionScore] += 1;
        somaEmocoes += resp.emotionScore;
        totalEmocoes += 1;
      }
    });

    const taxaAcerto = isReflection
      ? 100
      : respondidas > 0
        ? Math.round((acertos / respondidas) * 100)
        : 0;
    const tempoMedioMs = respondidas > 0 ? Math.round(somaTempoMs / respondidas) : 0;
    const mediaEmocao =
      totalEmocoes > 0 ? Number((somaEmocoes / totalEmocoes).toFixed(2)) : null;

    return {
      id: q.id,
      pergunta: q.question,
      categoriaKey: q.category,
      categoriaNome: CATEGORIES[q.category]?.name || q.category,
      categoriaBadge: CATEGORIES[q.category]?.badge || q.category,
      categoriaColor: CATEGORIES[q.category]?.color || "#3b82f6",
      correta: q.correctAnswer,
      medirEmocao: Boolean(q.medirEmocao),
      respondidas,
      acertos,
      erros,
      taxaAcerto,
      tempoMedioMs,
      tempoMedioSegundos: Number((tempoMedioMs / 1000).toFixed(1)),
      contagemOpcoes,
      contagemEmocoes,
      mediaEmocao,
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
      const bResp =
        s.respostasBonus?.[bonus.id] ||
        (bonus.questionIdNumeric ? s.respostasQuiz?.[String(bonus.questionIdNumeric)] : null);
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

  // 5. Análise de Desistências
  const catalogoMotivos = {
    tranquilo: { id: "tranquilo", label: "Tranquilo", color: "#1b5e20", emoji: "😄" },
    curioso: { id: "curioso", label: "Curioso", color: "#2e7d32", emoji: "🤔" },
    neutro: { id: "neutro", label: "Neutro", color: "#f57f17", emoji: "😐" },
    preocupado: { id: "preocupado", label: "Preocupado", color: "#ef6c00", emoji: "😟" },
    desconfortavel: { id: "desconfortavel", label: "Desconfortável", color: "#c62828", emoji: "😰" }
  };

  const legadoParaNovoMotivo = {
    no_comment: "neutro",
    disliked_topic: "curioso",
    felt_bad: "preocupado",
    heavy_topic: "desconfortavel"
  };

  const contagemMotivos = {
    tranquilo: 0,
    curioso: 0,
    neutro: 0,
    preocupado: 0,
    desconfortavel: 0
  };
  const contagemTelasSaida = {};
  let somaTempoAteSaida = 0;

  desistencias.forEach((s) => {
    const rawId = s.desistencia?.motivoId || "neutro";
    const mId = legadoParaNovoMotivo[rawId] || rawId;
    if (contagemMotivos[mId] !== undefined) {
      contagemMotivos[mId] += 1;
    } else {
      contagemMotivos.neutro += 1;
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

  // 6. Funil de Retenção
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

function escapeCsvCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/"/g, '""');
  if (/[",\n;]/.test(str)) {
    return `"${str}"`;
  }
  return str;
}

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
 * Exporta o resumo das sessões filtradas para CSV.
 */
export function exportarSessoesCSV(sessoes = [], { anonimizarNickname = true } = {}) {
  const headers = [
    "ID_Sessao",
    "Status",
    "Participante",
    "Faixa_Etaria",
    "Maior_De_Idade",
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
    "Emocao_Q9",
    "Emocao_Q12",
    "Bonus_1_Escolha",
    "Emocao_Bonus_1_Q13",
    "Bonus_2_Escolha",
    "Emocao_Bonus_2_Q14",
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

    const q9Emo = s.respostasQuiz?.["9"]?.emotionLabel
      ? `${s.respostasQuiz["9"].emotionScore} (${s.respostasQuiz["9"].emotionLabel})`
      : "";
    const q12Emo = s.respostasQuiz?.["12"]?.emotionLabel
      ? `${s.respostasQuiz["12"].emotionScore} (${s.respostasQuiz["12"].emotionLabel})`
      : "";
    const q13Emo =
      s.respostasBonus?.bonus_1?.emotionLabel || s.respostasQuiz?.["13"]?.emotionLabel
        ? `${s.respostasBonus?.bonus_1?.emotionScore ?? s.respostasQuiz?.["13"]?.emotionScore} (${s.respostasBonus?.bonus_1?.emotionLabel || s.respostasQuiz?.["13"]?.emotionLabel})`
        : "";
    const q14Emo =
      s.respostasBonus?.bonus_2?.emotionLabel || s.respostasQuiz?.["14"]?.emotionLabel
        ? `${s.respostasBonus?.bonus_2?.emotionScore ?? s.respostasQuiz?.["14"]?.emotionScore} (${s.respostasBonus?.bonus_2?.emotionLabel || s.respostasQuiz?.["14"]?.emotionLabel})`
        : "";

    const faixaEtariaTexto =
      s.consentimento?.faixaEtariaLabel ||
      (s.consentimento?.faixaEtaria === "maior_idade"
        ? "Maior de idade (18 anos ou mais)"
        : s.consentimento?.faixaEtaria === "menor_idade"
          ? "Menor de idade (menos de 18 anos)"
          : "Nao informado");
    const maiorDeIdadeTexto =
      typeof s.consentimento?.maiorDeIdade === "boolean"
        ? s.consentimento.maiorDeIdade
          ? "Sim"
          : "Nao"
        : s.consentimento?.faixaEtaria === "maior_idade"
          ? "Sim"
          : s.consentimento?.faixaEtaria === "menor_idade"
            ? "Nao"
            : "";

    return [
      s.sessionId || s.id,
      s.status,
      participanteLabel,
      faixaEtariaTexto,
      maiorDeIdadeTexto,
      s.consentimento?.aceito ? "Sim" : "Nao",
      s.timestamps?.sessaoIniciadaEm || "",
      s.sessaoFinalizadaEm || s.timestamps?.sessaoFinalizadaEm || "",
      s.tempos?.duracaoTotalSegundos ?? 0,
      s.tempos?.duracaoQuizSegundos ?? 0,
      s.tempos?.tempoMedioPorQuestaoMs ?? 0,
      s.desempenho?.questoesRespondidas ?? 0,
      s.desempenho?.totalQuestoes ?? 12,
      s.desempenho?.acertos ?? 0,
      s.desempenho?.erros ?? 0,
      s.desempenho?.percentualAcerto ?? 0,
      q9Emo,
      q12Emo,
      s.respostasBonus?.bonus_1?.alternativaEscolhida || "",
      q13Emo,
      s.respostasBonus?.bonus_2?.alternativaEscolhida || "",
      q14Emo,
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
    "Nota_Emocao",
    "Rotulo_Emocao",
    "Tempo_Gasto_Segundos",
    "Tempo_Resposta_Ms",
    "Iniciada_Em",
    "Respondida_Em"
  ];

  const rows = [];

  sessoes.forEach((s, idx) => {
    const participanteLabel = anonimizarNickname
      ? `Participante_${String(idx + 1).padStart(3, "0")}`
      : s.nickname || "Anonimo";

    Object.values(s.respostasQuiz || {}).forEach((r) => {
      const timeSec =
        typeof r.timeSpentSeconds === "number"
          ? r.timeSpentSeconds
          : Number(((r.tempoRespostaMs || 0) / 1000).toFixed(2));
      const isRef = r.tipo === "reflexao" || r.acertou === null;
      rows.push(
        [
          s.sessionId || s.id,
          s.status,
          participanteLabel,
          isRef ? "REFLEXAO_BLOCO_D" : "QUIZ_PRINCIPAL",
          r.questionId || `q${r.questaoId}`,
          r.categoria,
          r.selectedOption || r.alternativaEscolhida,
          isRef ? "N/A" : r.alternativaCorreta,
          isRef ? "REFLEXIVA" : r.acertou ? "ACERTO" : "ERRO",
          r.emotionScore ?? "",
          r.emotionLabel || "",
          timeSec,
          r.tempoRespostaMs ?? 0,
          r.startedAt || "",
          r.answeredAt || r.respondidaEm || ""
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
 * Exporta uma planilha formatada compatível com Microsoft Excel (.xls via SpreadsheetML XML).
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
    "Faixa Etária",
    "TCLE Aceito",
    "Data Início",
    "Data Fim",
    "Duração Total (s)",
    "Questões Respondidas",
    "Acertos",
    "Erros",
    "Aproveitamento (%)",
    "Tempo Médio/Questão (ms)",
    "Emoção Q9",
    "Emoção Q12",
    "Bônus 1",
    "Emoção Q13",
    "Bônus 2",
    "Emoção Q14",
    "Motivo Desistência",
    "Tela de Saída"
  ];
  const sessoesRows = sessoes.map((s, idx) => {
    const q9Emo = s.respostasQuiz?.["9"]?.emotionLabel
      ? `${s.respostasQuiz["9"].emotionScore} (${s.respostasQuiz["9"].emotionLabel})`
      : "";
    const q12Emo = s.respostasQuiz?.["12"]?.emotionLabel
      ? `${s.respostasQuiz["12"].emotionScore} (${s.respostasQuiz["12"].emotionLabel})`
      : "";
    const q13Emo =
      s.respostasBonus?.bonus_1?.emotionLabel || s.respostasQuiz?.["13"]?.emotionLabel
        ? `${s.respostasBonus?.bonus_1?.emotionScore ?? s.respostasQuiz?.["13"]?.emotionScore} (${s.respostasBonus?.bonus_1?.emotionLabel || s.respostasQuiz?.["13"]?.emotionLabel})`
        : "";
    const q14Emo =
      s.respostasBonus?.bonus_2?.emotionLabel || s.respostasQuiz?.["14"]?.emotionLabel
        ? `${s.respostasBonus?.bonus_2?.emotionScore ?? s.respostasQuiz?.["14"]?.emotionScore} (${s.respostasBonus?.bonus_2?.emotionLabel || s.respostasQuiz?.["14"]?.emotionLabel})`
        : "";

    const faixaEtariaExcel =
      s.consentimento?.faixaEtariaLabel ||
      (s.consentimento?.faixaEtaria === "maior_idade"
        ? "Maior de idade (18+)"
        : s.consentimento?.faixaEtaria === "menor_idade"
          ? "Menor de idade (<18)"
          : "Não informado");

    return [
      s.sessionId || s.id,
      s.status,
      anonimizarNickname ? `Participante_${String(idx + 1).padStart(3, "0")}` : s.nickname || "Anônimo",
      faixaEtariaExcel,
      s.consentimento?.aceito ? "Sim" : "Não",
      s.timestamps?.sessaoIniciadaEm || "",
      s.sessaoFinalizadaEm || "",
      Number(s.tempos?.duracaoTotalSegundos) || 0,
      Number(s.desempenho?.questoesRespondidas) || 0,
      Number(s.desempenho?.acertos) || 0,
      Number(s.desempenho?.erros) || 0,
      Number(s.desempenho?.percentualAcerto) || 0,
      Number(s.tempos?.tempoMedioPorQuestaoMs) || 0,
      q9Emo,
      q12Emo,
      s.respostasBonus?.bonus_1?.alternativaEscolhida || "",
      q13Emo,
      s.respostasBonus?.bonus_2?.alternativaEscolhida || "",
      q14Emo,
      s.desistencia?.motivoLabel || "",
      s.desistencia?.telaOuQuestaoDeSaida || ""
    ];
  });

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
    "Média Emoção (1-5)",
    "Escolhas A",
    "Escolhas B",
    "Escolhas C"
  ];
  const questoesRows = (analitico?.estatisticasPorQuestao || []).map((q) => [
    q.id,
    q.pergunta,
    q.categoriaNome,
    q.correta || "Reflexão",
    q.respondidas,
    q.acertos,
    q.erros,
    q.taxaAcerto,
    q.tempoMedioSegundos,
    q.mediaEmocao ?? "N/A",
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
