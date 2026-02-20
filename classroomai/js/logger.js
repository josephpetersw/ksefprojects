/**
 * logger.js — Robust Error & Event Logger for Classroom AI
 * Kenya Science & Engineering Fair · 62nd Edition · 2026
 *
 * Captures:
 *  - Unhandled JS errors (window.onerror)
 *  - Unhandled Promise rejections
 *  - Manual log calls (Logger.info / warn / error / debug)
 *  - AI engine events (detection errors, model failures)
 *
 * Outputs:
 *  - Browser console (colour-coded)
 *  - localStorage ring buffer (last 500 entries)
 *  - Optional API push to /api/log.php
 */

(function(global) {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────── */
  const CFG = {
    MAX_ENTRIES:  500,       // localStorage ring buffer size
    STORE_KEY:    'cai_logs',
    API_ENDPOINT: '/api/log.php',  // set to null to disable
    PUSH_ERRORS:  false,     // whether to POST errors to API
    MIN_LEVEL:    'debug',   // minimum log level to capture
    APP_VERSION:  '1.0.0',
  };

  const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
  const COLOURS = {
    debug: '#94a3b8',
    info:  '#06b6d4',
    warn:  '#f59e0b',
    error: '#ef4444',
  };
  const ICONS = {
    debug: '🔍',
    info:  'ℹ️',
    warn:  '⚠️',
    error: '❌',
  };

  /* ── Internal state ─────────────────────────────────────────── */
  let _listeners = [];
  let _sessionId = _generateId();

  function _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function _timestamp() {
    return new Date().toISOString();
  }

  /* ── Core log writer ─────────────────────────────────────────── */
  function _write(level, source, message, data) {
    if (LEVELS[level] < LEVELS[CFG.MIN_LEVEL]) return;

    const entry = {
      id:        _generateId(),
      ts:        _timestamp(),
      sessionId: _sessionId,
      level:     level,
      source:    source || 'app',
      message:   String(message),
      data:      data || null,
      url:       location.href,
      ua:        navigator.userAgent.slice(0, 80),
      v:         CFG.APP_VERSION,
    };

    // Console output
    const style = `color:${COLOURS[level]};font-weight:600;`;
    const prefix = `%c[CAI ${level.toUpperCase()}] ${ICONS[level]}`;
    if (data !== undefined && data !== null) {
      console.groupCollapsed(`${prefix} [${source}] ${message}`, style);
      console.log('Data:', data);
      console.log('Entry:', entry);
      console.groupEnd();
    } else {
      console.log(`${prefix} [${source}] ${message}`, style);
    }

    // localStorage ring buffer
    _pushToStore(entry);

    // Notify listeners
    _listeners.forEach(fn => { try { fn(entry); } catch(e) {} });

    // Optional API push for errors
    if (level === 'error' && CFG.PUSH_ERRORS && CFG.API_ENDPOINT) {
      _pushToAPI(entry);
    }

    return entry;
  }

  /* ── localStorage ────────────────────────────────────────────── */
  function _pushToStore(entry) {
    try {
      const raw = localStorage.getItem(CFG.STORE_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift(entry);
      if (logs.length > CFG.MAX_ENTRIES) logs.length = CFG.MAX_ENTRIES;
      localStorage.setItem(CFG.STORE_KEY, JSON.stringify(logs));
    } catch(e) {
      // Storage full or unavailable — fail silently
    }
  }

  /* ── API push ────────────────────────────────────────────────── */
  function _pushToAPI(entry) {
    try {
      fetch(CFG.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      }).catch(() => {}); // fire-and-forget
    } catch(e) {}
  }

  /* ── Global error catchers ────────────────────────────────────── */
  window.addEventListener('error', function(ev) {
    _write('error', 'window.onerror', ev.message || 'Unknown error', {
      filename: ev.filename,
      lineno:   ev.lineno,
      colno:    ev.colno,
      stack:    ev.error ? ev.error.stack : null,
    });
  });

  window.addEventListener('unhandledrejection', function(ev) {
    const reason = ev.reason;
    const msg = reason instanceof Error ? reason.message : String(reason);
    _write('error', 'Promise', 'Unhandled rejection: ' + msg, {
      stack: reason instanceof Error ? reason.stack : null,
    });
  });

  /* ── Console override (capture console.error/warn) ───────────── */
  const _origError = console.error.bind(console);
  const _origWarn  = console.warn.bind(console);

  console.error = function(...args) {
    _origError(...args);
    // Avoid infinite loop if _write calls console.error
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (!msg.includes('[CAI ')) { // not our own log
      _pushToStore({
        id: _generateId(), ts: _timestamp(), sessionId: _sessionId,
        level: 'error', source: 'console.error', message: msg, data: null,
        url: location.href, v: CFG.APP_VERSION,
      });
    }
  };

  console.warn = function(...args) {
    _origWarn(...args);
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (!msg.includes('[CAI ')) {
      _pushToStore({
        id: _generateId(), ts: _timestamp(), sessionId: _sessionId,
        level: 'warn', source: 'console.warn', message: msg, data: null,
        url: location.href, v: CFG.APP_VERSION,
      });
    }
  };

  /* ── Public API ───────────────────────────────────────────────── */
  const Logger = {

    /** Log levels */
    debug(source, message, data) { return _write('debug', source, message, data); },
    info (source, message, data) { return _write('info',  source, message, data); },
    warn (source, message, data) { return _write('warn',  source, message, data); },
    error(source, message, data) { return _write('error', source, message, data); },

    /** Convenience — log an Error object */
    exception(source, err, extraData) {
      return _write('error', source, err.message, {
        stack: err.stack,
        name:  err.name,
        ...extraData,
      });
    },

    /** Add a listener called for every log entry */
    onLog(fn) { _listeners.push(fn); },

    /** Retrieve stored logs from localStorage */
    getLogs(level) {
      try {
        const raw = localStorage.getItem(CFG.STORE_KEY);
        const logs = raw ? JSON.parse(raw) : [];
        return level ? logs.filter(l => l.level === level) : logs;
      } catch(e) { return []; }
    },

    /** Clear stored logs */
    clearLogs() {
      try { localStorage.removeItem(CFG.STORE_KEY); } catch(e) {}
    },

    /** Export logs as a downloadable JSON file */
    exportLogs() {
      const logs  = this.getLogs();
      const json  = JSON.stringify(logs, null, 2);
      const blob  = new Blob([json], { type: 'application/json' });
      const url   = URL.createObjectURL(blob);
      const a     = Object.assign(document.createElement('a'), {
        href: url,
        download: `cai-logs-${new Date().toISOString().slice(0,10)}.json`,
      });
      a.click();
      URL.revokeObjectURL(url);
    },

    /** Get log counts by level */
    summary() {
      const logs = this.getLogs();
      return {
        total:   logs.length,
        debug:   logs.filter(l => l.level === 'debug').length,
        info:    logs.filter(l => l.level === 'info').length,
        warn:    logs.filter(l => l.level === 'warn').length,
        error:   logs.filter(l => l.level === 'error').length,
        session: _sessionId,
      };
    },

    /** Set minimum log level */
    setLevel(level) {
      if (LEVELS[level] !== undefined) CFG.MIN_LEVEL = level;
    },

    /** Enable/disable API push */
    setAPIPush(enable) { CFG.PUSH_ERRORS = !!enable; },

    version: CFG.APP_VERSION,
    sessionId: _sessionId,
  };

  // Expose globally
  global.Logger = Logger;

  // Mark init
  Logger.info('Logger', `Classroom AI Logger v${CFG.APP_VERSION} initialised`, {
    sessionId: _sessionId,
    time: _timestamp(),
  });

})(window);
