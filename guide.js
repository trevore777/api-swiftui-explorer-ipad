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

  const guide = document.createElement('section');
  guide.className = 'playgrounds-guide';
  guide.innerHTML = `
    <div class="num">Before you paste</div>
    <h3>Start with the default Swift Playgrounds file</h3>
    <p class="muted">Work through the small code sections below first. They show you what each part does and exactly where it belongs. The complete working file is now at the <strong>bottom of this API lesson</strong>.</p>

    <div class="keep-delete-grid">
      <div class="keep-card">
        <strong>KEEP</strong>
        <pre class="mini-code">import SwiftUI</pre>
      </div>
      <div class="delete-card">
        <strong>WHEN USING THE FINAL COMPLETE FILE</strong>
        <p>Delete the whole starter file, including the original <code>import SwiftUI</code>. The complete code at the bottom already contains it.</p>
      </div>
    </div>

    <div class="placement-card">
      <div class="num">Build it in parts</div>
      <h3>Where each code snippet belongs</h3>
      <div class="placement-grid">
        <div><b>1</b><strong>Codable model</strong><p>Paste it <em>above</em> <code>struct ContentView: View {</code>.</p></div>
        <div><b>2</b><strong>@State variables</strong><p>Paste them <em>inside ContentView</em>, immediately above <code>var body: some View</code>.</p></div>
        <div><b>3</b><strong>SwiftUI screen</strong><p>Inside <code>body</code>, delete the original globe / Hello World interface and replace it with this UI.</p></div>
        <div><b>4</b><strong>API function</strong><p>Paste it below the closing brace of <code>body</code>, but before ContentView’s final <code>}</code>.</p></div>
      </div>
      <pre class="placement-example">import SwiftUI

// 1. MODEL GOES HERE
${escapeHtml(model)}

struct ContentView: View {

    // 2. @STATE GOES HERE
${escapeHtml(indent(parts.state, 4))}

    var body: some View {
        // 3. REPLACE HELLO WORLD UI HERE
    }

    // 4. API FUNCTION GOES HERE
${escapeHtml(indent(parts.fn, 4))}
}</pre>
    </div>

    <div class="brace-tip"><strong>Important:</strong> the snippets immediately below are only parts of the program. Do not expect an individual snippet to run by itself. Work through them, then use the complete checked file at the bottom.</div>
  `;

  const firstBlock = detail.querySelector('.block');
  if (firstBlock) detail.insertBefore(guide, firstBlock);
  else detail.appendChild(guide);

  const modelBlock = modelEl.closest('.block');
  const fetchBlock = fetchEl.closest('.block');
  const viewBlock = viewEl.closest('.block');
  if (modelBlock) modelBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Snippet 1 — Paste here:</strong> above <code>struct ContentView: View {</code>.</div>');
  if (fetchBlock) fetchBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Snippet 2 — This block contains TWO parts:</strong> put the <code>@State</code> line(s) above <code>body</code>, and put the <code>func</code> below <code>body</code> before ContentView’s final brace.</div>');
  if (viewBlock) viewBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Snippet 3 — Paste here:</strong> inside <code>var body: some View</code>, replacing the starter globe / “Hello, world!” interface.</div>');

  const finalCard = document.createElement('section');
  finalCard.className = 'full-file-card final-code-card';
  finalCard.innerHTML = `
    <div class="num">Final step — complete working code</div>
    <h3>Complete Swift Playgrounds file</h3>
    <p class="muted">This is the full file assembled from the snippets above. Nothing needs to be added around it.</p>

    <div class="complete-checklist">
      <strong>This final file includes all required parts:</strong>
      <ul>
        <li>✓ <code>import SwiftUI</code></li>
        <li>✓ Codable model</li>
        <li>✓ <code>struct ContentView: View</code></li>
        <li>✓ all <code>@State</code> variables</li>
        <li>✓ complete <code>var body: some View</code> interface</li>
        <li>✓ complete API / <code>URLSession</code> function</li>
        <li>✓ all opening and closing braces</li>
      </ul>
    </div>

    <ol>
      <li>In Swift Playgrounds, open <code>ContentView.swift</code>.</li>
      <li>Select <strong>all</strong> of the existing starter code.</li>
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
    <div class="brace-tip"><strong>If you get a red error:</strong> first compare your file with this complete block. Check that the entire block was copied and that no old Hello World code remains above or below it.</div>
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
