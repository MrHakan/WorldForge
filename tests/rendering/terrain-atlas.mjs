import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

global.window=global;
const drawing=new Proxy({}, {get(target,key){if(key in target)return target[key];return()=>{}},set(target,key,value){target[key]=value;return true}});
global.document={createElement(){return{width:0,height:0,getContext:()=>drawing}}};
for(const path of['src/core/engine.js','src/rendering/terrain-atlas.js','src/core/renderer.js'])vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});
const T=WorldForgeTerrain,E=WorldForgeEngine;
assert.equal(T.sample([0,10,20,30],2,2,.5,.5),15,'bilinear samples should interpolate across both axes');
assert.equal(T.sample([0,10,20,30],2,2,-.5,0),5,'the horizontal world seam should wrap');
assert.deepEqual(T.color('rgb(34,67,91)'),[34,67,91],'analysis layers must preserve their RGB colors');
const world=E.generateWorld({seed:'ATLAS-GEOMETRY-52',width:120,height:70,seaLevel:.53,age:'mature',settlementTarget:20,kingdomTarget:4});
const renderer=Object.create(WorldRenderer.prototype);
Object.assign(renderer,{world,historyView:null,mode:'terrain',projection:'relief',camera:{x:.5,y:.5,zoom:1},canvas:{width:1000,height:680},dpr:1});
const before=E.fingerprint(world);
for(const projection of['relief','flat']){
  renderer.projection=projection;
  for(const settlement of world.settlements.slice(0,15)){
    const x=settlement.x+.5,y=settlement.y+.5,p=renderer.worldToScreen(x,y),back=renderer.screenToWorld(p.x,p.y);
    assert.ok(back,'visible map coordinates should be pickable');
    const dx=Math.min(Math.abs(back.x-x),world.settings.width-Math.abs(back.x-x));
    assert.ok(dx<.01&&Math.abs(back.y-y)<.18,'rendering and picking must use the same displaced surface');
  }
}
renderer.projection='relief';
const first=T.build(renderer);
renderer.camera.x=.53;renderer.camera.zoom=1;
assert.equal(T.build(renderer),first,'camera changes must reuse the cached terrain surface');
renderer.historyView={year:100};
assert.equal(T.build(renderer),first,'natural terrain should be reused across historical views');
renderer.projection='flat';
assert.notEqual(T.build(renderer).canvas,first.canvas,'flat and 2.5D views need separate surface geometry');
renderer.projection='relief';
assert.equal(T.build(renderer),first,'switching back should reuse the relief surface');
assert.equal(E.fingerprint(world),before,'map rendering must not alter the simulation or its deterministic fingerprint');
const settlement=world.settlements[0];
world.cities={cities:[{id:0,settlementId:settlement.id}]};
assert.deepEqual(T.settlementPosition(world,0),{x:settlement.x+.5,y:settlement.y+.5},'city zero must use its real settlement coordinates');
assert.equal(T.settlementPosition(world,99999),null,'missing coordinates must not invent a circular layout');
console.log('Terrain projection, inverse picking, caching, RGB analysis and settlement alignment passed');
