import React from 'react';
import { TCLE_DATA } from '../data/tcle.js';

export function ConsentModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header-tab">
          {TCLE_DATA.title}
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#1c2a5e', fontWeight: 800 }}>
            {TCLE_DATA.studyTitle}
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>
            <strong>Público-Alvo:</strong> {TCLE_DATA.targetAudience} | <strong>Ambiente:</strong> Mostras científicas, museus e universidades.
          </p>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '8px' }}>🎯 Objetivos do Estudo:</h4>
            <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TCLE_DATA.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '14px', border: '1px solid #fde68a' }}>
            <h4 style={{ color: '#92400e', fontWeight: 700, marginBottom: '6px' }}>⚠️ Natureza Sensível:</h4>
            <p style={{ color: '#78350f', fontSize: '0.92rem', lineHeight: 1.45 }}>
              {TCLE_DATA.naturezaSensivel}
            </p>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '8px' }}>🛡️ Garantias e Sigilo:</h4>
            <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TCLE_DATA.garantias.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button className="btn-primary-blue" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
              Entendi e Estou Ciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
