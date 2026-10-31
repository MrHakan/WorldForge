(() => {
  'use strict';
  if (typeof document === 'undefined' || window.WorldForgeLoader) return;
  const pending = new Map(), waiters = new Set();
  let poll = null;
  const absolute = path => new URL(path, document.baseURI).href;
  function notify() {
    for (const check of [...waiters]) check();
    window.WorldForgeReleaseInfo?.apply();
  }
  function wait(test, timeout = 20000) {
    return new Promise((resolve, reject) => {
      let timer;
      const finish = (error, value) => {
        clearTimeout(timer);
        waiters.delete(check);
        if (!waiters.size) { clearInterval(poll); poll = null; }
        if (error) reject(error); else resolve(value);
      };
      const check = () => { try { const value = test(); if (value) finish(null, value); } catch (error) { finish(error); } };
      waiters.add(check);
      timer = setTimeout(() => finish(new Error('WorldForge dependency timeout')), timeout);
      // Fallback for legacy code that defines a dependency without using this loader.
      if (!poll) poll = setInterval(notify, 100);
      check();
    });
  }
  function style(path) {
    const url = absolute(path);
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === url)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = url;
    document.head.appendChild(link);
  }
  function script(path, test = null, timeout = 20000) {
    if (test && test()) return Promise.resolve();
    const url = absolute(path);
    let request = pending.get(url);
    if (!request) {
      const element = [...document.scripts].find(script => script.src === url) || document.createElement('script');
      const created = !element.src;
      request = new Promise((resolve, reject) => {
        const cleanup = () => { clearTimeout(timer); element.removeEventListener('load', loaded); element.removeEventListener('error', failed); };
        const loaded = () => { cleanup(); element.dataset.worldforgeLoaded = '1'; resolve(); queueMicrotask(notify); };
        const failed = () => { cleanup(); pending.delete(url); if (created) element.remove(); reject(new Error(`Failed to load ${path}`)); };
        const timer = setTimeout(failed, timeout);
        element.addEventListener('load', loaded, { once: true });
        element.addEventListener('error', failed, { once: true });
        if (element.dataset.worldforgeLoaded === '1') queueMicrotask(loaded);
        else if (created) { element.src = url; element.async = false; document.head.appendChild(element); }
      });
      pending.set(url, request);
    }
    return request.then(() => {
      if (test && !test()) throw new Error(`Missing dependency after loading ${path}`);
    });
  }
  window.WorldForgeLoader = { script, style, wait, notify };
})();
