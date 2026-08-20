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
  return `import SwiftUI\n\n${model}\n\nstruct ContentView: View {\n\n${indent(parts.state, 4)}\n\n    var body: some View {\n${indent(viewCode, 8)}\n    }${parts.fn ? `\n\n${indent(parts.fn, 4)}` : ''}\n}`;
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
    <p class="muted">When you create a new App, Swift Playgrounds normally gives you <code>import SwiftUI</code>, <code>struct ContentView: View</code>, a <code>VStack</code>, the globe image and “Hello, world!”.</p>

    <div class="keep-delete-grid">
      <div class="keep-card">
        <strong>KEEP</strong>
        <pre class="mini-code">import SwiftUI</pre>
      </div>
      <div class="delete-card">
        <strong>DELETE</strong>
        <p>Delete everything from <code>struct ContentView: View {</code> down to the final <code>}</code>.</p>
      </div>
    </div>

    <div class="beginner-callout">
      <strong>Recommended for Years 7–8:</strong>
      <span>Use the complete-file button below first. It puts the model, @State variables, interface and API function in the correct places for you.</span>
    </div>

    <div class="full-file-card">
      <div class="num">Beginner method</div>
      <h3>Copy the complete Swift file</h3>
      <ol>
        <li>Select all of the starter code in Swift Playgrounds.</li>
        <li>Delete it.</li>
        <li>Press <strong>Copy complete Swift file</strong> below.</li>
        <li>Paste it into <code>ContentView.swift</code>.</li>
        <li>Press <strong>Run ▶</strong>.</li>
      </ol>
      <div class="actions">
        <button class="primary" id="copyCompleteSwift">Copy complete Swift file</button>
        <span id="completeStatus"></span>
      </div>
      <pre id="completeSwift">${escapeHtml(complete)}</pre>
    </div>

    <div class="placement-card">
      <div class="num">Adding the code in parts</div>
      <h3>Exactly where each section goes</h3>
      <div class="placement-grid">
        <div><b>1</b><strong>Codable model</strong><p>Paste it <em>above</em> <code>struct ContentView: View {</code>.</p></div>
        <div><b>2</b><strong>@State variables</strong><p>Paste them <em>inside ContentView</em>, immediately above <code>var body: some View</code>.</p></div>
        <div><b>3</b><strong>SwiftUI screen</strong><p>Inside <code>body</code>, delete the old globe/Hello World <code>VStack</code> and replace it with the new UI.</p></div>
        <div><b>4</b><strong>API function</strong><p>Paste it below the closing brace of <code>body</code>, but before ContentView’s final <code>}</code>.</p></div>
      </div>
      <pre class="placement-example">import SwiftUI\n\n// 1. MODEL GOES HERE\n${escapeHtml(model)}\n\nstruct ContentView: View {\n\n    // 2. @STATE GOES HERE\n${escapeHtml(indent(parts.state, 4))}\n\n    var body: some View {\n        // 3. REPLACE HELLO WORLD UI HERE\n    }\n\n    // 4. API FUNCTION GOES HERE\n${escapeHtml(indent(parts.fn, 4))}\n}</pre>
    </div>

    <div class="brace-tip"><strong>If you get a red error:</strong> compare your <code>{ }</code> braces with the complete file above. A function accidentally pasted outside <code>ContentView</code>, or a missing brace, is a common copy-and-paste error.</div>
  `;

  const firstBlock = detail.querySelector('.block');
  if (firstBlock) detail.insertBefore(guide, firstBlock);
  else detail.appendChild(guide);

  guide.querySelector('#copyCompleteSwift').addEventListener('click', () => {
    copyText(complete, guide.querySelector('#completeStatus'));
  });

  const modelBlock = modelEl.closest('.block');
  const fetchBlock = fetchEl.closest('.block');
  const viewBlock = viewEl.closest('.block');
  if (modelBlock) modelBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Paste here:</strong> above <code>struct ContentView: View {</code>.</div>');
  if (fetchBlock) fetchBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Paste here:</strong> inside <code>ContentView</code>. Put the <code>@State</code> lines above <code>body</code>, and the <code>func</code> below <code>body</code> before the final brace.</div>');
  if (viewBlock) viewBlock.insertAdjacentHTML('afterbegin', '<div class="paste-location"><strong>Paste here:</strong> inside <code>var body: some View</code>. Replace the starter globe / “Hello, world!” interface.</div>');
}

if (detail) {
  const observer = new MutationObserver(() => {
    queueMicrotask(addGuidance);
  });
  observer.observe(detail, { childList: true });
  addGuidance();
  setTimeout(addGuidance, 100);
}
