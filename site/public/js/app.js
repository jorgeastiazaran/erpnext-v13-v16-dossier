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

      if (data.code === 'feedback') {
        // Render Interactive Feedback Form
        renderInteractiveFeedbackForm();
      } else {
        // Process HTML: inject UAT controls
        const processedHtml = processUATControls(data.html, data.code);
        $docContent.innerHTML = processedHtml;
      }

      // Scroll to top
      $mainContent.scrollTo(0, 0);
    } catch (err) {
      $docContent.innerHTML = `<p style="color:var(--status-fail);">Error cargando documento: ${err.message}</p>`;
    }
  }

  // ── Interactive Feedback Form ───────────────────────

  function renderInteractiveFeedbackForm() {
    const validModules = docs.filter(d => d.code !== 'resumen' && d.code !== 'feedback');

    let optionsHtml = validModules.map(m => `
      <option value="${m.code}">${m.icon} ${m.title}</option>
    `).join('');

    const formHtml = `
      <div class="feedback-form-container">
        <div class="feedback-intro-card">
          <h3>📝 Plantilla Interactiva de Registro de Feedback</h3>
          <p>Utiliza este formulario para emitir tu dictamen final y registrar observaciones generales sobre la operación del módulo en <strong>ERPNext v16</strong>.</p>
        </div>

        <form id="interactive-feedback-form" onsubmit="event.preventDefault(); window.__submitModuleFeedback();">
          
          <!-- Sección 1: Datos Generales -->
          <div class="form-section-card">
            <h4 class="form-section-header">1. Datos Generales</h4>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Nombre del Evaluador</label>
                <input type="text" value="${evaluatorName}" disabled class="form-input readonly-input">
              </div>
              <div class="form-group">
                <label for="fb-dept">Departamento / Área <span class="req">*</span></label>
                <input type="text" id="fb-dept" placeholder="Ej: Contabilidad, Almacén, Ventas..." required class="form-input">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="fb-module-select">Módulo a Evaluar <span class="req">*</span></label>
                <select id="fb-module-select" onchange="window.__onFeedbackModuleChange()" class="form-select">
                  ${optionsHtml}
                </select>
              </div>
              <div class="form-group">
                <label for="fb-env">Entorno de Pruebas</label>
                <select id="fb-env" class="form-select">
                  <option value="Staging (tecno16.posix.mx)" selected>Staging (tecno16.posix.mx)</option>
                  <option value="Producción">Producción</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sección 2: Resumen de Pruebas del Módulo -->
          <div class="form-section-card" id="fb-summary-box">
            <!-- Dynamic stats filled by JS -->
          </div>

          <!-- Sección 3: Observaciones Generales -->
          <div class="form-section-card">
            <h4 class="form-section-header">2. Observaciones Generales del Módulo</h4>
            
            <div class="form-group">
              <label for="fb-works-well">👍 ¿Qué funciona bien en v16?</label>
              <textarea id="fb-works-well" rows="3" placeholder="Describa las funcionalidades que operan correctamente y las mejoras respecto a v13..." class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label for="fb-not-working">⚠️ ¿Qué no funciona o funciona diferente a lo esperado?</label>
              <textarea id="fb-not-working" rows="3" placeholder="Describa comportamientos inesperados o hallazgos a revisar..." class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label for="fb-training">🎓 ¿Qué capacitación adicional requiere su equipo?</label>
              <textarea id="fb-training" rows="3" placeholder="Describa las áreas donde su equipo necesita capacitación..." class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label for="fb-suggestions">💡 Sugerencias y Recomendaciones</label>
              <textarea id="fb-suggestions" rows="3" placeholder="Sugerencias para mejorar la configuración o proceso de migración..." class="form-textarea"></textarea>
            </div>
          </div>

          <!-- Sección 4: Dictamen Final -->
          <div class="form-section-card highlight-card">
            <h4 class="form-section-header">3. Dictamen / Resultado Final del Módulo</h4>
            <div class="form-group">
              <label for="fb-final-result">Dictamen de Validación <span class="req">*</span></label>
              <select id="fb-final-result" class="form-select final-result-select" required>
                <option value="">— Seleccione Dictamen —</option>
                <option value="APPROVED">🟢 APROBADO — El módulo opera correctamente y está listo para producción</option>
                <option value="APPROVED_WITH_NOTES">🟡 APROBADO CON OBSERVACIONES — El módulo opera, pero hay detalles menores por resolver</option>
                <option value="NOT_APPROVED">🔴 NO APROBADO — El módulo tiene fallas críticas que deben resolverse antes de ir a producción</option>
              </select>
            </div>
          </div>

          <!-- Enviar / Guardar -->
          <div class="form-actions-bar">
            <button type="submit" class="btn btn-primary btn-submit-feedback" id="btn-submit-fb">
              <span class="btn-icon">🚀</span> Guardar y Registrar Feedback del Módulo
            </button>
            <span class="save-status-msg" id="fb-save-msg" style="display:none;"></span>
          </div>
        </form>
      </div>
    `;

    $docContent.innerHTML = formHtml;
    window.__onFeedbackModuleChange();
  }

  window.__onFeedbackModuleChange = function () {
    const select = document.getElementById('fb-module-select');
    if (!select) return;
    const moduleCode = select.value;
    const s = summaryData[moduleCode] || { total: 0, pass: 0, fail: 0, not_executed: 0, pending: 0 };

    // Update stats summary box
    const summaryBox = document.getElementById('fb-summary-box');
    if (summaryBox) {
      summaryBox.innerHTML = `
        <h4 class="form-section-header">Resumen de Avance UAT — Módulo ${select.options[select.selectedIndex].text}</h4>
        <div class="summary-pills">
          <div class="pill pass"><span class="pill-val">${s.pass}</span> Pruebas Pasadas</div>
          <div class="pill fail"><span class="pill-val">${s.fail}</span> Pruebas Falladas</div>
          <div class="pill not-exec"><span class="pill-val">${s.not_executed}</span> No Ejecutadas</div>
          <div class="pill pending"><span class="pill-val">${s.pending}</span> Pendientes</div>
          <div class="pill total"><span class="pill-val">${s.total}</span> Total Pruebas</div>
        </div>
      `;
    }

    // Load existing saved general feedback for this module & evaluator
    const key = `${evaluatorName}::MODULE_GENERAL_${moduleCode}`;
    const fb = feedbackData[key];

    const deptEl = document.getElementById('fb-dept');
    const envEl = document.getElementById('fb-env');
    const worksWellEl = document.getElementById('fb-works-well');
    const notWorkingEl = document.getElementById('fb-not-working');
    const trainingEl = document.getElementById('fb-training');
    const suggestionsEl = document.getElementById('fb-suggestions');
    const finalResultEl = document.getElementById('fb-final-result');

    if (fb && fb.comment) {
      try {
        const payload = JSON.parse(fb.comment);
        if (deptEl && payload.dept) deptEl.value = payload.dept;
        if (envEl && payload.env) envEl.value = payload.env;
        if (worksWellEl) worksWellEl.value = payload.works_well || '';
        if (notWorkingEl) notWorkingEl.value = payload.not_working || '';
        if (trainingEl) trainingEl.value = payload.training || '';
        if (suggestionsEl) suggestionsEl.value = payload.suggestions || '';
        if (finalResultEl) finalResultEl.value = payload.final_result || fb.status || '';
      } catch {
        if (finalResultEl) finalResultEl.value = fb.status || '';
      }
    } else {
      // Clear textareas for new entry
      if (worksWellEl) worksWellEl.value = '';
      if (notWorkingEl) notWorkingEl.value = '';
      if (trainingEl) trainingEl.value = '';
      if (suggestionsEl) suggestionsEl.value = '';
      if (finalResultEl) finalResultEl.value = '';
    }
  };

  window.__submitModuleFeedback = async function () {
    const select = document.getElementById('fb-module-select');
    const deptEl = document.getElementById('fb-dept');
    const envEl = document.getElementById('fb-env');
    const worksWellEl = document.getElementById('fb-works-well');
    const notWorkingEl = document.getElementById('fb-not-working');
    const trainingEl = document.getElementById('fb-training');
    const suggestionsEl = document.getElementById('fb-suggestions');
    const finalResultEl = document.getElementById('fb-final-result');

    if (!select || !deptEl || !finalResultEl) return;

    const moduleCode = select.value;
    const dept = deptEl.value.trim();
    const env = envEl.value;
    const finalResult = finalResultEl.value;

    if (!dept) {
      alert('Por favor especifica tu Departamento / Área.');
      deptEl.focus();
      return;
    }

    if (!finalResult) {
      alert('Por favor selecciona el Dictamen / Resultado Final del Módulo.');
      finalResultEl.focus();
      return;
    }

    const payload = {
      dept,
      env,
      works_well: worksWellEl ? worksWellEl.value.trim() : '',
      not_working: notWorkingEl ? notWorkingEl.value.trim() : '',
      training: trainingEl ? trainingEl.value.trim() : '',
      suggestions: suggestionsEl ? suggestionsEl.value.trim() : '',
      final_result: finalResult,
    };

    const testId = `MODULE_GENERAL_${moduleCode}`;
    const result = await saveFeedback(testId, finalResult, '', JSON.stringify(payload), moduleCode);

    if (result && result.success) {
      const msgEl = document.getElementById('fb-save-msg');
      if (msgEl) {
        msgEl.style.display = 'inline-block';
        msgEl.innerHTML = '✓ ¡Feedback registrado correctamente!';
        setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
      }
      showToast(`Dictamen guardado para ${select.options[select.selectedIndex].text}`);
    }
  };

  // ── UAT Controls Processing ──────────────────────────

  function processUATControls(html, moduleCode) {
    const container = document.createElement('div');
    container.innerHTML = html;

    const headings = container.querySelectorAll('h3');
    const uatHeadings = [];

    headings.forEach(h3 => {
      const text = h3.textContent.trim();
      const match = text.match(/^(UAT-[A-Z]+-\d+)/);
      if (match) {
        uatHeadings.push({ element: h3, testId: match[1], title: text });
      }
    });

    uatHeadings.forEach(({ element, testId, title }) => {
      const siblings = [];
      let next = element.nextElementSibling;
      while (next && !['H2', 'H3'].includes(next.tagName)) {
        if (next.tagName === 'HR') {
          const afterHr = next.nextElementSibling;
          if (!afterHr || ['H2', 'H3'].includes(afterHr?.tagName)) {
            break;
          }
        }
        siblings.push(next);
        next = next.nextElementSibling;
      }

      const filtered = siblings.filter(el => {
        if (el.tagName === 'P') {
          const text = el.textContent;
          if (text.includes('PASA') && text.includes('FALLA')) {
            el.remove();
            return false;
          }
        }
        return true;
      });

      const key = `${evaluatorName}::${testId}`;
      const fb = feedbackData[key] || {};
      const status = fb.status || 'pending';
      const severity = fb.severity || '';
      const comment = fb.comment || '';

      const card = document.createElement('div');
      card.className = `uat-card ${status !== 'pending' ? 'status-' + status : ''}`;
      card.id = `uat-${testId}`;

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

      const cleanTitle = title.replace(/^UAT-[A-Z]+-\d+:\s*/, '');
      if (cleanTitle) {
        cardInner += `<h4 style="margin: 0 0 0.5rem; font-size: 0.92rem;">${cleanTitle}</h4>`;
      }

      const contentWrapper = document.createElement('div');
      filtered.forEach(el => {
        if (el.tagName !== 'HR') {
          contentWrapper.appendChild(el.cloneNode(true));
        }
      });
      cardInner += contentWrapper.innerHTML;

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
      element.replaceWith(card);
      filtered.forEach(el => el.remove());
    });

    return container.innerHTML;
  }

  // ── UAT Interaction Handlers ─────────────────────────

  window.__setUATStatus = async function (testId, status, moduleCode) {
    const card = document.getElementById(`uat-${testId}`);
    if (!card) return;

    const severityEl = document.getElementById(`severity-${testId}`);
    const commentEl = document.getElementById(`comment-${testId}`);
    const severity = severityEl ? severityEl.value : '';
    const comment = commentEl ? commentEl.value : '';

    const result = await saveFeedback(testId, status, severity, comment, moduleCode);

    if (result && result.success) {
      card.className = `uat-card status-${status}`;

      card.querySelectorAll('.uat-btn').forEach(btn => {
        btn.classList.remove('active-pass', 'active-fail', 'active-not-exec');
      });

      const buttons = card.querySelectorAll('.uat-btn');
      if (status === 'pass') buttons[0].classList.add('active-pass');
      if (status === 'fail') buttons[1].classList.add('active-fail');
      if (status === 'not_executed') buttons[2].classList.add('active-not-exec');

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

    const key = `${evaluatorName}::${testId}`;
    const existingStatus = feedbackData[key]?.status || 'pending';

    const result = await saveFeedback(testId, existingStatus, severity, comment, moduleCode);

    if (result && result.success) {
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
