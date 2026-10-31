import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version, name } = require('../src/app/release-info.js');
const { GITHUB_REPOSITORY: repository, GITHUB_SHA: sha, GITHUB_TOKEN: token, GITHUB_REF: ref } = process.env;
if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[a-f0-9]{40}$/.test(sha || '') || !token || ref !== 'refs/heads/main') {
  throw new Error('Release requires a validated main-branch Actions environment');
}
const tag = `v${version}`;
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
const endpoint = `https://api.github.com/repos/${repository}/releases`;
const existing = await fetch(`${endpoint}/tags/${encodeURIComponent(tag)}`, { headers });
if (existing.ok) {
  console.log(`Release ${tag} already exists; preserving its tag and notes.`);
} else {
  if (existing.status !== 404) throw new Error(`Release lookup failed: HTTP ${existing.status}`);
  const notes = await readFile(new URL(`../docs/releases/V${version.split('.').slice(0, 2).join('.')}.md`, import.meta.url), 'utf8');
  const response = await fetch(endpoint, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_name: tag, target_commitish: sha, name: `${tag} — ${name}`, body: notes, draft: false, prerelease: false, make_latest: 'true' })
  });
  if (!response.ok) throw new Error(`Release creation failed: HTTP ${response.status} ${await response.text()}`);
  console.log((await response.json()).html_url);
}
