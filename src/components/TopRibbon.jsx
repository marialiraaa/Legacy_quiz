import React from 'react';

export function TopRibbon({ title, isCyber, onToggleMute, muted, onShowTCLE, onShowRanking, nickname }) {
  return (
    <header className="header-arch-container">
      <div className="header-arch">
        {isCyber ? (
          <h1 className="cyber-title">{title || "LEGACY QUIZ"}</h1>
        ) : (
          <h2>{title}</h2>
        )}
      </div>

      <div className="header-controls">
        {onShowRanking && (
          <button 
            className="icon-btn" 
            title="Ver Ranking de Líderes (Firestore)"
            onClick={onShowRanking}
            aria-label="Ver Ranking de Líderes"
          >
            🏆
          </button>
        )}
        
        {onShowTCLE && (
          <button 
            className="icon-btn" 
            title="Termo de Consentimento (TCLE)"
            onClick={onShowTCLE}
            aria-label="Ver Termo de Consentimento"
          >
            📋
          </button>
        )}

        {onToggleMute && (
          <button 
            className="icon-btn" 
            title={muted ? "Ativar Áudio" : "Silenciar Áudio"}
            onClick={onToggleMute}
            aria-label="Alternar áudio"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>
    </header>
  );
}
