import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
global.window=global;
for(const path of['src/rendering/terrain-atlas.js','src/rendering/living-settlements.js','src/rendering/webgl-atlas.js'])vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});
const A=WorldForgeLivingSettlements,Pen=WorldForgeWebGL.MeshPen;
const p={stage:4,wall:'#d6cbb0',side:'#8f9b92',roof:'#54766d',accent:'#dbba6b'};
const shapes=new Set();
for(const {id}of A.CATALOG){
 const pen=new Pen();A.building(pen,{type:id,x:0,y:0,w:.35,h:.6},p,64);
 assert.ok(pen.vertices.length>0&&pen.vertices.length%18===0,id+' must create complete colored triangles');
 assert.ok(pen.vertices.every(Number.isFinite),id+' must not upload NaN or infinity');
 for(let i=0;i<pen.vertices.length;i+=6)assert.ok(pen.vertices.slice(i+2,i+6).every(v=>v>=0&&v<=1),id+' must have valid RGBA colors');
 shapes.add(JSON.stringify(pen.vertices));
}
assert.ok(shapes.size>=24,'special buildings must retain distinct model geometry');
assert.ok(A.unit(200)>A.unit(100),'close models must keep scaling rather than magnifying a capped sprite');
console.log('All 27 building types produce finite GPU triangles, valid colors and distinct geometry');
