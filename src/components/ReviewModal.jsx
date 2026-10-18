import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/questions.js';
import { LightbulbRaysIcon } from './FeedbackView.jsx';

export function ReviewModal({ userAnswers, onClose, playClick }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'INCORRECT'

  const filteredQuestions = QUIZ_QUESTIONS.filter(q => {
    const isCorrect = userAnswers[q.id]?.isCorrect;
    if (filter === 'CORRECT') return isCorrect;
    if (filter === 'INCORRECT') return !isCorrect;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e2952' }}>
              Revisão de Respostas & Gabarito
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Consulte as respostas, justificativas e complementos conceituais
            </p>
          </div>

          <button 
            type="button"
            className="icon-btn" 
            onClick={() => {
              playClick?.();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[
            { id: 'ALL', label: 'Todas as Questões' },
            { id: 'CORRECT', label: '✓ Apenas Acertos' },
            { id: 'INCORRECT', label: '✕ Apenas Erros' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClick?.();
                setFilter(tab.id);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: filter === tab.id ? '#1e2952' : '#e2e8f0',
                color: filter === tab.id ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredQuestions.map(q => {
            const ans = userAnswers[q.id];
            const isCorrect = ans?.isCorrect;
            const chosenId = ans?.selectedOpt;

            return (
              <div 
                key={q.id} 
                className="review-item"
                style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '16px',
                  border: isCorrect ? '2px solid #bbf7d0' : '2px solid #fecaca'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                  <span className="review-q-header" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e2952' }}>
                    {q.question}
                  </span>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    background: isCorrect ? '#dcfce7' : '#fee2e2',
                    color: isCorrect ? '#166534' : '#991b1b',
                    whiteSpace: 'nowrap'
                  }}>
                    {isCorrect ? '✓ Acertou' : '✕ Errou'}
                  </span>
                </div>

                {/* Question feedback options stack matching reference design */}
                <div className="feedback-options-stack">
                  {q.options.map(opt => {
                    const isRight = opt.id === q.correctAnswer;
                    const wasChosen = opt.id === chosenId;

                    let stateClass = 'state-neutral';
                    if (isRight) {
                      stateClass = 'state-correct';
                    } else if (wasChosen && !isRight) {
                      stateClass = 'state-incorrect';
                    }

                    const hasAttachedComplement = isRight && Boolean(q.complement);

                    return (
                      <div key={opt.id} className="feedback-option-group">
                        <div className={`feedback-option-btn ${stateClass} ${hasAttachedComplement ? 'has-attached-complement' : ''}`}>
                          <div className="feedback-option-badge">
                            {opt.id}
                          </div>
                          <div className="feedback-option-body">
                            <span>{opt.text}</span>
                            {wasChosen && !isRight && (
                              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.85rem', color: '#ff0b0b' }}>
                                (Sua Escolha)
                              </span>
                            )}
                            {wasChosen && isRight && (
                              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.85rem', color: '#4ade80' }}>
                                (Sua Escolha Correta)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attached complement box */}
                        {hasAttachedComplement && (
                          <div className="feedback-complement-card">
                            <div className="feedback-complement-header">
                              <LightbulbRaysIcon size={24} color="#ffffff" />
                              <span>Complemento:</span>
                            </div>
                            <div className="feedback-complement-body">
                              {q.complement}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            type="button"
            className="feedback-nav-btn" 
            onClick={onClose}
          >
            Fechar Revisão
          </button>
        </div>
      </div>
    </div>
  );
}
