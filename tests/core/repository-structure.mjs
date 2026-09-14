import fs from 'node:fs';
import assert from 'node:assert/strict';

const exists = path => fs.existsSync(path);
const required = [
  'src/app/app.js',
  'src/app/workspace-navigation.js',
  'src/core/engine.js',
  'src/core/history-engine.js',
  'src/core/society-engine.js',
  'src/core/renderer.js',
  'src/features/city/city-engine.js',
  'src/features/city/city-ui.js',
  'src/features/warfare/warfare-hooks.js',
  'src/features/worldbuilding/worldbuilding-loader.js',
  'src/rendering/structure-archetypes.js',
  'src/styles/styles.css',
  'tests/core/worldgen.mjs',
  'tests/features/worldbuilding.mjs',
  'tests/warfare/warfare-hook-registry.test.js'
 ];
for (const path of required) assert.ok(exists(path), `Missing expected repository path: ${path}`);

const rootRuntimeFiles = fs.readdirSync('.').filter(path => /\.(?:js|css)$/.test(path));
assert.deepEqual(rootRuntimeFiles, [], 'Runtime JavaScript/CSS should live below src/');

const index = fs.readFileSync('index.html', 'utf8');
for (const path of [
  'src/styles/styles.css',
  'src/core/styles/history.css',
  'src/core/styles/society.css',
  'src/app/workspace-navigation.js',
  'src/app/app.js'
 ]) {
  assert.ok(index.includes(path), `index.html is missing the reorganized path: ${path}`);
}
assert.ok(!index.includes('src="engine.js"'), 'index.html still references the legacy root engine path');
assert.ok(!index.includes('href="styles.css"'), 'index.html still references the legacy root stylesheet path');

console.log('repository structure contract OK');
