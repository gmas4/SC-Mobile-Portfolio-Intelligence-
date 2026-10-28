(async () => {
  const toolbar = document.querySelector('.demo-bar');
  if (!toolbar) return;

  const currentMatch = location.pathname.match(/\/versions\/(v[^/]+)\//);
  const currentVersion = currentMatch?.[1];
  const repositoryBase = location.pathname.split('/versions/')[0];
  const control = document.createElement('label');
  control.className = 'version-control';
  control.innerHTML = '<span>Version</span><select aria-label="Prototype version"><option>Loading…</option></select>';
  toolbar.insertBefore(control, toolbar.firstChild);

  const style = document.createElement('style');
  style.textContent = `
    .demo-bar{width:min(1120px,calc(100% - 24px));gap:10px}
    .version-control{flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:6px 8px 6px 11px;border:1px solid #8fb3df;border-radius:999px;background:#fff;box-shadow:0 3px 15px #15264a14;color:#17325c;font:750 11px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;white-space:nowrap}
    .version-control span{color:#52647d;font-weight:650}
    .version-control select{width:235px;border:0;background:#edf5ff;color:#093775;border-radius:999px;padding:5px 24px 5px 8px;font:800 11px/1.2 inherit;cursor:pointer;outline-offset:2px}
    @media(max-width:1000px){.demo-bar{flex-wrap:wrap;justify-content:center}}
    @media(max-width:600px){.version-control{order:-2}.version-control select{width:210px}}
  `;
  document.head.appendChild(style);

  try {
    const response = await fetch(`${repositoryBase}/versions.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Version metadata returned ${response.status}`);
    const versions = await response.json();
    const select = control.querySelector('select');
    select.replaceChildren(...versions.map(item => {
      const option = document.createElement('option');
      option.value = item.path;
      option.textContent = `${item.version} — ${item.label}`;
      option.selected = item.version === currentVersion;
      return option;
    }));
    control.dataset.activeVersion = currentVersion || '';
    select.addEventListener('change', () => {
      const targetPath = select.value.replace(/^\/versions\//, '/versions/');
      location.assign(`${repositoryBase}${targetPath}${location.search}${location.hash}`);
    });
  } catch (error) {
    const select = control.querySelector('select');
    select.replaceChildren(new Option(currentVersion || 'Version unavailable', '', true, true));
    console.error('Unable to load prototype versions.', error);
  }
})();
