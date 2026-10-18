import React from 'react';

export function BonusIntro({ onNext, onBack, playClick }) {
  return (
    <div className="screen-content">
      <div className="card-surface bonus-intro-card">
        <div className="gift-box-glow">
          <img 
            src="assets/illustration-gift.png" 
            alt="Caixa de Presente Bônus Dourada" 
            className="gift-box-img"
            onError={(e) => {
              e.currentTarget.src = "assets/frame-236.png";
            }}
          />
        </div>

        <p style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 600, maxWidth: '600px', lineHeight: 1.5 }}>
          Parabéns por completar as etapas conceituais! Agora preparamos duas perguntas especiais de reflexão pessoal sobre você e suas memórias.
        </p>

        <div className="nav-buttons-row" style={{ marginTop: '10px' }}>
          <button 
            className="btn-outline-dark"
            onClick={() => {
              playClick();
              onBack();
            }}
          >
            Retornar
          </button>

          <button 
            className="btn-primary-blue"
            onClick={() => {
              playClick();
              onNext();
            }}
          >
            Próxima &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
