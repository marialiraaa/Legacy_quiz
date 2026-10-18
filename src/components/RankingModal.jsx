import React, { useEffect, useState } from 'react';
import { buscarRanking, ouvirRankingEmTempoReal } from '../services/jogadorService.js';

export function RankingModal({ isOpen, onClose, currentNickname }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    // Conecta o listener em tempo real para ranking ao vivo
    const unsubscribe = ouvirRankingEmTempoReal(
      (dados) => {
        setRanking(dados);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar ranking:", err);
        setError("Não foi possível carregar o ranking no momento.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content ranking-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              🏆 Ranking de Líderes
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Ordenado por maior pontuação e menor tempo
            </p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.2rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Carregando ranking...
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {!loading && ranking.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Nenhum participante registrado ainda. Seja o primeiro!
            </div>
          )}

          {!loading && ranking.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ranking.map((jogador, index) => {
                const isCurrent = currentNickname && 
                  jogador.id === currentNickname.trim().toLowerCase().replace(/\s+/g, '');

                const getBadge = (pos) => {
                  if (pos === 1) return '🥇';
                  if (pos === 2) return '🥈';
                  if (pos === 3) return '🥉';
                  return `#${pos}`;
                };

                return (
                  <div 
                    key={jogador.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: isCurrent ? '#eff6ff' : index % 2 === 0 ? '#f8fafc' : '#ffffff',
                      border: isCurrent ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ 
                      fontSize: index < 3 ? '1.3rem' : '0.95rem',
                      fontWeight: 700, 
                      minWidth: '40px',
                      color: index < 3 ? '#b45309' : '#64748b'
                    }}>
                      {getBadge(index + 1)}
                    </span>

                    <div style={{ flex: 1, marginLeft: '8px' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: '#1e293b',
                        fontSize: '1rem'
                      }}>
                        {jogador.nickname}
                      </span>
                      {isCurrent && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          Você
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '1.05rem', 
                        fontWeight: 700, 
                        color: '#0f172a' 
                      }}>
                        {jogador.pontuacao} pts
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ⏱ {jogador.tempoSegundos}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#f8fafc'
        }}>
          <button 
            onClick={onClose}
            className="btn-outline-dark"
            style={{ padding: '8px 24px', fontSize: '0.9rem' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
