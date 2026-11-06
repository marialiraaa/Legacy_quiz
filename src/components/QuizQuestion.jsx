import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../data/questions.js';
import { FeedbackView } from './FeedbackView.jsx';

export function QuizQuestion({
  questionData,
  currentIndex,
  totalQuestions,
  onAnswer,
  onNext,
  onPrev,
  userAnswer,
  playClick,
  playCorrect,
  playIncorrect,
  nickname,
  onExit
}) {
  const [selectedOpt, setSelectedOpt] = useState(userAnswer || null);
  const startTimeRef = useRef(Date.now());
  const isAnswered = selectedOpt !== null;
  const isCorrect = selectedOpt === questionData.correctAnswer;
  const categoryInfo = CATEGORIES[questionData.category] || CATEGORIES.BASIC_CONCEPTS;

  // Reinicia o contador de tempo automaticamente a cada mudança de questão
  useEffect(() => {
    setSelectedOpt(userAnswer || null);
    startTimeRef.current = Date.now();
  }, [questionData.id, currentIndex, userAnswer]);

  const handleSelectOption = (optId) => {
    if (isAnswered) return;
    const startTime = startTimeRef.current;
    const endTime = Date.now();
    const elapsedMs = Math.max(1, endTime - startTime);
    const timeSpentSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
    const startedAt = new Date(startTime).toISOString();
    const answeredAt = new Date(endTime).toISOString();

    setSelectedOpt(optId);
    const correct = optId === questionData.correctAnswer;
    if (correct) {
      playCorrect?.();
    } else {
      playIncorrect?.();
    }
    onAnswer(questionData.id, optId, correct, {
      questionId: `q${questionData.id}`,
      selectedOption: optId,
      timeSpentSeconds,
      startedAt,
      answeredAt,
      tempoRespostaMs: elapsedMs,
      respondidaEm: answeredAt
    });
  };

  // If already answered, render the exact Reference Design Feedback Screen (Frame 222 / Frame 223)
  if (isAnswered) {
    return (
      <div className="screen-content feedback-screen-wrapper">
        <FeedbackView
          isCorrect={isCorrect}
          options={questionData.options}
          correctAnswer={questionData.correctAnswer}
          selectedAnswer={selectedOpt}
          complementText={questionData.complement}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onPrev={() => {
            playClick?.();
            onExit?.();
          }}
          onNext={() => {
            playClick?.();
            onNext();
          }}
          canPrev={true}
          canNext={true}
          prevLabel="Sair do Jogo"
          nextLabel="Próxima →"
        />
      </div>
    );
  }

  // Unanswered State: Illustration and Interactive Options
  return (
    <div className="screen-content">
      {/* Meta Bar: Category Pill */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '860px',
        margin: '0 auto 10px',
        width: '100%',
        padding: '0 6px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div className="category-pill" style={{ borderLeft: `4px solid ${categoryInfo.color}` }}>
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.name}</span>
        </div>
      </div>

      <div className="quiz-unanswered-container">
        {/* Question illustration if available */}
        {questionData.image ? (
          <div className="question-illustration-box">
            <img 
              src={questionData.image} 
              alt="Ilustração da Pergunta" 
              className="question-illustration-img"
            />
          </div>
        ) : (
          <div className="question-placeholder-box">
            <span style={{ fontSize: '3.5rem' }}>{questionData.icon || categoryInfo.icon}</span>
            <p style={{ marginTop: '8px', color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
              Reflita sobre os aspectos conceituais e éticos desta questão
            </p>
          </div>
        )}

        {/* Unanswered Interactive Options */}
        <div className="options-row">
          {questionData.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="option-card"
              onClick={() => {
                playClick?.();
                handleSelectOption(opt.id);
              }}
              style={{ width: '100%' }}
            >
              <div className="option-badge">
                {opt.id}
              </div>
              <div className="option-text">
                {opt.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer: Progress bar & Return button */}
      <div className="quiz-footer">
        <div className="feedback-progress-wrapper" style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          <div className="feedback-progress-track">
            <div 
              className="feedback-progress-fill"
              style={{ width: `${Math.max(4, Math.round(((currentIndex + 1) / totalQuestions) * 100))}%` }}
            />
          </div>
          <div className="feedback-progress-counter">
            {currentIndex + 1}/{totalQuestions}
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
