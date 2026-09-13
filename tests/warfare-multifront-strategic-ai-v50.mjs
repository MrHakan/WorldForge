import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
global.window=global;
const Warfare={initialize:w=>w.warfareSupply,summary:()=>({}),cityMilitaryView:()=>({})};
global.WorldForgeWarfareSupply=Warfare;
vm.runInThisContext(fs.readFileSync('warfare-strategic-ai.js','utf8'),{filename:'warfare-strategic-ai.js'});
const A=global.WorldForgeWarfareStrategicAI;assert.equal(A.VERSION,'5.0.19');
const cities=[];for(let i=0;i<4;i++)cities.push({id:i+1,kingdomId:1,x:i*3,y:0,population:100-i*5});for(let i=0;i<4;i++)cities.push({id:i+11,kingdomId:2,x:i*3,y:20,population:120-i*5});
const armies=[];for(let i=0;i<6;i++)armies.push({id:`a${i}`,ownerId:1,homeCityId:(i%4)+1,combatPower:100-i});for(let i=0;i<6;i++)armies.push({id:`d${i}`,ownerId:2,homeCityId:(i%4)+11,combatPower:95-i});
const w={cities:{cities},history:{currentYear:50,current:{activeWarIds:['w1']},wars:{w1:{id:'w1',attackerId:1,defenderId:2,warGoal:'conquest',endYear:null}}},warfareSupply:{currentYear:50,armies,sieges:[],stats:{}}};
A.apply(w,true);const S=w.warfareSupply.strategicAI;assert.equal(S.fronts.length,2,'16 city pairs should create two strategic fronts');assert.equal(S.campaigns.length,2);assert.equal(S.campaigns.filter(c=>c.theaterRole==='primary').length,1);assert.equal(S.campaigns.filter(c=>c.theaterRole==='secondary').length,1);assert.notEqual(S.campaigns[0].id,S.campaigns[1].id);
const attackerAssignments=S.fronts.flatMap(f=>f.attackerArmyIds.map(String));const defenderAssignments=S.fronts.flatMap(f=>f.defenderArmyIds.map(String));assert.equal(new Set(attackerAssignments).size,attackerAssignments.length,'attacker army cannot occupy two fronts');assert.equal(new Set(defenderAssignments).size,defenderAssignments.length,'defender army cannot occupy two fronts');
for(const army of armies){const matches=S.fronts.filter(f=>f.attackerArmyIds.includes(army.id)||f.defenderArmyIds.includes(army.id));assert.ok(matches.length<=1,'each army must have at most one front assignment')}
const primary=S.campaigns.find(c=>c.theaterRole==='primary'),secondary=S.campaigns.find(c=>c.theaterRole==='secondary');assert.ok(primary.priority>secondary.priority,'primary theater should retain priority advantage');
console.log('WorldForge v5.0 multi-front strategic allocation behavioral tests passed.');