import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
for(const f of ['engine.js','history-engine.js','society-engine.js','city-engine.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const E=global.WorldForgeEngine,H=global.WorldForgeHistory,S=global.WorldForgeSociety,C=global.WorldForgeCity;
assert.ok(E&&H&&S&&C,'core, history, society and city engines must be exposed');

const options={seed:'EMBER-CROWN-01',width:160,height:90,seaLevel:.53,age:'mature',settlementTarget:45,kingdomTarget:7};
const make=()=>{const w=E.generateWorld(options);H.initialize(w);S.initialize(w);C.initialize(w);return w};
const a=make(),b=make();
assert.deepEqual(C.validateCities(a),[],'Year 0 city state must satisfy the v0.4 contract');
assert.equal(a.cities.cities.length,a.settlements.length,'every settlement must receive a city/locality model');
assert.ok(a.cities.cities.some(c=>c.districts.length>=8),'major cities should have detailed district layouts');
assert.ok(a.cities.cities.every(c=>c.roads.length>=Math.max(1,c.districts.length-1)),'district graph should be connected through road edges');
assert.ok(a.cities.cities.reduce((n,c)=>n+c.businesses.length,0)>100,'world should contain a useful business layer');
assert.ok(a.cities.gangs.length>0,'urban centers should seed organized-crime factions');
assert.ok(a.cities.gangs.every(g=>g.leaderId==null||a.society.people[g.leaderId]),'gang leaders must reference society people');
assert.ok(a.cities.cities.some(c=>c.officials.magistrateId!=null),'cities should reference named civic officials');

C.simulateYears(a,300);
C.simulateYears(b,100);C.simulateYears(b,75);C.simulateYears(b,125);
assert.equal(a.history.currentYear,300);
assert.equal(a.society.currentYear,300);
assert.equal(a.cities.currentYear,300);
assert.deepEqual(H.validateHistory(a),[],'history remains valid under integrated city simulation');
assert.deepEqual(S.validateSociety(a),[],'society remains valid under integrated city simulation');
assert.deepEqual(C.validateCities(a),[],'300-year city simulation must remain structurally valid');
assert.equal(H.historyFingerprint(a),H.historyFingerprint(b),'city orchestration must preserve deterministic history');
assert.equal(S.societyFingerprint(a),S.societyFingerprint(b),'city orchestration must preserve deterministic society');
assert.equal(C.cityFingerprint(a),C.cityFingerprint(b),'city simulation must be chunk-independent deterministic');
assert.ok(a.cities.stats.crimeEvents>0,'long run should create recorded crime activity');
assert.ok(a.cities.stats.crackdowns>0,'city watches should conduct crackdowns over a long run');
assert.ok(a.cities.stats.gangWars>0,'competing gangs should generate turf wars over a long run');
assert.ok(a.history.events.some(e=>['smuggling','extortion','gang_war','crackdown'].includes(e.type)),'city events must enter the shared world chronicle');
assert.ok(a.history.events.some(e=>['smuggling','extortion','gang_war','crackdown'].includes(e.type)&&Array.isArray(e.personIds)&&e.personIds.length),'crime events should reference named society figures');
assert.ok(a.cities.snapshots.length>20&&a.cities.snapshots.length<100,'city history snapshots should remain compact');

const historic=C.viewAt(a,100);
assert.ok(historic.year<=100,'historical city view must resolve at/before requested year');
assert.equal(historic.cities.length,a.settlements.length);
const biggest=C.currentView(a).cities.slice().sort((x,y)=>y.population-x.population)[0];
const detail=C.cityDetail(a,biggest.id,300);
assert.ok(detail.districts.length>=4&&Array.isArray(detail.gangs),'city detail should expose districts and local factions');
assert.ok(Number.isFinite(detail.crimeRate)&&Number.isFinite(detail.blackMarket),'city detail should expose public-order metrics');

const raw=E.serialize(a),restored=E.deserialize(raw);H.initialize(restored);S.initialize(restored);C.initialize(restored);
assert.deepEqual(C.validateCities(restored),[],'save/export round-trip must preserve city state');
assert.equal(C.cityFingerprint(restored),C.cityFingerprint(a),'save/export must preserve city identity');

const metrics=C.currentView(a).stats;
console.log('WorldForge v0.4 deterministic cities & crime tests passed.');
console.log(JSON.stringify({year:a.cities.currentYear,cities:a.cities.cities.length,businesses:metrics.businesses,activeGangs:metrics.activeGangs,meanCrime:metrics.meanCrime,blackMarket:metrics.blackMarket,crimeEvents:a.cities.stats.crimeEvents,gangWars:a.cities.stats.gangWars,crackdowns:a.cities.stats.crackdowns,arrests:a.cities.stats.arrests,fingerprint:C.cityFingerprint(a)}));
