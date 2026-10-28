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

async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
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

async function testPolicyJourney(persona, mobile) {
  const notVisibleCategory = persona === 'simon' ? 'long-term-care' : 'life';
  await send('Emulation.setDeviceMetricsOverride', {
    width: mobile ? 390 : 1280,
    height: mobile ? 844 : 960,
    deviceScaleFactor: 1,
    mobile
  });
  await navigate(`/versions/v1.1/?persona=${persona}`);
  await openJourney(persona);
  await click('[data-action="home"]');
  await waitFor("document.querySelectorAll('.transaction-row').length === 7", 'realistic transaction list');
  assert(!(await evaluate("document.body.textContent.includes('SGD 0.01')")), `v1.1/${persona} retained placeholder transactions`);
  assert(await evaluate("document.body.textContent.includes('Salary credit') && document.body.textContent.includes('Mortgage / Home Loan')"), `v1.1/${persona} synthetic transactions missing`);

  await click('.moment-trigger');
  assert(await evaluate("document.querySelector('#moment-callout').classList.contains('is-visible')"), `v1.1/${persona} moment help failed`);
  await click('.protection-info summary');
  assert(await evaluate("document.querySelector('.protection-info').open"), `v1.1/${persona} protection help failed`);

  const categorySelector = `.protection-category[data-category="${notVisibleCategory}"][data-status="not-visible"]`;
  assert(await evaluate(`Boolean(document.querySelector(${JSON.stringify(categorySelector)}))`), `v1.1/${persona} expected not-visible category missing`);
  await click(categorySelector);
  await waitFor("document.querySelector('[data-action=" + '"protection-confirm"' + "]')", 'I already have cover action');
  await click('[data-action="protection-confirm"]');
  await waitFor("document.querySelector('[data-action=" + '"policy-upload"' + "]')", 'add existing cover step');

  await click('[data-action="policy-manual"]');
  await waitFor("document.querySelector('[data-policy-field=" + '"policyName"' + "]')", 'manual policy form');
  await evaluate(`(() => { const input = document.querySelector('[data-policy-field="policyName"]'); input.value = 'Customer Entered Policy'; input.dispatchEvent(new Event('input', { bubbles:true })); })()`);
  await click('[data-action="policy-manual-summary"]');
  assert(await evaluate("document.querySelector('.policy-summary').textContent.includes('Customer Entered Policy')"), `v1.1/${persona} manual details were not summarised`);
  await click('[data-action="policy-missing"]');
  await waitFor("document.querySelector('[data-action=" + '"policy-upload"' + "]')", 'missing-information options');

  await click('[data-action="policy-upload"]');
  assert(await evaluate("document.querySelector('.policy-file-input').accept.includes('.pdf') && document.querySelector('.policy-file-input').accept.includes('.png')"), `v1.1/${persona} upload types are incomplete`);
  await click('[data-action="policy-sample-upload"]');
  await waitFor("document.querySelector('.policy-summary')", 'illustrative policy summary');
  assert(await evaluate("document.querySelector('.policy-summary').textContent.includes('Customer-uploaded') && document.querySelector('.policy-summary').textContent.includes('Pending customer review')"), `v1.1/${persona} provenance or pending status missing`);
  await click('[data-action="policy-original"]');
  assert(await evaluate("Boolean(document.querySelector('.document-preview'))"), `v1.1/${persona} original-document explanation missing`);
  await click('[data-action="policy-confirm"]');
  await waitFor("document.querySelector('.country-grid')", 'country selection');
  assert(await evaluate(`document.querySelector(${JSON.stringify(`.protection-category[data-category="${notVisibleCategory}"]`)}).dataset.status === 'customer-confirmed'`), `v1.1/${persona} external policy did not become customer confirmed`);

  await click('[data-country="United Kingdom"]');
  await click('[data-action="policy-interpret"]');
  await waitFor("document.querySelectorAll('.interpretation-row').length === 4", 'international interpretation');
  const interpretation = await evaluate("document.querySelector('.interpretation-list').textContent");
  assert(interpretation.includes('Likely included') && interpretation.includes('Unclear / check required') && interpretation.includes('Not identified') && interpretation.includes('Review required'), `v1.1/${persona} interpretation states incomplete`);
  assert(!interpretation.includes('Definitely covered') && !interpretation.includes('Definitely not covered'), `v1.1/${persona} interpretation is too definitive`);
  if (CAPTURE_PATH && persona === 'sarah' && !mobile) {
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(CAPTURE_PATH.replace(/\.png$/i, '-policy.png'), Buffer.from(capture.data, 'base64'));
  }
  await click('[data-question="unclear"]');
  assert(await evaluate("Boolean(document.querySelector('.policy-ai p'))"), `v1.1/${persona} policy AI explanation missing`);
  await click('[data-action="policy-options"]');
  assert(await evaluate("document.querySelector('#protection-dialog-title').textContent === 'Areas to explore'"), `v1.1/${persona} needs-led options step failed`);
  await click('[data-action="policy-continue-journey"]');
  await waitFor("document.querySelector('.financial-picture')", 'return to Portfolio Intelligence');
  assert(await evaluate("document.querySelector('.financial-picture').textContent.includes('customer-confirmed external policy')"), `v1.1/${persona} financial picture did not reflect external cover`);

  await click('[data-action="home"]');
  await waitFor(`document.querySelector(${JSON.stringify(`.protection-category[data-category="${notVisibleCategory}"][data-status="customer-confirmed"]`)})`, 'confirmed portfolio status');
  assert(await evaluate("document.body.textContent.includes('External policy added')"), `v1.1/${persona} external policy supporting text missing`);
  await click('.demo-reset');
  await waitFor("!document.querySelector('.protection-category[data-status=" + '"customer-confirmed"' + "]')", 'policy reset');

  const otherPersona = persona === 'sarah' ? 'alex' : 'sarah';
  await navigate(`/versions/v1.1/?persona=${otherPersona}`);
  assert(!(await evaluate("Boolean(document.querySelector('.protection-category[data-status=" + '"customer-confirmed"' + "]'))")), `v1.1/${persona} policy state leaked into ${otherPersona}`);
  assert(browserErrors.length === 0, `v1.1/${persona} policy flow console errors: ${browserErrors.join('; ')}`);
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

for (const persona of Object.keys(personas)) {
  for (const mobile of [false, true]) {
    await testPolicyJourney(persona, mobile);
    results.push(`v1.1 ${persona} external-policy flow ${mobile ? 'mobile' : 'desktop'}`);
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
