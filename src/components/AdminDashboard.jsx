import React, { useState, useEffect, useMemo } from "react";
import { CATEGORIES, QUIZ_QUESTIONS } from "../data/questions.js";
import {
  observarEstadoAuthAdmin,
  loginAdminComEmail,
  loginAdminComGoogle,
  logoutAdmin
} from "../services/authService.js";
import {
  ouvirSessoesPesquisaEmTempoReal,
  calcularAnaliticoCompleto,
  exportarSessoesCSV,
  exportarRespostasDetalhadasCSV,
  exportarPlanilhaExcel
} from "../services/metricasService.js";
import { ouvirRankingEmTempoReal } from "../services/jogadorService.js";

/**
 * Formata segundos em "Xm Ys" ou "Ys"
 */
function formatarDuracao(segundos) {
  const seg = Math.max(0, Math.round(Number(segundos) || 0));
  if (seg < 60) return `${seg}s`;
  const min = Math.floor(seg / 60);
  const rem = seg % 60;
  return `${min}m ${String(rem).padStart(2, "0")}s`;
}

/**
 * Formata data ISO 8601 para "DD/MM/AAAA HH:mm"
 */
function formatarDataHora(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Componente SVG: Gráfico de Setores / Rosca (Donut Chart)
 */
function DonutChart({ segments = [], size = 180, strokeWidth = 26, centerLabel, centerSub }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

  let accumulatedPercent = 0;

  return (
    <div className="admin-donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="admin-donut-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {total > 0 &&
          segments.map((seg, idx) => {
            const val = Number(seg.value) || 0;
            if (val <= 0) return null;
            const pct = val / total;
            const dashLength = pct * circumference;
            const dashOffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color || "#3b82f6"}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dasharray 0.35s ease" }}
              >
                <title>{`${seg.label}: ${val} (${Math.round(pct * 100)}%)`}</title>
              </circle>
            );
          })}
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="central"
          className="admin-donut-center-value"
        >
          {centerLabel ?? total}
        </text>
        {centerSub && (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="central"
            className="admin-donut-center-sub"
          >
            {centerSub}
          </text>
        )}
      </svg>

      <div className="admin-chart-legend">
        {segments.map((seg, idx) => {
          const val = Number(seg.value) || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={idx} className="admin-legend-item">
              <span className="admin-legend-dot" style={{ background: seg.color }} />
              <span className="admin-legend-label">{seg.label}</span>
              <strong className="admin-legend-val">
                {val} ({pct}%)
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Componente SVG: Gráfico de Linhas para Evolução Temporal
 */
function TemporalLineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="admin-empty-chart">
        <span>📈</span>
        <p>Ainda não há registros suficientes no período para traçar a evolução temporal.</p>
      </div>
    );
  }

  const width = 680;
  const height = 250;
  const padLeft = 44;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 42;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(4, ...data.map((d) => Math.max(d.total || 0, d.concluidas || 0)));

  const getX = (index) => {
    if (data.length === 1) return padLeft + plotW / 2;
    return padLeft + (index / (data.length - 1)) * plotW;
  };

  const getY = (val) => {
    return padTop + plotH - (val / maxVal) * plotH;
  };

  const buildPath = (key) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d[key] || 0).toFixed(1)}`)
      .join(" ");

  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="admin-line-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="admin-line-svg">
        {/* Linhas de grade horizontais */}
        {yTicks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Linha de Total de Sessões */}
        <path
          d={buildPath("total")}
          fill="none"
          stroke="#1e2952"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Linha de Sessões Concluídas */}
        <path
          d={buildPath("concluidas")}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Linha de Desistências */}
        <path
          d={buildPath("desistencias")}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />

        {/* Pontos interativos e Rótulos do Eixo X */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <g key={d.diaKey}>
              <circle cx={x} cy={getY(d.total)} r="5" fill="#1e2952">
                <title>{`${d.dataFormatada} — Total: ${d.total} sessões`}</title>
              </circle>
              <circle cx={x} cy={getY(d.concluidas)} r="4.5" fill="#16a34a">
                <title>{`${d.dataFormatada} — Concluídas: ${d.concluidas} (Média: ${d.mediaAcertos} pts)`}</title>
              </circle>
              <circle cx={x} cy={getY(d.desistencias)} r="4" fill="#dc2626">
                <title>{`${d.dataFormatada} — Desistências: ${d.desistencias}`}</title>
              </circle>
              <text
                x={x}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#475569"
              >
                {d.dataFormatada.substring(0, 5)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="admin-line-legend">
        <span className="admin-legend-item">
          <span className="admin-legend-dot" style={{ background: "#1e2952" }} /> Total de Sessões
        </span>
        <span className="admin-legend-item">
          <span className="admin-legend-dot" style={{ background: "#16a34a" }} /> Concluídas
        </span>
        <span className="admin-legend-item">
          <span className="admin-legend-dot" style={{ background: "#dc2626" }} /> Desistências
        </span>
      </div>
    </div>
  );
}

/**
 * Componente Principal do Painel Administrativo
 */
export function AdminDashboard({ onExitAdmin }) {
  // Estado de Autenticação e Autorização
  const [authState, setAuthState] = useState({
    user: null,
    authorized: false,
    loading: true,
    reason: ""
  });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dados em tempo real vindos do Firestore
  const [sessoesReais, setSessoesReais] = useState([]);
  const [rankingReal, setRankingReal] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  // Navegação e Filtros do Dashboard
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  // 'OVERVIEW' | 'QUESTIONS' | 'RETENTION' | 'RECORDS'
  const [filtroPeriodo, setFiltroPeriodo] = useState("ALL");
  // 'ALL' | 'TODAY' | '7D' | '30D' | 'CUSTOM'
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ALL");
  // 'ALL' | 'concluida' | 'desistencia'
  const [filtroCategoria, setFiltroCategoria] = useState("ALL");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [anonimizarNicknames, setAnonimizarNicknames] = useState(true);

  // Modal de inspeção individual de sessão
  const [sessaoInspecionada, setSessaoInspecionada] = useState(null);

  // 1. Monitora autenticação administrativa
  useEffect(() => {
    const unsub = observarEstadoAuthAdmin((state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, []);

  // 2. Conecta listeners em tempo real ao Firestore somente quando autenticado e autorizado
  useEffect(() => {
    if (!authState.authorized || !authState.user) {
      setSessoesReais([]);
      setRankingReal([]);
      setDbLoading(false);
      return;
    }

    setDbLoading(true);
    setDbError(null);

    const unsubSessoes = ouvirSessoesPesquisaEmTempoReal(
      (dados) => {
        setSessoesReais(dados);
        setLastSyncAt(new Date());
        setDbLoading(false);
        setDbError(null);
      },
      (err) => {
        console.error("Erro ao consultar sessoes_pesquisa:", err);
        setDbLoading(false);
        if (err.code === "permission-denied") {
          setDbError(
            "Permissão negada pelo Firestore. Certifique-se de que as regras atualizadas (firestore.rules) foram publicadas no projeto Firebase e que sua conta possui permissão administrativa."
          );
        } else {
          setDbError(`Erro ao carregar dados do banco: ${err.message}`);
        }
      }
    );

    const unsubRanking = ouvirRankingEmTempoReal(
      (dadosRanking) => {
        setRankingReal(dadosRanking);
      },
      (err) => {
        console.warn("Aviso ao carregar coleção jogadores:", err);
      },
      100
    );

    return () => {
      unsubSessoes();
      unsubRanking();
    };
  }, [authState.authorized, authState.user]);

  // 3. Aplica filtros de Período, Status e Busca sobre os registros reais
  const sessoesFiltradas = useMemo(() => {
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();

    return sessoesReais.filter((s) => {
      // Filtro de Status
      if (filtroStatus !== "ALL" && s.status !== filtroStatus) {
        return false;
      }

      // Filtro de Período
      const dataStr =
        s.sessaoFinalizadaEm ||
        s.timestamps?.sessaoFinalizadaEm ||
        s.timestamps?.sessaoIniciadaEm;
      const dataMs = dataStr ? new Date(dataStr).getTime() : 0;

      if (filtroPeriodo === "TODAY" && dataMs < inicioHoje) {
        return false;
      }
      if (filtroPeriodo === "7D" && dataMs < Date.now() - 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (filtroPeriodo === "30D" && dataMs < Date.now() - 30 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (filtroPeriodo === "CUSTOM") {
        if (dataInicioCustom) {
          const minMs = new Date(`${dataInicioCustom}T00:00:00`).getTime();
          if (dataMs < minMs) return false;
        }
        if (dataFimCustom) {
          const maxMs = new Date(`${dataFimCustom}T23:59:59`).getTime();
          if (dataMs > maxMs) return false;
        }
      }

      // Filtro de Busca Textual
      if (buscaTexto.trim()) {
        const termo = buscaTexto.trim().toLowerCase();
        const idMatch = (s.sessionId || s.id || "").toLowerCase().includes(termo);
        const nickMatch = (s.nickname || "").toLowerCase().includes(termo);
        const motivoMatch = (s.desistencia?.motivoLabel || "").toLowerCase().includes(termo);
        if (!idMatch && !nickMatch && !motivoMatch) return false;
      }

      return true;
    });
  }, [
    sessoesReais,
    filtroStatus,
    filtroPeriodo,
    dataInicioCustom,
    dataFimCustom,
    buscaTexto
  ]);

  // 4. Calcula todo o conjunto analítico com base nas sessões filtradas e na categoria selecionada
  const analitico = useMemo(() => {
    return calcularAnaliticoCompleto(sessoesFiltradas, filtroCategoria);
  }, [sessoesFiltradas, filtroCategoria]);

  // Questões mais fácil e mais difícil (quando há respostas registradas)
  const destaquesQuestoes = useMemo(() => {
    const respondidas = analitico.estatisticasPorQuestao.filter((q) => q.respondidas > 0);
    if (respondidas.length === 0) return { maisAcertada: null, maisErrada: null };
    const ordenadas = [...respondidas].sort((a, b) => b.taxaAcerto - a.taxaAcerto);
    return {
      maisAcertada: ordenadas[0],
      maisErrada: ordenadas[ordenadas.length - 1]
    };
  }, [analitico.estatisticasPorQuestao]);

  // Handlers de Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await loginAdminComEmail(emailInput, passwordInput);
      setPasswordInput("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      await loginAdminComGoogle();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
  };

  // === TELA DE CARREGAMENTO DE AUTENTICAÇÃO ===
  if (authState.loading) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.6rem", marginBottom: 12 }}>🔐</div>
          <h2 style={{ color: "#1e2952", fontWeight: 800 }}>Verificando Credenciais...</h2>
          <p style={{ color: "#64748b", marginTop: 6 }}>
            Validando sessão administrativa junto ao Firebase Authentication.
          </p>
        </div>
      </div>
    );
  }

  // === PORTÃO DE ACESSO RESTRITO (LOGIN DO PESQUISADOR) ===
  if (!authState.authorized || !authState.user) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <span className="admin-badge-restricted">🔒 ÁREA RESTRITA AO PESQUISADOR</span>
            <h1 className="admin-auth-title">Painel Administrativo & Estatísticas</h1>
            <p className="admin-auth-subtitle">
              Projeto <strong>Legacy Quiz / DAVI</strong> • Instituto de Computação (UFMT)
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="admin-auth-form">
            <div className="admin-field-group">
              <label htmlFor="admin-email">E-mail Administrativo</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                placeholder="pesquisador@ufmt.br"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={loginLoading}
              />
            </div>

            <div className="admin-field-group">
              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={loginLoading}
              />
            </div>

            {loginError && <div className="admin-auth-error">⚠️ {loginError}</div>}

            <button type="submit" className="admin-btn-primary" disabled={loginLoading}>
              {loginLoading ? "Autenticando..." : "Entrar no Painel Administrativo →"}
            </button>
          </form>

          <div className="admin-auth-divider">
            <span>ou autentique-se com</span>
          </div>

          <button
            type="button"
            className="admin-btn-google"
            onClick={handleGoogleLogin}
            disabled={loginLoading}
          >
            <span>🌐</span>
            <span>Continuar com Conta Google Autorizada</span>
          </button>

          <div className="admin-auth-footer">
            <p>
              O acesso aos dados da coleção <code>sessoes_pesquisa</code> é protegido por regras de
              segurança no servidor (Firebase Auth + Firestore Security Rules).
            </p>
            {onExitAdmin && (
              <button type="button" className="admin-link-back" onClick={onExitAdmin}>
                ← Voltar para a aplicação pública do Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { kpis } = analitico;

  // === PAINEL ADMINISTRATIVO AUTENTICADO ===
  return (
    <div className="admin-dashboard-shell">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <div className="admin-brand-logo">📊</div>
          <div>
            <div className="admin-brand-kicker">UFMT • PROJETO DAVI • CAAE 94717525.4.0000.5690</div>
            <h1 className="admin-brand-title">Legacy Quiz — Painel de Métricas e Pesquisa</h1>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <div className="admin-live-pill" title="Sincronizado em tempo real via onSnapshot">
            <span className="admin-live-dot" />
            <span>
              Tempo Real {lastSyncAt ? `(${lastSyncAt.toLocaleTimeString("pt-BR")})` : ""}
            </span>
          </div>

          <div className="admin-user-chip" title={authState.reason}>
            <span>👤</span>
            <span>{authState.user.email || authState.user.uid}</span>
          </div>

          {onExitAdmin && (
            <button type="button" className="admin-btn-outline-sm" onClick={onExitAdmin}>
              Ver Quiz
            </button>
          )}

          <button type="button" className="admin-btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="admin-main-container">
        {dbError && (
          <div className="admin-alert-error">
            <strong>⚠️ Atenção na comunicação com o Firestore:</strong> {dbError}
          </div>
        )}

        {/* Global Filter & Export Toolbar */}
        <section className="admin-filters-bar" aria-label="Filtros globais do painel">
          <div className="admin-filter-item">
            <label>Período</label>
            <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
              <option value="ALL">Todo o período</option>
              <option value="TODAY">Hoje</option>
              <option value="7D">Últimos 7 dias</option>
              <option value="30D">Últimos 30 dias</option>
              <option value="CUSTOM">Intervalo personalizado</option>
            </select>
          </div>

          {filtroPeriodo === "CUSTOM" && (
            <>
              <div className="admin-filter-item">
                <label>De</label>
                <input
                  type="date"
                  value={dataInicioCustom}
                  onChange={(e) => setDataInicioCustom(e.target.value)}
                />
              </div>
              <div className="admin-filter-item">
                <label>Até</label>
                <input
                  type="date"
                  value={dataFimCustom}
                  onChange={(e) => setDataFimCustom(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="admin-filter-item">
            <label>Status da Sessão</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="ALL">Todas ({sessoesReais.length})</option>
              <option value="concluida">Apenas Concluídas</option>
              <option value="desistencia">Apenas Desistências</option>
            </select>
          </div>

          <div className="admin-filter-item">
            <label>Categoria Temática</label>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="ALL">Todas as 6 Categorias</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-item admin-filter-search">
            <label>Buscar Sessão / Participante</label>
            <input
              type="text"
              placeholder="ID da sessão, apelido ou motivo..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
            />
          </div>

          <div className="admin-filter-privacy">
            <label className="admin-checkbox-inline">
              <input
                type="checkbox"
                checked={anonimizarNicknames}
                onChange={(e) => setAnonimizarNicknames(e.target.checked)}
              />
              <span>🛡️ Ocultar/Anonimizar apelidos</span>
            </label>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <nav className="admin-tabs-nav" aria-label="Seções do painel">
          {[
            { id: "OVERVIEW", label: "📊 Visão Geral & Evolução" },
            { id: "QUESTIONS", label: "🎯 Desempenho por Categoria, Questões & Bônus" },
            { id: "RETENTION", label: "🚪 Retenção, Desistências & Engajamento" },
            {
              id: "RECORDS",
              label: `🗂️ Registros (${sessoesFiltradas.length}) & Exportação CSV/Excel`
            }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {dbLoading ? (
          <div className="admin-empty-state">
            <div style={{ fontSize: "2.5rem" }}>⏳</div>
            <h3>Carregando métricas em tempo real do Firestore...</h3>
          </div>
        ) : (
          <>
            {/* === ABA 1: VISÃO GERAL & EVOLUÇÃO === */}
            {activeTab === "OVERVIEW" && (
              <div className="admin-section-stack">
                {/* 6 KPI Cards */}
                <div className="admin-kpi-grid">
                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Total de Sessões Coletadas</span>
                      <span className="admin-kpi-icon" style={{ background: "#e0e7ff" }}>
                        📋
                      </span>
                    </div>
                    <div className="admin-kpi-value">{kpis.totalSessoes}</div>
                    <div className="admin-kpi-foot">
                      <span className="text-success">{kpis.totalConcluidas} concluídas</span> •{" "}
                      <span className="text-danger">{kpis.totalDesistencias} desistências</span>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Taxa de Conclusão</span>
                      <span className="admin-kpi-icon" style={{ background: "#dcfce7" }}>
                        ✅
                      </span>
                    </div>
                    <div className="admin-kpi-value" style={{ color: "#16a34a" }}>
                      {kpis.taxaConclusao}%
                    </div>
                    <div className="admin-kpi-foot">
                      Taxa de abandono: <strong>{kpis.taxaDesistencia}%</strong>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Média de Acertos (Concluídas)</span>
                      <span className="admin-kpi-icon" style={{ background: "#fef3c7" }}>
                        🏆
                      </span>
                    </div>
                    <div className="admin-kpi-value">
                      {kpis.mediaPontuacao} <small>/ {QUIZ_QUESTIONS.length}</small>
                    </div>
                    <div className="admin-kpi-foot">
                      Aproveitamento médio: <strong>{kpis.percentualMedioAcerto}%</strong>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Tempo Médio de Sessão</span>
                      <span className="admin-kpi-icon" style={{ background: "#e0f2fe" }}>
                        ⏱️
                      </span>
                    </div>
                    <div className="admin-kpi-value">
                      {formatarDuracao(kpis.mediaDuracaoSegundos)}
                    </div>
                    <div className="admin-kpi-foot">
                      Média por questão: <strong>{kpis.tempoMedioPorQuestaoSegundos}s</strong>
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Termos TCLE Assinados</span>
                      <span className="admin-kpi-icon" style={{ background: "#f3e8ff" }}>
                        ✍️
                      </span>
                    </div>
                    <div className="admin-kpi-value">{kpis.totalTcleAceito}</div>
                    <div className="admin-kpi-foot">
                      <strong>{kpis.taxaAceiteTcle}%</strong> das sessões iniciadas
                    </div>
                  </div>

                  <div className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <span className="admin-kpi-label">Participantes no Ranking Público</span>
                      <span className="admin-kpi-icon" style={{ background: "#fce7f3" }}>
                        🥇
                      </span>
                    </div>
                    <div className="admin-kpi-value">{rankingReal.length}</div>
                    <div className="admin-kpi-foot">
                      Interações pós-jogo: <strong>{kpis.totalInteracoesPosJogo}</strong>
                    </div>
                  </div>
                </div>

                {/* Gráficos de Evolução Temporal e Proporção */}
                <div className="admin-charts-row-2col">
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Evolução Temporal de Utilização</h3>
                        <p>
                          Acompanhamento diário do volume de sessões iniciadas, concluídas e
                          desistências
                        </p>
                      </div>
                    </div>
                    <TemporalLineChart data={analitico.evolucaoTemporal} />
                  </div>

                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Proporção de Conclusão vs. Desistência</h3>
                        <p>Distribuição percentual do desfecho das sessões filtradas</p>
                      </div>
                    </div>
                    <DonutChart
                      centerLabel={`${kpis.taxaConclusao}%`}
                      centerSub="Conclusão"
                      segments={[
                        {
                          label: "Concluídas",
                          value: kpis.totalConcluidas,
                          color: "#16a34a"
                        },
                        {
                          label: "Desistências",
                          value: kpis.totalDesistencias,
                          color: "#dc2626"
                        }
                      ]}
                    />
                  </div>
                </div>

                {/* Gráfico de Barras: Desempenho por Eixo Temático */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Desempenho por Categoria Temática</h3>
                      <p>
                        Taxa de acerto (%) e tempo médio de resposta (segundos) nos 6 eixos do
                        Legacy Quiz
                      </p>
                    </div>
                  </div>

                  <div className="admin-bars-list">
                    {analitico.desempenhoPorCategoria.map((cat) => (
                      <div key={cat.key} className="admin-bar-row">
                        <div className="admin-bar-meta">
                          <span className="admin-bar-title">
                            <span>{cat.icon}</span>
                            <strong>{cat.nome}</strong>
                          </span>
                          <span className="admin-bar-stats">
                            <strong>{cat.percentualAcerto}%</strong> de acerto ({cat.acertos}/
                            {cat.respondidas} resp.) • ⏱ {cat.tempoMedioSegundos}s/questão
                          </span>
                        </div>
                        <div className="admin-bar-track">
                          <div
                            className="admin-bar-fill"
                            style={{
                              width: `${Math.max(cat.respondidas > 0 ? 3 : 0, cat.percentualAcerto)}%`,
                              background: cat.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* === ABA 2: DESEMPENHO POR QUESTÃO & PERGUNTAS BÔNUS === */}
            {activeTab === "QUESTIONS" && (
              <div className="admin-section-stack">
                {/* Cards de Destaques de Questões */}
                <div className="admin-charts-row-2col">
                  <div className="admin-panel-card admin-highlight-card success">
                    <div className="admin-highlight-tag">✓ Maior Taxa de Acerto</div>
                    {destaquesQuestoes.maisAcertada ? (
                      <>
                        <h4>{destaquesQuestoes.maisAcertada.pergunta}</h4>
                        <p>
                          <strong>{destaquesQuestoes.maisAcertada.taxaAcerto}% de acerto</strong> (
                          {destaquesQuestoes.maisAcertada.acertos}/
                          {destaquesQuestoes.maisAcertada.respondidas} respostas) • Tempo médio:{" "}
                          {destaquesQuestoes.maisAcertada.tempoMedioSegundos}s
                        </p>
                      </>
                    ) : (
                      <p>Ainda não há respostas registradas para calcular.</p>
                    )}
                  </div>

                  <div className="admin-panel-card admin-highlight-card danger">
                    <div className="admin-highlight-tag">⚠️ Maior Índice de Dificuldade / Erro</div>
                    {destaquesQuestoes.maisErrada ? (
                      <>
                        <h4>{destaquesQuestoes.maisErrada.pergunta}</h4>
                        <p>
                          <strong>{destaquesQuestoes.maisErrada.taxaAcerto}% de acerto</strong> (
                          {destaquesQuestoes.maisErrada.erros} erros em{" "}
                          {destaquesQuestoes.maisErrada.respondidas} respostas) • Tempo médio:{" "}
                          {destaquesQuestoes.maisErrada.tempoMedioSegundos}s
                        </p>
                      </>
                    ) : (
                      <p>Ainda não há respostas registradas para calcular.</p>
                    )}
                  </div>
                </div>

                {/* Perguntas Bônus Reflexivas (Q25 e Q26) */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>✨ Distribuição das Perguntas Bônus Reflexivas (Questões 25 e 26)</h3>
                      <p>
                        Proporção das escolhas subjetivas dos participantes sobre identidade e
                        planejamento de legado digital
                      </p>
                    </div>
                  </div>

                  <div className="admin-charts-row-2col">
                    {analitico.estatisticasBonus.map((b) => (
                      <div key={b.id} className="admin-bonus-box">
                        <div className="admin-bonus-head">
                          <span className="admin-bonus-badge">{b.titulo}</span>
                          <span className="admin-bonus-meta">
                            {b.totalRespostas} respostas • ⏱ {b.tempoMedioSegundos}s médios
                          </span>
                        </div>
                        <p className="admin-bonus-question">{b.pergunta}</p>
                        <div className="admin-bars-list">
                          {b.opcoes.map((opt) => (
                            <div key={opt.id} className="admin-bar-row">
                              <div className="admin-bar-meta">
                                <span>
                                  <strong>Opção {opt.id}:</strong> {opt.texto}
                                </span>
                                <strong>
                                  {opt.quantidade} ({opt.percentual}%)
                                </strong>
                              </div>
                              <div className="admin-bar-track">
                                <div
                                  className="admin-bar-fill"
                                  style={{
                                    width: `${Math.max(opt.quantidade > 0 ? 4 : 0, opt.percentual)}%`,
                                    background:
                                      opt.id === "A"
                                        ? "#8b5cf6"
                                        : opt.id === "B"
                                        ? "#06b6d4"
                                        : "#f59e0b"
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabela e Barras de Distribuição por Questão (1 a 24) */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Análise Detalhada por Questão ({analitico.estatisticasPorQuestao.length})</h3>
                      <p>
                        Distribuição das alternativas A, B e C, gabarito oficial, taxa de acerto e
                        tempo médio de decisão
                      </p>
                    </div>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Questão</th>
                          <th>Categoria</th>
                          <th>Gabarito</th>
                          <th>Respostas</th>
                          <th>Distribuição (A / B / C)</th>
                          <th>Taxa de Acerto</th>
                          <th>Tempo Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analitico.estatisticasPorQuestao.map((q) => (
                          <tr key={q.id}>
                            <td style={{ maxWidth: 320, fontWeight: 600, color: "#1e2952" }}>
                              {q.pergunta}
                            </td>
                            <td>
                              <span
                                className="admin-cat-tag"
                                style={{
                                  borderLeft: `3px solid ${q.categoriaColor}`
                                }}
                              >
                                {q.categoriaBadge}
                              </span>
                            </td>
                            <td>
                              <span className="admin-opt-pill correct">{q.correta}</span>
                            </td>
                            <td>{q.respondidas}</td>
                            <td style={{ minWidth: 190 }}>
                              <div className="admin-stacked-bar">
                                <div
                                  style={{
                                    width: `${q.percentualOpcoes.A}%`,
                                    background: q.correta === "A" ? "#16a34a" : "#94a3b8"
                                  }}
                                  title={`A: ${q.contagemOpcoes.A} (${q.percentualOpcoes.A}%)`}
                                />
                                <div
                                  style={{
                                    width: `${q.percentualOpcoes.B}%`,
                                    background: q.correta === "B" ? "#16a34a" : "#64748b"
                                  }}
                                  title={`B: ${q.contagemOpcoes.B} (${q.percentualOpcoes.B}%)`}
                                />
                                <div
                                  style={{
                                    width: `${q.percentualOpcoes.C}%`,
                                    background: q.correta === "C" ? "#16a34a" : "#cbd5e1"
                                  }}
                                  title={`C: ${q.contagemOpcoes.C} (${q.percentualOpcoes.C}%)`}
                                />
                              </div>
                              <div className="admin-stacked-labels">
                                <span>A: {q.percentualOpcoes.A}%</span>
                                <span>B: {q.percentualOpcoes.B}%</span>
                                <span>C: {q.percentualOpcoes.C}%</span>
                              </div>
                            </td>
                            <td>
                              <strong
                                style={{
                                  color:
                                    q.taxaAcerto >= 70
                                      ? "#16a34a"
                                      : q.taxaAcerto >= 40
                                      ? "#d97706"
                                      : "#dc2626"
                                }}
                              >
                                {q.taxaAcerto}%
                              </strong>{" "}
                              <small style={{ color: "#64748b" }}>
                                ({q.acertos}/{q.respondidas})
                              </small>
                            </td>
                            <td>{q.tempoMedioSegundos}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* === ABA 3: RETENÇÃO, DESISTÊNCIAS & ENGAJAMENTO === */}
            {activeTab === "RETENTION" && (
              <div className="admin-section-stack">
                <div className="admin-charts-row-2col">
                  {/* Funil de Retenção */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Funil de Retenção da Jornada</h3>
                        <p>Progressão dos participantes através das etapas éticas e do jogo</p>
                      </div>
                    </div>

                    <div className="admin-bars-list">
                      {analitico.funilRetencao.map((step, idx) => (
                        <div key={idx} className="admin-bar-row">
                          <div className="admin-bar-meta">
                            <strong>{step.etapa}</strong>
                            <span>
                              <strong>{step.quantidade}</strong> participantes ({step.percentual}%)
                            </span>
                          </div>
                          <div className="admin-bar-track">
                            <div
                              className="admin-bar-fill"
                              style={{
                                width: `${Math.max(step.quantidade > 0 ? 4 : 0, step.percentual)}%`,
                                background: "linear-gradient(90deg, #1e2952, #3b82f6)"
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gráfico de Setores: Motivos de Desistência */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Motivos de Desistência Informados</h3>
                        <p>
                          Distribuição emocional coletada na tela de acolhimento (Tempo médio até a
                          saída: {formatarDuracao(analitico.analiseDesistencias.tempoMedioAteSaidaSegundos)})
                        </p>
                      </div>
                    </div>

                    <DonutChart
                      centerLabel={analitico.analiseDesistencias.totalDesistencias}
                      centerSub="Saídas"
                      segments={analitico.analiseDesistencias.motivos.map((m) => ({
                        label: `${m.emoji} ${m.label}`,
                        value: m.quantidade,
                        color: m.color
                      }))}
                    />
                  </div>
                </div>

                <div className="admin-charts-row-2col">
                  {/* Telas / Questões de Saída */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Pontos de Interrupção (Tela / Questão de Saída)</h3>
                        <p>Identifica em qual momento exato os participantes optaram por sair</p>
                      </div>
                    </div>

                    {analitico.analiseDesistencias.telasDeSaida.length === 0 ? (
                      <div className="admin-empty-chart">
                        <span>🎉</span>
                        <p>Nenhuma desistência registrada para os filtros atuais.</p>
                      </div>
                    ) : (
                      <div className="admin-bars-list">
                        {analitico.analiseDesistencias.telasDeSaida.map((item) => (
                          <div key={item.tela} className="admin-bar-row">
                            <div className="admin-bar-meta">
                              <strong>Etapa: {item.tela}</strong>
                              <span>
                                {item.quantidade} saídas ({item.percentual}%)
                              </span>
                            </div>
                            <div className="admin-bar-track">
                              <div
                                className="admin-bar-fill"
                                style={{
                                  width: `${Math.max(5, item.percentual)}%`,
                                  background: "#ef4444"
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Métricas de Engajamento e Recursos */}
                  <div className="admin-panel-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Métricas de Engajamento & Interação</h3>
                        <p>Utilização de recursos pedagógicos e controles durante e após o quiz</p>
                      </div>
                    </div>

                    <div className="admin-engagement-grid">
                      <div className="admin-eng-box">
                        <span className="admin-eng-num">
                          {analitico.engajamentoConsolidado.abriuRevisaoGabarito}
                        </span>
                        <span className="admin-eng-label">Consultas ao Gabarito Comentado</span>
                      </div>
                      <div className="admin-eng-box">
                        <span className="admin-eng-num">
                          {analitico.engajamentoConsolidado.abriuRanking}
                        </span>
                        <span className="admin-eng-label">Aberturas do Modal de Ranking</span>
                      </div>
                      <div className="admin-eng-box">
                        <span className="admin-eng-num">
                          {analitico.engajamentoConsolidado.exportouJson}
                        </span>
                        <span className="admin-eng-label">Downloads de JSON Individual</span>
                      </div>
                      <div className="admin-eng-box">
                        <span className="admin-eng-num">
                          {analitico.engajamentoConsolidado.tentativasSaidaCanceladas}
                        </span>
                        <span className="admin-eng-label">
                          Saídas Canceladas ("Continuar Jogando")
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <h4 style={{ fontSize: "0.92rem", color: "#334155", marginBottom: 8 }}>
                        Filtros Utilizados no Modal de Revisão (Gabarito):
                      </h4>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span className="admin-cat-tag">
                          Todas as Questões: <strong>{analitico.engajamentoConsolidado.filtrosRevisao.ALL}</strong>
                        </span>
                        <span className="admin-cat-tag">
                          Apenas Acertos: <strong>{analitico.engajamentoConsolidado.filtrosRevisao.CORRECT}</strong>
                        </span>
                        <span className="admin-cat-tag">
                          Apenas Erros: <strong>{analitico.engajamentoConsolidado.filtrosRevisao.INCORRECT}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === ABA 4: REGISTROS DETALHADOS & EXPORTAÇÃO CSV / EXCEL === */}
            {activeTab === "RECORDS" && (
              <div className="admin-section-stack">
                {/* Barra de Exportação Científica */}
                <div className="admin-panel-card admin-export-banner">
                  <div>
                    <h3>📥 Exportação de Dados para Análise Científica</h3>
                    <p>
                      Exporte os registros filtrados ({sessoesFiltradas.length} sessões) em formatos
                      compatíveis com Excel, R, Python e SPSS.{" "}
                      {anonimizarNicknames
                        ? "Os apelidos estão anonimizados para proteção de privacidade."
                        : "Exibindo apelidos originais cadastrados no jogo."}
                    </p>
                  </div>
                  <div className="admin-export-buttons">
                    <button
                      type="button"
                      className="admin-btn-export csv"
                      disabled={sessoesFiltradas.length === 0}
                      onClick={() =>
                        exportarSessoesCSV(sessoesFiltradas, {
                          anonimizarNickname: anonimizarNicknames
                        })
                      }
                    >
                      📄 Exportar Resumo das Sessões (.CSV)
                    </button>
                    <button
                      type="button"
                      className="admin-btn-export csv-long"
                      disabled={sessoesFiltradas.length === 0}
                      onClick={() =>
                        exportarRespostasDetalhadasCSV(sessoesFiltradas, {
                          anonimizarNickname: anonimizarNicknames
                        })
                      }
                    >
                      📊 Exportar Respostas por Questão (.CSV)
                    </button>
                    <button
                      type="button"
                      className="admin-btn-export excel"
                      disabled={sessoesFiltradas.length === 0}
                      onClick={() =>
                        exportarPlanilhaExcel(sessoesFiltradas, analitico, {
                          anonimizarNickname: anonimizarNicknames
                        })
                      }
                    >
                      📗 Exportar Relatório Multi-Abas (.XLS Excel)
                    </button>
                  </div>
                </div>

                {/* Tabela de Sessões Coletadas (sessoes_pesquisa) */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>
                        Registros da Coleção <code>sessoes_pesquisa</code> ({sessoesFiltradas.length})
                      </h3>
                      <p>
                        Clique em "Inspecionar" para visualizar todas as respostas, tempos por
                        questão e carimbos de data/hora da sessão
                      </p>
                    </div>
                  </div>

                  {sessoesFiltradas.length === 0 ? (
                    <div className="admin-empty-chart">
                      <span>📭</span>
                      <p>Nenhuma sessão encontrada para os filtros selecionados.</p>
                    </div>
                  ) : (
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID da Sessão</th>
                            <th>Status</th>
                            <th>Participante</th>
                            <th>Data/Hora Final</th>
                            <th>Duração</th>
                            <th>Progresso</th>
                            <th>Pontuação</th>
                            <th>Bônus (1 / 2)</th>
                            <th>Desistência / Saída</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessoesFiltradas.map((s, idx) => {
                            const nomeExibido = anonimizarNicknames
                              ? `Participante #${String(sessoesFiltradas.length - idx).padStart(3, "0")}`
                              : s.nickname || "Anônimo (Pré-TCLE)";

                            const isConcluida = s.status === "concluida";
                            const acertos = s.desempenho?.acertos ?? 0;
                            const totalQ = s.desempenho?.totalQuestoes ?? 24;
                            const pct = s.desempenho?.percentualAcerto ?? 0;

                            return (
                              <tr key={s.sessionId || s.id}>
                                <td>
                                  <code className="admin-code-id">
                                    {(s.sessionId || s.id || "").substring(0, 22)}
                                  </code>
                                </td>
                                <td>
                                  <span
                                    className={`admin-status-badge ${
                                      isConcluida ? "concluida" : "desistencia"
                                    }`}
                                  >
                                    {isConcluida ? "✓ Concluída" : "🚪 Desistência"}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{nomeExibido}</td>
                                <td>{formatarDataHora(s.sessaoFinalizadaEm)}</td>
                                <td>{formatarDuracao(s.tempos?.duracaoTotalSegundos)}</td>
                                <td>
                                  {s.desempenho?.questoesRespondidas ?? 0}/{totalQ} questões
                                </td>
                                <td>
                                  <strong>
                                    {acertos}/{totalQ}
                                  </strong>{" "}
                                  <small>({pct}%)</small>
                                </td>
                                <td>
                                  {s.respostasBonus?.bonus_1?.alternativaEscolhida || "—"} /{" "}
                                  {s.respostasBonus?.bonus_2?.alternativaEscolhida || "—"}
                                </td>
                                <td>
                                  {s.desistencia ? (
                                    <span style={{ fontSize: "0.82rem", color: "#991b1b" }}>
                                      {s.desistencia.motivoLabel} ({s.desistencia.telaOuQuestaoDeSaida})
                                    </span>
                                  ) : (
                                    <span style={{ color: "#94a3b8" }}>—</span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="admin-btn-inspect"
                                    onClick={() => setSessaoInspecionada(s)}
                                  >
                                    🔍 Inspecionar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Tabela da Coleção 'jogadores' (Ranking) */}
                <div className="admin-panel-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>
                        Registros da Coleção <code>jogadores</code> — Ranking Oficial (
                        {rankingReal.length})
                      </h3>
                      <p>
                        Dados públicos de classificação ordenados por maior pontuação e menor tempo
                      </p>
                    </div>
                  </div>

                  {rankingReal.length === 0 ? (
                    <div className="admin-empty-chart">
                      <span>🏆</span>
                      <p>Nenhum participante registrado na coleção de ranking ainda.</p>
                    </div>
                  ) : (
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Posição</th>
                            <th>ID Documento</th>
                            <th>Participante</th>
                            <th>Pontuação</th>
                            <th>Tempo Total</th>
                            <th>Referência Assinatura (Storage)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankingReal.map((jog) => (
                            <tr key={jog.id}>
                              <td>
                                <strong>#{jog.posicao}</strong>
                              </td>
                              <td>
                                <code className="admin-code-id">{jog.id}</code>
                              </td>
                              <td>
                                {anonimizarNicknames
                                  ? `Jogador_Ranking_#${String(jog.posicao).padStart(2, "0")}`
                                  : jog.nickname}
                              </td>
                              <td>
                                <strong>{jog.pontuacao} pts</strong>
                              </td>
                              <td>{formatarDuracao(jog.tempoSegundos)}</td>
                              <td>
                                <code className="admin-code-id">
                                  {jog.assinaturaUrl ? "✓ Armazenada no Storage" : "—"}
                                </code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Inspeção Detalhada de uma Sessão */}
      {sessaoInspecionada && (
        <div
          className="modal-overlay"
          onClick={() => setSessaoInspecionada(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-inspect-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-inspect-header">
              <div>
                <span className="admin-badge-restricted">INSPEÇÃO DE SESSÃO</span>
                <h3>{sessaoInspecionada.sessionId || sessaoInspecionada.id}</h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSessaoInspecionada(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-inspect-body">
              <div className="admin-inspect-summary-grid">
                <div>
                  <strong>Status:</strong>{" "}
                  {sessaoInspecionada.status === "concluida" ? "Concluída" : "Desistência"}
                </div>
                <div>
                  <strong>Participante:</strong>{" "}
                  {anonimizarNicknames
                    ? "Anonimizado"
                    : sessaoInspecionada.nickname || "Anônimo"}
                </div>
                <div>
                  <strong>Início:</strong>{" "}
                  {formatarDataHora(sessaoInspecionada.timestamps?.sessaoIniciadaEm)}
                </div>
                <div>
                  <strong>Término:</strong>{" "}
                  {formatarDataHora(sessaoInspecionada.sessaoFinalizadaEm)}
                </div>
                <div>
                  <strong>Duração Total (Sessão):</strong>{" "}
                  {formatarDuracao(sessaoInspecionada.tempos?.duracaoTotalSegundos)}
                </div>
                <div>
                  <strong>Tempo Total Quiz:</strong>{" "}
                  {(
                    sessaoInspecionada.tempos?.totalQuizDurationSeconds ??
                    sessaoInspecionada.tempos?.duracaoQuizSegundos ??
                    0
                  ).toFixed(2)}
                  s
                </div>
                <div>
                  <strong>Tempo Médio / Questão:</strong>{" "}
                  {((sessaoInspecionada.tempos?.tempoMedioPorQuestaoMs || 0) / 1000).toFixed(2)}s
                </div>
                <div>
                  <strong>Pontuação:</strong> {sessaoInspecionada.desempenho?.acertos ?? 0}/
                  {sessaoInspecionada.desempenho?.totalQuestoes ?? 24} (
                  {sessaoInspecionada.desempenho?.percentualAcerto ?? 0}%)
                </div>
                <div>
                  <strong>TCLE Aceito:</strong>{" "}
                  {sessaoInspecionada.consentimento?.aceito ? "Sim" : "Não"}
                </div>
              </div>

              {sessaoInspecionada.desistencia && (
                <div className="admin-alert-error" style={{ marginTop: 12 }}>
                  <strong>Registro de Desistência:</strong> Motivo{" "}
                  <em>"{sessaoInspecionada.desistencia.motivoLabel}"</em> na etapa{" "}
                  <code>{sessaoInspecionada.desistencia.telaOuQuestaoDeSaida}</code> após{" "}
                  {formatarDuracao(sessaoInspecionada.desistencia.tempoAteSaidaSegundos)}.
                </div>
              )}

              <h4 style={{ marginTop: 18, marginBottom: 8, color: "#1e2952" }}>
                Respostas Individuais por Questão
              </h4>
              <div className="admin-table-responsive" style={{ maxHeight: 280 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Categoria</th>
                      <th>Escolhida</th>
                      <th>Correta</th>
                      <th>Resultado</th>
                      <th>Tempo de Resposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(sessaoInspecionada.respostasQuiz || {}).length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                          Nenhuma questão respondida nesta sessão.
                        </td>
                      </tr>
                    ) : (
                      Object.values(sessaoInspecionada.respostasQuiz || {})
                        .sort((a, b) => a.questaoId - b.questaoId)
                        .map((r) => (
                          <tr key={r.questaoId}>
                            <td>
                              <strong>Q{r.questaoId}</strong>
                            </td>
                            <td>{CATEGORIES[r.categoria]?.badge || r.categoria}</td>
                            <td>{r.alternativaEscolhida}</td>
                            <td>{r.alternativaCorreta}</td>
                            <td>
                              <span
                                style={{
                                  color: r.acertou ? "#16a34a" : "#dc2626",
                                  fontWeight: 700
                                }}
                              >
                                {r.acertou ? "✓ Acertou" : "✕ Errou"}
                              </span>
                            </td>
                            <td>
                              {(
                                typeof r.timeSpentSeconds === "number"
                                  ? r.timeSpentSeconds
                                  : (r.tempoRespostaMs || 0) / 1000
                              ).toFixed(2)}
                              s
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

