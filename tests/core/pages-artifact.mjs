import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { resolve } from 'node:path';

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/stale-build-file.txt', 'obsolete');
execFileSync(process.execPath, ['scripts/build-pages.mjs'], { stdio: 'pipe' });
assert.equal(fs.existsSync('dist/stale-build-file.txt'), false, 'builds must remove stale output');
const index = fs.readFileSync('dist/index.html', 'utf8');
assert.equal(index, fs.readFileSync('index.html', 'utf8'), 'source and production entrypoints must be identical');
for (const match of index.matchAll(/(?:src|href)="(src\/[^"]+)"/g)) {
  assert.ok(fs.existsSync(resolve('dist', match[1])), `Missing deployed asset ${match[1]}`);
}
const scriptTags = [...index.matchAll(/<script\b([^>]+)>/g)];
assert.ok(scriptTags.every(match => /\bdefer\b/.test(match[1])), 'classic scripts should defer without losing order');
for (const name of ['.github', 'tests', 'scripts', 'node_modules', 'docs', 'package.json']) {
  assert.equal(fs.existsSync(`dist/${name}`), false, `Development content must not ship: ${name}`);
}
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deployed = JSON.parse(fs.readFileSync('dist/release.json', 'utf8'));
assert.equal(deployed.version, manifest.version);
assert.ok(fs.existsSync('dist/.nojekyll'));
console.log('Pages artifact: clean runtime-only output, identical entrypoint, valid paths and release version');
