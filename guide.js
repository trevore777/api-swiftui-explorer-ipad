const detail = document.querySelector('#detail');

function escapeHtml(text = '') {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function indent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => line ? pad + line : '').join('\n');
}

function splitFetch(text) {
  const marker = 'func ';
  const index = text.indexOf(marker);
  if (index === -1) return { state: text.trim(), fn: '' };
  return {
    state: text.slice(0, index).trim(),
    fn: text.slice(index).trim()
  };
}

function buildCompleteFile(model, fetchCode, viewCode) {
  const parts = splitFetch(fetchCode);
  const sections = [
    'import SwiftUI',
    model.trim(),
    'struct ContentView: View {',
    indent(parts.state, 4),
    '    var body: some View {',
    indent(viewCode.trim(), 8),
    '    }',
    parts.fn ? indent(parts.fn, 4) : '',
    '}'
  ].filter(Boolean);

  return sections.join('\n\n')
    .replace('    var body: some View {\n\n', '    var body: some View {\n')
    .replace('\n\n    }\n\n', '\n    }\n\n');
}

async function copyText(text, status) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied — switch to Swift Playgrounds and paste.';
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    status.textContent = 'Copied.';
  }
  setTimeout(() => { status.textContent = ''; }, 3500);
}

function makeSnippetCard(number, title, instruction, code, id) {
  return `
    <section class="block teaching-snippet">
      <div class="num">Snippet ${number}</div>
      <h3>${title}</h3>
      <p class="muted">${instruction}</p>
      <div class="actions">
        <button data-guide-copy="${id}">Copy this Swift code</button>
        <span id="status-${id}"></span>
      </div>
      <pre id="${id}">${escapeHtml(code)}</pre>
    </section>`;
}

