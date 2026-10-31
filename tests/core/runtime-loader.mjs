import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const scripts = [], styles = [];
class Element extends EventTarget {
  constructor(tag) { super(); this.tag = tag; this.dataset = {}; this.src = ''; }
  remove() { const index = scripts.indexOf(this); if (index >= 0) scripts.splice(index, 1); }
}
const document = {
  baseURI: 'https://example.github.io/WorldForge/', scripts,
  createElement: tag => new Element(tag),
  querySelectorAll: () => styles,
  head: { appendChild(element) { (element.tag === 'script' ? scripts : styles).push(element); } }
};
const context = { document, URL, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/app/runtime-loader.js', 'utf8'), context);
const loader = context.WorldForgeLoader;
const one = loader.script('src/shared.js', () => context.first);
const two = loader.script('./src/shared.js', () => context.second);
assert.equal(scripts.length, 1, 'equivalent paths must share one in-flight script');
context.first = context.second = true;
scripts[0].dispatchEvent(new Event('load'));
await Promise.all([one, two]);
const missing = loader.script('src/shared.js', () => false);
await assert.rejects(missing, /Missing dependency/);
loader.style('src/theme.css'); loader.style('./src/theme.css');
assert.equal(styles.length, 1);
const failure = loader.script('src/retry.js', () => context.retried);
scripts.at(-1).dispatchEvent(new Event('error'));
await assert.rejects(failure, /Failed to load/);
const retry = loader.script('src/retry.js', () => context.retried);
context.retried = true;
scripts.at(-1).dispatchEvent(new Event('load'));
await retry;
await assert.rejects(loader.script('src/timeout.js', () => false, 5), /Failed to load/);
const dependent = loader.wait(() => context.dependency);
context.dependency = 'ready'; loader.notify();
assert.equal(await dependent, 'ready');
await assert.rejects(loader.wait(() => false, 5), /dependency timeout/);
console.log('Shared loader deduplication, retries, deadlines and dependency wakeups passed');
