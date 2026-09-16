const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync('src/features/warfare/warfare-strategic-map-controls.js','utf8');
const lookup="let tip=$('#worldforgeStrategicTooltip');if(!tip){tip=document.createElement('div')";
assert.ok(source.includes(lookup),'strategic controls must reuse the document-level tooltip before creating one');
assert.equal((source.match(/tip\.id='worldforgeStrategicTooltip'/g)||[]).length,1,'tooltip should have one creation site');
console.log('strategic tooltip lifecycle guard OK');
