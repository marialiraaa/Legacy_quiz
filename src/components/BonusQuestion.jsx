import React, { useState, useEffect, useRef } from 'react';

export function BonusQuestion({
  bonusData,
  currentIndex,
  totalBonus,
  onAnswerBonus,
  onNext,
  savedAnswer,
  playClick,
  playCorrect,
  onExit
}) {
  const initialOpt =
    typeof savedAnswer === 'object' && savedAnswer !== null
      ? savedAnswer.selectedOption || savedAnswer.selectedOpt
      : savedAnswer || null;

  const [selectedOption, setSelectedOption] = useState(initialOpt);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const startTimeRef = useRef(Date.now());

  const isLastBonus = currentIndex === totalBonus - 1;
  const feedbackText =
    bonusData.feedback ||
    bonusData.reflection ||
    'Obrigado por compartilhar sua reflexão sobre seu legado digital.';

  const progressPercentage = Math.max(
    10,
    Math.round(((currentIndex + 1) / totalBonus) * 100)
  );

  // Limpa estados e reinicia o cronômetro a cada transição de pergunta bônus
  useEffect(() => {
    const nextOpt =
      typeof savedAnswer === 'object' && savedAnswer !== null
        ? savedAnswer.selectedOption || savedAnswer.selectedOpt
        : savedAnswer || null;
    setSelectedOption(nextOpt);
    setIsConfirmed(false);
    startTimeRef.current = Date.now();
  }, [bonusData.id, currentIndex, savedAnswer]);

  // Etapa 1: Seleção sem avanço imediato (Anti-Misclick)
  const handleSelectOption = (optId) => {
    if (isConfirmed) return;
    playClick?.();
    setSelectedOption(optId);
  };

  // Etapa 2: Confirmação da pergunta de reflexão (tipo === "reflexao")
  const handleConfirmBonus = () => {
    if (isConfirmed || !selectedOption) return;

    const startTime = startTimeRef.current;
    const endTime = Date.now();
    const elapsedMs = Math.max(1, endTime - startTime);
    const timeSpentSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
    const startedAt = new Date(startTime).toISOString();
    const answeredAt = new Date(endTime).toISOString();

    setIsConfirmed(true);
    playClick?.();
    playCorrect?.();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }

    onAnswerBonus?.(bonusData.id, selectedOption, {
      questionId: bonusData.id,
      selectedOption,
      timeSpentSeconds,
      startedAt,
      answeredAt,
      tempoRespostaMs: elapsedMs,
      respondidaEm: answeredAt,
      tipo: 'reflexao'
    });
  };

  // Etapa 3: Avançar para a próxima pergunta bônus ou tela de resultado
  const handleAdvance = () => {
    playClick?.();
    onNext?.();
  };

  return (
    <div className="screen-content gamified-quiz-screen">
      <div className="gamified-quiz-card">
        {/* 1. Barra de Progresso Gamificada no Topo */}
        <div className="gamified-top-header">
          <div className="gamified-meta-row">
            <div
              className="category-pill gamified-category-pill"
              style={{
                background: '#f5f3ff',
                color: '#6d28d9',
                borderLeft: '4px solid #8b5cf6'
              }}
            >
              <span>✨</span>
              <span>{bonusData.title || 'Reflexão Pessoal'}</span>
            </div>

            <div className="gamified-counter-badge">
              Reflexão <strong>{currentIndex + 1}</strong> de <strong>{totalBonus}</strong>
            </div>
          </div>

          <div
            className="gamified-progress-track"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalBonus}
          >
            <div
              className="gamified-progress-fill reflection-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 2. Corpo Animado da Questão (slideInFade) */}
        <div key={bonusData.id} className="gamified-question-stage slide-in-fade">
          <div className="options-row gamified-options-list">
            {bonusData.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let stateClass = '';
              let statusIcon = null;

              if (!isConfirmed) {
                if (isSelected) {
                  stateClass = 'selected';
                  statusIcon = '✓';
                }
              } else {
                if (isSelected) {
                  stateClass = 'confirmed-reflection';
                  statusIcon = '💬';
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
                    {opt.text}
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

          {/* 3. Balão de Feedback Reflexivo (slideUpFade após confirmar) */}
          {isConfirmed && feedbackText && (
            <div
              className="gamified-feedback-balloon slide-up-fade tone-reflection"
              role="status"
              aria-live="polite"
            >
              <div className="gamified-feedback-header">
                <span className="gamified-feedback-icon">💬</span>
                <span className="gamified-feedback-title">
                  Reflexão Registrada
                </span>
              </div>
              <p className="gamified-feedback-text">{feedbackText}</p>
            </div>
          )}
        </div>

        {/* 4. Barra de Ação Fixa/Visível */}
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
              onClick={handleConfirmBonus}
            >
              Confirmar Resposta
            </button>
          ) : (
            <button
              type="button"
              className="btn-next-question gamified-btn-primary"
              onClick={handleAdvance}
            >
              {isLastBonus ? 'Ver Resultado 🏆' : 'Próxima Pergunta →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
