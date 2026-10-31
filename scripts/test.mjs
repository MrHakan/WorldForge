import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';

const group = process.argv[2] || 'all';
if (!['all', 'core', 'features', 'rendering', 'warfare'].includes(group)) {
  throw new Error(`Unknown test group: ${group}`);
}
const files = [];
async function discover(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await discover(path);
    else if (/\.(?:mjs|test\.js)$/.test(entry.name)) files.push(path);
  }
}
if (group === 'all') {
  for (const name of ['core', 'features', 'rendering', 'warfare']) await discover(`tests/${name}`);
} else await discover(`tests/${group}`);
files.sort();
const requested = Number(process.env.TEST_CONCURRENCY);
const concurrency = Number.isFinite(requested) && requested > 0
  ? Math.min(8, Math.floor(requested)) : Math.min(4, availableParallelism());
let cursor = 0, failed = 0;
const started = performance.now();
async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++];
    await new Promise(resolve => {
      const child = spawn(process.execPath, [file], { stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';
      child.stdout.on('data', data => output += data);
      child.stderr.on('data', data => output += data);
      child.on('error', error => output += error.stack);
      child.on('close', code => {
        if (code !== 0) { failed++; console.error(`FAIL ${file}\n${output}`); }
        else console.log(`PASS ${file}`);
        resolve();
      });
    });
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`${files.length - failed}/${files.length} suites passed in ${((performance.now() - started) / 1000).toFixed(1)}s (${concurrency} workers)`);
if (failed) process.exitCode = 1;
