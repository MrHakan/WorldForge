import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{Tracker,apply}=require('../../src/runtime/state-delta.js');
const world={settings:{seed:'delta'},layers:{elevation:new Float32Array([.2,.7])},history:{currentYear:0,snapshots:[{year:0,data:[1,2]}],events:[]},endless:{epochOffset:0},society:{people:[{id:0,wealth:2,traits:['a']}]},wiki:{notes:{}}};
const replica=structuredClone(world),layers=replica.layers,people=replica.society.people,tracker=new Tracker(world);
assert.deepEqual(tracker.changes(world),[]);
for(let year=1;year<=30;year++){
 world.history.currentYear=year;world.history.events.push({id:year,title:'event '+year});world.society.people[0].wealth=year;
 world.history.snapshots.push({year,data:[year,year+1]});if(year>10)world.history.snapshots.shift();
 if(year===10)world.society.people.push({id:1,wealth:9});
 if(year===12)delete world.society.people[0].traits;
 apply(replica,structuredClone(tracker.changes(world)));assert.deepEqual(replica,world);
}
assert.equal(replica.layers,layers);assert.equal(replica.society.people,people,'patches must preserve stable entity arrays');
replica.wiki.notes.personal='user edit during simulation';world.history.currentYear++;
apply(replica,tracker.changes(world));assert.equal(replica.wiki.notes.personal,'user edit during simulation');
world.endless.epochOffset=3000;world.history.currentYear=2;for(const s of world.history.snapshots)s.year-=3000;
apply(replica,tracker.changes(world));assert.deepEqual(replica.history,world.history,'rebases must invalidate immutable snapshot shortcuts');
const hostile=JSON.parse('{"__proto__":{"safe":true}}');world.wiki.notes=hostile;apply(replica,tracker.changes(world));
assert.equal(Object.getPrototypeOf(replica.wiki.notes),Object.prototype);assert.equal({}.safe,undefined);
assert.throws(()=>apply(replica,[['set',['layers'],{}]]),/Invalid/);
console.log('State deltas: append, trim, deletion, rebasing, stable geometry, authored notes and safe object keys passed');

const aged={history:{currentYear:6000,snapshots:Array.from({length:5000},(_,year)=>({year,people:Array(64).fill(year)}))},endless:{epochOffset:0},live:{population:1}};
const aging=new Tracker(aged);assert.deepEqual(aging.changes(aged),[]);aged.history.currentYear++;aged.live.population++;
assert.ok(JSON.stringify(aged).length>1000000);assert.ok(JSON.stringify(aging.changes(aged)).length<500,'live traffic must not grow with unchanged replay history');
console.log('A 5,000-snapshot world updates with under 500 bytes of deltas');

const derived={history:{currentYear:0},live:{flags:{fortified:false}}},copy=structuredClone(derived),deltas=new Tracker(derived);
copy.live.flags=Object.freeze(copy.live.flags);derived.live.flags.fortified=true;apply(copy,deltas.changes(derived));assert.equal(copy.live.flags.fortified,true);
console.log('Frozen derived engine flags can be refreshed without redefining read-only properties');

const ordered={history:{currentYear:0},jobs:{farmer:1,scholar:2}},orderedCopy=structuredClone(ordered),orderTracker=new Tracker(ordered);
ordered.jobs={farmer:1,smith:3,scholar:2};apply(orderedCopy,orderTracker.changes(ordered));assert.equal(JSON.stringify(orderedCopy),JSON.stringify(ordered),'allocation dictionaries must preserve insertion order');
console.log('Rebuilt allocation dictionaries retain deterministic key ordering');

const changing={history:{currentYear:0},market:{jobs:{},values:Array.from({length:100},()=>0)}},packed=structuredClone(changing),packing=new Tracker(changing);
changing.market.values=Array.from({length:100},(_,i)=>i+1);const update=packing.changes(changing);assert.ok(update.length<5,'dense changes should use compact containers instead of per-field messages');apply(packed,update);assert.deepEqual(packed,changing);
console.log('Dense changing arrays are coalesced into compact messages');
