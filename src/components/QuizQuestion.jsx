import React, { useState, useRef, useEffect } from 'react';
import { getCategoryInfo, EMOTION_SCALE } from '../data/questions.js';

export function QuizQuestion({
  questionData,
  currentIndex,
  totalQuestions,
  onAnswer,
  onEmotionSelect,
  onNext,
  userAnswer,
  savedEmotionScore = null,
  streak = 0,
  playClick,
  playCorrect,
  playIncorrect,
  onExit
}) {
  const [selectedOption, setSelectedOption] = useState(userAnswer || null);
  const [isConfirmed, setIsConfirmed] = useState(Boolean(userAnswer));
  const [selectedEmotion, setSelectedEmotion] = useState(savedEmotionScore || null);
  const startTimeRef = useRef(Date.now());
  const timingMetaRef = useRef(null);

  // Suporta tanto o formato novo (alternativas/texto/correta/pergunta/categoria/imagem) quanto o legado
  const alternatives = questionData.alternativas || questionData.options || [];
  const questionType =
    questionData.tipo ||
    (questionData.correctAnswer ? 'conhecimento' : 'reflexao');
  const isReflection = questionType === 'reflexao';
  const requiresEmotion = Boolean(questionData.medirEmocao);

  // Descobre o ID da alternativa correta quando tipo === "conhecimento"
  const correctOptionObj = alternatives.find((a) => a.correta === true);
  const correctOptionId = isReflection
    ? null
    : correctOptionObj?.id || questionData.correctAnswer || null;

  const isCorrect = !isReflection && selectedOption === correctOptionId;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const categoryInfo = getCategoryInfo(
    questionData.categoria || questionData.category
  );
  const questionImage = questionData.imagem || questionData.image || null;
  const feedbackText =
    questionData.feedback ||
    questionData.complement ||
    questionData.reflection ||
    '';

  const progressPercentage = Math.max(
    5,
    Math.round(((currentIndex + 1) / totalQuestions) * 100)
  );

  // Reinicia estados locais (opção, confirmação, emoção e cronômetro) a cada mudança de questão
  useEffect(() => {
    setSelectedOption(userAnswer || null);
    setIsConfirmed(Boolean(userAnswer));
    setSelectedEmotion(savedEmotionScore || null);
    startTimeRef.current = Date.now();
  timingMetaRef.current = null;
}, [questionData.id, currentIndex, userAnswer, savedEmotionScore]);

// Etapa 1: Seleção sem validação imediata (Anti-Misclick)
const handleSelectOption = (optId) => {
  if (isConfirmed) return;
  playClick?.();
  setSelectedOption(optId);
};

// Etapa 2: Confirmação com feedback sensorial (áudio + vibração tátil + animação + streak)
const handleConfirmAnswer = () => {
  if (isConfirmed || !selectedOption) return;

  const startTime = startTimeRef.current;
  const endTime = Date.now();
  const elapsedMs = Math.max(1, endTime - startTime);
  const timeSpentSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
  const startedAt = new Date(startTime).toISOString();
  const answeredAt = new Date(endTime).toISOString();

  setIsConfirmed(true);

  const selectedAltObj = alternatives.find((a) => a.id === selectedOption);
  let evaluatedCorrect = null;

  if (isReflection) {
    evaluatedCorrect = null;
    playCorrect?.();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  } else {
    evaluatedCorrect =
      typeof selectedAltObj?.correta === 'boolean'
        ? selectedAltObj.correta
        : selectedOption === correctOptionId;

    if (evaluatedCorrect) {
      playCorrect?.();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      playIncorrect?.();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
    }
  }

    const baseMeta = {
      questionId: `q${questionData.id}`,
      selectedOption,
      timeSpentSeconds,
      startedAt,
      answeredAt,
      tempoRespostaMs: elapsedMs,
      respondidaEm: answeredAt,
      tipo: questionType,
      categoria: questionData.categoria || categoryInfo.name,
      emotionScore: null,
      emotionLabel: null
    };
    timingMetaRef.current = { evaluatedCorrect, baseMeta };

    onAnswer?.(questionData.id, selectedOption, evaluatedCorrect, baseMeta);
};

  // Seleção de emoção no Termômetro Emocional (5 níveis) e sincronização com o estado global / Firebase
  const handleSelectEmotion = (emotionItem) => {
    playClick?.();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setSelectedEmotion(emotionItem.score);

    if(onEmotionSelect) {
          onEmotionSelect(questionData.id, {
            emotionScore: emotionItem.score,
            emotionLabel: emotionItem.label,
            emotionEmoji: emotionItem.emoji
          });
        } else if(timingMetaRef.current) {
        onAnswer?.(
          questionData.id,
          selectedOption,
          timingMetaRef.current.evaluatedCorrect,
          {
            ...timingMetaRef.current.baseMeta,
            emotionScore: emotionItem.score,
            emotionLabel: emotionItem.label,
            skipStreakUpdate: true
          }
        );
      }
    };

    // Etapa 3: Avançar para a próxima pergunta (bloqueado se medirEmocao === true e nenhuma emoção foi escolhida)
    const canAdvance = !requiresEmotion || selectedEmotion !== null;

    const handleAdvance = () => {
      if (!canAdvance) return;
      playClick?.();
      onNext?.();
    };

    return (
      <div className="screen-content gamified-quiz-screen">
          <div
            className={`gamified-quiz-card ${isConfirmed ? 'has-feedback-open' : ''
              } ${requiresEmotion ? 'has-emotion-thermometer' : ''}`}
          >
            {/* 1. Barra de Progresso Gamificada no Topo + Categoria, Streak Badge e Contagem */}
            <div className="gamified-top-header">
              <div className="gamified-meta-row">
                <div
                  className="category-pill gamified-category-pill"
                  style={{
                    borderLeft: `4px solid ${categoryInfo.color}`,
                    background: isReflection ? '#f5f3ff' : undefined,
                    color: isReflection ? '#6d28d9' : undefined
                  }}
                >
                  <span>{categoryInfo.icon}</span>
                  <span>{questionData.categoria || categoryInfo.name}</span>
                </div>

                <div className="gamified-meta-right">
                  {streak >= 2 && (
                    <div
                      key={`streak-${streak}`}
                      className="streak-badge-pill"
                      title={`Sequência de Consciência: ${streak} seguidas!`}
                      aria-live="polite"
                    >
                      <span className="streak-flame-icon" aria-hidden="true">
                        🔥
                      </span>
                      <span>{streak} seguidas!</span>
                    </div>
                  )}

                  <div className="gamified-counter-badge">
                    Pergunta <strong>{currentIndex + 1}</strong> de <strong>{totalQuestions}</strong>
                  </div>
                </div>
              </div>

              <div
                className="gamified-progress-track"
                role="progressbar"
                aria-valuenow={currentIndex + 1}
                aria-valuemin={1}
                aria-valuemax={totalQuestions}
              >
                <div
                  className={`gamified-progress-fill ${isReflection ? 'reflection-fill' : ''}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* 2. Corpo Animado da Questão (slideInFade a cada troca de índice/ID) */}
            <div
              key={questionData.id}
              className={`gamified-question-stage slide-in-fade ${isConfirmed ? 'is-confirmed-stage' : ''
                } ${requiresEmotion && isConfirmed ? 'has-emotion-open' : ''}`}
            >
              {/* Ilustração da Pergunta Redimensionada Proporcionalmente */}
              {questionImage && (
                <div className="gamified-illustration-box">
                  <img
                    src={questionImage}
                    alt={`Ilustração da pergunta ${questionData.id}`}
                    className="gamified-illustration-img"
                  />
                </div>
              )}

              {/* Lista de Alternativas */}
              <div className="options-row gamified-options-list">
                {alternatives.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isRightOption =
                    !isReflection &&
                    (opt.correta === true || opt.id === correctOptionId);
                  const optText = opt.texto || opt.text;

                  let stateClass = '';
                  let statusIcon = null;

                  if (!isConfirmed) {
                    if (isSelected) {
                      stateClass = 'selected';
                      statusIcon = '✓';
                    }
                  } else if (isReflection) {
                    if (isSelected) {
                      stateClass = 'confirmed-reflection';
                      statusIcon = '💬';
                    } else {
                      stateClass = 'confirmed-dimmed';
                    }
                  } else {
                    if (isRightOption) {
                      stateClass = 'confirmed-correct';
                      statusIcon = '✓';
                    } else if (isSelected && !isRightOption) {
                      stateClass = 'confirmed-wrong';
                      statusIcon = '✕';
                    } else {
                      stateClass = 'confirmed-dimmed';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`option-card gamified-option-card ${stateClass}`}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isConfirmed}
                      aria-pressed={isSelected}
                    >
                      <div className="option-badge gamified-option-badge">
                        {opt.id}
                      </div>
                      <div className="option-text gamified-option-text">
                        {optText}
                      </div>
                      <div
                        className={`option-status-icon ${statusIcon ? 'visible' : ''}`}
                        aria-hidden="true"
                      >
                        {statusIcon}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3. Balão de Feedback Educativo (slideUpFade após confirmar) */}
              {isConfirmed && feedbackText && (
                <div
              className={`gamified-feedback-balloon slide-up-fade ${isReflection
                      ? 'tone-reflection'
                      : isCorrect
                  ? 'tone-correct'
                  : 'tone-wrong'
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="gamified-feedback-header">
                <span className="gamified-feedback-icon">
                  {isReflection ? '✨' : isCorrect ? '🎉' : '💡'}
                </span>
                <span className="gamified-feedback-title">
                  {isReflection
                    ? 'Reflexão Registrada'
                    : isCorrect
                  ? 'Boa! Resposta correta.'
                    : 'Opa! Veja a explicação:'}
                </span>
                {isReflection && streak >= 2 && (
                  <span className="gamified-streak-bonus-note">
                    🔥 Bônus de reflexão! Sequência mantida ({streak} seguidas)
                  </span>
                )}
              </div>
              <p className="gamified-feedback-text">{feedbackText}</p>
            </div>
          )}

          {/* 4. Termômetro Emocional (5 Níveis Face Scale) nas questões com medirEmocao: true */}
            {isConfirmed && requiresEmotion && (
              <div
                className="emotion-thermometer-box slide-up-fade"
                role="group"
                aria-label="Como você se sente sobre isso?"
              >
                <div className="emotion-thermometer-title">
                  Como você se sente sobre isso?
                </div>
                <div className="emotion-thermometer-row">
                  {EMOTION_SCALE.map((item) => {
                    const isEmotionSelected = selectedEmotion === item.score;
                    const isEmotionDimmed =
                      selectedEmotion !== null && !isEmotionSelected;

                    return (
                      <button
                        key={item.score}
                        type="button"
                        className={`emotion-face-btn ${isEmotionSelected ? 'selected' : ''
                          } ${isEmotionDimmed ? 'dimmed' : ''}`}
                        style={{
                          '--emotion-color': item.color,
                          '--emotion-bg': item.bg
                        }}
                        onClick={() => handleSelectEmotion(item)}
                        aria-pressed={isEmotionSelected}
                        title={`${item.label} (Nota ${item.score})`}
                      >
                        <span className="emotion-face-emoji" aria-hidden="true">
                          {item.emoji}
                        </span>
                        <span className="emotion-face-label">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Barra de Ação Fixa/Visível (Confirmar Resposta -> Próxima Pergunta) */}
          <div className="gamified-action-bar">
            {onExit && (
              <button
                type="button"
                className="gamified-btn-exit"
                onClick={() => {
                  playClick?.();
                  onExit();
                }}
                title="Sair do Jogo"
              >
                🚪 Sair
              </button>
            )}

            {!isConfirmed ? (
              <button
                type="button"
                className="btn-confirm-answer gamified-btn-primary"
                disabled={selectedOption === null}
                onClick={handleConfirmAnswer}
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                type="button"
                className="btn-next-question gamified-btn-primary"
                disabled={!canAdvance}
                onClick={handleAdvance}
              >
              {!canAdvance
                  ? 'Escolha como se sente acima ↑'
                  : isLastQuestion
                ? 'Ver Resultado 🏆'
                : 'Próxima Pergunta →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
