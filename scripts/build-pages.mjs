import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'dist');
const require = createRequire(import.meta.url);
const { version, name } = require('../src/app/release-info.js');
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (manifest.version !== version) throw new Error('Package and browser release versions disagree');
const index = await readFile(resolve(root, 'index.html'), 'utf8');
// The source entrypoint is also the deployed entrypoint. No CI-only script injection.
if (!index.includes('src/features/workforce/workforce-loader.js')) throw new Error('Incomplete runtime entrypoint');
if (relative(root, destination) !== 'dist') throw new Error('Build destination must be the repository dist directory');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'src'), resolve(destination, 'src'), { recursive: true });
for (const path of ['index.html', 'LICENSE']) await cp(resolve(root, path), resolve(destination, path));
await writeFile(resolve(destination, '.nojekyll'), '');
await writeFile(resolve(destination, 'release.json'), JSON.stringify({ version, name }) + '\n');
console.log(`Built WorldForge v${version} in ${destination}`);
