(function (root) {
  'use strict';
  const version = '5.1.0', name = 'Responsive Pages Workspace';
  function apply() {
    if (typeof document === 'undefined') return;
    const worldName = root.WorldForgeApp?.state?.world?.name;
    const title = `${worldName ? worldName + ' · ' : ''}WorldForge v${version}`;
    if (document.title !== title) document.title = title;
    const set = (selector, text) => { const element = document.querySelector(selector); if (element && element.textContent !== text) element.textContent = text; };
    set('.version-pill', `v${version} · WORLD STUDIO`);
    set('footer span', `WorldForge v${version} · ${name}`);
    set('.architecture-panel h2', `WorldForge v${version} State Contract`);
    set('.architecture-panel .status-ready', `v${version} INTEGRATED`);
    set('#releasePanel .eyebrow', `WORLDFORGE v${version}`);
  }
  const info = { version, name, apply };
  if (typeof module !== 'undefined' && module.exports) module.exports = info;
  if (root) root.WorldForgeReleaseInfo = info;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', apply, { once: true });
})(typeof window !== 'undefined' ? window : globalThis);
