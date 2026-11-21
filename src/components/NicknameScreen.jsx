import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TCLE_DATA } from '../data/tcle.js';
import { SignatureCanvas } from './SignatureCanvas.jsx';

export function NicknameScreen({ onConfirmNickname, onBack, playClick }) {
  // Validation Gates State
  const [ageGroup, setAgeGroup] = useState(''); // 'maior_idade' | 'menor_idade'
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState({ hasSignature: false, dataUrl: null });

  // Participant Input State
  const [nicknameInput, setNicknameInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const scrollContainerRef = useRef(null);

  // Scroll listener to detect when user has scrolled to the bottom of TCLE
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) {
      setScrollProgress(100);
      setHasScrolledToBottom(true);
      return;
    }

    const currentPercent = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
    setScrollProgress(currentPercent);

    // Considered read if scrolled past 92%
    if (currentPercent >= 92 && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  // Check initial scrollability on mount
  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  // Master validation: Age group + all 3 TCLE requirements must be satisfied to unlock Nickname & Start
  const hasSelectedAgeGroup = ageGroup === 'maior_idade' || ageGroup === 'menor_idade';
  const ageGroupLabel =
    ageGroup === 'maior_idade'
      ? 'Maior de idade (18 anos ou mais)'
      : ageGroup === 'menor_idade'
        ? 'Menor de idade (menos de 18 anos)'
        : '';
  const isTCLEComplete =
    hasSelectedAgeGroup && hasScrolledToBottom && hasAcceptedConsent && signatureInfo.hasSignature;
  const isFormValid = isTCLEComplete && nicknameInput.trim().length > 0;

  const handleSignatureChange = (sigData) => {
    setSignatureInfo(sigData);
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!hasSelectedAgeGroup) {
      setErrorMsg('Por favor, informe se você é maior ou menor de idade antes de prosseguir.');
      return;
    }
    if (!isTCLEComplete) {
      setErrorMsg('Por favor, cumpra todas as etapas do termo e assinatura antes de prosseguir.');
      return;
    }
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setErrorMsg('Por favor, informe um apelido (nickname) para prosseguir.');
      return;
    }
    setErrorMsg('');
    playClick?.();
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    playClick?.();
    const consentPayload = {
      acceptedAt: new Date().toISOString(),
      caae: TCLE_DATA.header.caae,
      ageGroup,
      isAdult: ageGroup === 'maior_idade',
      ageGroupLabel,
      signatureDataUrl: signatureInfo.dataUrl,
      agreedText: TCLE_DATA.consentDeclaration
    };
    onConfirmNickname(nicknameInput.trim(), consentPayload);
  };

  return (
    <div className="screen-content tcle-nickname-screen">
      {/* Top back button */}
      <div style={{ maxWidth: '920px', width: '100%', margin: '0 auto 16px auto' }}>
        <button
          type="button"
          className="feedback-nav-btn"
          style={{ padding: '8px 20px', fontSize: '0.95rem' }}
          onClick={() => {
            playClick?.();
            onBack();
          }}
        >
          &larr; Voltar
        </button>
      </div>

      <div className="tcle-card-container">
        {/* Header Ribbon */}
        <div className="tcle-header-banner">
          <div className="tcle-badge">UFMT • Instituto de Computação • Projeto DAVI</div>
          <h2 className="tcle-title">{TCLE_DATA.header.title}</h2>
          <p className="tcle-subtitle">
            Pesquisa: <strong>{TCLE_DATA.header.studyTitle}</strong> | CAAE: <strong>{TCLE_DATA.header.caae}</strong>
          </p>
        </div>

        {/* Informative Highlights */}
        <div className="tcle-highlights-grid">
          {TCLE_DATA.summaryPoints.map((item, idx) => (
            <div key={idx} className="tcle-highlight-pill">
              <span className="tcle-highlight-icon">{item.icon}</span>
              <div>
                <strong>{item.title}:</strong> {item.text}
              </div>
            </div>
          ))}
        </div>

        {/* AGE GROUP SELECTION: Maior ou Menor de Idade */}
        <div className="tcle-step-box tcle-age-step-box">
          <div className="tcle-step-header">
            <span className="tcle-step-number">Perfil Etário</span>
            <span className="tcle-step-title">Você é maior ou menor de idade?</span>
            <span className={`tcle-scroll-badge ${hasSelectedAgeGroup ? 'done' : 'pending'}`}>
              {hasSelectedAgeGroup ? '✓ Selecionado' : 'Obrigatório'}
            </span>
          </div>
          <p className="tcle-age-helper">
            Selecione abaixo a sua faixa etária para registrar adequadamente o seu termo de participação na pesquisa:
          </p>
          <div className="tcle-age-options-grid" role="radiogroup" aria-label="Seleção de faixa etária">
            <button
              type="button"
              role="radio"
              aria-checked={ageGroup === 'maior_idade'}
              className={`tcle-age-option-card ${ageGroup === 'maior_idade' ? 'selected' : ''}`}
              onClick={() => {
                playClick?.();
                setAgeGroup('maior_idade');
                if (errorMsg) setErrorMsg('');
              }}
            >
              <div className="tcle-age-option-top">
                <span className="tcle-age-icon">🧑</span>
                <span className="tcle-age-radio-indicator">
                  {ageGroup === 'maior_idade' ? '✓' : ''}
                </span>
              </div>
              <div className="tcle-age-option-title">Sou Maior de Idade</div>
              <div className="tcle-age-option-sub">Tenho 18 anos ou mais (TCLE)</div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={ageGroup === 'menor_idade'}
              className={`tcle-age-option-card ${ageGroup === 'menor_idade' ? 'selected' : ''}`}
              onClick={() => {
                playClick?.();
                setAgeGroup('menor_idade');
                if (errorMsg) setErrorMsg('');
              }}
            >
              <div className="tcle-age-option-top">
                <span className="tcle-age-icon">🌱</span>
                <span className="tcle-age-radio-indicator">
                  {ageGroup === 'menor_idade' ? '✓' : ''}
                </span>
              </div>
              <div className="tcle-age-option-title">Sou Menor de Idade</div>
              <div className="tcle-age-option-sub">Tenho menos de 18 anos (TALE / Assentimento)</div>
            </button>
          </div>
        </div>

        {/* STEP 1: Scrollable Complete TCLE Document */}
        <div className="tcle-step-box">
          <div className="tcle-step-header">
            <span className="tcle-step-number">Etapa 1 de 3</span>
            <span className="tcle-step-title">Leitura do Termo Completo</span>
            <span className={`tcle-scroll-badge ${hasScrolledToBottom ? 'done' : 'pending'}`}>
              {hasScrolledToBottom ? '✓ Leitura Concluída' : `Role até o final (${scrollProgress}%)`}
            </span>
          </div>

          <div
            ref={scrollContainerRef}
            className="tcle-scroll-viewport"
            onScroll={handleScroll}
            tabIndex={0}
            role="region"
            aria-label="Texto integral do Termo de Consentimento"
          >
            {TCLE_DATA.fullSections.map((sec) => (
              <section key={sec.id} className="tcle-section-block">
                <h4 className="tcle-section-title">{sec.title}</h4>
                <div className="tcle-section-content">{sec.content}</div>
              </section>
            ))}

            <div className="tcle-end-marker">
              <span>Fim do documento oficial • Obrigado pela leitura atenta.</span>
            </div>
          </div>
        </div>

        {/* STEP 2: Checkbox Acceptance */}
        <div className={`tcle-step-box ${!hasScrolledToBottom ? 'is-locked' : ''}`}>
          <div className="tcle-step-header">
            <span className="tcle-step-number">Etapa 2 de 3</span>
            <span className="tcle-step-title">Declaração de Concordância</span>
          </div>

          <label className={`tcle-checkbox-label ${!hasScrolledToBottom ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              className="tcle-checkbox-input"
              checked={hasAcceptedConsent}
              disabled={!hasScrolledToBottom}
              onChange={(e) => {
                setHasAcceptedConsent(e.target.checked);
                if (errorMsg) setErrorMsg('');
              }}
            />
            <span className="tcle-checkbox-custom" />
            <span className="tcle-checkbox-text">
              {TCLE_DATA.consentDeclaration}
            </span>
          </label>
        </div>

        {/* STEP 3: Manual Digital Signature Canvas */}
        <div className={`tcle-step-box ${!hasAcceptedConsent ? 'is-locked' : ''}`}>
          <div className="tcle-step-header">
            <span className="tcle-step-number">Etapa 3 de 3</span>
            <span className="tcle-step-title">Assinatura Manual Digital</span>
          </div>

          <SignatureCanvas
            disabled={!hasAcceptedConsent}
            onSignatureChange={handleSignatureChange}
          />
        </div>

        {/* FINAL GATE: Identification Nickname Field */}
        <div className={`tcle-identification-panel ${!isTCLEComplete ? 'locked' : 'unlocked'}`}>
          <div className="tcle-identification-header">
            <span className="id-icon">{isTCLEComplete ? '🔓' : '🔒'}</span>
            <div>
              <h3 className="id-title">Identificação do Jogador</h3>
              <p className="id-description">
                {isTCLEComplete
                  ? `Consentimento aceito (${ageGroupLabel})! Agora escolha o seu apelido de jogador para iniciar o quiz.`
                  : 'Informe se você é maior ou menor de idade e cumpra as 3 etapas do termo acima para desbloquear este campo.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleInitialSubmit} className="tcle-nickname-form">
            <div className="input-group-wrapper">
              <input
                type="text"
                className="tcle-input-nickname"
                placeholder={isTCLEComplete ? "Digite seu apelido (nickname)..." : "Bloqueado até o aceite do TCLE..."}
                value={nicknameInput}
                maxLength={24}
                disabled={!isTCLEComplete}
                onChange={(e) => {
                  setNicknameInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              {errorMsg && (
                <p className="tcle-error-text">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="feedback-nav-btn tcle-submit-btn"
              disabled={!isFormValid}
            >
              Confirmar & Iniciar Jogo &rarr;
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal matching Frame 225 */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-tab">
              Confirme seu Nickname
            </div>
            <div className="modal-body">
              <label className="modal-label">Nickname escolhido:</label>
              <div className="modal-input-display">
                {nicknameInput.trim()}
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#1e2952', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '12px', fontWeight: 700 }}>
                👤 Perfil informado: {ageGroupLabel}
              </div>

              <div style={{ marginTop: '8px', fontSize: '0.88rem', color: '#166534', background: '#dcfce7', padding: '10px 14px', borderRadius: '12px', fontWeight: 600 }}>
                ✓ Termo assinado digitalmente e registrado nesta sessão.
              </div>

              <div className="modal-actions" style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn-red"
                  onClick={() => {
                    playClick?.();
                    setShowConfirmModal(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-green"
                  onClick={handleFinalConfirm}
                >
                  Confirmar & Jogar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
