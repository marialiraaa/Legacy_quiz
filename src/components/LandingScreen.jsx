import React from 'react';

export function LandingScreen({ onStartGame, playClick, muted, onToggleMute, onShowTCLE, onShowRanking }) {
  return (
    <div className="landing-exact-container">
      <div className="landing-stage">
        {/* Exact high-fidelity frame from Figma */}
        <img 
          src="assets/frame-227.png" 
          alt="Legacy Quiz - Seus dados têm um futuro. Você sabe qual?"
          className="landing-bg-image"
        />

        {/* Floating Top Controls (Audio, TCLE & Ranking) seamlessly integrated in top right */}
        <div className="landing-floating-controls">
          {onShowRanking && (
            <button 
              className="icon-btn-floating" 
              title="Ver Ranking de Líderes"
              onClick={() => {
                playClick();
                onShowRanking();
              }}
              aria-label="Ver Ranking de Líderes"
            >
              🏆
            </button>
          )}

          {onShowTCLE && (
            <button 
              className="icon-btn-floating" 
              title="Termo de Consentimento Livre e Esclarecido (TCLE)"
              onClick={() => {
                playClick();
                onShowTCLE();
              }}
              aria-label="Ver Termo de Consentimento"
            >
              📋
            </button>
          )}

          {onToggleMute && (
            <button 
              className="icon-btn-floating" 
              title={muted ? "Ativar Áudio" : "Silenciar Áudio"}
              onClick={() => {
                onToggleMute();
              }}
              aria-label="Alternar áudio"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          )}
        </div>

        {/* Interactive hotspot aligned pixel-by-pixel with the green 'VAMOS JOGAR!' button */}
        <button
          className="landing-btn-hotspot"
          onClick={() => {
            playClick();
            onStartGame();
          }}
          title="Clique para iniciar o quiz!"
          aria-label="Vamos Jogar! Iniciar o quiz"
        >
          <span className="hotspot-glow" />
        </button>
      </div>
    </div>
  );
}
