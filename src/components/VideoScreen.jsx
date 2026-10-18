import React, { useState } from 'react';

export function VideoScreen({ videoIndex, onNext, onBack, onExit, playClick }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoData = videoIndex === 1 ? {
    title: "Vídeo 1: Introdução Reflexiva sobre Memória e Legado",
    subtitle: "Uma reflexão sensível sobre a passagem do tempo, as memórias que cultivamos e os rastros que deixamos no mundo digital.",
    reflection: "Ao término deste vídeo introdutório, você se sente confortável e deseja prosseguir com a sessão do quiz?",
    poster: "assets/video-screen.png"
  } : {
    title: "Vídeo 2: Fundamentação Conceitual do Legado Digital",
    subtitle: "Conheça os pilares de direitos digitais, o destino das contas e o impacto nas gerações futuras.",
    reflection: "Compreender o legado digital é um ato de cidadania e de amor para com quem dividirá a nossa história.",
    poster: "assets/video-screen.png"
  };

  return (
    <div className="screen-content">
      <div className="video-card-container">
        <div className="video-player-wrapper">
          <img 
            src={videoData.poster} 
            alt="Miniatura do Vídeo Reflexivo"
            className="video-poster-img"
          />

          <div 
            className="video-play-overlay"
            onClick={() => {
              playClick();
              setIsPlaying(!isPlaying);
            }}
          >
            <div className="play-circle-icon">
              {isPlaying ? (
                <span style={{ fontSize: '1.8rem', color: '#1c2a5e' }}>⏸</span>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="video-reflective-prompt">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
            {videoData.title}
          </h3>
          <p style={{ color: '#475569', marginBottom: '12px' }}>
            {videoData.subtitle}
          </p>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
            <p style={{ fontWeight: 600, color: '#334155' }}>
              💡 {videoData.reflection}
            </p>
          </div>
        </div>

        <div className="nav-buttons-row">
          <button 
            className="btn-outline-dark"
            onClick={() => {
              playClick();
              onBack();
            }}
          >
            Retornar
          </button>

          {videoIndex === 1 ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-outline-dark" 
                style={{ borderColor: '#ef4444', color: '#dc2626' }}
                onClick={() => {
                  playClick();
                  onExit();
                }}
              >
                Não desejo prosseguir
              </button>
              <button 
                className="btn-primary-blue"
                onClick={() => {
                  playClick();
                  onNext();
                }}
              >
                Sim, Prosseguir &rarr;
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary-blue"
              onClick={() => {
                playClick();
                onNext();
              }}
            >
              Iniciar o Quiz &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
