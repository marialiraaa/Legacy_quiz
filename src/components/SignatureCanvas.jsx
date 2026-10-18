import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Interactive Digital Signature Canvas Component
 * Supports both touch (mobile/tablet) and mouse with High-DPI sharpness
 */
export function SignatureCanvas({ onSignatureChange, disabled = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [pointsCount, setPointsCount] = useState(0);

  // Initialize canvas with proper pixel ratio for crisp rendering
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save current content if any
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    // Resize
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1e2952'; // Dark navy ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore content if it existed
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (disabled) return;
    // Prevent scrolling when drawing on touch screens
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(x, y);
    ctx.stroke();

    setPointsCount((prev) => {
      const next = prev + 1;
      // Consider valid if at least 15 points drawn
      if (next >= 15 && !hasDrawn) {
        setHasDrawn(true);
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureChange?.({ hasSignature: true, dataUrl });
      }
      return next;
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && pointsCount >= 15) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange?.({ hasSignature: true, dataUrl });
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    setHasDrawn(false);
    setPointsCount(0);
    onSignatureChange?.({ hasSignature: false, dataUrl: null });
  };

  return (
    <div className={`signature-component-wrapper ${disabled ? 'is-disabled' : ''}`}>
      <div className="signature-header-row">
        <label className="signature-label">
          ✍️ Assinatura Manual do Participante:
        </label>
        <button
          type="button"
          className="btn-clear-signature"
          onClick={handleClear}
          disabled={disabled || !hasDrawn}
          title="Apagar assinatura e assinar novamente"
        >
          🗑️ Limpar Assinatura
        </button>
      </div>

      <div className="signature-canvas-container">
        <canvas
          ref={canvasRef}
          className="signature-canvas-element"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Área para desenhar a sua assinatura manual"
        />

        {/* Visual Guide Line */}
        <div className="signature-guideline">
          <span>Assine com o mouse ou toque do dedo acima desta linha</span>
        </div>

        {/* Status Badge */}
        <div className={`signature-status-badge ${hasDrawn ? 'signed' : 'waiting'}`}>
          {hasDrawn ? '✓ Assinatura Registrada' : 'Aguardando Assinatura'}
        </div>
      </div>
    </div>
  );
}
