/**
 * NailTryOn — Main AR component
 *
 * Pipeline:
 *   Camera → MediaPipe Hands → One-Euro Smoothing → Nail Geometry →
 *   Perspective-Warp Renderer → Canvas Display
 *
 * MediaPipe is loaded via CDN to avoid SSR/bundler issues.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { LandmarkSmoother } from '../lib/smoothing';
import { computeNailQuad, FINGERS } from '../lib/nailGeometry';
import { renderNailOnQuad } from '../lib/nailRenderer';
import { initNailDesigns, NAIL_DESIGNS } from '../lib/nailDesigns';
import NailCarousel from './NailCarousel';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/';

// ── MediaPipe CDN loader ──────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadMediaPipe() {
  await loadScript(MEDIAPIPE_CDN + 'hands.js');
  const hands = new window.Hands({
    locateFile: (f) => MEDIAPIPE_CDN + f,
  });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.70,
    minTrackingConfidence: 0.65,
  });
  return hands;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NailTryOn() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const handsRef    = useRef(null);
  const smootherRef = useRef(null);   // one per hand slot
  const rafRef      = useRef(null);
  const designsRef  = useRef([]);
  const streamRef   = useRef(null);

  // Active landmark data (shared between MediaPipe callback + rAF)
  const landmarksRef = useRef([]);

  const [selectedDesign, setSelectedDesign] = useState(1); // Hot Pink by default
  const [opacity,  setOpacity]  = useState(0.92);
  const [fingers,  setFingers]  = useState(new Set(['thumb','index','middle','ring','pinky']));
  const [facingMode, setFacingMode] = useState('user');
  const [phase, setPhase] = useState('loading'); // loading | perm | ready | active
  const [toast, setToast] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, ms = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  }, []);

  // ── Resize canvas to match video ────────────────────────────────────────────
  const syncCanvasSize = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth  || window.innerWidth;
      canvas.height = video.videoHeight || window.innerHeight;
    }
  }, []);

  // ── MediaPipe results handler ────────────────────────────────────────────────
  const onResults = useCallback((results) => {
    landmarksRef.current = results.multiHandLandmarks ?? [];
  }, []);

  // ── Render loop (rAF) ───────────────────────────────────────────────────────
  const renderLoop = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const hands  = handsRef.current;

    if (video && video.readyState >= 2 && hands) {
      syncCanvasSize();
      // Send current frame to MediaPipe
      try {
        await hands.send({ image: video });
      } catch { /* MediaPipe not ready yet */ }

      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;

      // Draw mirrored video (front cam = mirror)
      ctx.save();
      if (facingMode === 'user') {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, W, H);
      ctx.restore();

      // Render nails for each detected hand
      const rawLandmarkSets = landmarksRef.current;
      const design = designsRef.current[selectedDesign];
      if (design?.canvas && rawLandmarkSets.length > 0) {
        rawLandmarkSets.forEach((rawLms, handIdx) => {
          // Ensure smoother exists for this hand slot
          if (!smootherRef.current[handIdx]) {
            smootherRef.current[handIdx] = new LandmarkSmoother(21, 4.0, 50.0);
          }
          const lms = smootherRef.current[handIdx].smooth(rawLms);

          // Mirror landmark x if front camera (video is drawn mirrored,
          // but MediaPipe gives unmirrored coords)
          const mirroredLms = facingMode === 'user'
            ? lms.map(lm => ({ ...lm, x: 1 - lm.x }))
            : lms;

          // Render each selected finger
          for (const finger of fingers) {
            const quad = computeNailQuad(mirroredLms, finger, W, H);
            if (quad) renderNailOnQuad(ctx, design.canvas, quad, opacity);
          }
        });
      }
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [selectedDesign, opacity, fingers, facingMode, syncCanvasSize]);

  // ── Camera start ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width:  { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setPhase('active');
    } catch (err) {
      console.error('Camera error:', err);
      setPhase('perm');
    }
  }, [facingMode]);

  // ── Flip camera ─────────────────────────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    // Reset smoothers on camera flip (landmarks jump)
    smootherRef.current = [];
    setFacingMode(next);
    showToast(next === 'user' ? '🤳 Front camera' : '📷 Rear camera');
  }, [facingMode, showToast]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (phase === 'active') startCamera();
  }, [facingMode]); // eslint-disable-line

  // ── Screenshot ──────────────────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsCapturing(true);
    setTimeout(() => {
      const url = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nailart-${Date.now()}.jpg`;
      a.click();
      setIsCapturing(false);
      showToast('💅 Saved to downloads!');
    }, 50);
  }, [showToast]);

  // ── Toggle finger ────────────────────────────────────────────────────────────
  const toggleFinger = useCallback((f) => {
    setFingers(prev => {
      const next = new Set(prev);
      if (next.has(f)) { if (next.size > 1) next.delete(f); }
      else next.add(f);
      return next;
    });
  }, []);

  // ── Init on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    smootherRef.current = [];

    // Generate nail designs
    designsRef.current = initNailDesigns();

    // Load MediaPipe then start camera
    loadMediaPipe()
      .then(hands => {
        hands.onResults(onResults);
        handsRef.current = hands;
        return startCamera();
      })
      .catch(err => {
        console.error('Init error:', err);
        setPhase('perm');
      });

    // Start render loop
    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []); // eslint-disable-line

  // Re-subscribe render loop when deps change
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">

      {/* Hidden video source */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />

      {/* Main AR canvas — fills entire screen */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'auto' }}
      />

      {/* ── Permission / Loading overlay ─────────────────────────────────── */}
      {(phase === 'loading' || phase === 'perm') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: '#0D0D1A' }}>
          <div className="glass rounded-3xl p-8 max-w-sm w-full mx-6 text-center animate-fade-in"
            style={{ border: '1px solid rgba(255,45,120,0.38)' }}>
            <div className="text-6xl mb-5">
              {phase === 'loading' ? '✨' : '📸'}
            </div>
            {phase === 'loading' ? (
              <>
                <div className="spinner mx-auto mb-4" />
                <p style={{ color: '#FFB3D1', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Loading AI engine…
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, color: '#FF2D78', marginBottom: 10 }}>
                  Camera Access
                </h2>
                <p style={{ color: '#FFB3D1', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  Allow camera access to try on nail designs in real-time. Nothing is stored or recorded.
                </p>
                <button className="btn-pink w-full" onClick={startCamera}>
                  Allow Camera ✨
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      {phase === 'active' && (
        <div className="absolute top-0 left-0 right-0 z-30 glass px-5 pt-4 pb-3"
          style={{ background: 'rgba(13,13,26,0.76)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{
                fontFamily: 'Playfair Display', fontSize: 22,
                color: '#FF2D78', letterSpacing: 1,
              }}>
                ✦ try on
              </h1>
              <p style={{
                fontSize: 10, color: '#FFB3D1',
                textTransform: 'uppercase', letterSpacing: 1.4, marginTop: 2,
              }}>
                {NAIL_DESIGNS[selectedDesign]?.name ?? '—'}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Flip camera */}
              <button className="btn-icon text-sm" onClick={flipCamera} title="Flip camera">
                🔄
              </button>

              {/* Opacity slider */}
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full"
                style={{ border: '1px solid rgba(255,45,120,0.30)' }}>
                <span style={{ fontSize: 11, color: '#C084A8' }}>opacity</span>
                <input
                  type="range" min={50} max={100} value={Math.round(opacity * 100)}
                  onChange={e => setOpacity(Number(e.target.value) / 100)}
                  style={{ width: 60, accentColor: '#FF2D78' }}
                />
              </div>
            </div>
          </div>

          {/* Finger toggles */}
          <div className="flex gap-2 mt-3">
            {FINGERS.map(f => (
              <button
                key={f}
                onClick={() => toggleFinger(f)}
                style={{
                  fontSize: 10,
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: fingers.has(f) ? '#FF2D78' : 'rgba(255,255,255,0.15)',
                  background: fingers.has(f) ? 'rgba(255,45,120,0.20)' : 'rgba(255,255,255,0.05)',
                  color: fingers.has(f) ? '#FFB3D1' : '#C084A8',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                  boxShadow: fingers.has(f) ? '0 0 8px rgba(255,45,120,0.4)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom panel ─────────────────────────────────────────────────── */}
      {phase === 'active' && (
        <div className="absolute bottom-0 left-0 right-0 z-30"
          style={{
            background: 'rgba(13,13,26,0.90)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,45,120,0.32)',
            paddingTop: 12,
            paddingBottom: 20,
          }}>

          {/* Nail design carousel */}
          <NailCarousel
            designs={designsRef.current}
            selected={selectedDesign}
            onSelect={setSelectedDesign}
          />

          {/* Shutter row */}
          <div className="flex items-center justify-between px-10 mt-3">
            {/* Placeholder left */}
            <div style={{ width: 52 }} />

            {/* Shutter / capture button */}
            <button
              className="shutter"
              onClick={capturePhoto}
              disabled={isCapturing}
              style={{ opacity: isCapturing ? 0.6 : 1 }}
              title="Capture photo"
            >
              <div className="shutter-inner" />
            </button>

            {/* Flip — duplicate for right side access */}
            <button
              className="btn-icon"
              onClick={flipCamera}
              style={{ width: 52, height: 52, fontSize: 20 }}
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* ── Capture flash ──────────────────────────────────────────────────── */}
      {isCapturing && (
        <div className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.35)',
            animation: 'fadeIn 0.15s ease',
          }}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 130, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(26,26,46,0.95)',
            border: '1px solid rgba(255,45,120,0.38)',
            borderRadius: 30,
            padding: '10px 22px',
            fontSize: 13, fontWeight: 600,
            color: '#FFB3D1',
            whiteSpace: 'nowrap',
            zIndex: 60,
            animation: 'toastIn 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