function addGuidance() {
  if (!detail || detail.querySelector('.playgrounds-guide')) return;

  const modelEl = detail.querySelector('#model');
  const fetchEl = detail.querySelector('#fetch');
  const viewEl = detail.querySelector('#view');
  if (!modelEl || !fetchEl || !viewEl) return;

  const model = modelEl.textContent.trim();
  const fetchCode = fetchEl.textContent.trim();
  const viewCode = viewEl.textContent.trim();
  const parts = splitFetch(fetchCode);
  const complete = buildCompleteFile(model, fetchCode, viewCode);

  const modelBlock = modelEl.closest('.block');
  const fetchBlock = fetchEl.closest('.block');
  const viewBlock = viewEl.closest('.block');

  const guide = document.createElement('section');
  guide.className = 'playgrounds-guide';
  guide.innerHTML = `
    <div class="num">Before you paste</div>
    <h3>Build the app in four clear parts</h3>
    <p class="muted">The four snippets below are complete pieces of the final program. Each one shows exactly where it belongs. The complete working file is still at the <strong>bottom of this API lesson</strong>.</p>

    <div class="placement-card">
      <div class="num">Where each snippet goes</div>
      <div class="placement-grid">
        <div><b>1</b><strong>Codable model</strong><p>Paste it above <code>struct ContentView: View {</code>.</p></div>
        <div><b>2</b><strong>@State variables</strong><p>Paste them inside <code>ContentView</code>, immediately above <code>var body: some View</code>.</p></div>
        <div><b>3</b><strong>SwiftUI screen</strong><p>Inside <code>body</code>, remove the original globe / Hello World interface and paste this UI.</p></div>
        <div><b>4</b><strong>API function</strong><p>Paste it below <code>body</code>, but before ContentView’s final <code>}</code>.</p></div>
      </div>
      <pre class="placement-example">import SwiftUI

// 1. MODEL
${escapeHtml(model)}

struct ContentView: View {

    // 2. STATE
${escapeHtml(indent(parts.state, 4))}

    var body: some View {
${escapeHtml(indent(viewCode, 8))}
    }

    // 4. API FUNCTION
${escapeHtml(indent(parts.fn, 4))}
}</pre>
    </div>

    <div class="brace-tip"><strong>Important:</strong> unlike the old guide, the example above now shows the <strong>real SwiftUI body code</strong>. Nothing is hidden behind a placeholder.</div>
  `;

  const firstBlock = detail.querySelector('.block');
  if (firstBlock) detail.insertBefore(guide, firstBlock);
  else detail.appendChild(guide);

  if (modelBlock) {
    modelBlock.outerHTML = makeSnippetCard(
      1,
      'Codable model',
      'Paste this above struct ContentView: View {. It describes the JSON data Swift will decode.',
      model,
      'guide-model'
    );
  }

  if (fetchBlock) {
    fetchBlock.outerHTML =
      makeSnippetCard(
        2,
        '@State variables',
        'Paste these inside ContentView, directly above var body: some View.',
        parts.state,
        'guide-state'
      ) +
      makeSnippetCard(
        4,
        'API function',
        'Paste this below the closing brace of body, but before ContentView’s final closing brace.',
        parts.fn,
        'guide-function'
      );
  }

  if (viewBlock) {
    viewBlock.outerHTML = makeSnippetCard(
      3,
      'SwiftUI screen',
      'Paste this inside var body: some View, replacing the original globe and “Hello, world!” interface.',
      viewCode,
      'guide-view'
    );
  }

  const snippetSections = [...detail.querySelectorAll('.teaching-snippet')];
  snippetSections.sort((a, b) => {
    const na = Number(a.querySelector('.num')?.textContent.replace(/\D/g, '') || 0);
    const nb = Number(b.querySelector('.num')?.textContent.replace(/\D/g, '') || 0);
    return na - nb;
  });
  const anchor = guide.nextSibling;
  snippetSections.forEach(section => detail.insertBefore(section, anchor));

  detail.querySelectorAll('[data-guide-copy]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.guideCopy;
      const code = detail.querySelector('#' + id)?.textContent || '';
      const status = detail.querySelector('#status-' + id);
      copyText(code, status);
    });
  });

  const finalCard = document.createElement('section');
  finalCard.className = 'full-file-card final-code-card';
  finalCard.innerHTML = `
    <div class="num">Final step — complete working code</div>
    <h3>Complete Swift Playgrounds file</h3>
    <p class="muted">This is the full file assembled from all four snippets above. Nothing needs to be added around it.</p>

    <div class="complete-checklist">
      <strong>This final file includes:</strong>
      <ul>
        <li>✓ <code>import SwiftUI</code></li>
        <li>✓ complete Codable model</li>
        <li>✓ <code>struct ContentView: View</code></li>
        <li>✓ all <code>@State</code> variables</li>
        <li>✓ the full SwiftUI interface shown in Snippet 3</li>
        <li>✓ the full API / <code>URLSession</code> function shown in Snippet 4</li>
        <li>✓ all required opening and closing braces</li>
      </ul>
    </div>

    <ol>
      <li>Open <code>ContentView.swift</code> in Swift Playgrounds.</li>
      <li>Select all of the existing starter code.</li>
      <li>Delete it so the file is empty.</li>
      <li>Press <strong>Copy complete working code</strong>.</li>
      <li>Paste the code into the empty file.</li>
      <li>Press <strong>Run ▶</strong>.</li>
    </ol>

    <div class="actions">
      <button class="primary" id="copyCompleteSwift">Copy complete working code</button>
      <span id="completeStatus"></span>
    </div>
    <pre id="completeSwift">${escapeHtml(complete)}</pre>
    <div class="brace-tip"><strong>If you get a red error:</strong> compare your file with this complete block and check that no old Hello World code remains above or below it.</div>
  `;

  detail.appendChild(finalCard);

  finalCard.querySelector('#copyCompleteSwift').addEventListener('click', () => {
    copyText(complete, finalCard.querySelector('#completeStatus'));
  });
}

if (detail) {
  const observer = new MutationObserver(() => {
    queueMicrotask(addGuidance);
  });
  observer.observe(detail, { childList: true });
  addGuidance();
  setTimeout(addGuidance, 100);
}
