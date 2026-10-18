import React, { useState } from 'react';

export function ExitSurveyModal({ onClose, onConfirmExit }) {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-tab" style={{ background: '#334155' }}>
          Interromper Participação
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '1.05rem', color: '#1e293b', fontWeight: 600 }}>
            Você optou por não prosseguir na sessão. Sua decisão é totalmente respeitada.
          </p>
          <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
            Se desejar, compartilhe brevemente o motivo da sua desistência (opcional):
          </p>
          
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: Tema desconfortável, falta de tempo, etc..."
            rows={3}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '2px solid #cbd5e1',
              padding: '12px 16px',
              fontFamily: 'inherit',
              fontSize: '0.95rem'
            }}
          />

          <div className="modal-actions">
            <button className="btn-outline-dark" style={{ flex: 1 }} onClick={onClose}>
              Voltar ao Jogo
            </button>
            <button 
              className="btn-red" 
              style={{ flex: 1 }} 
              onClick={() => onConfirmExit(reason)}
            >
              Confirmar Saída
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
