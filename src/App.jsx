import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { QUIZ_QUESTIONS, BONUS_QUESTIONS } from './data/questions.js';
import { useAudio } from './hooks/useAudio.js';

import { TopRibbon } from './components/TopRibbon.jsx';
import { ConsentModal } from './components/ConsentModal.jsx';
import { ExitConfirmModal } from './components/ExitConfirmModal.jsx';
import { ExitFeedbackScreen } from './components/ExitFeedbackScreen.jsx';
import { LandingScreen } from './components/LandingScreen.jsx';
import { ContentWarning } from './components/ContentWarning.jsx';
import { NicknameScreen } from './components/NicknameScreen.jsx';
import { VideoScreen } from './components/VideoScreen.jsx';
import { QuizQuestion } from './components/QuizQuestion.jsx';
import { BonusIntro } from './components/BonusIntro.jsx';
import { BonusQuestion } from './components/BonusQuestion.jsx';

import { CompletionScreen } from './components/CompletionScreen.jsx';
import { ReviewModal } from './components/ReviewModal.jsx';
import { RankingModal } from './components/RankingModal.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { salvarJogador, uploadAssinatura, formatNickname } from './services/jogadorService.js';
import {
  gerarSessionId,
  construirPayloadSessao,
  salvarSessaoPesquisa,
  atualizarEngajamentoSessao
} from './services/metricasService.js';

const createInitialTimestamps = () => ({
  sessaoIniciadaEm: new Date().toISOString(),
  avisoConteudoAceitoEm: null,
  tcleAceitoEm: null,
  quizIniciadoEm: null,
  bonusIniciadoEm: null,
  sessaoFinalizadaEm: null
});

const createInitialEngajamento = () => ({
  tentativasSaidaCanceladas: 0,
  alteracoesAudioMute: 0,
  abriuRevisaoGabarito: 0,
  filtrosRevisaoUtilizados: [],
  abriuRanking: 0,
  exportouJson: 0
});

const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  return path === '/admin' || hash === '#/admin' || hash === '#admin';
};

