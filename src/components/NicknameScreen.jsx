import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TCLE_DATA } from '../data/tcle.js';
import { SignatureCanvas } from './SignatureCanvas.jsx';

export function NicknameScreen({ onConfirmNickname, onBack, playClick }) {
  // Validation Gates State
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

  // Master validation: All 3 requirements must be satisfied to unlock Nickname & Start
  const isTCLEComplete = hasScrolledToBottom && hasAcceptedConsent && signatureInfo.hasSignature;
  const isFormValid = isTCLEComplete && nicknameInput.trim().length > 0;

  const handleSignatureChange = (sigData) => {
    setSignatureInfo(sigData);
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
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
                  ? 'Consentimento aceito com sucesso! Agora escolha o seu apelido de jogador para iniciar o quiz.'
                  : 'Cumpra as 3 etapas do TCLE acima para desbloquear este campo e iniciar o jogo.'}
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

              <div style={{ marginTop: '12px', fontSize: '0.88rem', color: '#166534', background: '#dcfce7', padding: '10px 14px', borderRadius: '12px', fontWeight: 600 }}>
                ✓ TCLE assinado digitalmente e registrado nesta sessão.
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
