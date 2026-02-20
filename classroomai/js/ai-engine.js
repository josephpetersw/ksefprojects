/**
 * ai-engine.js — face-api.js AI Behaviour Analysis Engine
 * Classroom AI · Kenya Science & Engineering Fair 62nd Edition
 *
 * Requires face-api.js to be loaded before this script.
 * Uses: TinyFaceDetector + FaceLandmark68 + FaceExpressions
 */

const AIEngine = (() => {

  /* ── Constants ─────────────────────────────────────────── */
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

  /**
   * Behaviour map: expression → { label, colorHex, badgeClass, icon }
   */
  const BEHAVIOUR_MAP = {
    neutral:   { label: 'Attentive',  color: '#10b981', badge: 'attentive',  icon: '✓', severity: 0 },
    happy:     { label: 'Engaged',    color: '#06b6d4', badge: 'engaged',    icon: '★', severity: 0 },
    surprised: { label: 'Alert',      color: '#3b82f6', badge: 'alert-b',    icon: '!', severity: 1 },
    sad:       { label: 'Disengaged', color: '#f59e0b', badge: 'disengaged', icon: '−', severity: 2 },
    fearful:   { label: 'Anxious',    color: '#f97316', badge: 'anxious',    icon: '⚠', severity: 2 },
    angry:     { label: 'Disruptive', color: '#ef4444', badge: 'disruptive', icon: '✗', severity: 3 },
    disgusted: { label: 'Confused',   color: '#8b5cf6', badge: 'confused',   icon: '?', severity: 2 },
  };

  const SUSPICIOUS = { label: 'Suspicious', color: '#ef4444', badge: 'suspicious', icon: '👀', severity: 3 };

  /* ── State ─────────────────────────────────────────────── */
  let _modelsLoaded = false;
  let _running = false;
  let _rafId = null;
  let _lastTs = 0;
  let _interval = 400; // ms between detections
  let _studentHistory = {};  // id → last behaviour
  let _onDetect = null;      // callback(results)
  let _onLog = null;         // callback(logEntry)

  /* ── Load Models ────────────────────────────────────────── */
  async function loadModels(onProgress) {
    if (_modelsLoaded) return;
    onProgress?.('Loading face detector…', 20);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    onProgress?.('Loading landmark model…', 55);
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
    onProgress?.('Loading expression model…', 85);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    onProgress?.('Models ready ✓', 100);
    _modelsLoaded = true;
  }

  /* ── Classify Behaviour ─────────────────────────────────── */
  function classifyBehaviour(expressions, landmarks) {
    // Top expression
    const sorted = Object.entries(expressions)
      .filter(([, v]) => v > 0.05)
      .sort(([, a], [, b]) => b - a);

    const [dominant] = sorted[0] || ['neutral'];
    let behaviour = BEHAVIOUR_MAP[dominant] || BEHAVIOUR_MAP.neutral;

    // Head-pose check via nose/eye centres (lateral gaze → suspicious)
    if (landmarks) {
      try {
        const noseTip   = landmarks.getNose()[3];         // point on bridge
        const leftEye   = landmarks.getLeftEye();
        const rightEye  = landmarks.getRightEye();
        const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
        const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
        const faceCenterX = (landmarks.positions[0].x + landmarks.positions[16].x) / 2;
        const faceWidth  = Math.abs(landmarks.positions[16].x - landmarks.positions[0].x);
        const ratio = (noseTip.x - faceCenterX) / (faceWidth / 2);

        if (Math.abs(ratio) > 0.28) {
          behaviour = SUSPICIOUS;
        }
      } catch (_) { /* ignore landmark errors */ }
    }

    return behaviour;
  }

  /* ── Compute class attention score ─────────────────────── */
  function computeAttentionScore(results) {
    if (!results.length) return 0;
    const goodBehaviours = ['Attentive', 'Engaged', 'Alert'];
    const good = results.filter(r => goodBehaviours.includes(r.behaviour.label)).length;
    return Math.round((good / results.length) * 100);
  }

  /* ── Draw overlay on canvas ─────────────────────────────── */
  function drawOverlay(canvas, results, videoEl) {
    const ctx = canvas.getContext('2d');

    // Match canvas to video dimensions
    if (videoEl) {
      canvas.width  = videoEl.videoWidth  || videoEl.offsetWidth;
      canvas.height = videoEl.videoHeight || videoEl.offsetHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    results.forEach((r, idx) => {
      const box = r.detection.box;
      const beh = r.behaviour;
      const x = box.x, y = box.y, w = box.width, h = box.height;

      // Box
      ctx.strokeStyle = beh.color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Corner accents
      const cLen = Math.min(w, h) * 0.12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // top-left
      ctx.moveTo(x, y + cLen); ctx.lineTo(x, y); ctx.lineTo(x + cLen, y);
      // top-right
      ctx.moveTo(x + w - cLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cLen);
      // bottom-left
      ctx.moveTo(x, y + h - cLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cLen, y + h);
      // bottom-right
      ctx.moveTo(x + w - cLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cLen);
      ctx.stroke();

      // Label background
      const label = `S${idx + 1} · ${beh.icon} ${beh.label}`;
      ctx.font = 'bold 13px Inter, sans-serif';
      const tw = ctx.measureText(label).width;
      const lh = 22;
      const lx = x;
      const ly = y > lh + 4 ? y - lh - 4 : y + h + 4;

      // Pill background
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#060c1a';
      roundRect(ctx, lx - 2, ly, tw + 16, lh, 5);
      ctx.fill();

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = beh.color;
      roundRect(ctx, lx - 2, ly, tw + 16, lh, 5);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, lx + 6, ly + 15);

      // Confidence bar under box
      if (r.expressions) {
        const conf = r.expressions[Object.entries(r.expressions).sort(([,a],[,b])=>b-a)[0][0]];
        const barW = w * conf;
        ctx.fillStyle = beh.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y + h + 2, barW, 3);
        ctx.globalAlpha = 1;
      }
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── Detection Loop ─────────────────────────────────────── */
  async function detectOnce(videoEl) {
    if (!_modelsLoaded || !videoEl || videoEl.readyState < 2) return [];

    const opts = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,  // 160 | 224 | 320 | 416 | 512 | 608
      scoreThreshold: 0.5
    });

    let detections;
    try {
      detections = await faceapi
        .detectAllFaces(videoEl, opts)
        .withFaceLandmarks(true)
        .withFaceExpressions();
    } catch (e) {
      console.warn('[AI] Detection error', e);
      return [];
    }

    return detections.map((d, idx) => {
      const behaviour = classifyBehaviour(d.expressions, d.landmarks);
      const id = `s${idx + 1}`;

      // Log behaviour change
      if (_studentHistory[id] !== behaviour.label) {
        const prev = _studentHistory[id];
        _studentHistory[id] = behaviour.label;
        if (prev !== undefined) {
          _onLog?.({
            id,
            prev,
            current: behaviour.label,
            severity: behaviour.severity,
            behaviour,
            timestamp: Date.now()
          });
        } else {
          _onLog?.({
            id, prev: null, current: behaviour.label,
            severity: 0, behaviour, timestamp: Date.now()
          });
        }
      }

      return { id, detection: d.detection, landmarks: d.landmarks, expressions: d.expressions, behaviour };
    });
  }

  function startLoop(videoEl, canvas) {
    _running = true;
    _studentHistory = {};

    const tick = async (ts) => {
      if (!_running) return;
      if (ts - _lastTs >= _interval) {
        _lastTs = ts;
        const results = await detectOnce(videoEl);
        drawOverlay(canvas, results, videoEl);
        _onDetect?.(results);
      }
      _rafId = requestAnimationFrame(tick);
    };

    _rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    _running = false;
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = null;
    _studentHistory = {};
  }

  /* ── Session Saving ─────────────────────────────────────── */
  function saveSession(data) {
    Store.push('sessions', {
      id: Date.now(),
      date: new Date().toISOString(),
      ...data
    });

    // Also POST to PHP backend (non-blocking)
    fetch('../api/sessions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, timestamp: Date.now() })
    }).catch(() => {}); // silently fail if no backend
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    loadModels,
    classifyBehaviour,
    computeAttentionScore,
    drawOverlay,
    detectOnce,

    start(videoEl, canvas, { onDetect, onLog, interval } = {}) {
      _onDetect = onDetect || null;
      _onLog    = onLog    || null;
      _interval = interval || parseInt(getSetting('detection_interval')) || 400;
      startLoop(videoEl, canvas);
    },

    stop() { stopLoop(); },

    get isRunning() { return _running; },
    get modelsLoaded() { return _modelsLoaded; },

    BEHAVIOUR_MAP,
    SUSPICIOUS,
    computeAttentionScore,
    saveSession,
  };
})();

window.AIEngine = AIEngine;