export function App() {
  // Restricted Admin Route State (not exposed in any public menu)
  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(checkIsAdminRoute());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('LANDING'); 
  // 'LANDING' | 'CONTENT_WARNING' | 'NICKNAME' | 'VIDEO_1' | 'VIDEO_2' | 'QUIZ' | 
  // 'BONUS_INTRO' | 'BONUS_QUESTIONS' | 'COMPLETION'
  const [originScreenBeforeExit, setOriginScreenBeforeExit] = useState('QUIZ');

  // Quiz Indexes
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentBonusIdx, setCurrentBonusIdx] = useState(0);

  // Participant & Telemetry Data
  const [sessionId, setSessionId] = useState(() => gerarSessionId());
  const [nickname, setNickname] = useState('');
  const [consentRecord, setConsentRecord] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: { selectedOpt, isCorrect, tempoRespostaMs, respondidaEm } }
  const [bonusAnswers, setBonusAnswers] = useState({});

  const [dropoutData, setDropoutData] = useState(null);
  const [sessionTimestamps, setSessionTimestamps] = useState(createInitialTimestamps);
  const [engajamento, setEngajamento] = useState(createInitialEngajamento);

  // Prevenção de gravação duplicada da mesma sessão
  const savedCompletionSessionRef = useRef(null);
  const savedDropoutSessionRef = useRef(null);

  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, error: null });

  // Helper para registrar e sincronizar interações de engajamento
  const registrarInteracaoEngajamento = useCallback((updater) => {
    setEngajamento(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (
        savedCompletionSessionRef.current === sessionId ||
        savedDropoutSessionRef.current === sessionId
      ) {
        atualizarEngajamentoSessao(sessionId, next);
      }
      return next;
    });
  }, [sessionId]);

  // Salva os dados no Firestore (jogadores + sessoes_pesquisa) e Storage ao atingir a tela final
  useEffect(() => {
    if (
      currentScreen === 'COMPLETION' &&
      nickname &&
      !saveStatus.success &&
      !saveStatus.loading &&
      savedCompletionSessionRef.current !== sessionId
    ) {
      savedCompletionSessionRef.current = sessionId;
      const salvarDadosFinais = async () => {
        setSaveStatus({ loading: true, success: false, error: null });
        const fimIso = new Date().toISOString();
        const timestampsFinais = {
          ...sessionTimestamps,
          sessaoFinalizadaEm: fimIso
        };
        setSessionTimestamps(timestampsFinais);

        let assinaturaUrl = "assinaturas/sem_assinatura.png";
        if (consentRecord?.signatureDataUrl) {
          try {
            const formattedNick = formatNickname(nickname);
            assinaturaUrl = await uploadAssinatura(consentRecord.signatureDataUrl, formattedNick);
          } catch (uploadErr) {
            console.warn("Aviso ao enviar assinatura para o storage:", uploadErr);
          }
        }

        // 1. Persiste as métricas detalhadas na coleção 'sessoes_pesquisa' (independente de conflito de nickname no ranking)
        try {
          await salvarSessaoPesquisa({
            sessionId,
            status: 'concluida',
            nickname,
            assinaturaUrl,
            consentRecord,
            userAnswers,
            bonusAnswers,
            totalQuizDurationSeconds,
            dropoutData: null,
            timestamps: timestampsFinais,
            engajamento
          });
        } catch (metricsErr) {
          console.error("Erro ao registrar métricas na coleção sessoes_pesquisa:", metricsErr);
        }

        // 2. Persiste o registro enxuto na coleção 'jogadores' para o Ranking
        try {
          const inicioMs = new Date(timestampsFinais.sessaoIniciadaEm).getTime();
          const fallbackSegundos = Math.max(1, Math.round((Date.now() - inicioMs) / 1000));
          const tempoSegundos =
            totalQuizDurationSeconds > 0
              ? Math.max(1, Math.round(totalQuizDurationSeconds))
              : fallbackSegundos;
          await salvarJogador({
            nickname,
            assinaturaUrl,
            pontuacao: score,
            tempoSegundos
          });
          setSaveStatus({ loading: false, success: true, error: null });
        } catch (err) {
          console.error("Erro ao registrar jogador no Firestore:", err);
          setSaveStatus({ loading: false, success: false, error: err.message });
        }
      };
      salvarDadosFinais();
    }
  }, [currentScreen, nickname, sessionId]);

  // Audio Hook
  const { muted, toggleMute: rawToggleMute, playClick, playCorrect, playIncorrect, playFanfare } = useAudio();

  const toggleMute = useCallback(() => {
    rawToggleMute();
    registrarInteracaoEngajamento(prev => ({
      ...prev,
      alteracoesAudioMute: prev.alteracoesAudioMute + 1
    }));
  }, [rawToggleMute, registrarInteracaoEngajamento]);

  // Calculated Score
  const score = useMemo(() => {
    return Object.values(userAnswers).filter(a => a.isCorrect).length;
  }, [userAnswers]);

  // Tempo total gasto nas questões do quiz (em segundos, com precisão de 2 casas decimais)
  const totalQuizDurationSeconds = useMemo(() => {
    const answersList = Object.values(userAnswers);
    if (answersList.length === 0) return 0;

    const sumSeconds = answersList.reduce(
      (acc, ans) => acc + (Number(ans.timeSpentSeconds) || 0),
      0
    );
    if (sumSeconds > 0) {
      return Number(sumSeconds.toFixed(2));
    }

    const startTimes = answersList
      .map(a => (a.startedAt ? new Date(a.startedAt).getTime() : NaN))
      .filter(t => !Number.isNaN(t));
    const endTimes = answersList
      .map(a => (a.answeredAt ? new Date(a.answeredAt).getTime() : NaN))
      .filter(t => !Number.isNaN(t));

    if (startTimes.length > 0 && endTimes.length > 0) {
      const firstStart = Math.min(...startTimes);
      const lastEnd = Math.max(...endTimes);
      return Number((Math.max(0, lastEnd - firstStart) / 1000).toFixed(2));
    }
    return 0;
  }, [userAnswers]);

  // Dynamic Header Title
  const headerTitle = useMemo(() => {
    switch (currentScreen) {
      case 'LANDING':
        return 'LEGACY QUIZ';
      case 'CONTENT_WARNING':
        return 'AVISO DE CONTEÚDO';
      case 'NICKNAME':
        return 'IDENTIFICAÇÃO DO JOGADOR';
      case 'QUIZ':
        return QUIZ_QUESTIONS[currentQuestionIdx]?.question || 'LEGACY QUIZ';
      case 'EXIT_FEEDBACK':
        return 'FEEDBACK DE DESISTÊNCIA';
      case 'BONUS_INTRO':
        return 'ESTÁ PRONTO(A) PARA AS PERGUNTAS BÔNUS';
      case 'BONUS_QUESTIONS':
        return BONUS_QUESTIONS[currentBonusIdx]?.question || 'PERGUNTA BÔNUS';

      case 'COMPLETION':
        return 'OBRIGADO POR PARTICIPAR!';
      default:
        return 'LEGACY QUIZ';
    }
  }, [currentScreen, currentQuestionIdx, currentBonusIdx]);

  // Answer handler for Core Quiz (inclui tempo de resposta em segundos e timestamps de início/fim)
  const handleAnswerQuestion = (qId, selectedOpt, isCorrect, meta = {}) => {
    const nowIso = new Date().toISOString();
    const timeSpentSeconds =
      typeof meta.timeSpentSeconds === 'number'
        ? meta.timeSpentSeconds
        : Number((((meta.tempoRespostaMs || 0) / 1000)).toFixed(2));

    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        questionId: meta.questionId || `q${qId}`,
        selectedOption: selectedOpt,
        timeSpentSeconds,
        startedAt: meta.startedAt || nowIso,
        answeredAt: meta.answeredAt || meta.respondidaEm || nowIso,
        selectedOpt,
        isCorrect,
        tempoRespostaMs: meta.tempoRespostaMs ?? Math.round(timeSpentSeconds * 1000),
        respondidaEm: meta.answeredAt || meta.respondidaEm || nowIso
      }
    }));
  };

  // Answer handler for Bonus Questions (inclui tempo de resposta em segundos e timestamps de início/fim)
  const handleAnswerBonus = (bonusId, selectedOpt, meta = {}) => {
    const nowIso = new Date().toISOString();
    const timeSpentSeconds =
      typeof meta.timeSpentSeconds === 'number'
        ? meta.timeSpentSeconds
        : Number((((meta.tempoRespostaMs || 0) / 1000)).toFixed(2));

    setBonusAnswers(prev => ({
      ...prev,
      [bonusId]: {
        questionId: meta.questionId || bonusId,
        selectedOption: selectedOpt,
        timeSpentSeconds,
        startedAt: meta.startedAt || nowIso,
        answeredAt: meta.answeredAt || meta.respondidaEm || nowIso,
        selectedOpt,
        tempoRespostaMs: meta.tempoRespostaMs ?? Math.round(timeSpentSeconds * 1000),
        respondidaEm: meta.answeredAt || meta.respondidaEm || nowIso
      }
    }));
  };

  // Handler para solicitar saída preservando a tela de origem
  const handleRequestExit = () => {
    setOriginScreenBeforeExit(currentScreen);
    setShowExitModal(true);
  };

  // Determina o identificador exato da tela/questão no momento da saída
  const getScreenExitLabel = (screen) => {
    if (screen === 'CONTENT_WARNING') return 'CONTENT_WARNING';
    if (screen === 'NICKNAME') return 'NICKNAME';
    if (screen === 'QUIZ') return `QUIZ_Q${currentQuestionIdx + 1}`;
    if (screen === 'BONUS_INTRO') return 'BONUS_INTRO';
    if (screen === 'BONUS_QUESTIONS') return `BONUS_Q${currentBonusIdx + 1}`;
    return screen || `QUIZ_Q${currentQuestionIdx + 1}`;
  };

  // Export Study Data as JSON (com métricas estruturadas completas)
  const handleExportData = () => {
    const nextEngajamento = {
      ...engajamento,
      exportouJson: engajamento.exportouJson + 1
    };
    registrarInteracaoEngajamento(nextEngajamento);

    const structuredMetrics = construirPayloadSessao({
      sessionId,
      status: dropoutData ? 'desistencia' : 'concluida',
      nickname,
      consentRecord,
      userAnswers,
      bonusAnswers,
      totalQuizDurationSeconds,
      dropoutData,
      timestamps: {
        ...sessionTimestamps,
        sessaoFinalizadaEm: sessionTimestamps.sessaoFinalizadaEm || new Date().toISOString()
      },
      engajamento: nextEngajamento
    });

    const studyRecord = {
      sessionId,
      participantNickname: nickname,
      sessionStartedAt: sessionTimestamps.sessaoIniciadaEm,
      sessionFinishedAt: structuredMetrics.sessaoFinalizadaEm,
      totalQuizDurationSeconds,
      consent: consentRecord,
      dropout: dropoutData,
      score: {
        totalCorrect: score,
        totalQuestions: QUIZ_QUESTIONS.length,
        percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100)
      },
      answers: userAnswers,
      bonusAnswers,
      metrics: structuredMetrics
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studyRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quiz_legado_${nickname || 'participante'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restart Quiz (gera nova sessão limpa)
  const handlePlayAgain = () => {
    setSessionId(gerarSessionId());
    setUserAnswers({});
    setBonusAnswers({});
    setConsentRecord(null);
    setDropoutData(null);
    setSessionTimestamps(createInitialTimestamps());
    setEngajamento(createInitialEngajamento());
    savedCompletionSessionRef.current = null;
    savedDropoutSessionRef.current = null;
    setCurrentQuestionIdx(0);
    setCurrentBonusIdx(0);
    setSaveStatus({ loading: false, success: false, error: null });
    setCurrentScreen('LANDING');
  };

  const handleOpenRanking = () => {
    registrarInteracaoEngajamento(prev => ({
      ...prev,
      abriuRanking: prev.abriuRanking + 1
    }));
    setShowRankingModal(true);
  };

  const handleOpenReview = () => {
    registrarInteracaoEngajamento(prev => ({
      ...prev,
      abriuRevisaoGabarito: prev.abriuRevisaoGabarito + 1,
      filtrosRevisaoUtilizados: prev.filtrosRevisaoUtilizados.includes('ALL')
        ? prev.filtrosRevisaoUtilizados
        : [...prev.filtrosRevisaoUtilizados, 'ALL']
    }));
    setShowReviewModal(true);
  };

  if (isAdminRoute) {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="app-wrapper">
      {/* Top Header Ribbon with dynamic titles (hidden on LANDING since Frame 227 already has the header embedded) */}
      {currentScreen !== 'LANDING' && (
        <TopRibbon 
          title={headerTitle}
          onToggleMute={toggleMute}
          muted={muted}
          nickname={nickname}
          onShowRanking={handleOpenRanking}
        />
      )}

      {/* Screen Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentScreen === 'LANDING' && (
          <LandingScreen 
            onStartGame={() => {
              setSessionTimestamps(prev => ({
                ...prev,
                sessaoIniciadaEm: new Date().toISOString()
              }));
              setCurrentScreen('CONTENT_WARNING');
            }}
            playClick={playClick}
            muted={muted}
            onToggleMute={toggleMute}
            onShowRanking={handleOpenRanking}
          />
        )}

        {currentScreen === 'CONTENT_WARNING' && (
          <ContentWarning 
            onContinue={() => {
              setSessionTimestamps(prev => ({
                ...prev,
                avisoConteudoAceitoEm: new Date().toISOString()
              }));
              setCurrentScreen('NICKNAME');
            }}
            onExit={handleRequestExit}
            playClick={playClick}
          />
        )}

        {currentScreen === 'NICKNAME' && (
          <NicknameScreen 
            onConfirmNickname={(name, consentData) => {
              const nowIso = new Date().toISOString();
              setNickname(name);
              setConsentRecord(consentData);
              setSessionTimestamps(prev => ({
                ...prev,
                tcleAceitoEm: consentData?.acceptedAt || nowIso,
                quizIniciadoEm: nowIso
              }));
              setCurrentScreen('QUIZ');
            }}
            onBack={() => setCurrentScreen('CONTENT_WARNING')}
            playClick={playClick}
          />
        )}

        {currentScreen === 'QUIZ' && (
          <QuizQuestion 
            key={QUIZ_QUESTIONS[currentQuestionIdx].id}
            questionData={QUIZ_QUESTIONS[currentQuestionIdx]}
            currentIndex={currentQuestionIdx}
            totalQuestions={QUIZ_QUESTIONS.length}
            userAnswer={userAnswers[QUIZ_QUESTIONS[currentQuestionIdx].id]?.selectedOpt}
            onAnswer={handleAnswerQuestion}
            onNext={() => {
              if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
                setCurrentQuestionIdx(idx => idx + 1);
              } else {
                setCurrentScreen('BONUS_INTRO');
              }
            }}
            onExit={handleRequestExit}
            playClick={playClick}
            playCorrect={playCorrect}
            playIncorrect={playIncorrect}
            nickname={nickname}
          />
        )}

        {currentScreen === 'EXIT_FEEDBACK' && (
          <ExitFeedbackScreen 
            onConfirmExit={async (reason) => {
              const exitTimestamp = new Date().toISOString();
              const screenLabel = getScreenExitLabel(originScreenBeforeExit);
              const dropoutPayload = {
                reasonId: reason.id,
                reasonLabel: reason.label,
                screenAtExit: screenLabel,
                questionIdx: originScreenBeforeExit === 'QUIZ' ? currentQuestionIdx : null,
                timestamp: exitTimestamp
              };
              setDropoutData(dropoutPayload);

              const timestampsSaida = {
                ...sessionTimestamps,
                sessaoFinalizadaEm: exitTimestamp
              };
              setSessionTimestamps(timestampsSaida);

              if (savedDropoutSessionRef.current !== sessionId) {
                savedDropoutSessionRef.current = sessionId;
                try {
                  let assinaturaUrl = null;
                  if (nickname && consentRecord?.signatureDataUrl) {
                    try {
                      const formattedNick = formatNickname(nickname);
                      assinaturaUrl = await uploadAssinatura(consentRecord.signatureDataUrl, formattedNick);
                    } catch (uploadErr) {
                      console.warn("Aviso ao enviar assinatura em desistência:", uploadErr);
                    }
                  }
                  await salvarSessaoPesquisa({
                    sessionId,
                    status: 'desistencia',
                    nickname,
                    assinaturaUrl,
                    consentRecord,
                    userAnswers,
                    bonusAnswers,
                    totalQuizDurationSeconds,
                    dropoutData: dropoutPayload,
                    timestamps: timestampsSaida,
                    engajamento
                  });
                } catch (err) {
                  console.error("Erro ao registrar desistência no Firestore:", err);
                }
              }
            }}
            onResumeGame={() => {
              registrarInteracaoEngajamento(prev => ({
                ...prev,
                tentativasSaidaCanceladas: prev.tentativasSaidaCanceladas + 1
              }));
              setCurrentScreen(originScreenBeforeExit || 'QUIZ');
            }}
            onReturnHome={handlePlayAgain}
            playClick={playClick}
          />
        )}

        {currentScreen === 'BONUS_INTRO' && (
          <BonusIntro 
            onNext={() => {
              setSessionTimestamps(prev => ({
                ...prev,
                bonusIniciadoEm: prev.bonusIniciadoEm || new Date().toISOString()
              }));
              setCurrentScreen('BONUS_QUESTIONS');
            }}
            onBack={() => {
              setCurrentQuestionIdx(QUIZ_QUESTIONS.length - 1);
              setCurrentScreen('QUIZ');
            }}
            playClick={playClick}
          />
        )}

        {currentScreen === 'BONUS_QUESTIONS' && (
          <BonusQuestion 
            key={BONUS_QUESTIONS[currentBonusIdx].id}
            bonusData={BONUS_QUESTIONS[currentBonusIdx]}
            currentIndex={currentBonusIdx}
            totalBonus={BONUS_QUESTIONS.length}
            savedAnswer={bonusAnswers[BONUS_QUESTIONS[currentBonusIdx].id]}
            onAnswerBonus={handleAnswerBonus}
            onNext={() => {
              if (currentBonusIdx < BONUS_QUESTIONS.length - 1) {
                setCurrentBonusIdx(idx => idx + 1);
              } else {
                playFanfare();
                setCurrentScreen('COMPLETION');
              }
            }}
            onPrev={() => {
              if (currentBonusIdx > 0) {
                setCurrentBonusIdx(idx => idx - 1);
              } else {
                setCurrentScreen('BONUS_INTRO');
              }
            }}
            onExit={handleRequestExit}
            playClick={playClick}
            playCorrect={playCorrect}
          />
        )}

        {currentScreen === 'COMPLETION' && (
          <CompletionScreen 
            score={score}
            totalQuestions={QUIZ_QUESTIONS.length}
            nickname={nickname}
            onPlayAgain={handlePlayAgain}
            onOpenReview={handleOpenReview}
            onExportData={handleExportData}
            onOpenRanking={handleOpenRanking}
            saveStatus={saveStatus}
            playClick={playClick}
          />
        )}
      </main>

      {/* Global Modals */}
      {showExitModal && (
        <ExitConfirmModal 
          onCancel={() => {
            registrarInteracaoEngajamento(prev => ({
              ...prev,
              tentativasSaidaCanceladas: prev.tentativasSaidaCanceladas + 1
            }));
            setShowExitModal(false);
          }}
          onConfirm={() => {
            setShowExitModal(false);
            setCurrentScreen('EXIT_FEEDBACK');
          }}
          playClick={playClick}
        />
      )}

      {showReviewModal && (
        <ReviewModal 
          userAnswers={userAnswers}
          onClose={() => setShowReviewModal(false)}
          playClick={playClick}
          onFilterChange={(filterId) => {
            registrarInteracaoEngajamento(prev => ({
              ...prev,
              filtrosRevisaoUtilizados: prev.filtrosRevisaoUtilizados.includes(filterId)
                ? prev.filtrosRevisaoUtilizados
                : [...prev.filtrosRevisaoUtilizados, filterId]
            }));
          }}
        />
      )}

      {showRankingModal && (
        <RankingModal 
          isOpen={showRankingModal}
          onClose={() => setShowRankingModal(false)}
          currentNickname={nickname}
        />
      )}
    </div>
  );
}
