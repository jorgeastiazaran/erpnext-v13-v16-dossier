/* ═══════════════════════════════════════════════════════
   Dossier ERPNext v13 → v16 — Frontend App
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────
  let evaluatorName = localStorage.getItem('dossier_evaluator') || '';
  let docs = [];
  let currentDoc = null;
  let feedbackData = {};
  let summaryData = {};

  // ── DOM Refs ─────────────────────────────────────────
  const $modal = document.getElementById('evaluator-modal');
  const $evalInput = document.getElementById('evaluator-name');
  const $evalSubmit = document.getElementById('evaluator-submit');
  const $app = document.getElementById('app');
  const $sidebarNav = document.getElementById('sidebar-nav');
  const $sidebar = document.getElementById('sidebar');
  const $sidebarOverlay = document.getElementById('sidebar-overlay');
  const $sidebarToggle = document.getElementById('sidebar-toggle');
  const $mainContent = document.getElementById('main-content');
  const $dashboardView = document.getElementById('dashboard-view');
  const $docView = document.getElementById('doc-view');
  const $docHeader = document.getElementById('doc-header');
  const $docContent = document.getElementById('doc-content');
  const $dashboardGrid = document.getElementById('dashboard-grid');
  const $evalAvatar = document.getElementById('evaluator-avatar');
  const $evalNameDisplay = document.getElementById('evaluator-name-display');
  const $mobileEvalBadge = document.getElementById('mobile-evaluator-badge');
  const $changeEvaluator = document.getElementById('change-evaluator');
  const $btnExport = document.getElementById('btn-export');

  // ── Init ─────────────────────────────────────────────

  function init() {
    if (evaluatorName) {
      showApp();
    } else {
      showModal();
    }

    // Event listeners
    $evalInput.addEventListener('input', () => {
      $evalSubmit.disabled = $evalInput.value.trim().length < 2;
    });

    $evalSubmit.addEventListener('click', handleEvaluatorSubmit);
    $evalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !$evalSubmit.disabled) handleEvaluatorSubmit();
    });

    $sidebarToggle.addEventListener('click', toggleSidebar);
    $sidebarOverlay.addEventListener('click', closeSidebar);

    $changeEvaluator.addEventListener('click', () => {
      localStorage.removeItem('dossier_evaluator');
      evaluatorName = '';
      $app.style.display = 'none';
      $evalInput.value = '';
      $evalSubmit.disabled = true;
      showModal();
    });

    $btnExport.addEventListener('click', () => {
      window.open('/api/feedback/export', '_blank');
    });
  }

  // ── Modal ────────────────────────────────────────────

  function showModal() {
    $modal.classList.remove('hidden');
    $modal.style.display = 'flex';
    setTimeout(() => $evalInput.focus(), 300);
  }

  function handleEvaluatorSubmit() {
    evaluatorName = $evalInput.value.trim();
    if (evaluatorName.length < 2) return;
    localStorage.setItem('dossier_evaluator', evaluatorName);
    $modal.classList.add('hidden');
    $modal.style.display = 'none';
    showApp();
  }

  // ── App ──────────────────────────────────────────────

  async function showApp() {
    $app.style.display = 'flex';
    updateEvaluatorUI();
    await loadDocs();
    await loadFeedback();
    await loadSummary();
    buildSidebar();
    showDashboard();
  }

  function updateEvaluatorUI() {
    const initials = evaluatorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    $evalAvatar.textContent = initials;
    $evalNameDisplay.textContent = evaluatorName;
    $mobileEvalBadge.textContent = initials;
  }

  // ── API Calls ────────────────────────────────────────

  async function loadDocs() {
    try {
      const res = await fetch('/api/docs');
      docs = await res.json();
    } catch (err) {
      console.error('Error loading docs:', err);
      docs = [];
    }
  }

  async function loadFeedback() {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      feedbackData = data.feedback || {};
    } catch (err) {
      console.error('Error loading feedback:', err);
    }
  }

  async function loadSummary() {
    try {
      const res = await fetch(`/api/summary?evaluator=${encodeURIComponent(evaluatorName)}`);
      summaryData = await res.json();
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  async function saveFeedback(testId, status, severity, comment, module) {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator: evaluatorName,
          testId,
          status,
          severity,
          comment,
          module,
        }),
      });
      const data = await res.json();
      if (data.success) {
        feedbackData[`${evaluatorName}::${testId}`] = data.feedback;
        await loadSummary();
        updateSidebarBadges();
      }
      return data;
    } catch (err) {
      console.error('Error saving feedback:', err);
      return null;
    }
  }

  // ── Sidebar ──────────────────────────────────────────

  function buildSidebar() {
    let html = '';

    // Dashboard link
    html += `
      <div class="nav-item active" data-view="dashboard" onclick="window.__navigateTo('dashboard')">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Dashboard</span>
      </div>
    `;

    html += '<div class="nav-separator"></div>';
    html += '<div class="nav-section-label">Módulos</div>';

    for (const doc of docs) {
      const badge = getSidebarBadge(doc.code);
      html += `
        <div class="nav-item" data-view="doc" data-doc="${doc.filename}" onclick="window.__navigateTo('doc', '${doc.filename}')">
          <span class="nav-icon">${doc.icon}</span>
          <span class="nav-label">${doc.title}</span>
          ${badge}
        </div>
      `;
    }

    $sidebarNav.innerHTML = html;
  }

  function getSidebarBadge(moduleCode) {
    const s = summaryData[moduleCode];
    if (!s || s.total === 0) return '';

    if (s.fail > 0) {
      return `<span class="nav-badge fail">${s.fail}✗</span>`;
    }
    if (s.pass === s.total) {
      return `<span class="nav-badge pass">✓</span>`;
    }
    if (s.pass > 0 || s.not_executed > 0) {
      return `<span class="nav-badge partial">${s.pass}/${s.total}</span>`;
    }
    return '';
  }

  function updateSidebarBadges() {
    const navItems = $sidebarNav.querySelectorAll('.nav-item[data-doc]');
    navItems.forEach(item => {
      const filename = item.dataset.doc;
      const doc = docs.find(d => d.filename === filename);
      if (!doc) return;
      const existingBadge = item.querySelector('.nav-badge');
      if (existingBadge) existingBadge.remove();
      const badgeHtml = getSidebarBadge(doc.code);
      if (badgeHtml) {
        item.insertAdjacentHTML('beforeend', badgeHtml);
      }
    });
  }

  function setActiveNav(view, filename) {
    $sidebarNav.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (view === 'dashboard' && item.dataset.view === 'dashboard') {
        item.classList.add('active');
      } else if (view === 'doc' && item.dataset.doc === filename) {
        item.classList.add('active');
      }
    });
  }

  function toggleSidebar() {
    $sidebar.classList.toggle('open');
    $sidebarOverlay.classList.toggle('open');
  }

  function closeSidebar() {
    $sidebar.classList.remove('open');
    $sidebarOverlay.classList.remove('open');
  }

  // ── Navigation ───────────────────────────────────────

  window.__navigateTo = function (view, filename) {
    closeSidebar();

    if (view === 'dashboard') {
      showDashboard();
      setActiveNav('dashboard');
    } else if (view === 'doc') {
      showDocument(filename);
      setActiveNav('doc', filename);
    }
  };

  // ── Dashboard ────────────────────────────────────────

  function showDashboard() {
    $dashboardView.style.display = 'block';
    $docView.style.display = 'none';
    setActiveNav('dashboard');
    renderDashboard();
  }

  function renderDashboard() {
    const moduleEntries = Object.entries(summaryData);

    if (moduleEntries.length === 0) {
      $dashboardGrid.innerHTML = `
        <div class="dashboard-empty" style="grid-column: 1/-1;">
          <div class="dashboard-empty-icon">📊</div>
          <p>Cargando datos de progreso...</p>
        </div>
      `;

      // Show cards for all docs that have tests
      const cardsHtml = docs
        .filter(d => d.code !== 'resumen' && d.code !== 'feedback')
        .map(d => `
          <div class="dashboard-card" onclick="window.__navigateTo('doc', '${d.filename}')">
            <div class="card-header">
              <span class="card-icon">${d.icon}</span>
              <span class="card-title">${d.title}</span>
            </div>
            <div class="card-progress">
              <div class="progress-bar">
                <div class="progress-segment pending" style="width: 100%"></div>
              </div>
            </div>
            <div class="card-stats">
              <span class="stat"><span class="stat-dot pending"></span> Sin iniciar</span>
            </div>
          </div>
        `).join('');
      
      if (cardsHtml) $dashboardGrid.innerHTML = cardsHtml;
      return;
    }

    let html = '';
    for (const [code, s] of moduleEntries) {
      const doc = docs.find(d => d.code === code);
      if (!doc) continue;

      const passP = s.total > 0 ? (s.pass / s.total * 100) : 0;
      const failP = s.total > 0 ? (s.fail / s.total * 100) : 0;
      const notExecP = s.total > 0 ? (s.not_executed / s.total * 100) : 0;

      html += `
        <div class="dashboard-card" onclick="window.__navigateTo('doc', '${doc.filename}')">
          <div class="card-header">
            <span class="card-icon">${s.icon}</span>
            <span class="card-title">${s.title}</span>
          </div>
          <div class="card-progress">
            <div class="progress-bar">
              <div class="progress-segment pass" style="width: ${passP}%"></div>
              <div class="progress-segment fail" style="width: ${failP}%"></div>
              <div class="progress-segment not-exec" style="width: ${notExecP}%"></div>
            </div>
          </div>
          <div class="card-stats">
            <span class="stat"><span class="stat-dot pass"></span> ${s.pass} pasa</span>
            <span class="stat"><span class="stat-dot fail"></span> ${s.fail} falla</span>
            <span class="stat"><span class="stat-dot not-exec"></span> ${s.not_executed} N/E</span>
            <span class="stat"><span class="stat-dot pending"></span> ${s.pending} pendiente</span>
          </div>
        </div>
      `;
    }

    $dashboardGrid.innerHTML = html;
  }

  // ── Document View ────────────────────────────────────

  async function showDocument(filename) {
    $dashboardView.style.display = 'none';
    $docView.style.display = 'block';

    // Show loading
    $docContent.innerHTML = '<p style="color:var(--text-muted);">Cargando documento...</p>';

    try {
      const res = await fetch(`/api/docs/${encodeURIComponent(filename)}`);
      const data = await res.json();
      currentDoc = data;

      // Header
      $docHeader.innerHTML = `
        <div class="doc-breadcrumb">
          <a href="#" onclick="window.__navigateTo('dashboard'); return false;">Dashboard</a> / ${data.title}
        </div>
        <h1>${data.title}</h1>
      `;

      // Process HTML: inject UAT controls
      const processedHtml = processUATControls(data.html, data.code);
      $docContent.innerHTML = processedHtml;

      // Scroll to top
      $mainContent.scrollTo(0, 0);
    } catch (err) {
      $docContent.innerHTML = `<p style="color:var(--status-fail);">Error cargando documento: ${err.message}</p>`;
    }
  }

  // ── UAT Controls Processing ──────────────────────────

  function processUATControls(html, moduleCode) {
    // Find UAT test sections: ### UAT-XXX-NN: Title
    // We need to wrap each UAT section with interactive controls
    const container = document.createElement('div');
    container.innerHTML = html;

    // Find all h3 elements that match UAT pattern
    const headings = container.querySelectorAll('h3');
    const uatHeadings = [];

    headings.forEach(h3 => {
      const text = h3.textContent.trim();
      const match = text.match(/^(UAT-[A-Z]+-\d+)/);
      if (match) {
        uatHeadings.push({ element: h3, testId: match[1], title: text });
      }
    });

    // Process each UAT section
    uatHeadings.forEach(({ element, testId, title }) => {
      // Collect all siblings until next h3 or h2 or hr
      const siblings = [];
      let next = element.nextElementSibling;
      while (next && !['H2', 'H3'].includes(next.tagName)) {
        // Stop at HR that is NOT between table and result line
        if (next.tagName === 'HR') {
          // Check if the next element after HR is also a section heading
          const afterHr = next.nextElementSibling;
          if (!afterHr || ['H2', 'H3'].includes(afterHr?.tagName)) {
            break;
          }
        }
        siblings.push(next);
        next = next.nextElementSibling;
      }

      // Remove "Resultado: ☐ PASA / ☐ FALLA" paragraph from siblings
      const filtered = siblings.filter(el => {
        if (el.tagName === 'P') {
          const text = el.textContent;
          if (text.includes('PASA') && text.includes('FALLA')) {
            el.remove();
            return false;
          }
        }
        // Also remove trailing HR
        if (el.tagName === 'HR' && !el.nextElementSibling?.textContent?.includes('UAT-')) {
          // Keep HRs that are between UAT sections, remove trailing ones
        }
        return true;
      });

      // Get existing feedback for this test
      const key = `${evaluatorName}::${testId}`;
      const fb = feedbackData[key] || {};
      const status = fb.status || 'pending';
      const severity = fb.severity || '';
      const comment = fb.comment || '';

      // Create UAT card
      const card = document.createElement('div');
      card.className = `uat-card ${status !== 'pending' ? 'status-' + status : ''}`;
      card.id = `uat-${testId}`;

      // Build inner HTML
      let cardInner = `
        <div class="uat-header">
          <span class="uat-id">${testId}</span>
          <div class="uat-buttons">
            <button class="uat-btn ${status === 'pass' ? 'active-pass' : ''}"
                    onclick="window.__setUATStatus('${testId}', 'pass', '${moduleCode}')"
                    title="Marcar como PASA">
              ✓ Pasa
            </button>
            <button class="uat-btn ${status === 'fail' ? 'active-fail' : ''}"
                    onclick="window.__setUATStatus('${testId}', 'fail', '${moduleCode}')"
                    title="Marcar como FALLA">
              ✗ Falla
            </button>
            <button class="uat-btn ${status === 'not_executed' ? 'active-not-exec' : ''}"
                    onclick="window.__setUATStatus('${testId}', 'not_executed', '${moduleCode}')"
                    title="Marcar como No Ejecutada">
              — N/E
            </button>
          </div>
        </div>
      `;

      // Re-insert the heading content (minus the UAT-ID which is now a badge)
      const cleanTitle = title.replace(/^UAT-[A-Z]+-\d+:\s*/, '');
      if (cleanTitle) {
        cardInner += `<h4 style="margin: 0 0 0.5rem; font-size: 0.92rem;">${cleanTitle}</h4>`;
      }

      // Insert collected content
      const contentWrapper = document.createElement('div');
      filtered.forEach(el => {
        if (el.tagName !== 'HR') {
          contentWrapper.appendChild(el.cloneNode(true));
        }
      });
      cardInner += contentWrapper.innerHTML;

      // Comment section
      cardInner += `
        <div class="uat-details">
          <button class="uat-details-toggle ${comment || severity ? 'open' : ''}"
                  onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open');">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Comentarios y detalles
          </button>
          <div class="uat-details-body ${comment || severity ? 'open' : ''}">
            <div class="uat-field">
              <label>Severidad (si falla)</label>
              <select id="severity-${testId}" onchange="window.__markUATDirty('${testId}')">
                <option value="">— Seleccionar —</option>
                <option value="critical" ${severity === 'critical' ? 'selected' : ''}>🔴 Crítico</option>
                <option value="major" ${severity === 'major' ? 'selected' : ''}>🟠 Mayor</option>
                <option value="minor" ${severity === 'minor' ? 'selected' : ''}>🟡 Menor</option>
                <option value="cosmetic" ${severity === 'cosmetic' ? 'selected' : ''}>🟢 Cosmético</option>
              </select>
            </div>
            <div class="uat-field">
              <label>Comentario / Descripción del error</label>
              <textarea id="comment-${testId}"
                        placeholder="Describe el error, pasos para reproducir, observaciones..."
                        oninput="window.__markUATDirty('${testId}')">${comment}</textarea>
            </div>
            <div class="uat-save-row">
              <span class="uat-saved-indicator" id="saved-${testId}">✓ Guardado</span>
              <button class="uat-save-btn" id="save-btn-${testId}"
                      onclick="window.__saveUATDetails('${testId}', '${moduleCode}')">
                Guardar comentario
              </button>
            </div>
          </div>
        </div>
      `;

      card.innerHTML = cardInner;

      // Replace original elements with the card
      element.replaceWith(card);
      filtered.forEach(el => el.remove());
    });

    return container.innerHTML;
  }

  // ── UAT Interaction Handlers ─────────────────────────

  window.__setUATStatus = async function (testId, status, moduleCode) {
    const card = document.getElementById(`uat-${testId}`);
    if (!card) return;

    // Get existing comment/severity
    const severityEl = document.getElementById(`severity-${testId}`);
    const commentEl = document.getElementById(`comment-${testId}`);
    const severity = severityEl ? severityEl.value : '';
    const comment = commentEl ? commentEl.value : '';

    // Save to API
    const result = await saveFeedback(testId, status, severity, comment, moduleCode);

    if (result && result.success) {
      // Update card visuals
      card.className = `uat-card status-${status}`;

      // Update buttons
      card.querySelectorAll('.uat-btn').forEach(btn => {
        btn.classList.remove('active-pass', 'active-fail', 'active-not-exec');
      });

      const buttons = card.querySelectorAll('.uat-btn');
      if (status === 'pass') buttons[0].classList.add('active-pass');
      if (status === 'fail') buttons[1].classList.add('active-fail');
      if (status === 'not_executed') buttons[2].classList.add('active-not-exec');

      // If fail, auto-open the details section
      if (status === 'fail') {
        const toggle = card.querySelector('.uat-details-toggle');
        const body = card.querySelector('.uat-details-body');
        if (toggle && body) {
          toggle.classList.add('open');
          body.classList.add('open');
        }
      }

      showToast(`${testId}: ${status === 'pass' ? '✓ Pasa' : status === 'fail' ? '✗ Falla' : '— No Ejecutada'}`);
    }
  };

  window.__saveUATDetails = async function (testId, moduleCode) {
    const severityEl = document.getElementById(`severity-${testId}`);
    const commentEl = document.getElementById(`comment-${testId}`);
    const severity = severityEl ? severityEl.value : '';
    const comment = commentEl ? commentEl.value : '';

    // Get current status
    const key = `${evaluatorName}::${testId}`;
    const existingStatus = feedbackData[key]?.status || 'pending';

    const result = await saveFeedback(testId, existingStatus, severity, comment, moduleCode);

    if (result && result.success) {
      // Show saved indicator
      const indicator = document.getElementById(`saved-${testId}`);
      if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2500);
      }
      showToast('Comentario guardado');
    }
  };

  window.__markUATDirty = function (testId) {
    const indicator = document.getElementById(`saved-${testId}`);
    if (indicator) indicator.classList.remove('show');
  };

  // ── Toast ────────────────────────────────────────────

  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  // ── Start ────────────────────────────────────────────
  init();
})();
