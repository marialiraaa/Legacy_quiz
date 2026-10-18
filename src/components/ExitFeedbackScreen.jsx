import React, { useState } from 'react';

/**
 * SVGs estilizados para as 4 emoções, fiéis à referência visual:
 * - 🥺 Me senti mal (amarelo)
 * - 😒 Não gostei do assunto (azul)
 * - 😰 Achei um tema pesado (roxo)
 * - 😐 Nada a declarar (cinza neutro)
 */

function FeltBadIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {/* Face Circle */}
      <circle cx="36" cy="36" r="32" fill="#FBB03B" />
      {/* Big Pleading Eyes */}
      <ellipse cx="26" cy="33" rx="6.5" ry="8" fill="#1E293B" />
      <circle cx="28" cy="30" r="2.8" fill="#FFFFFF" />
      <circle cx="24.5" cy="36" r="1.4" fill="#FFFFFF" />
      
      <ellipse cx="46" cy="33" rx="6.5" ry="8" fill="#1E293B" />
      <circle cx="48" cy="30" r="2.8" fill="#FFFFFF" />
      <circle cx="44.5" cy="36" r="1.4" fill="#FFFFFF" />
      
      {/* Eyebrows angled up */}
      <path d="M21 21C24 23 29 25 31 25" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M51 21C48 23 43 25 41 25" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Pouting/sad mouth */}
      <path d="M30 50C33 46 39 46 42 50" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DislikedTopicIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {/* Face Circle */}
      <circle cx="36" cy="36" r="32" fill="#2980B9" />
      {/* Unamused / Side-eye Half-closed eyes */}
      <ellipse cx="25" cy="34" rx="6.5" ry="6.5" fill="#1E293B" />
      <circle cx="22" cy="34" r="2.2" fill="#FFFFFF" />
      <path d="M18 29H32" stroke="#2980B9" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 27C21 27 28 27 31 29" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      <ellipse cx="47" cy="34" rx="6.5" ry="6.5" fill="#1E293B" />
      <circle cx="44" cy="34" r="2.2" fill="#FFFFFF" />
      <path d="M40 29H54" stroke="#2980B9" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 27C51 27 44 27 41 29" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Slanted unimpressed mouth */}
      <path d="M28 50L44 46" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function HeavyTopicIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {/* Face Circle */}
      <circle cx="36" cy="36" r="32" fill="#8E44AD" />
      {/* Worried eyes */}
      <ellipse cx="26" cy="36" rx="5" ry="5.5" fill="#1E293B" />
      <circle cx="27.5" cy="34.5" r="1.8" fill="#FFFFFF" />

      <ellipse cx="46" cy="36" rx="5" ry="5.5" fill="#1E293B" />
      <circle cx="47.5" cy="34.5" r="1.8" fill="#FFFFFF" />

      {/* Tilted worried eyebrows */}
      <path d="M21 26C24 24 29 27 31 29" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M51 26C48 24 43 27 41 29" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Wavy anxious mouth */}
      <path d="M27 49C30 46 33 50 36 47C39 44 42 49 45 47" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" />

      {/* Cold sweat drop or stress indicator */}
      <path d="M54 20C55 23 57 24 57 26C57 27.6 55.6 29 54 29C52.4 29 51 27.6 51 26C51 24 53 23 54 20Z" fill="#7DD3FC" />
    </svg>
  );
}

function NeutralFaceIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {/* Face Circle */}
      <circle cx="36" cy="36" r="32" fill="#95A5A6" />
      {/* Dot Eyes */}
      <circle cx="26" cy="34" r="4.5" fill="#1E293B" />
      <circle cx="46" cy="34" r="4.5" fill="#1E293B" />

      {/* Straight Neutral Line Mouth */}
      <line x1="26" y1="48" x2="46" y2="48" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

const EXIT_OPTIONS = [
  {
    id: 'felt_bad',
    label: 'Me senti mal',
    emoji: '🥺',
    color: '#f59e0b',
    icon: FeltBadIcon
  },
  {
    id: 'disliked_topic',
    label: 'Não gostei do assunto',
    emoji: '😒',
    color: '#3b82f6',
    icon: DislikedTopicIcon
  },
  {
    id: 'heavy_topic',
    label: 'Achei um tema pesado',
    emoji: '😰',
    color: '#8b5cf6',
    icon: HeavyTopicIcon
  },
  {
    id: 'no_comment',
    label: 'Nada a declarar',
    emoji: '😐',
    color: '#64748b',
    icon: NeutralFaceIcon
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

        {/* Emotion Cards Row matching reference design */}
        <div className="emotion-cards-row" role="radiogroup" aria-label="Motivo da saída">
          {EXIT_OPTIONS.map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = selectedId === opt.id;

            return (
              <div 
                key={opt.id} 
                className="emotion-card-wrapper"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`emotion-card-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                  title={`${opt.emoji} ${opt.label}`}
                >
                  <IconComponent />
                </button>
                <span className={`emotion-card-label ${isSelected ? 'selected' : ''}`}>
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
