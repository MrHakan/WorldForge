import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
vm.runInThisContext(fs.readFileSync('engine.js','utf8'),{filename:'engine.js'});
const E=global.WorldForgeEngine;
assert.ok(E,'WorldForgeEngine must be exposed');

const options={seed:'EMBER-CROWN-01',width:160,height:90,seaLevel:.53,age:'mature',settlementTarget:45,kingdomTarget:7};
const a=E.generateWorld(options),b=E.generateWorld(options);
assert.deepEqual(E.validateWorld(a),[],'generated world must satisfy v0.1 state contract');
assert.equal(E.fingerprint(a),E.fingerprint(b),'same seed/settings must generate same world');
assert.equal(a.layers.elevation.length,160*90);
assert.equal(a.layers.biome.length,160*90);
assert.ok(a.summary.landPercent>15&&a.summary.landPercent<85,'land percentage should be plausible');
assert.ok(a.rivers.length>=3,'world should contain river systems');
assert.ok(a.settlements.length>=30,'world should place a useful settlement set');
assert.equal(a.kingdoms.length,7,'requested kingdoms should be generated');
assert.ok(a.roads.length>10,'road graph should connect settlements');
assert.ok(a.kingdoms.every(k=>a.settlements[k.capitalId].capital),'every kingdom must reference a capital');
assert.ok(a.settlements.every(s=>Number.isInteger(s.kingdomId)&&s.kingdomId>=0),'every settlement must belong to a kingdom');
assert.ok(a.kingdoms.reduce((n,k)=>n+k.settlementIds.length,0)===a.settlements.length,'kingdom membership must cover settlements exactly');

const raw=E.serialize(a),restored=E.deserialize(raw);
assert.deepEqual(E.validateWorld(restored),[],'serialized world must restore cleanly');
assert.equal(E.fingerprint(restored),E.fingerprint(a),'save/export round-trip must preserve world identity');
assert.equal(restored.layers.elevation.constructor.name,'Float32Array');
assert.equal(restored.layers.political.constructor.name,'Int16Array');

const changed=E.generateWorld({...options,seed:'OTHER-SEED'});
assert.notEqual(E.fingerprint(changed),E.fingerprint(a),'different seeds should produce different worlds');

console.log('WorldForge v0.1 deterministic world-generation tests passed.');
console.log(JSON.stringify({fingerprint:E.fingerprint(a),name:a.name,land:a.summary.landPercent,rivers:a.rivers.length,settlements:a.settlements.length,kingdoms:a.kingdoms.length,roads:a.roads.length}));