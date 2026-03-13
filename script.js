const ICONS = {
  database: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4" rx="5.5" ry="2" stroke="#F5F2ED" stroke-width="1.2" fill="none" opacity="0.7"/><path d="M2.5 4V8C2.5 9.1 4.96 10 8 10C11.04 10 13.5 9.1 13.5 8V4" stroke="#F5F2ED" stroke-width="1.2" fill="none" opacity="0.7"/><path d="M2.5 8V12C2.5 13.1 4.96 14 8 14C11.04 14 13.5 13.1 13.5 12V8" stroke="#F5F2ED" stroke-width="1.2" fill="none" opacity="0.7"/></svg>`,
  sources: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><path d="M6.5 6L4.5 8C3.4 9.1 3.4 10.9 4.5 12C5.6 13.1 7.4 13.1 8.5 12L9.5 11" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7"/><path d="M9.5 10L11.5 8C12.6 6.9 12.6 5.1 11.5 4C10.4 2.9 8.6 2.9 7.5 4L6.5 5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7"/></svg>`,
  ai: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.2 5.8L13 5.8L9.9 8.2L11.1 12L8 9.6L4.9 12L6.1 8.2L3 5.8L6.8 5.8Z" stroke="#F5F2ED" stroke-width="1" stroke-linejoin="round" fill="none" opacity="0.6"/></svg>`,
  methodology: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><path d="M5 4L3 8L5 12" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.6"/><path d="M11 4L13 8L11 12" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.6"/></svg>`,
  downloads: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><path d="M8 3V10.5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M5.5 8.5L8 11L10.5 8.5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.6"/><path d="M3 13H13" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/></svg>`,
  notebook: `<svg class="file-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#F5F2ED" stroke-width="1.2" fill="none" opacity="0.6"/><path d="M5.5 7.5H8.5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M5.5 9.5H10" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M10.5 11.5L13 14" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/></svg>`,
  downloadRow: `<svg class="download-icon" viewBox="0 0 16 16" fill="none"><path d="M8 3V10.5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round"/><path d="M5.5 8.5L8 11L10.5 8.5" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 13H13" stroke="#F5F2ED" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  chevron: `<svg class="file-chevron" viewBox="0 0 14 14" fill="none"><path d="M3 5L7 9L11 5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  notebookBtn: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#16191B" stroke-width="1.2" fill="none"/><path d="M5.5 7.5H8.5" stroke="#16191B" stroke-width="1.2" stroke-linecap="round"/><path d="M5.5 9.5H10" stroke="#16191B" stroke-width="1.2" stroke-linecap="round"/></svg>`
};

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderSources(sources, invId) {
  return sources.map(s => {
    const titleTag = s.url
      ? `<a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`
      : `<span class="source-title">${esc(s.title)}</span>`;
    return `<div class="source-item">
      <span class="source-claim">\u201C${esc(s.claim)}\u201D</span>
      ${titleTag}
      <span class="source-meta">${esc(s.meta)}</span>
    </div>`;
  }).join('');
}

function renderDisclosure(d) {
  const section = (label, items) => `<div class="disclosure-section">
    <span class="disclosure-label">${esc(label)}</span>
    <ul class="disclosure-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
  </div>`;
  return section('Models used', d.models) + section('Tasks performed by AI', d.tasks) + section('Not AI-generated', d.notAi);
}

function renderMethodology(paragraphs) {
  return paragraphs.map(p => `<p class="methodology-text">${esc(p)}</p>`).join('');
}

function renderDownloads(downloads, invId) {
  return downloads.map(d => `<div class="download-item">
    <div class="download-info">
      <span class="download-filename">${esc(d.filename)}</span>
      <div class="download-meta">
        <span class="download-badge">${esc(d.format)}</span>
        <span class="download-size">${esc(d.description)}</span>
      </div>
    </div>
    <a href="data/${invId}/${encodeURIComponent(d.filename)}" download>${ICONS.downloadRow}</a>
  </div>`).join('');
}

function renderDatabase(db) {
  return `<div class="database-cta">
    <a class="database-button" href="${esc(db.url)}" target="_blank" rel="noopener">
      ${ICONS.database} ${esc(db.label)}
    </a>
    <span class="database-stats">${esc(db.stats)}</span>
  </div>`;
}

function renderNotebook(url) {
  return `<div class="notebook-cta">
    <span class="notebook-heading">Query this investigation</span>
    <p class="notebook-text">Ask questions about our sources, methodology, and findings using Google's NotebookLM. The notebook contains all primary documents, court filings, and the full investigation text.</p>
    <a class="notebook-button" href="${esc(url)}" target="_blank" rel="noopener">
      ${ICONS.notebookBtn} Open in NotebookLM
    </a>
  </div>`;
}

function buildFile(icon, label, content, open = false) {
  return `<div class="file${open ? ' open' : ''}">
    <div class="file-bar" role="button" tabindex="0" aria-expanded="${open}">
      <div class="file-bar-left">${icon}<span class="file-label">${esc(label)}</span></div>
      ${ICONS.chevron}
    </div>
    <div class="file-content"><div class="file-content-inner"><div class="file-content-body">${content}</div></div></div>
  </div>`;
}

function render(inv) {
  document.title = `Investigation Companion — ${inv.title} | Buried Signals`;
  document.querySelector('meta[name="description"]').content =
    `Transparency package for ${inv.title}. Sources, methodology, AI disclosure, and downloadable data.`;

  document.getElementById('ref').textContent = `${inv.ref} \u00B7 ${inv.date}`;
  document.getElementById('title').textContent = inv.title;
  document.getElementById('summary-text').textContent = inv.summary;

  const metaRow = document.getElementById('meta-row');
  metaRow.innerHTML = inv.collaborators.map(c =>
    `<div class="meta-tag"><div class="meta-dot meta-dot--teal"></div><span class="meta-label meta-label--teal">${esc(c.name)}</span></div>`
  ).join('');

  if (inv.fundedBy) {
    document.getElementById('funded-by').textContent = inv.fundedBy;
    document.getElementById('funded-pill').style.display = '';
  }

  const fileList = document.getElementById('file-list');
  fileList.innerHTML =
    (inv.database ? buildFile(ICONS.database, 'Data', renderDatabase(inv.database)) : '') +
    buildFile(ICONS.sources, 'Sources', renderSources(inv.sources, inv.id)) +
    buildFile(ICONS.ai, 'AI Disclosure', renderDisclosure(inv.aiDisclosure)) +
    buildFile(ICONS.methodology, 'Methodology', renderMethodology(inv.methodology)) +
    buildFile(ICONS.downloads, 'Downloads', renderDownloads(inv.downloads, inv.id)) +
    buildFile(ICONS.notebook, 'NotebookLM', renderNotebook(inv.notebookUrl));

  bindAccordion();
}

function bindAccordion() {
  const files = document.querySelectorAll('.file');
  files.forEach(file => {
    const bar = file.querySelector('.file-bar');
    bar.addEventListener('click', () => {
      const wasOpen = file.classList.contains('open');
      files.forEach(f => f.classList.remove('open'));
      if (!wasOpen) file.classList.add('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    document.getElementById('title').textContent = 'Investigation not found';
    document.getElementById('summary-text').textContent = 'No investigation ID provided. Use ?id=cleared to load an investigation.';
    return;
  }
  try {
    const res = await fetch(`investigations/${encodeURIComponent(id)}.json`);
    if (!res.ok) throw new Error(res.status);
    render(await res.json());
  } catch (e) {
    document.getElementById('title').textContent = 'Investigation not found';
    document.getElementById('summary-text').textContent = `Could not load investigation "${id}".`;
  }
});
