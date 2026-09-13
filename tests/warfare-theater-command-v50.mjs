import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
global.window=global;
const Warfare={initialize:w=>w.warfareSupply,summary:()=>({})};
global.WorldForgeWarfareSupply=Warfare;
vm.runInThisContext(fs.readFileSync('warfare-theater-command.js','utf8'),{filename:'warfare-theater-command.js'});
const T=global.WorldForgeWarfareTheaterCommand;assert.equal(T.VERSION,'5.0.21');
function world(){return{history:{currentYear:200},warfareSupply:{currentYear:200,armies:[{id:'r1',ownerId:1,combatPower:120,reinforcementFrontId:'f0',reinforcementPriority:.6,reinforcementAssignedYear:199,reinforcementStatus:'en-route',strategicRole:'reinforcing'}],strategicAI:{fronts:[{id:'f0',warId:'w1',collapseRisk:.18,reinforcementFulfillment:.9},{id:'f1',warId:'w1',collapseRisk:.12,reinforcementFulfillment:.4}],campaigns:[{id:'c0',warId:'w1',frontId:'f0',theaterRole:'primary',priority:.58,targetCityId:10},{id:'c1',warId:'w1',frontId:'f1',theaterRole:'secondary',priority:.82,targetCityId:20}]},campaignPlanning:{plans:[{id:'plan:c0',campaignId:'c0',warId:'w1',frontId:'f0',momentum:.08,objectiveProgress:.12,supplyReliability:.7,reinforcementFulfillment:.9,collapseRisk:.18},{id:'plan:c1',campaignId:'c1',warId:'w1',frontId:'f1',momentum:.72,objectiveProgress:.68,supplyReliability:.82,reinforcementFulfillment:.4,collapseRisk:.12}]},strategicReserves:{requests:[{id:'q0',frontId:'f0',warId:'w1',realmId:1,priority:.55,collapseRisk:.18,desiredPower:100,committedPower:120,fulfillment:1,status:'fulfilled'},{id:'q1',frontId:'f1',warId:'w1',realmId:1,priority:.8,collapseRisk:.32,desiredPower:180,committedPower:50,fulfillment:.28,status:'partial'}],moves:[{id:'move:r1:f0:199',armyId:'r1',frontId:'f0',realmId:1,committedPower:120,priority:.55,year:199,status:'en-route'}]},stats:{}}}}
const w=world();T.apply(w,true);const S=w.warfareSupply,TC=S.theaterCommand;
assert.equal(S.strategicAI.campaigns.find(c=>c.id==='c1').theaterRole,'primary','strong secondary theater should be promoted');
assert.equal(S.strategicAI.campaigns.find(c=>c.id==='c0').theaterRole,'secondary');
assert.equal(TC.primaryByWar.w1,'c1');assert.equal(TC.stats.promotions,0,'initial command choice is not a promotion event');
assert.equal(S.armies[0].reinforcementFrontId,'f1','surplus secondary reserve must redirect to the new primary theater');
assert.equal(S.armies[0].reinforcementStatus,'redirected');assert.equal(TC.transfers.length,1);
assert.equal(TC.exploitationFronts.length,1,'breakthrough conditions should open an exploitation front record');assert.equal(TC.exploitationFronts[0].parentFrontId,'f1');
const snapshot=JSON.stringify(TC);T.apply(w,true);assert.equal(JSON.stringify(S.theaterCommand),snapshot,'same-year force apply must be idempotent');
S.currentYear=w.history.currentYear=201;S.campaignPlanning.plans.find(p=>p.campaignId==='c0').momentum=.85;S.campaignPlanning.plans.find(p=>p.campaignId==='c0').objectiveProgress=.8;S.campaignPlanning.plans.find(p=>p.campaignId==='c1').momentum=.05;S.campaignPlanning.plans.find(p=>p.campaignId==='c1').objectiveProgress=.1;S.strategicAI.campaigns.find(c=>c.id==='c0').priority=.95;S.strategicAI.campaigns.find(c=>c.id==='c1').priority=.45;T.apply(w,true);assert.equal(S.theaterCommand.primaryByWar.w1,'c0','decisive challenger must replace the current primary theater');assert.equal(S.theaterCommand.stats.promotions,1);assert.ok(S.theaterCommand.events.some(e=>e.type==='primary-promoted'));
console.log('WorldForge v5.0 strategic theater command behavioral tests passed.');