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

function createAlignedParts(model, fetchCode, viewCode) {
  const parts = splitFetch(fetchCode);
  return {
    model: model.trim(),
    state: indent(parts.state, 4),
    view: indent(viewCode.trim(), 8),
    fn: parts.fn ? indent(parts.fn, 4) : ''
  };
}

function buildCompleteFile(aligned) {
  return [
    'import SwiftUI',
    aligned.model,
    'struct ContentView: View {',
    aligned.state,
    '    var body: some View {',
    aligned.view,
    '    }',
    aligned.fn,
    '}'
  ].filter(Boolean).join('\n\n')
    .replace('    var body: some View {\n\n', '    var body: some View {\n')
    .replace('\n\n    }\n\n', '\n    }\n\n');
}

function buildMarkedExample(aligned) {
  return `import SwiftUI\n\n// SNIPPET 1 — CODABLE MODEL\n${aligned.model}\n\nstruct ContentView: View {\n\n    // SNIPPET 2 — @STATE VARIABLES\n${aligned.state}\n\n    var body: some View {\n        // SNIPPET 3 — SWIFTUI SCREEN\n${aligned.view}\n    }\n\n    // SNIPPET 4 — API FUNCTION\n${aligned.fn}\n}`;
}

function verifyAlignment(aligned, complete) {
  const required = [aligned.model, aligned.state, aligned.view, aligned.fn].filter(Boolean);
  return required.every(part => complete.includes(part));
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

  const aligned = createAlignedParts(
    modelEl.textContent,
    fetchEl.textContent,
    viewEl.textContent
  );
  const complete = buildCompleteFile(aligned);
  const markedExample = buildMarkedExample(aligned);
  const alignmentOK = verifyAlignment(aligned, complete);

  const modelBlock = modelEl.closest('.block');
  const fetchBlock = fetchEl.closest('.block');
  const viewBlock = viewEl.closest('.block');

  const guide = document.createElement('section');
  guide.className = 'playgrounds-guide';
  guide.innerHTML = `
    <div class="num">Before you paste</div>
    <h3>See exactly where the four snippets go</h3>
    <p class="muted">The example below uses the <strong>exact same code</strong> as the four Copy buttons. Indentation is included, so what students copy now matches what they see here and in the final file.</p>

    <div class="placement-card">
      <div class="placement-grid">
        <div><b>1</b><strong>Codable model</strong><p>Paste above <code>struct ContentView: View {</code>.</p></div>
        <div><b>2</b><strong>@State variables</strong><p>Paste inside <code>ContentView</code>, directly above <code>var body: some View</code>.</p></div>
        <div><b>3</b><strong>SwiftUI screen</strong><p>Paste inside <code>body</code>, replacing the original globe / Hello World UI.</p></div>
        <div><b>4</b><strong>API function</strong><p>Paste below <code>body</code>, before ContentView’s final <code>}</code>.</p></div>
      </div>
      <pre class="placement-example">${escapeHtml(markedExample)}</pre>
    </div>

    <div class="brace-tip"><strong>Alignment check:</strong> ${alignmentOK ? '✓ All four snippets are present unchanged in the final file.' : '⚠ A code section did not align. Tell your teacher before copying.'}</div>
  `;

  const firstBlock = detail.querySelector('.block');
  if (firstBlock) detail.insertBefore(guide, firstBlock);
  else detail.appendChild(guide);

  if (modelBlock) {
    modelBlock.outerHTML = makeSnippetCard(
      1,
      'Codable model',
      'Paste this above struct ContentView: View {. This code appears exactly the same in the example above and final file below.',
      aligned.model,
      'guide-model'
    );
  }

  if (fetchBlock) {
    fetchBlock.outerHTML =
      makeSnippetCard(
        2,
        '@State variables',
        'Paste this inside ContentView, directly above var body: some View. The four-space indentation is already included.',
        aligned.state,
        'guide-state'
      ) +
      makeSnippetCard(
        4,
        'API function',
        'Paste this below body, before ContentView’s final closing brace. The four-space indentation is already included.',
        aligned.fn,
        'guide-function'
      );
  }

  if (viewBlock) {
    viewBlock.outerHTML = makeSnippetCard(
      3,
      'SwiftUI screen',
      'Paste this inside var body: some View, replacing the original globe and “Hello, world!” interface. The eight-space indentation is already included.',
      aligned.view,
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
    <p class="muted">This file is assembled directly from Snippets 1–4 above. The copied snippets are not rewritten or shortened.</p>

    <div class="complete-checklist">
      <strong>Automatic check:</strong>
      <ul>
        <li>${alignmentOK ? '✓' : '⚠'} Snippet 1 matches the final file</li>
        <li>${alignmentOK ? '✓' : '⚠'} Snippet 2 matches the final file</li>
        <li>${alignmentOK ? '✓' : '⚠'} Snippet 3 matches the final file</li>
        <li>${alignmentOK ? '✓' : '⚠'} Snippet 4 matches the final file</li>
        <li>✓ <code>import SwiftUI</code> and the ContentView wrapper are included</li>
      </ul>
    </div>

    <ol>
      <li>Open <code>ContentView.swift</code>.</li>
      <li>Select all existing starter code and delete it.</li>
      <li>Press <strong>Copy complete working code</strong>.</li>
      <li>Paste it into the empty file.</li>
      <li>Press <strong>Run ▶</strong>.</li>
    </ol>

    <div class="actions">
      <button class="primary" id="copyCompleteSwift" ${alignmentOK ? '' : 'disabled'}>Copy complete working code</button>
      <span id="completeStatus"></span>
    </div>
    <pre id="completeSwift">${escapeHtml(complete)}</pre>
    <div class="brace-tip"><strong>If you get a red error:</strong> make sure all old Hello World code was removed before pasting the complete file.</div>
  `;

  detail.appendChild(finalCard);

  finalCard.querySelector('#copyCompleteSwift')?.addEventListener('click', () => {
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
