import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {createPagesServer} from '../../scripts/serve.mjs';
const root=resolve(import.meta.dirname,'../..'),server=createPagesServer(resolve(root,'dist'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1536,height:1000},deviceScaleFactor:2}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/warfare-strategic-map-overlay.js',async route=>{await new Promise(r=>setTimeout(r,350));await route.continue()});
 await page.goto('http://127.0.0.1:'+server.address().port+'/WorldForge/');await page.waitForFunction(()=>WorldForgeLoader.ready);
 await page.waitForFunction(()=>document.querySelector('#worldforgeStrategicMapControls')?.closest('#atlasAdvancedControls'));
 await mkdir(resolve(root,'test-results'),{recursive:true});
 const report=await page.evaluate(()=>{
  const r=WorldForgeApp.state.renderer,s=r.world.settlements.find(s=>s.x>30&&s.x<120&&s.y>20&&s.y<70)||r.world.settlements[0];
  r.focusSettlement(s.id);r.camera.zoom=12;r.draw();
  const detail=r.terrainDetail;return{detail,stage:WorldForgeLivingSettlements.profile(r,s).stage};
 });
 assert.ok(report.detail.resolution>=report.detail.pixelsPerCell,'terrain texture must cover device pixels at close zoom');
 assert.ok(report.detail.tiles<100,'only visible tiles should render');
 await page.getByRole('button',{name:'Explore settlement',exact:true}).click();
 assert.ok(await page.evaluate(()=>WorldForgeApp.state.renderer.camera.zoom>=8));
 await page.screenshot({path:resolve(root,'test-results/hd-natural.jpg'),type:'jpeg',quality:85});
 // Isolated rendering fixtures, never exported or saved as a user world.
 for(let stage=0;stage<5;stage++){
  const observed=await page.evaluate(stage=>{
   const r=WorldForgeApp.state.renderer,s=r.world.settlements.find(s=>s.id===r.selectedSettlementId),known={};
   const gates=[[],['agriculture'],['masonry','bronze_working'],['ironworking','siege_engineering'],['public_sanitation','mechanical_engineering']];
   for(let i=0;i<=stage;i++)for(const id of gates[i])known[id]={year:0,adoption:1};
   r.world.technology.realms.find(t=>t.realmId===r.ownerOf(s)).known=known;r.historyView=null;
   r.popOf=()=>stage===0?100:stage===1?500:stage===2?1800:stage===3?5000:15000;
   r.draw();return WorldForgeLivingSettlements.profile(r,s).stage;
  },stage);
  assert.equal(observed,stage,'the rendered fixture must use the intended architectural stage');
  await page.screenshot({path:resolve(root,'test-results/hd-stage-'+stage+'.jpg'),type:'jpeg',quality:85});
 }
 assert.deepEqual(errors,[]);console.log('HD close zoom, DPR resolution, visible tile bounds and five settlement stages passed');
}finally{await browser.close();await new Promise(r=>server.close(r))}
