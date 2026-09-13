import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
global.window=global;
const Warfare={initialize:w=>w.warfareSupply,summary:()=>({})};
global.WorldForgeWarfareSupply=Warfare;
vm.runInThisContext(fs.readFileSync('warfare-strategic-reserves.js','utf8'),{filename:'warfare-strategic-reserves.js'});
const R=global.WorldForgeWarfareStrategicReserves;assert.equal(R.VERSION,'5.0.17');
const balanced={id:'front:w:0',warId:'w',attackerId:1,defenderId:2,attackerPower:500,defenderPower:500,balance:0,status:'contested'};
assert.equal(R.requestFor(balanced),null,'balanced fronts must not arbitrarily reinforce the defender');
function world(){return{cities:{cities:[{id:1,realmId:1,x:0,y:0},{id:2,realmId:1,x:500,y:0},{id:3,realmId:2,x:1000,y:0}]},warfareSupply:{currentYear:100,armies:[{id:'near',ownerId:1,homeCityId:1,size:200,supply:.8,morale:.8,combatPower:220,strategicRole:'reserve'},{id:'far',ownerId:1,homeCityId:2,size:200,supply:.8,morale:.8,combatPower:220,strategicRole:'reserve'}],strategicAI:{fronts:[{id:'front:w:0',warId:'w',attackerId:1,defenderId:2,attackerAnchorCityId:1,defenderAnchorCityId:3,attackerPower:200,defenderPower:800,balance:-.6,status:'defender-advantage'}]},stats:{}}}}
const w=world();R.apply(w,true);const S=w.warfareSupply,firstMoves=S.strategicReserves.moves.map(x=>x.id),assigned=S.armies.filter(a=>a.reinforcementFrontId).map(a=>a.id);assert.ok(assigned.length>0,'weak front should receive reserves');assert.equal(assigned[0],'near','equal reserves should prefer the closer army');
R.apply(w,true);assert.deepEqual(S.strategicReserves.moves.map(x=>x.id),firstMoves,'same-year force apply must keep stable move identities');assert.deepEqual(S.armies.filter(a=>a.reinforcementFrontId).map(a=>a.id),assigned,'same-year force apply must not duplicate commitments');
S.strategicAI.fronts=[];R.apply(w,true);assert.equal(S.armies.filter(a=>a.reinforcementFrontId).length,0,'closed fronts must release reinforcement assignments');assert.ok(S.strategicReserves.history.some(x=>x.reason==='front-closed'),'release reason must be recorded');
const w2=world();R.apply(w2,true);w2.warfareSupply.strategicAI.fronts[0]={...balanced,attackerAnchorCityId:1,defenderAnchorCityId:3};R.apply(w2,true);assert.equal(w2.warfareSupply.armies.filter(a=>a.reinforcementFrontId).length,0,'resolved requests must release committed reserves');assert.ok(w2.warfareSupply.strategicReserves.history.some(x=>x.reason==='request-resolved'),'resolved request release must be recorded');
console.log('WorldForge v5.0 strategic reserve lifecycle behavioral tests passed.');