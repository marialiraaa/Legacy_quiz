import React from 'react';

export function ContentWarning({ onContinue, onExit, playClick }) {
  return (
    <div className="screen-content">
      <div className="card-surface warning-box">
        <h2 className="warning-lead">
          A próxima tela contempla temas relacionados a morte, perda e legado
        </h2>

        <p className="warning-desc">
          Estes elementos podem ser emocionalmente sensíveis para alguns jogadores. Recomenda-se uma reflexão prévia antes de continuar.
        </p>

        <h3 className="warning-question">
          Deseja continuar jogando?
        </h3>

        <div className="warning-actions">
          <button 
            className="btn-primary-blue"
            onClick={() => {
              playClick();
              onContinue();
            }}
          >
            SIM, DESEJO CONTINUAR
          </button>

          <button 
            className="btn-outline-dark"
            onClick={() => {
              playClick();
              onExit();
            }}
          >
            NÃO, DESEJO SAIR
          </button>
        </div>
      </div>
    </div>
  );
}
