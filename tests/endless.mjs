import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
global.window=global;
for(const f of ['engine.js','history-engine.js','society-engine.js','city-engine.js','adventure-engine.js','story-engine.js','wiki-engine.js','culture-engine.js','faction-engine.js','endless-engine.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const E=global.WorldForgeEngine,H=global.WorldForgeHistory,S=global.WorldForgeSociety,Ci=global.WorldForgeCity,A=global.WorldForgeAdventure,T=global.WorldForgeStory,W=global.WorldForgeWiki,Cu=global.WorldForgeCulture,F=global.WorldForgeFactions,X=global.WorldForgeEndless;
assert.ok(E&&H&&S&&Ci&&A&&T&&W&&Cu&&F&&X,'all v0.9 engines must load');
const options={seed:'ENDLESS-GATE-09',width:120,height:70,seaLevel:.53,age:'mature',settlementTarget:25,kingdomTarget:5};
function init(w){H.initialize(w);S.initialize(w);Ci.initialize(w);A.initialize(w);T.initialize(w);W.initialize(w);Cu.initialize(w);F.initialize(w);X.initialize(w);return w}

// Real full-stack integration: Story -> Adventure -> City -> Society -> History, then Culture, Factions, Endless.
Cu.setBaseSimulator(T.simulateYears.bind(T));
F.setBaseSimulator(Cu.simulateYears.bind(Cu));
X.setBaseSimulator(F.simulateYears.bind(F));
const real=init(E.generateWorld(options));
X.simulateYears(real,120);
assert.equal(X.absoluteYear(real),120,'absolute clock must advance with the full simulation stack');
for(const m of [real.history,real.society,real.cities,real.adventure,real.story,real.culture,real.factions])assert.equal(m.currentYear,real.history.currentYear,'all live modules must share the same local epoch year');
assert.deepEqual(X.validate(real),[],'real v0.9 integrated state must validate');
assert.ok(real.culture.cultures.length>=4&&real.factions.organizations.length>=10,'new v0.7/v0.8 systems must remain active under endless wrapper');
const beforeSeed=real.settings.seed;
const raw=E.serialize(real),restored=E.deserialize(raw);init(restored);
assert.equal(X.absoluteYear(restored),120,'save/export must preserve absolute year');
assert.equal(restored.settings.seed,beforeSeed,'save/export must preserve public seed');
assert.deepEqual(X.validate(restored),[],'restored endless state must validate');

// Fast deterministic boundary harness. It exercises multiple epoch rebases without spending CI time on 12,500 full simulation years.
function fastBase(w,n){
  const modules=[w.society,w.cities,w.adventure,w.story,w.culture,w.factions].filter(Boolean);
  for(let i=0;i<n;i++){
    w.history.currentYear++;
    for(const m of modules)m.currentYear=w.history.currentYear;
    w.history.stats.yearsSimulated=(w.history.stats.yearsSimulated||0)+1;
    if(w.history.currentYear%100===0){w.history.events.push({id:w.history.events.length,year:w.history.currentYear,type:'era',importance:1,title:`Synthetic Year ${w.history.currentYear}`,text:'Long-run gate marker.'})}
  }
}
const a=init(E.generateWorld({...options,seed:'ENDLESS-BOUNDARY'}));
const b=init(E.generateWorld({...options,seed:'ENDLESS-BOUNDARY'}));
X.setBaseSimulator(fastBase);
X.simulateYears(a,12500);
X.simulateYears(b,3500);X.simulateYears(b,4200);X.simulateYears(b,4800);
for(const w of [a,b]){
  assert.equal(X.absoluteYear(w),12500,'absolute clock must cross the old 5,000-year ceiling');
  assert.ok(w.history.currentYear<X.REBASE_AT,'local legacy year must stay below rebase threshold');
  assert.ok(w.endless.rebases>=3,'multiple epoch rebases must occur');
  assert.equal(w.settings.seed,'ENDLESS-BOUNDARY','epoch RNG must not mutate the public seed');
  assert.ok(w.endless.archive.eventCount>0,'old detailed events must move into era archives');
  assert.ok(w.endless.archive.eras.length>0,'ancient eras must be summarized');
  assert.ok(w.endless.archive.checkpoints.length>0,'long-run checkpoints must be retained');
  assert.deepEqual(X.validate(w),[],'post-rebase state must validate');
}
assert.equal(X.fingerprint(a),X.fingerprint(b),'endless kernel must be deterministic independent of caller chunk sizes');
const mem=X.memoryStats(a);
assert.ok(mem.events<140,'live detailed event window must stay bounded after repeated rebases');
assert.ok(mem.snapshots<1000,'tiered snapshot retention must remain bounded in the synthetic long-run gate');
console.log('WorldForge v0.9 endless simulation tests passed.');
console.log(JSON.stringify({absoluteYear:X.absoluteYear(a),localYear:a.history.currentYear,epochOffset:a.endless.epochOffset,rebases:a.endless.rebases,liveEvents:mem.events,archivedEvents:mem.archivedEvents,eraArchives:mem.eraArchives,checkpoints:mem.checkpoints,fingerprint:X.fingerprint(a)}));