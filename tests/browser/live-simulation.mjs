import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {createPagesServer} from '../../scripts/serve.mjs';
const root=resolve(import.meta.dirname,'../..'),server=createPagesServer(resolve(root,'dist'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.setDefaultTimeout(45000);page.on('pageerror',e=>errors.push(e.message));
await mkdir(resolve(root,'test-results'),{recursive:true});
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/WorldForge/',{waitUntil:'domcontentloaded',timeout:45000});await page.waitForFunction(()=>window.WorldForgeLoader?.ready);
 // Compare the worker's complete feature stack with the actual browser stack.
 const parity=await page.evaluate(async()=>{
  const app=WorldForgeApp,r=app.state.renderer,X=WorldForgeEndless,E=WorldForgeEngine;
  const baseline=E.deserialize(E.serialize(app.state.world)),checks=w=>[WorldForgeHistory.historyFingerprint(w),WorldForgeSociety.societyFingerprint(w),WorldForgeTechnology.fingerprint(w),WorldForgeWorkforce.fingerprint(w),WorldForgeWorldOrder.fingerprint(w),WorldForgeMilitary.fingerprint(w)];
  X.simulateYears(baseline,12);const layers=r.world.layers,builds=r.gpu?.stats.meshBuilds;
  await WorldForgeEndlessUI.runAsync(12);
  const differences=[];const compare=(a,b,path)=>{if(differences.length>=40)return;if(a===null||b===null||typeof a!=='object'||typeof b!=='object'){if(!Object.is(a,b))differences.push({path,expected:a,actual:b});return}for(const key of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[key],b[key],path+'.'+key)};
  const expected=checks(baseline),actual=checks(app.state.world);compare(baseline.workforce,app.state.world.workforce,'workforce');
  return{expected,actual,differences,backend:WorldForgeRuntime.stats.backend,error:WorldForgeRuntime.stats.lastError,geometryStable:r.world.layers===layers,builds,afterBuilds:r.gpu?.stats.meshBuilds};
 });
 await writeFile(resolve(root,'test-results/live-parity.json'),JSON.stringify(parity,null,2));
 assert.equal(parity.backend,'worker',JSON.stringify(parity));assert.deepEqual(parity.actual,parity.expected,'worker and browser simulation must stay deterministic across all systems');assert.ok(parity.geometryStable);assert.equal(parity.afterBuilds,parity.builds);
 await page.evaluate(()=>{document.querySelector('#playBtn').click()});
 await page.waitForFunction(()=>WorldForgeApp.state.world.history.currentYear>=22&&WorldForgeApp.state.playing);
 await page.evaluate(()=>WorldForgeApp.stopPlay());await page.waitForFunction(()=>!WorldForgeEndlessUI.state.running);
 await page.evaluate(()=>{
  window.__live={beats:0,commits:0,stale:0,maxGapMs:0};let last=performance.now();window.__beat=setInterval(()=>{const now=performance.now();__live.maxGapMs=Math.max(__live.maxGapMs,now-last);last=now;__live.beats++},10);
  window.addEventListener('worldforge:state-commit',()=>{__live.commits++;const text=document.querySelector('#currentYear').textContent;const view=WorldForgeHistory.currentView(WorldForgeApp.state.world),population=document.querySelector('#historyPopulation').textContent.replace(/\D/g,'');if(!text.includes(String(view.year))||population!==String(Math.round(view.metrics.population)))__live.stale++});
  void WorldForgeEndlessUI.runAsync(10000);
 });
 await page.waitForFunction(()=>__live.commits>=2&&WorldForgeApp.state.world.history.currentYear>=200&&WorldForgeEndlessUI.state.running,null,{timeout:240000});
 assert.ok(await page.evaluate(()=>__live.beats>10),'the main thread must keep responding during long runs');
 assert.ok(await page.evaluate(()=>__live.maxGapMs<500),'long runs must not create half-second main-thread stalls');
 assert.equal(await page.evaluate(()=>__live.stale),0,'displayed data must update during the job, not only after it ends');
 await page.evaluate(()=>{const r=WorldForgeApp.state.renderer;r.camera.zoom=8;r.requestDraw();WorldForgeEndless.cancel(r.world)});
 await page.waitForFunction(()=>!WorldForgeEndlessUI.state.running);
 assert.equal(await page.evaluate(()=>WorldForgeEndless.isRunning(WorldForgeApp.state.world)),false);
 const report=await page.evaluate(()=>{clearInterval(__beat);return{...__live,runtime:WorldForgeRuntime.stats,year:WorldForgeEndless.absoluteYear(WorldForgeApp.state.world)}});
 // Superseded worker replies must never replace a newly forged/imported world.
 await page.evaluate(()=>{void WorldForgeEndlessUI.runAsync(10000);document.querySelector('#seedInput').value='LIVE-REPLACEMENT-55';WorldForgeApp.forge()});
 await page.waitForFunction(()=>WorldForgeApp.state.world.settings.seed==='LIVE-REPLACEMENT-55');
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>WorldForgeApp.state.world.history.currentYear),0);
 const fallback=await browser.newPage();await fallback.addInitScript(()=>{window.Worker=undefined});
 await fallback.goto('http://127.0.0.1:'+server.address().port+'/WorldForge/',{waitUntil:'domcontentloaded',timeout:45000});await fallback.waitForFunction(()=>window.WorldForgeLoader?.ready);
 await fallback.evaluate(()=>WorldForgeEndlessUI.runAsync(1));assert.equal(await fallback.evaluate(()=>WorldForgeApp.state.world.history.currentYear),1);await fallback.close();
 assert.deepEqual(errors,[]);await writeFile(resolve(root,'test-results/live-simulation.json'),JSON.stringify({parity,report},null,2));
 console.log('Live simulation: full-stack worker parity, responsive input, intermediate data refresh, stable GPU geometry, cancellation, replacement and cooperative fallback passed');
}catch(error){await writeFile(resolve(root,'test-results/live-simulation-errors.json'),JSON.stringify({error:error.stack,errors,runtime:await page.evaluate(()=>({stats:window.WorldForgeRuntime?.stats,live:window.__live,year:window.WorldForgeApp?.state.world?.history.currentYear,running:window.WorldForgeEndlessUI?.state.running})).catch(()=>null)},null,2));throw error}
finally{await browser.close();await new Promise(r=>server.close(r))}
