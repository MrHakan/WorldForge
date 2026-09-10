import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
for(const f of ['engine.js','history-engine.js','society-engine.js','city-engine.js','adventure-engine.js','story-engine.js','wiki-engine.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const E=global.WorldForgeEngine,H=global.WorldForgeHistory,S=global.WorldForgeSociety,C=global.WorldForgeCity,A=global.WorldForgeAdventure,T=global.WorldForgeStory,W=global.WorldForgeWiki;
assert.ok(E&&H&&S&&C&&A&&T&&W,'all v1.0 engines must be exposed');
const options={seed:'EMBER-CROWN-01',width:160,height:90,seaLevel:.53,age:'mature',settlementTarget:45,kingdomTarget:7};
const world=E.generateWorld(options);H.initialize(world);S.initialize(world);C.initialize(world);A.initialize(world);T.initialize(world);T.simulateYears(world,300);W.initialize(world);
assert.deepEqual(W.validateWiki(world),[],'v1 encyclopedia must have valid cross-links');
const index=W.buildIndex(world,300);
assert.ok(index.length>world.settlements.length*4,'encyclopedia should integrate many entity types');
for(const type of ['realm','settlement','person','house','city','gang','site','quest','dialogue','event'])assert.ok(index.some(a=>a.type===type),`index should include ${type} articles`);
const people=W.search(world,'',{year:300,type:'person',limit:20});assert.ok(people.length>0,'typed search returns people');
const q=W.search(world,'quest',{year:300,limit:50});assert.ok(q.length>0,'full text search returns results');
const article=W.article(world,people[0].ref,300);assert.ok(article?.title,'article lookup works');
const rel=W.related(world,article.ref,300);assert.ok(Array.isArray(rel),'related entity traversal works');
const eventArticle=index.find(a=>a.type==='event'&&a.refs.length);if(eventArticle){const linked=eventArticle.refs.find(r=>W.article(world,r,300));assert.ok(linked,'event should cross-link to a resolvable entity')}
const site=index.find(a=>a.type==='site');if(site){const chronology=W.chronology(world,site.ref,300);assert.ok(Array.isArray(chronology),'entity chronology query works')}
assert.equal(W.toggleBookmark(world,article.ref),true,'bookmark can be added');assert.equal(W.toggleBookmark(world,article.ref),false,'bookmark can be removed');W.toggleBookmark(world,article.ref);
W.setNote(world,article.ref,'Regression note');assert.equal(world.wiki.notes[article.ref],'Regression note','article notes persist');
const authored=W.addAuthoredArticle(world,{title:'Regression Chronicle Note',body:'A user-authored world note.',year:300,refs:[article.ref]});assert.ok(authored&&world.wiki.authoredArticles.length===1,'author can add world notes');
const md=W.exportMarkdown(world,300);assert.ok(md.includes(world.name)&&md.includes('## Index'),'Markdown encyclopedia export works');
const fp=W.wikiFingerprint(world,300);assert.match(fp,/^[0-9a-f]{8}$/,'wiki fingerprint format');
const raw=E.serialize(world),restored=E.deserialize(raw);H.initialize(restored);S.initialize(restored);C.initialize(restored);A.initialize(restored);T.initialize(restored);W.initialize(restored);
assert.equal(restored.wiki.notes[article.ref],'Regression note','save/export preserves encyclopedia notes');assert.ok(restored.wiki.bookmarks.includes(article.ref),'save/export preserves bookmarks');assert.equal(restored.wiki.authoredArticles.length,1,'save/export preserves authored articles');assert.deepEqual(W.validateWiki(restored),[],'restored encyclopedia remains valid');assert.equal(W.wikiFingerprint(restored,300),W.wikiFingerprint(world,300),'derived encyclopedia identity survives round-trip');
const historic=W.buildIndex(world,100);assert.ok(historic.length>0&&historic.every(a=>a.year<=100||a.type!=='event'),'historical encyclopedia respects replay year');
const dash=W.dashboard(world,300);assert.equal(dash.year,300);assert.equal(dash.total,W.buildIndex(world,300).length);
console.log('WorldForge v1.0 encyclopedia integration tests passed.');
console.log(JSON.stringify({year:dash.year,articles:dash.total,people:dash.counts.person,places:dash.counts.settlement,sites:dash.counts.site,quests:dash.counts.quest,events:dash.counts.event,bookmarks:dash.bookmarks,fingerprint:W.wikiFingerprint(world,300)}));