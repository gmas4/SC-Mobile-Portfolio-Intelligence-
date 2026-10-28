import { writeFile } from 'node:fs/promises';

const BASE = process.env.PROTOTYPE_URL || 'http://127.0.0.1:8765';
const CDP = process.env.CDP_URL || 'http://127.0.0.1:9222';
const CAPTURE_PATH = process.env.CAPTURE_PATH;

const target = await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let id = 0;
const pending = new Map();
const browserErrors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') browserErrors.push(message.params.entry.text);
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, description, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function navigate(path) {
  browserErrors.length = 0;
  await send('Page.navigate', { url: `${BASE}${path}` });
  await waitFor("document.readyState === 'complete'", 'page load');
  await waitFor("document.querySelector('.version-control select')?.options.length === 2", 'version selector');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const personas = {
  simon: { gap: 'S$480,000', entry: '.push-card' },
  alex: { gap: 'S$270,000', entry: '.email-cta' },
  sarah: { gap: 'S$34,000', entry: '[data-action="open"]' }
};

async function openJourney(persona) {
  if (persona === 'simon') await waitFor("document.querySelector('.push-card')", 'Simon push notification', 3000);
  await evaluate(`document.querySelector(${JSON.stringify(personas[persona].entry)}).click()`);
  await waitFor("document.querySelector('.hero')", `${persona} journey`);
}

async function testJourney(version, persona, mobile) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: mobile ? 390 : 1280,
    height: mobile ? 844 : 960,
    deviceScaleFactor: 1,
    mobile
  });
  await navigate(`/versions/${version}/?persona=${persona}`);
  const label = await evaluate("document.querySelector('.version-control select').selectedOptions[0].textContent");
  assert(label.startsWith(version), `${version} active label is incorrect`);
  await openJourney(persona);

  const gap = await evaluate("document.querySelector('.gap-number b').textContent");
  assert(gap === personas[persona].gap, `${version}/${persona} expected ${personas[persona].gap}, received ${gap}`);
  const hasPicture = await evaluate("Boolean(document.querySelector('.financial-picture'))");
  assert(hasPicture === (version === 'v1.1'), `${version}/${persona} financial-picture isolation failed`);
  if (hasPicture) {
    const rows = await evaluate("document.querySelectorAll('.picture-row').length");
    assert(rows === 4, `${version}/${persona} expected four picture rows`);
    await evaluate("document.querySelector('.picture-row summary').click()");
    assert(await evaluate("document.querySelector('.picture-row').open"), `${version}/${persona} picture details did not open`);
  }
  if (CAPTURE_PATH && version === 'v1.1' && persona === 'alex' && !mobile) {
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(CAPTURE_PATH, Buffer.from(capture.data, 'base64'));
  }

  await evaluate("document.querySelector('[data-action=" + '"assistant"' + "]').click()");
  await waitFor("document.querySelector('.assistant-sheet')", 'assistant');
  await evaluate("document.querySelector('[data-prompt=" + '"next"' + "]').click()");
  await waitFor("document.querySelector('.chat-cta')", 'assistant next step');
  await evaluate("document.querySelector('.chat-cta').click()");
  assert(await evaluate("document.querySelector('[data-tab=" + '"options"' + "]').classList.contains('active')"), `${version}/${persona} Ways Forward not reached`);

  await evaluate("document.querySelector('[data-tab=" + '"assumptions"' + "]').click()");
  const before = await evaluate("document.querySelector('.gap-number b').textContent");
  await evaluate(`(() => { const input = document.querySelector('input[type="range"]'); input.value = Number(input.value) + Number(input.step); input.dispatchEvent(new Event('input', { bubbles:true })); })()`);
  const after = await evaluate("document.querySelector('.gap-number b').textContent");
  assert(before !== after, `${version}/${persona} scenario calculation did not react`);

  await evaluate("document.querySelector('[data-tab=" + '"options"' + "]').click()");
  await evaluate("document.querySelector('[data-action=" + '"book"' + "]').click()");
  assert(await evaluate("Boolean(document.querySelector('.booking'))"), `${version}/${persona} adviser handoff failed`);

  await evaluate("document.querySelector('[data-action=" + '"home"' + "]').click()");
  await waitFor("document.querySelector('.protection-category')", 'protection portfolio');
  await evaluate("document.querySelector('.protection-category').click()");
  assert(await evaluate("Boolean(document.querySelector('.protection-dialog'))"), `${version}/${persona} protection details failed`);
  await evaluate("document.querySelector('.protection-dialog-close').click()");

  const scrolling = await evaluate(`(() => { const screen = document.querySelector('.screen'); screen.scrollTop = 120; return { top:screen.scrollTop, scrollHeight:screen.scrollHeight, clientHeight:screen.clientHeight }; })()`);
  assert(scrolling.scrollHeight > scrolling.clientHeight && scrolling.top > 0, `${version}/${persona} ${mobile ? 'mobile' : 'desktop'} scrolling failed`);
  assert(browserErrors.length === 0, `${version}/${persona} console errors: ${browserErrors.join('; ')}`);
}

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');

const results = [];
for (const version of ['v1.0', 'v1.1']) {
  for (const persona of Object.keys(personas)) {
    for (const mobile of [false, true]) {
      await testJourney(version, persona, mobile);
      results.push(`${version} ${persona} ${mobile ? 'mobile' : 'desktop'}`);
    }
  }
}

await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 960, deviceScaleFactor: 1, mobile: false });
await navigate('/versions/v1.0/?persona=sarah');
await evaluate("document.querySelector('.version-control select').value='/versions/v1.1/'; document.querySelector('.version-control select').dispatchEvent(new Event('change'))");
await waitFor("location.pathname.includes('/versions/v1.1/') && new URLSearchParams(location.search).get('persona') === 'sarah'", 'v1.0 to v1.1 switch');
await waitFor("document.querySelector('.version-control select')?.selectedOptions[0]?.textContent.startsWith('v1.1')", 'v1.1 label');
await evaluate("document.querySelector('.version-control select').value='/versions/v1.0/'; document.querySelector('.version-control select').dispatchEvent(new Event('change'))");
await waitFor("location.pathname.includes('/versions/v1.0/') && new URLSearchParams(location.search).get('persona') === 'sarah'", 'v1.1 to v1.0 switch');
await send('Page.reload', { ignoreCache: true });
await waitFor("location.pathname.includes('/versions/v1.0/') && new URLSearchParams(location.search).get('persona') === 'sarah'", 'refresh state');
assert(!(await evaluate("Boolean(document.querySelector('.financial-picture'))")), 'v1.1 content leaked into v1.0');
results.push('bidirectional version switching, persona preservation, and refresh');

await send('Page.navigate', { url: `${BASE}/?persona=alex` });
await waitFor("location.pathname.includes('/versions/v1.1/') && new URLSearchParams(location.search).get('persona') === 'alex'", 'root latest-version redirect');
results.push('root redirect to latest stable version');

console.log(`PASS (${results.length} checks)\n- ${results.join('\n- ')}`);
socket.close();
