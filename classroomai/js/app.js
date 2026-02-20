/**
 * app.js — Shared utilities for Classroom AI
 * Kenya Science & Engineering Fair · 62nd Edition
 */

/* ── Active Nav Link ─────────────────────────────────────── */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && page.includes(href.split('/').pop())) {
      link.classList.add('active');
    }
  });
})();

/* ── Sidebar Toggle (mobile) ─────────────────────────────── */
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggleBtn && sidebar) {
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== sidebarToggleBtn) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── Mode ────────────────────────────────────────────────── */
(function initLightMode() {
  document.documentElement.classList.add('light-mode');
})();

/* ── Toast Notifications ─────────────────────────────────── */
(function createToastContainer() {
  if (!document.getElementById('toast-container')) {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
})();

window.showToast = function(msg, type = 'info', duration = 3500) {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warn: 'fa-exclamation-triangle' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, duration);
};

/* ── LocalStorage Helpers ────────────────────────────────── */
const Store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(`cai_${key}`);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`cai_${key}`, JSON.stringify(value)); } catch {}
  },
  push(key, item, maxLen = 200) {
    const arr = this.get(key, []);
    arr.unshift(item);
    if (arr.length > maxLen) arr.length = maxLen;
    this.set(key, arr);
  }
};

window.Store = Store;

/* ── Settings defaults ───────────────────────────────────── */
const SETTING_DEFAULTS = {
  ai_sensitivity: 'medium',
  alert_threshold: 5,
  camera_resolution: '720p',
  detection_interval: 400,
};

window.getSetting = (key) => Store.get(`setting_${key}`, SETTING_DEFAULTS[key]);
window.setSetting = (key, val) => Store.set(`setting_${key}`, val);

/* ── Format Helpers ──────────────────────────────────────── */
window.fmtTime = function(ts) {
  return new Date(ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

window.fmtDuration = function(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

/* ── Topbar Clock ────────────────────────────────────────── */
const clockEl = document.getElementById('topbarClock');
if (clockEl) {
  const tick = () => {
    clockEl.textContent = new Date().toLocaleTimeString('en-KE', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  tick();
  setInterval(tick, 1000);
}
