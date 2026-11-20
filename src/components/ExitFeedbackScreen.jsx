import React, { useState } from 'react';

const EXIT_OPTIONS = [
  {
    id: 'tranquilo',
    score: 5,
    emoji: '😄',
    label: 'Tranquilo',
    color: '#1b5e20',
    bg: '#e8f5e9'
  },
  {
    id: 'curioso',
    score: 4,
    emoji: '🤔',
    label: 'Curioso',
    color: '#2e7d32',
    bg: '#f1f8e9'
  },
  {
    id: 'neutro',
    score: 3,
    emoji: '😐',
    label: 'Neutro',
    color: '#f57f17',
    bg: '#fffde7'
  },
  {
    id: 'preocupado',
    score: 2,
    emoji: '😟',
    label: 'Preocupado',
    color: '#ef6c00',
    bg: '#fff3e0'
  },
  {
    id: 'desconfortavel',
    score: 1,
    emoji: '😰',
    label: 'Desconfortável',
    color: '#c62828',
    bg: '#ffebee'
  }
];

export function ExitFeedbackScreen({
  onConfirmExit,
  onResumeGame,
  onReturnHome,
  playClick
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelect = (id) => {
    playClick?.();
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    playClick?.();
    const chosen = EXIT_OPTIONS.find(opt => opt.id === selectedId);
    onConfirmExit?.(chosen);
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="screen-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-surface exit-feedback-card" style={{ textAlign: 'center', maxWidth: '640px', padding: '36px 28px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
            🤝
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#1e2952', fontWeight: 800, margin: '0 0 12px' }}>
            Participação Encerrada
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
            Seu motivo foi registrado de forma anônima. Agradecemos sinceramente pela sua atenção e respeito pelo projeto de pesquisa <strong>Legacy Quiz / DAVI (UFMT)</strong>.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '0.88rem',
            color: '#64748b',
            marginBottom: '28px',
            textAlign: 'left'
          }}>
            ℹ️ Conforme o <strong>Termo de Consentimento Livre e Esclarecido (TCLE)</strong>, sua recusa ou desistência não acarreta nenhuma penalidade, constrangimento ou prejuízo financeiro.
          </div>

          <button
            type="button"
            className="feedback-nav-btn"
            style={{ minWidth: '220px', margin: '0 auto' }}
            onClick={() => {
              playClick?.();
              onReturnHome?.();
            }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-content">
      <div className="card-surface exit-feedback-card">
        {/* Main Question Heading */}
        <h2 className="exit-feedback-title">
          Por que você deseja sair?
        </h2>

        <p className="exit-feedback-subtitle">
          Sua resposta é anônima e nos ajuda a compreender a sensibilidade dos temas abordados no quiz.
        </p>

        {/* Emotion Cards Row matching the emoji design used in questions */}
        <div className="emotion-cards-row" role="radiogroup" aria-label="Motivo da saída">
          {EXIT_OPTIONS.map((opt) => {
            const isSelected = selectedId === opt.id;
            const hasSelection = Boolean(selectedId);

            return (
              <div 
                key={opt.id} 
                className="emotion-card-wrapper"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`emotion-card-btn ${isSelected ? 'selected' : ''} ${hasSelection && !isSelected ? 'dimmed' : ''}`}
                  style={{
                    borderColor: isSelected ? opt.color : undefined,
                    backgroundColor: isSelected ? opt.bg : undefined
                  }}
                  onClick={() => handleSelect(opt.id)}
                  title={`${opt.emoji} ${opt.label}`}
                >
                  <span className="exit-emotion-emoji" role="img" aria-label={opt.label}>
                    {opt.emoji}
                  </span>
                </button>
                <span
                  className={`emotion-card-label ${isSelected ? 'selected' : ''}`}
                  style={{ color: isSelected ? opt.color : undefined }}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="exit-feedback-actions">
          {onResumeGame && (
            <button
              type="button"
              className="feedback-nav-btn exit-cancel-btn"
              onClick={() => {
                playClick?.();
                onResumeGame();
              }}
            >
              Continuar Jogando
            </button>
          )}

          <button
            type="button"
            className="feedback-nav-btn exit-submit-btn"
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            Confirmar e Sair &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
