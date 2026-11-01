import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {createPagesServer} from '../../scripts/serve.mjs';

const root=resolve(import.meta.dirname,'../..'),server=createPagesServer(resolve(root,'dist'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1536,height:1000},deviceScaleFactor:2}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await mkdir(resolve(root,'test-results'),{recursive:true});
const url='http://127.0.0.1:'+server.address().port+'/WorldForge/';
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForFunction(()=>window.WorldForgeLoader?.ready);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 assert.equal(await page.evaluate(()=>WorldForgeApp.state.renderer.gpuActive),true,'the real WebGL shaders must compile and render');
 const report=await page.evaluate(()=>{
  const r=WorldForgeApp.state.renderer,T=WorldForgeTerrain;
  const fingerprint=WorldForgeEngine.fingerprint(r.world),s=r.world.settlements.find(s=>s.x>30&&s.x<120&&s.y>20&&s.y<70)||r.world.settlements[0];
  r.focusSettlement(s.id);r.camera.zoom=16;r.draw();
  const before={...r.gpu.stats},buffers=r.gpu.chunks.map(c=>c.vertices),times=[];
  const raster=T.build;T.build=()=>{throw new Error('GPU zoom attempted CPU terrain rasterization')};
  try{
   for(let i=0;i<24;i++){r.camera.zoom=16+i;r.camera.x+=.00002;const t=performance.now();r.draw();times.push(performance.now()-t)}
  }finally{T.build=raster}
  const gl=r.gpu.gl,pixels=new Uint8Array(r.gpu.canvas.width*r.gpu.canvas.height*4);r.draw();gl.readPixels(0,0,r.gpu.canvas.width,r.gpu.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const colors=new Set();for(let i=0;i<pixels.length;i+=256)colors.add((pixels[i]>>3)+','+(pixels[i+1]>>3)+','+(pixels[i+2]>>3));
  return{before,after:{...r.gpu.stats},sameBuffers:buffers.every((b,i)=>b===r.gpu.chunks[i].vertices),times,colors:colors.size,error:gl.getError(),fingerprintUnchanged:WorldForgeEngine.fingerprint(r.world)===fingerprint};
 });
 assert.equal(report.after.meshBuilds,report.before.meshBuilds,'zoom must retain the uploaded terrain mesh');
 assert.equal(report.after.textureUploads,report.before.textureUploads,'zoom must retain the uploaded world textures');
 assert.equal(report.after.modelBuilds,report.before.modelBuilds,'zoom must retain cached building geometry');
 assert.ok(report.sameBuffers&&report.fingerprintUnchanged);
 assert.equal(report.error,0,'WebGL must not report GL errors');assert.ok(report.colors>60,'GPU pixels must contain shaded terrain and models');
 await page.screenshot({path:resolve(root,'test-results/webgl-close.jpg'),type:'jpeg',quality:90});
 const burst=await page.evaluate(async()=>{
  const r=WorldForgeApp.state.renderer,rect=r.canvas.getBoundingClientRect(),before=r.gpu.stats.frames;
  for(let i=0;i<40;i++)r.canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:i%2?5:-5,clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2,cancelable:true}));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  return r.gpu.stats.frames-before;
 });
 assert.ok(burst<=3,'input bursts must coalesce into animation frames');
 await page.evaluate(()=>{const r=WorldForgeApp.state.renderer;r.camera.x=.999;r.camera.zoom=1;r.setProjection('flat');r.setMode('political');r.draw()});
 assert.equal(await page.evaluate(()=>WorldForgeApp.state.renderer.gpu.gl.getError()),0,'wrapped flat analytical views must use valid GPU state');
 // Context loss is common after backgrounding Safari. Verify a working fallback
 // and rebuild on restoration, not a permanently blank or frozen map.
 await page.evaluate(()=>{const r=WorldForgeApp.state.renderer;r.camera.zoom=1;window.__testContextLoss=r.gpu.gl.getExtension('WEBGL_lose_context');window.__testContextLoss.loseContext()});
 await page.waitForFunction(()=>{const r=WorldForgeApp.state.renderer;return r.gpu.lost&&!r.gpuActive});
 assert.equal(await page.locator('#worldCanvas').getAttribute('data-renderer'),'canvas2d');
 await page.evaluate(()=>window.__testContextLoss.restoreContext());
 await page.waitForFunction(()=>{const r=WorldForgeApp.state.renderer;return !r.gpu.lost&&r.gpuActive});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{WorldForgeMapExperience.focusMap(true);WorldForgeApp.state.renderer.center()});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 assert.equal(await page.locator('#worldCanvas').getAttribute('data-renderer'),'webgl');
 assert.ok(await page.evaluate(()=>{const r=WorldForgeApp.state.renderer;return r.canvas.width===r.gpu.canvas.width&&r.canvas.height===r.gpu.canvas.height}));
 await page.screenshot({path:resolve(root,'test-results/webgl-mobile.jpg'),type:'jpeg',quality:85});
 const fallback=await browser.newPage({viewport:{width:1100,height:800}});
 await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
 await fallback.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await fallback.waitForFunction(()=>window.WorldForgeLoader?.ready);
 assert.equal(await fallback.locator('#worldCanvas').getAttribute('data-renderer'),'canvas2d');
 await fallback.close();assert.deepEqual(errors,[]);
 await writeFile(resolve(root,'test-results/webgl-performance.json'),JSON.stringify(report,null,2));
 console.log('WebGL: real shaders and pixels, stable GPU buffers, zero zoom uploads, frame coalescing, context recovery, mobile DPR and unavailable-GPU fallback passed');
 console.log(JSON.stringify({cpuDrawMs:report.times,meshBuilds:report.after.meshBuilds,textureUploads:report.after.textureUploads,colors:report.colors}));
}catch(error){
 await writeFile(resolve(root,'test-results/webgl-errors.json'),JSON.stringify({error:error.stack,errors,gpu:await page.evaluate(()=>({error:WorldForgeApp?.state?.renderer?.gpuFailure,detail:WorldForgeApp?.state?.renderer?.terrainDetail})).catch(()=>null)},null,2));
 await page.screenshot({path:resolve(root,'test-results/webgl-failure.jpg'),type:'jpeg',quality:75,timeout:5000}).catch(()=>{});throw error;
}finally{await browser.close();await new Promise(r=>server.close(r))}
