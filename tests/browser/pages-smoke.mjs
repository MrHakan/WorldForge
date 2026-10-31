import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createPagesServer } from '../../scripts/serve.mjs';

const root = resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const server = createPagesServer(resolve(root, 'dist'));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/WorldForge/`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(10000);
const errors = [], failedRequests = [];
page.on('pageerror', error => errors.push(error.stack));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
try {
  await page.goto(url);
  await page.waitForFunction(() => window.WorldForgeLoader?.ready, null, { timeout: 45000 });
  assert.ok((await page.title()).endsWith(`WorldForge v${version}`));
  assert.ok((await page.locator('.version-pill').textContent()).includes(version));
  assert.equal(await page.evaluate(() => WorldForgeApp.state.world.history.currentYear), 0);
  // Every displayed page must reveal real content, including nested worldbuilding sections.
  const categories = await page.evaluate(() => WorldForgeWorkspaceNavigation.categories.map(category => category.id));
  for (const category of categories) {
    console.log('Navigate',category);
    await page.locator(`[data-workspace-tab="${category}"]`).click();
    const pages = await page.locator('#workspaceSubtabs [data-workspace-page]').evaluateAll(buttons => buttons.map(button => button.dataset.workspacePage));
    for (const workspacePage of pages) {
      await page.locator(`#workspaceSubtabs [data-workspace-page="${workspacePage}"]`).click();
      assert.ok(await page.evaluate(({ category, workspacePage }) => [...document.querySelectorAll('[data-workspace-category]')].some(panel => panel.dataset.workspaceCategory === category && panel.dataset.workspacePage === workspacePage && !panel.closest('[hidden]')), { category, workspacePage }), `${category}/${workspacePage} must reveal content`);
    }
  }
  await page.locator('[data-workspace-tab="overview"]').click();
  await page.locator('#workspaceSubtabs [data-workspace-page="chronicle"]').click();
  console.log('Advance, save and cancel');
  await page.locator('[data-years="1"]').click();
  await page.waitForFunction(() => WorldForgeApp.state.world.history.currentYear === 1 && !WorldForgeEndlessUI.state.running);
  await page.locator('#saveBtn').click();
  assert.ok(await page.evaluate(() => localStorage.getItem('worldforge-main')));
  const saved = await page.evaluate(() => WorldForgeEngine.serialize(WorldForgeApp.state.world));
  await page.locator('#workspaceSubtabs [data-workspace-page="continuity"]').click();
  await page.locator('[data-endless-years]').first().click();
  await page.waitForFunction(() => WorldForgeEndlessUI.state.running);
  await page.locator('#endlessCancel').click();
  await page.waitForFunction(() => !WorldForgeEndlessUI.state.running);
  assert.ok(await page.evaluate(() => WorldForgeApp.state.world.history.currentYear < 1000));
  console.log('Replace and import');
  // Forge while another job is waiting to resume: its completion must not repaint the new world.
  await page.locator('#workspaceSubtabs [data-workspace-page="generator"]').click();
  await page.evaluate(() => {
    void WorldForgeEndlessUI.runAsync(10000);
    if(!WorldForgeEndless.isRunning(WorldForgeApp.state.world))throw new Error('Expected an active job');
    document.querySelector('#seedInput').value='PAGES-REPLACEMENT-51';
    document.querySelector('#generateBtn').click();
  });
  await page.waitForFunction(() => WorldForgeApp.state.world.settings.seed === 'PAGES-REPLACEMENT-51');
  assert.equal(await page.evaluate(() => WorldForgeApp.state.world.history.currentYear), 0);
  await page.locator('#importInput').setInputFiles({ name: 'world.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
  await page.waitForFunction(() => WorldForgeApp.state.world.history.currentYear === 1);
  assert.equal(await page.evaluate(() => WorldForgeEndless.isRunning(WorldForgeApp.state.world)), false);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  // An expected storage failure is reported to the user, not as an uncaught exception.
  const errorCount = errors.length;
  await page.locator('#saveBtn').click();
  await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('Export World'));
  assert.ok(errors.slice(errorCount).every(error=>/QuotaExceededError|Full/.test(error)), 'only the expected storage failure may be reported');
  errors.splice(errorCount);
  console.log('Mobile layout');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile workspace must not overflow horizontally');
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.ok((await page.locator('.version-pill').textContent()).includes(version));
  assert.ok((await page.locator('footer span').first().textContent()).includes(version));
  assert.ok(await page.locator('#generateBtn').isVisible(), 'active mobile panel must contain its controls');
  await page.screenshot({ path: resolve(root, 'test-results/mobile.png'), fullPage: false });
  assert.ok((await page.title()).endsWith(`WorldForge v${version}`), 'background feature renders must preserve release metadata');
  assert.deepEqual(failedRequests, [], 'all runtime assets must load under /WorldForge/');
  assert.deepEqual(errors, [], 'browser console must be clean');
  console.log('Pages browser smoke passed: navigation, simulation, cancellation, replacement, import, storage and mobile layout');
} catch (error) {
  await mkdir(resolve(root, 'test-results'), { recursive: true });
  console.error('Browser check failed:',error.stack);
  await writeFile(resolve(root, 'test-results/errors.json'), JSON.stringify({ errors, failedRequests, failure:error.stack }, null, 2));
  await page.screenshot({ path: resolve(root, 'test-results/failure.png'), fullPage: false,timeout:5000 }).catch(()=>{});
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
