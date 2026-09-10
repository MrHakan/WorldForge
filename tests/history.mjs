import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
vm.runInThisContext(fs.readFileSync('engine.js','utf8'),{filename:'engine.js'});
vm.runInThisContext(fs.readFileSync('history-engine.js','utf8'),{filename:'history-engine.js'});
const E=global.WorldForgeEngine,H=global.WorldForgeHistory;
assert.ok(E&&H,'WorldForge core and history engines must be exposed');

const options={seed:'EMBER-CROWN-01',width:160,height:90,seaLevel:.53,age:'mature',settlementTarget:45,kingdomTarget:7};
const direct=E.generateWorld(options),chunked=E.generateWorld(options);
H.initialize(direct);H.initialize(chunked);
assert.deepEqual(H.validateHistory(direct),[],'Year 0 history state must validate');
assert.equal(direct.history.currentYear,0);
assert.equal(direct.history.snapshots[0].year,0);

H.simulateYears(direct,300);
H.simulateYears(chunked,100);
H.simulateYears(chunked,75);
H.simulateYears(chunked,125);
assert.equal(direct.history.currentYear,300);
assert.equal(chunked.history.currentYear,300);
assert.equal(H.historyFingerprint(direct),H.historyFingerprint(chunked),'history must be deterministic independent of simulation chunk size');
assert.deepEqual(H.validateHistory(direct),[],'simulated history must satisfy v0.2 state contract');
assert.ok(direct.history.snapshots.length>=61,'five-year replay snapshots should be retained');
assert.equal(direct.history.snapshots.at(-1).year,300,'latest snapshot must match present year');
assert.ok(direct.history.events.length>=13,'chronicle should include founding and periodic era records');

const founding=H.viewAt(direct,0),year75=H.viewAt(direct,77),present=H.currentView(direct);
assert.equal(founding.year,0);
assert.ok(year75.year<=77&&year75.year>=70,'timeline lookup should resolve to nearest saved snapshot');
assert.equal(present.year,300);
assert.equal(present.settlementPopulation.length,direct.settlements.length);
assert.equal(present.political.length,direct.settings.width*direct.settings.height);
assert.ok(present.metrics.population>0&&present.metrics.trade>0,'history metrics must be populated');
assert.ok(present.realms.some(r=>r.active),'at least one realm must survive');
assert.ok(present.tradeVolumes.length===direct.roads.length,'road trade state must cover the road graph');

const series=H.metricsSeries(direct);
assert.equal(series[0].year,0);
assert.equal(series.at(-1).year,300);
assert.ok(series.every((p,i)=>i===0||p.year>=series[i-1].year),'metric series must be chronological');

const encoded=H.rleEncode([0,0,0,1,1,-1,-1,2]),decoded=H.rleDecode(encoded,8);
assert.deepEqual(Array.from(decoded),[0,0,0,1,1,-1,-1,2],'political RLE must round-trip');

const raw=E.serialize(direct),restored=E.deserialize(raw);
assert.equal(restored.history.currentYear,300,'save/export must preserve history year');
assert.deepEqual(H.validateHistory(restored),[],'history must survive core serialize/deserialize');
assert.equal(H.historyFingerprint(restored),H.historyFingerprint(direct),'history fingerprint must survive round-trip');

const toYear=E.generateWorld({...options,seed:'HISTORY-TARGET'});H.simulateTo(toYear,125);assert.equal(toYear.history.currentYear,125,'simulateTo must reach requested year');
console.log('WorldForge v0.2 history regression tests passed.');
console.log(JSON.stringify({year:direct.history.currentYear,fingerprint:H.historyFingerprint(direct),events:direct.history.events.length,wars:direct.history.wars.length,realms:direct.history.realms.length,snapshots:direct.history.snapshots.length,population:present.metrics.population,trade:present.metrics.trade}));