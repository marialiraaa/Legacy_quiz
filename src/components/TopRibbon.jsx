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
        {nickname && (
          <div 
            className="header-nickname-badge"
            title={`Jogador: ${nickname}`}
          >
            <span>👤</span>
            <span style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Jogador:</span>
            <span style={{ color: '#10a429', fontWeight: 800 }}>{nickname}</span>
          </div>
        )}

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
