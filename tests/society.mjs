import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
vm.runInThisContext(fs.readFileSync('engine.js','utf8'),{filename:'engine.js'});
vm.runInThisContext(fs.readFileSync('history-engine.js','utf8'),{filename:'history-engine.js'});
vm.runInThisContext(fs.readFileSync('society-engine.js','utf8'),{filename:'society-engine.js'});
const E=global.WorldForgeEngine,H=global.WorldForgeHistory,S=global.WorldForgeSociety;
assert.ok(E&&H&&S,'core, history and society engines must be exposed');

const options={seed:'EMBER-CROWN-01',width:160,height:90,seaLevel:.53,age:'mature',settlementTarget:45,kingdomTarget:7};
const make=()=>{const w=E.generateWorld(options);H.initialize(w);S.initialize(w);return w};
const a=make();
assert.deepEqual(S.validateSociety(a),[],'Year 0 society must satisfy the v0.3 contract');
const s0=S.currentView(a);
assert.ok(s0.stats.livingNotables>=80&&s0.stats.livingNotables<=220,'useful bounded notable population');
assert.equal(s0.titles.filter(t=>t.active).length,a.history.current.realmState.filter(Boolean).filter(r=>r.active).length,'every active realm begins with a title');
assert.ok(s0.titles.every(t=>!t.active||Number.isInteger(t.holderId)),'active titles need holders');
assert.ok(a.society.people.some(p=>p.friendIds.length),'initial friendship network should exist');
assert.ok(a.society.people.some(p=>p.rivalIds.length),'initial rivalry network should exist');
assert.ok(a.society.people.filter(p=>p.spouseId!=null).every(p=>a.society.people[p.spouseId]?.spouseId===p.id),'spouses must be reciprocal');

const b=make();
S.simulateYears(a,300);
S.simulateYears(b,100);S.simulateYears(b,75);S.simulateYears(b,125);
assert.equal(a.history.currentYear,300);
assert.equal(a.society.currentYear,300);
assert.deepEqual(S.validateSociety(a),[],'300-year society must remain structurally valid');
assert.equal(S.societyFingerprint(a),S.societyFingerprint(b),'society simulation must be chunk-independent deterministic');
assert.equal(H.historyFingerprint(a),H.historyFingerprint(b),'society feedback into history must also be chunk-independent');
assert.ok(a.society.stats.births>0,'dynastic/notable births should occur');
assert.ok(a.society.stats.deaths>0,'notable deaths should occur');
assert.ok(a.society.stats.marriages>0,'marriages should occur');
assert.ok(a.society.stats.successions>0,'title succession should occur over a long run');
assert.ok(a.history.events.some(e=>Array.isArray(e.personIds)&&e.personIds.length),'history events should be linked to named people');
assert.ok(a.history.events.some(e=>e.type==='succession'),'chronicle should record successions');
assert.ok(a.society.snapshots.length>20,'society timeline snapshots should accumulate');
assert.ok(a.society.snapshots.length<100,'snapshot cadence should remain compact for 300 years');

const historic=S.viewAt(a,100);
assert.ok(historic.year<=100,'historical society view must resolve at/before requested year');
assert.ok(historic.living.length>0,'historical society snapshot should contain living notables');
const focus=S.currentView(a).titles.find(t=>t.active)?.holderId ?? S.currentView(a).living[0]?.id;
const family=S.familyGraph(a,focus,300);
assert.ok(family&&family.people.some(p=>p.relation==='Self'),'family graph must include selected person');

const raw=E.serialize(a),restored=E.deserialize(raw);H.initialize(restored);S.initialize(restored);
assert.deepEqual(S.validateSociety(restored),[],'save/export round-trip must preserve society');
assert.equal(S.societyFingerprint(restored),S.societyFingerprint(a),'save/export must preserve society identity');

console.log('WorldForge v0.3 deterministic society tests passed.');
console.log(JSON.stringify({year:a.society.currentYear,people:a.society.people.length,living:S.currentView(a).stats.livingNotables,houses:a.society.houses.length,titles:a.society.titles.length,births:a.society.stats.births,deaths:a.society.stats.deaths,marriages:a.society.stats.marriages,successions:a.society.stats.successions,crises:a.society.stats.successionCrises,fingerprint:S.societyFingerprint(a)}));