import React from 'react';

export function CompletionScreen({
  score,
  totalQuestions,
  nickname,
  onPlayAgain,
  onOpenReview,
  onExportData,
  onOpenRanking,
  saveStatus,
  playClick
}) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="screen-content">
      <div className="card-surface thankyou-card">
        <h2 className="thankyou-title">
          OBRIGADO POR PARTICIPAR!
        </h2>

        <p className="thankyou-subtitle">
          {nickname ? `Parabéns, ${nickname}! ` : ''}
          Agradecemos o seu tempo e esforço ao completar o nosso quiz.
        </p>

        {/* Laurel Wreath Badge matching Frame 245 */}
        <div className="laurel-container">
          <img 
            src="assets/laurel-badge.png" 
            alt="Brasão de Conclusão"
            className="laurel-img"
            onError={(e) => {
              e.currentTarget.src = "assets/frame-245.png";
            }}
          />
        </div>

        {/* Score Statistics */}
        <div className="score-stats-grid">
          <div className="score-stat-box">
            <div className="score-number">{score} / {totalQuestions}</div>
            <div className="score-label">Acertos no Quiz</div>
          </div>

          <div className="score-stat-box">
            <div className="score-number" style={{ color: percentage >= 70 ? '#16a34a' : '#2563eb' }}>
              {percentage}%
            </div>
            <div className="score-label">Aproveitamento</div>
          </div>

          <div className="score-stat-box">
            <div className="score-number" style={{ color: '#8b5cf6' }}>
              🏅
            </div>
            <div className="score-label">
              {percentage >= 80 ? 'Mestre em Legado' : percentage >= 50 ? 'Consciente Digital' : 'Explorador Inicial'}
            </div>
          </div>
        </div>

        {/* Feedback de sincronização com Firebase */}
        {saveStatus && (
          <div style={{ margin: '8px 0', fontSize: '0.88rem' }}>
            {saveStatus.loading && (
              <span style={{ color: '#2563eb' }}>⏳ Registrando sua pontuação no ranking...</span>
            )}
            {saveStatus.success && (
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Sua pontuação foi salva no ranking com sucesso!</span>
            )}
            {saveStatus.error && (
              <span style={{ color: '#dc2626' }}>⚠️ {saveStatus.error}</span>
            )}
          </div>
        )}

        {/* Action Buttons matching Frame 245 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button 
            className="btn-outline-dark" 
            style={{ minWidth: '180px' }}
            onClick={() => {
              playClick();
              onPlayAgain();
            }}
          >
            JOGAR NOVAMENTE
          </button>

          <button 
            className="btn-outline-dark"
            style={{ minWidth: '180px' }}
            onClick={() => {
              playClick();
              onOpenReview();
            }}
          >
            VER RESPOSTAS
          </button>

          {onOpenRanking && (
            <button 
              className="btn-primary-blue"
              style={{ minWidth: '180px', backgroundColor: '#2563eb' }}
              onClick={() => {
                playClick();
                onOpenRanking();
              }}
            >
              🏆 VER RANKING
            </button>
          )}
        </div>

        <p className="thankyou-footer-text">
          Esperamos que tenha se divertido e refletido sobre a importância de seus ativos digitais.
        </p>
      </div>
    </div>
  );
}
