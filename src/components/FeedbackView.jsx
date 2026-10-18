import React from 'react';

/**
 * Outlined Lightbulb SVG Icon with radiating rays
 * Faithfully matches Frame 222 & Frame 223 reference design
 */
export function LightbulbRaysIcon({ size = 26, color = '#ffffff', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Radiating rays */}
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      {/* Bulb outline */}
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5h6.18z" />
    </svg>
  );
}

/**
 * Reusable Feedback View Component
 * Faithful implementation of Frame 222 (Correct) and Frame 223 (Incorrect)
 */
export function FeedbackView({
  headlineText,
  isCorrect,
  options = [],
  correctAnswer,
  selectedAnswer,
  complementText,
  complementTitle = 'Complemento:',
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  prevLabel = 'Retornar',
  nextLabel = 'Próxima →'
}) {
  const defaultHeadline = isCorrect ? 'Boa! Resposta correta.' : 'Opa! Resposta incorreta.';
  const displayHeadline = headlineText || defaultHeadline;

  return (
    <div className="quiz-feedback-container">
      {/* Feedback Headline: Left-aligned above the options stack */}
      <div className={`feedback-headline ${isCorrect ? 'correct' : 'incorrect'}`}>
        {displayHeadline}
      </div>

      {/* Options Stack */}
      <div className="feedback-options-stack">
        {options.map((opt) => {
          const isThisOptionCorrect = opt.id === correctAnswer;
          const isUserChoice = opt.id === selectedAnswer;

          // Determine card state
          let stateClass = 'state-neutral';
          if (isThisOptionCorrect) {
            stateClass = 'state-correct';
          } else if (isUserChoice) {
            stateClass = 'state-incorrect';
          }

          const hasAttachedComplement = isThisOptionCorrect && Boolean(complementText);

          return (
            <div key={opt.id} className="feedback-option-group">
              {/* Option Bar */}
              <div
                className={`feedback-option-btn ${stateClass} ${hasAttachedComplement ? 'has-attached-complement' : ''}`}
              >
                <div className="feedback-option-badge">
                  {opt.id}
                </div>
                <div className="feedback-option-body">
                  {opt.text}
                </div>
              </div>

              {/* Seamlessly Attached Complement Box directly below correct option */}
              {hasAttachedComplement && (
                <div className="feedback-complement-card">
                  <div className="feedback-complement-header">
                    <LightbulbRaysIcon size={24} color="#ffffff" />
                    <span>{complementTitle}</span>
                  </div>
                  <div className="feedback-complement-body">
                    {complementText}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Progress Track, Question Counter, Navigation Buttons */}
      <div className="feedback-footer-container">
        <div className="feedback-progress-wrapper">
          <div className="feedback-progress-track">
            <div
              className="feedback-progress-fill"
              style={{
                width: `${Math.max(4, Math.round(((currentIndex + 1) / totalQuestions) * 100))}%`
              }}
            />
          </div>
          <div className="feedback-progress-counter">
            {currentIndex + 1}/{totalQuestions}
          </div>
        </div>

        <div className="feedback-nav-buttons">
          <button
            type="button"
            className="feedback-nav-btn"
            onClick={onPrev}
            disabled={!canPrev}
            style={{
              opacity: canPrev ? 1 : 0.45,
              cursor: canPrev ? 'pointer' : 'not-allowed'
            }}
          >
            {prevLabel}
          </button>

          <button
            type="button"
            className="feedback-nav-btn"
            onClick={onNext}
            disabled={!canNext}
            style={{
              opacity: canNext ? 1 : 0.45,
              cursor: canNext ? 'pointer' : 'not-allowed'
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
