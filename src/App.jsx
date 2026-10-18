import React, { useState, useMemo, useEffect } from 'react';
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
import { salvarJogador, uploadAssinatura, formatNickname } from './services/jogadorService.js';

export function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('LANDING'); 
  // 'LANDING' | 'CONTENT_WARNING' | 'NICKNAME' | 'VIDEO_1' | 'VIDEO_2' | 'QUIZ' | 
  // 'BONUS_INTRO' | 'BONUS_QUESTIONS' | 'COMPLETION'

  // Quiz Indexes
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentBonusIdx, setCurrentBonusIdx] = useState(0);

  // Participant Data
  const [nickname, setNickname] = useState('');
  const [consentRecord, setConsentRecord] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: { selectedOpt, isCorrect } }
  const [bonusAnswers, setBonusAnswers] = useState({});

  const [dropoutData, setDropoutData] = useState(null);
  const [sessionStartTime] = useState(new Date().toISOString());

  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, error: null });

  // Salva os dados no Firestore e Storage ao atingir a tela final
  useEffect(() => {
    if (currentScreen === 'COMPLETION' && nickname && !saveStatus.success && !saveStatus.loading) {
      const salvarDadosFinais = async () => {
        setSaveStatus({ loading: true, success: false, error: null });
        try {
          let assinaturaUrl = "assinaturas/sem_assinatura.png";
          if (consentRecord?.signatureDataUrl) {
            try {
              const formattedNick = formatNickname(nickname);
              assinaturaUrl = await uploadAssinatura(consentRecord.signatureDataUrl, formattedNick);
            } catch (uploadErr) {
              console.warn("Aviso ao enviar assinatura para o storage:", uploadErr);
            }
          }
          const tempoSegundos = Math.max(1, Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000));
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
  }, [currentScreen, nickname]);

  // Audio Hook
  const { muted, toggleMute, playClick, playCorrect, playIncorrect, playFanfare } = useAudio();

  // Calculated Score
  const score = useMemo(() => {
    return Object.values(userAnswers).filter(a => a.isCorrect).length;
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

  // Answer handler for Core Quiz
  const handleAnswerQuestion = (qId, selectedOpt, isCorrect) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: { selectedOpt, isCorrect }
    }));
  };

  // Answer handler for Bonus Questions
  const handleAnswerBonus = (bonusId, selectedOpt) => {
    setBonusAnswers(prev => ({
      ...prev,
      [bonusId]: selectedOpt
    }));
  };

  // Export Study Data as JSON
  const handleExportData = () => {
    const studyRecord = {
      participantNickname: nickname,
      sessionStartedAt: sessionStartTime,
      sessionFinishedAt: new Date().toISOString(),
      consent: consentRecord,
      dropout: dropoutData,
      score: {
        totalCorrect: score,
        totalQuestions: QUIZ_QUESTIONS.length,
        percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100)
      },
      answers: userAnswers,
      bonusAnswers,

    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studyRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quiz_legado_${nickname || 'participante'}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restart Quiz
  const handlePlayAgain = () => {
    setUserAnswers({});
    setBonusAnswers({});

    setConsentRecord(null);
    setDropoutData(null);
    setCurrentQuestionIdx(0);
    setCurrentBonusIdx(0);
    setSaveStatus({ loading: false, success: false, error: null });
    setCurrentScreen('LANDING');
  };

  return (
    <div className="app-wrapper">
      {/* Top Header Ribbon with dynamic titles (hidden on LANDING since Frame 227 already has the header embedded) */}
      {currentScreen !== 'LANDING' && (
        <TopRibbon 
          title={headerTitle}
          onToggleMute={toggleMute}
          muted={muted}
          nickname={nickname}
          onShowRanking={() => setShowRankingModal(true)}
        />
      )}

      {/* Screen Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentScreen === 'LANDING' && (
          <LandingScreen 
            onStartGame={() => setCurrentScreen('CONTENT_WARNING')}
            playClick={playClick}
            muted={muted}
            onToggleMute={toggleMute}
            onShowRanking={() => setShowRankingModal(true)}
          />
        )}

        {currentScreen === 'CONTENT_WARNING' && (
          <ContentWarning 
            onContinue={() => setCurrentScreen('NICKNAME')}
            onExit={() => setShowExitModal(true)}
            playClick={playClick}
          />
        )}

        {currentScreen === 'NICKNAME' && (
          <NicknameScreen 
            onConfirmNickname={(name, consentData) => {
              setNickname(name);
              setConsentRecord(consentData);
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
            onExit={() => setShowExitModal(true)}
            playClick={playClick}
            playCorrect={playCorrect}
            playIncorrect={playIncorrect}
            nickname={nickname}
          />
        )}

        {currentScreen === 'EXIT_FEEDBACK' && (
          <ExitFeedbackScreen 
            onConfirmExit={(reason) => {
              setDropoutData({
                reasonId: reason.id,
                reasonLabel: reason.label,
                screenAtExit: `QUIZ_Q${currentQuestionIdx + 1}`,
                timestamp: new Date().toISOString()
              });
            }}
            onResumeGame={() => setCurrentScreen('QUIZ')}
            onReturnHome={handlePlayAgain}
            playClick={playClick}
          />
        )}

        {currentScreen === 'BONUS_INTRO' && (
          <BonusIntro 
            onNext={() => setCurrentScreen('BONUS_QUESTIONS')}
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
            onExit={() => setShowExitModal(true)}
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
            onOpenReview={() => setShowReviewModal(true)}
            onExportData={handleExportData}
            onOpenRanking={() => setShowRankingModal(true)}
            saveStatus={saveStatus}
            playClick={playClick}
          />
        )}
      </main>

      {/* Global Modals */}
      {showExitModal && (
        <ExitConfirmModal 
          onCancel={() => setShowExitModal(false)}
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
