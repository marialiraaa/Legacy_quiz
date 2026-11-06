import React, { useState, useEffect, useRef } from 'react';

export function BonusQuestion({
  bonusData,
  currentIndex,
  totalBonus,
  onAnswerBonus,
  onNext,
  onPrev,
  savedAnswer,
  playClick,
  playCorrect,
  onExit
}) {
  const initialOpt = typeof savedAnswer === 'object' && savedAnswer !== null
    ? (savedAnswer.selectedOption || savedAnswer.selectedOpt)
    : (savedAnswer || null);
  const [selected, setSelected] = useState(initialOpt);
  const startTimeRef = useRef(Date.now());

  // Sync state & reset timer if question index changes
  useEffect(() => {
    const nextOpt = typeof savedAnswer === 'object' && savedAnswer !== null
      ? (savedAnswer.selectedOption || savedAnswer.selectedOpt)
      : (savedAnswer || null);
    setSelected(nextOpt);
    startTimeRef.current = Date.now();
  }, [bonusData.id, currentIndex, savedAnswer]);

  const handleSelect = (optId) => {
    if (selected) return; // Prevent double click
    const startTime = startTimeRef.current;
    const endTime = Date.now();
    const elapsedMs = Math.max(1, endTime - startTime);
    const timeSpentSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
    const startedAt = new Date(startTime).toISOString();
    const answeredAt = new Date(endTime).toISOString();

    setSelected(optId);
    playClick?.();
    playCorrect?.();
    onAnswerBonus?.(bonusData.id, optId, {
      questionId: bonusData.id,
      selectedOption: optId,
      timeSpentSeconds,
      startedAt,
      answeredAt,
      tempoRespostaMs: elapsedMs,
      respondidaEm: answeredAt
    });

    // No feedback screen for bonus questions: immediately advance to next question or completion
    setTimeout(() => {
      onNext();
    }, 280);
  };

  return (
    <div className="screen-content">
      {/* Category / Bonus Tag */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div className="category-pill" style={{ background: '#fef3c7', color: '#92400e', borderLeft: '4px solid #f59e0b' }}>
          <span>✨</span>
          <span>{bonusData.title}</span>
        </div>
      </div>

      <div className="quiz-unanswered-container">
        {bonusData.image && (
          <div className="question-illustration-box" style={{ borderColor: '#818cf8', maxWidth: '720px' }}>
            <img 
              src={bonusData.image} 
              alt="Ilustração da Pergunta Bônus" 
              className="question-illustration-img"
              onError={(e) => {
                e.currentTarget.src = currentIndex === 0 ? "assets/frame-235.png" : "assets/frame-233.png";
              }}
            />
          </div>
        )}

        {/* 3 Option cards */}
        <div className="options-row" style={{ marginTop: '16px' }}>
          {bonusData.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.id)}
                disabled={selected !== null}
                style={{ width: '100%' }}
              >
                <div className="option-badge">
                  {opt.id}
                </div>
                <div className="option-text">
                  {opt.text}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="quiz-footer">
        <div className="feedback-progress-wrapper" style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          <div className="feedback-progress-track">
            <div 
              className="feedback-progress-fill"
              style={{ 
                width: `${Math.max(4, Math.round(((currentIndex + 1) / totalBonus) * 100))}%` 
              }}
            />
          </div>
          <div className="feedback-progress-counter">
            Bônus {currentIndex + 1}/{totalBonus}
          </div>
        </div>

        <div className="nav-buttons-row">
          <button 
            type="button"
            className="feedback-nav-btn btn-exit-game"
            onClick={() => {
              playClick?.();
              onExit?.();
            }}
            title="Sair do Jogo"
          >
            <span>🚪</span>
            <span>Sair do Jogo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
