import React, { useEffect, useRef } from 'react';

/**
 * Determina a Medalha, Ícone, Patente e Mensagem Acolhedora
 * com base nos acertos nas 12 questões de conhecimento.
 */
function obterPatenteLegado(score) {
  if (score >= 9) {
    return {
      tier: 'gold',
      medalEmoji: '🥇',
      badgeIcon: '👑',
      tierLabel: 'Medalha de Ouro',
      title: 'Guardião do Legado Digital',
      message:
        'Excelente! Você domina as boas práticas e sabe como proteger sua história online!'
    };
  }
  if (score >= 5) {
    return {
      tier: 'silver',
      medalEmoji: '🥈',
      badgeIcon: '🛡️',
      tierLabel: 'Medalha de Prata',
      title: 'Navegador Consciente',
      message:
        'Você já manda bem nos cuidados digitais e agora conhece ferramentas importantes para o futuro!'
    };
  }
  return {
    tier: 'bronze',
    medalEmoji: '🥉',
    badgeIcon: '🧭',
    tierLabel: 'Medalha de Bronze',
    title: 'Explorador do Legado Digital',
    message:
      'Você deu o primeiro passo para entender como cuidar das suas memórias e contas online!'
  };
}

export function CompletionScreen({
  score = 0,
  totalQuestions = 12,
  maxStreak = 0,
  nickname,
  onPlayAgain,
  onOpenReview,
  onOpenRanking,
  researchFormUrl,
  saveStatus,
  playClick
}) {
  const canvasRef = useRef(null);
  const patente = obterPatenteLegado(score);

  // 1. Dispara chuva leve e elegante de confetes na entrada da tela de celebração
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();

    const colors = [
      '#22c55e',
      '#3b82f6',
      '#8b5cf6',
      '#f59e0b',
      '#ec4899',
      '#06b6d4',
      '#eab308'
    ];
    const particleCount = 65;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.6 - 10,
      w: Math.random() * 8 + 5,
      h: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 2.4 + 1.4,
      vx: (Math.random() - 0.5) * 1.8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.12,
      opacity: 1
    }));

    const startTime = performance.now();
    const durationMs = 4200;

    const render = (now) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        if (elapsed > durationMs * 0.65) {
          p.opacity = Math.max(
            0,
            1 - (elapsed - durationMs * 0.65) / (durationMs * 0.35)
          );
        }

        if (p.y < height + 20 && p.opacity > 0.02) {
          activeParticles += 1;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (elapsed < durationMs && activeParticles > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="screen-content celebration-screen-wrapper">
      {/* Canvas leve de confetes sobreposto sem bloquear cliques */}
      <canvas
        ref={canvasRef}
        className="celebration-confetti-canvas"
        aria-hidden="true"
      />

      <div className="celebration-container">
        {/* 2. Cabeçalho Personalizado + Card da Medalha e Patente */}
        <div className={`celebration-hero-card tier-${patente.tier}`}>
          <div className="celebration-kicker">
            🎉 JORNADA CONCLUÍDA • PROJETO DAVI
          </div>

          <h2 className="celebration-greeting">
            {nickname
              ? `Parabéns pela jornada, ${nickname}!`
              : 'Parabéns pela jornada!'}
          </h2>

          {/* Medalha / Badge com animação @keyframes medalPop */}
          <div className="celebration-medal-wrapper medal-pop-anim">
            <div className={`celebration-medal-circle tier-${patente.tier}`}>
              <span className="celebration-medal-icon" aria-hidden="true">
                {patente.badgeIcon}
              </span>
              <span className="celebration-medal-sub" aria-hidden="true">
                {patente.medalEmoji}
              </span>
            </div>
            <span className={`celebration-tier-pill tier-${patente.tier}`}>
              {patente.tierLabel} • Patente Desbloqueada
            </span>
          </div>

          <h3 className="celebration-rank-title">{patente.title}</h3>
          <p className="celebration-rank-message">{patente.message}</p>

          {/* 3. Resumo da Jornada (2 Mini-Cards Lado a Lado + Nota do Bloco D) */}
          <div className="celebration-stats-row">
            <div className="celebration-mini-card">
              <div className="celebration-mini-label">
                Acertos de Conhecimento
              </div>
              <div className="celebration-mini-value">
                <span className="celebration-mini-icon">🎯</span>
                <strong>
                  {score} de {totalQuestions}
                </strong>
              </div>
            </div>

            <div className="celebration-mini-card streak-highlight">
              <div className="celebration-mini-label">
                Maior Sequência de Consciência
              </div>
              <div className="celebration-mini-value">
                <span className="celebration-mini-icon">🔥</span>
                <strong>
                  {maxStreak} {maxStreak === 1 ? 'questão' : 'seguidas'}
                </strong>
              </div>
            </div>
          </div>

          <div className="celebration-reflection-note">
            <span>✨</span>
            <span>
              Suas respostas nas perguntas de reflexão pessoal (Bloco D) foram
              registradas com sucesso!
            </span>
          </div>

          {/* Feedback de sincronização com Firebase */}
          {saveStatus && (
            <div className="celebration-firebase-status">
              {saveStatus.loading && (
                <span className="status-loading">
                  ⏳ Sincronizando sua jornada com o banco de dados...
                </span>
              )}
              {saveStatus.success && (
                <span className="status-success">
                  ✅ Jornada e pontuação registradas com sucesso!
                </span>
              )}
              {saveStatus.error && (
                <span className="status-error">⚠️ {saveStatus.error}</span>
              )}
            </div>
          )}
        </div>

        {/* 4. Seção "Seu Pontapé Inicial" (3 Dicas Práticas & Links) */}
        <div className="celebration-kickstart-card">
          <div className="kickstart-header">
            <span className="kickstart-header-icon">🚀</span>
            <div>
              <h4 className="kickstart-title">Seu Pontapé Inicial</h4>
              <p className="kickstart-subtitle">
                3 passos rápidos para organizar e proteger seu legado digital hoje
                mesmo:
              </p>
            </div>
          </div>

          <div className="kickstart-tips-list">
            <a
              href="https://myaccount.google.com/inactive"
              target="_blank"
              rel="noopener noreferrer"
              className="kickstart-tip-item kickstart-tip-link"
              onClick={() => playClick?.()}
            >
              <span className="kickstart-tip-badge">1</span>
              <div className="kickstart-tip-content">
                <strong>Gerenciador de Contas Inativas do Google ↗</strong>
                <span>
                  Defina contatos de confiança para receberem fotos/arquivos ou
                  programe a exclusão após inatividade.
                </span>
              </div>
            </a>

            <div className="kickstart-tip-item">
              <span className="kickstart-tip-badge">2</span>
              <div className="kickstart-tip-content">
                <strong>Memorial no Instagram e Facebook (Meta)</strong>
                <span>
                  Em <em>Central de Contas → Dados pessoais → Propriedade e controle</em>,
                  escolha entre transformar o perfil em memorial ou excluir.
                </span>
              </div>
            </div>

            <div className="kickstart-tip-item">
              <span className="kickstart-tip-badge">3</span>
              <div className="kickstart-tip-content">
                <strong>Contato de Legado & Pessoa de Confiança</strong>
                <span>
                  Adicione um Contato de Legado no seu celular (iOS/Android) e
                  converse com alguém próximo sobre suas vontades digitais.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Rodapé de Ações: Continuidade da Pesquisa (Projeto DAVI), Gabarito, Ranking e Refazer */}
        <div className="celebration-actions-footer">
          {researchFormUrl ? (
            <a
              href={researchFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="celebration-btn-primary"
              onClick={() => playClick?.()}
            >
              📋 Continuar Pesquisa (Avaliação & Personagem Davi) →
            </a>
          ) : (
            <button
              type="button"
              className="celebration-btn-primary"
              onClick={() => {
                playClick?.();
                onOpenReview?.();
              }}
            >
              📋 Revisar Gabarito & Continuar Pesquisa (Davi) →
            </button>
          )}

          <div className="celebration-secondary-btns">
            {researchFormUrl && onOpenReview && (
              <button
                type="button"
                className="celebration-btn-secondary"
                onClick={() => {
                  playClick?.();
                  onOpenReview();
                }}
              >
                🔍 Ver Respostas
              </button>
            )}

            {onOpenRanking && (
              <button
                type="button"
                className="celebration-btn-secondary ranking-tone"
                onClick={() => {
                  playClick?.();
                  onOpenRanking();
                }}
              >
                🏆 Ver Ranking
              </button>
            )}

            <button
              type="button"
              className="celebration-btn-secondary"
              onClick={() => {
                playClick?.();
                onPlayAgain?.();
              }}
            >
              🔄 Refazer o Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
