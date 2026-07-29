const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Docs directory — try sibling ../docs first, then local ./docs
const DOCS_DIR = fs.existsSync(path.join(__dirname, '..', 'docs'))
  ? path.join(__dirname, '..', 'docs')
  : path.join(__dirname, 'docs');

const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(FEEDBACK_FILE))) {
  fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true });
}

// Ensure feedback file exists
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify({ evaluators: {}, feedback: {} }, null, 2));
}

// ── Helpers ──────────────────────────────────────────────

function readFeedback() {
  try {
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
  } catch {
    return { evaluators: {}, feedback: {} };
  }
}

function writeFeedback(data) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

// Map of filenames to human-readable titles and short codes
const DOC_META = {
  '00_resumen_ejecutivo.md': { title: 'Resumen Ejecutivo', code: 'resumen', icon: '📋', order: 0 },
  '01_contabilidad.md':     { title: 'Contabilidad',      code: 'contabilidad', icon: '💰', order: 1 },
  '02_inventario.md':       { title: 'Inventario / Stock', code: 'inventario', icon: '📦', order: 2 },
  '03_ventas.md':           { title: 'Ventas',             code: 'ventas', icon: '🛒', order: 3 },
  '04_compras.md':          { title: 'Compras',            code: 'compras', icon: '🏷️', order: 4 },
  '05_manufactura.md':      { title: 'Manufactura',        code: 'manufactura', icon: '🏭', order: 5 },
  '06_recursos_humanos.md': { title: 'Recursos Humanos',   code: 'rrhh', icon: '👥', order: 6 },
  '07_calidad.md':          { title: 'Calidad',            code: 'calidad', icon: '✅', order: 7 },
  '08_mantenimiento.md':    { title: 'Mantenimiento',      code: 'mantenimiento', icon: '🔧', order: 8 },
  '09_framework_frappe.md': { title: 'Framework Frappe',   code: 'framework', icon: '⚙️', order: 9 },
  'plantilla_feedback.md':  { title: 'Plantilla Feedback', code: 'feedback', icon: '📝', order: 10 },
};

// Configure marked for GFM tables etc.
marked.setOptions({
  gfm: true,
  breaks: true,
});

// ── API Routes ───────────────────────────────────────────

// GET /api/docs — list available docs
app.get('/api/docs', (req, res) => {
  try {
    const files = fs.readdirSync(DOCS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort();

    const docs = files.map(f => {
      const meta = DOC_META[f] || { title: f.replace('.md', ''), code: f.replace('.md', ''), icon: '📄', order: 99 };
      return {
        filename: f,
        ...meta,
      };
    });

    docs.sort((a, b) => a.order - b.order);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Error listing docs', details: err.message });
  }
});

// GET /api/docs/:filename — return rendered HTML for a doc
app.get('/api/docs/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const markdown = fs.readFileSync(filepath, 'utf8');
    const html = marked(markdown);
    const meta = DOC_META[filename] || { title: filename.replace('.md', ''), code: filename.replace('.md', ''), icon: '📄' };

    res.json({
      filename,
      title: meta.title,
      code: meta.code,
      markdown,
      html,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error reading doc', details: err.message });
  }
});

// GET /api/feedback — return all feedback data
app.get('/api/feedback', (req, res) => {
  const data = readFeedback();
  res.json(data);
});

// POST /api/feedback — save/update feedback for a test
// Body: { evaluator, testId, status, severity, comment, module }
app.post('/api/feedback', (req, res) => {
  try {
    const { evaluator, testId, status, severity, comment, module } = req.body;

    if (!evaluator || !testId) {
      return res.status(400).json({ error: 'evaluator and testId are required' });
    }

    const data = readFeedback();

    // Register evaluator if new
    if (!data.evaluators[evaluator]) {
      data.evaluators[evaluator] = {
        name: evaluator,
        registeredAt: new Date().toISOString(),
      };
    }

    // Create feedback key
    const key = `${evaluator}::${testId}`;
    data.feedback[key] = {
      evaluator,
      testId,
      module: module || '',
      status: status || 'pending',    // 'pass', 'fail', 'not_executed', 'pending'
      severity: severity || '',        // 'critical', 'major', 'minor', 'cosmetic'
      comment: comment || '',
      updatedAt: new Date().toISOString(),
    };

    writeFeedback(data);
    res.json({ success: true, feedback: data.feedback[key] });
  } catch (err) {
    res.status(500).json({ error: 'Error saving feedback', details: err.message });
  }
});

// GET /api/summary — return progress summary by module
app.get('/api/summary', (req, res) => {
  try {
    const data = readFeedback();
    const evaluator = req.query.evaluator || null;

    // Count tests per module from the docs
    const testCounts = {};
    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));

    for (const f of files) {
      const content = fs.readFileSync(path.join(DOCS_DIR, f), 'utf8');
      const meta = DOC_META[f] || { code: f.replace('.md', ''), title: f };
      const testMatches = content.match(/###\s+UAT-[A-Z]+-\d+/g) || [];
      if (testMatches.length > 0) {
        testCounts[meta.code] = {
          title: meta.title,
          icon: meta.icon || '📄',
          total: testMatches.length,
          testIds: testMatches.map(m => m.replace(/^###\s+/, '').split(':')[0].trim()),
          pass: 0,
          fail: 0,
          not_executed: 0,
          pending: 0,
        };
      }
    }

    // Count feedback status per module
    for (const [key, fb] of Object.entries(data.feedback)) {
      if (evaluator && fb.evaluator !== evaluator) continue;

      // Find which module this test belongs to
      for (const [moduleCode, moduleData] of Object.entries(testCounts)) {
        if (moduleData.testIds.some(tid => fb.testId.startsWith(tid))) {
          if (fb.status === 'pass') moduleData.pass++;
          else if (fb.status === 'fail') moduleData.fail++;
          else if (fb.status === 'not_executed') moduleData.not_executed++;
          break;
        }
      }
    }

    // Calculate pending
    for (const moduleData of Object.values(testCounts)) {
      moduleData.pending = moduleData.total - moduleData.pass - moduleData.fail - moduleData.not_executed;
    }

    res.json(testCounts);
  } catch (err) {
    res.status(500).json({ error: 'Error generating summary', details: err.message });
  }
});

// GET /api/feedback/export — export all feedback as CSV
app.get('/api/feedback/export', (req, res) => {
  const data = readFeedback();
  const rows = [['Evaluador', 'ID Prueba', 'Módulo', 'Estado', 'Severidad', 'Comentario', 'Fecha'].join(',')];

  for (const fb of Object.values(data.feedback)) {
    rows.push([
      `"${fb.evaluator}"`,
      `"${fb.testId}"`,
      `"${fb.module}"`,
      `"${fb.status}"`,
      `"${fb.severity}"`,
      `"${(fb.comment || '').replace(/"/g, '""')}"`,
      `"${fb.updatedAt}"`,
    ].join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=feedback_erpnext_migration.csv');
  res.send('\uFEFF' + rows.join('\n'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Dossier ERPNext Migration running at http://localhost:${PORT}`);
  console.log(`📁 Serving docs from: ${DOCS_DIR}`);
});
