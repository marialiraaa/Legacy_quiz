import React from 'react';

/**
 * Modal de Confirmação de Saída
 * Pergunta: "Tem certeza de que deseja sair?"
 * Ações: "Cancelar" (mantém no jogo) e "Confirmar Saída" (leva à tela de feedback emocional)
 */
export function ExitConfirmModal({ onCancel, onConfirm, playClick }) {
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
      <div className="modal-content exit-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-tab" style={{ background: '#dc2626' }}>
          Interromper Partida
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }} aria-hidden="true">
            🚪
          </div>

          <h3 id="exit-modal-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e2952', margin: '0 0 10px' }}>
            Tem certeza de que deseja sair?
          </h3>

          <p style={{ fontSize: '0.96rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Sua participação é voluntária e você pode encerrar a qualquer momento. Se confirmar, você poderá nos contar rapidamente o motivo antes de finalizar.
          </p>

          <div className="modal-actions" style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn-outline-dark"
              style={{ flex: 1, padding: '12px 18px', fontWeight: 700 }}
              onClick={() => {
                playClick?.();
                onCancel();
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn-red"
              style={{ flex: 1, padding: '12px 18px', fontWeight: 700 }}
              onClick={() => {
                playClick?.();
                onConfirm();
              }}
            >
              Confirmar Saída
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
