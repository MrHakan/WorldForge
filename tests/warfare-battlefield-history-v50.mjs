import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
global.window=global;
const Warfare={initialize:w=>w.warfareSupply,simulateWarfareYear:(w,y)=>{w.warfareSupply.currentYear=y;return w.warfareSupply},summary:()=>({}),cityMilitaryView:()=>({})};
global.WorldForgeWarfareSupply=Warfare;
vm.runInThisContext(fs.readFileSync('warfare-battlefield-history-v2.js','utf8'),{filename:'warfare-battlefield-history-v2.js'});
const B=global.WorldForgeWarfareBattlefieldHistoryV2;assert.equal(B.VERSION,'5.0.9a');
function world(){return{seed:'BATTLEFIELD-TEST',history:{currentYear:100},worldbuilding:{revision:1,profiles:[{settlementId:1,landmarks:[]}]},archaeology:{stats:{}},heritage:{stats:{}},warfareSupply:{currentYear:100,armies:[{id:'army:a',homeCityId:0,size:800},{id:'army:d',homeCityId:1,size:700}],battles:[{id:'battle:test:40',year:40,type:'relief',targetCityId:1,attackerArmyId:'army:a',defenderArmyId:'army:d',attackerCasualties:420,defenderCasualties:360,outcome:'siege-broken',ratio:.78}],stats:{}}}}
const w=world();B.apply(w,true);const H=w.warfareSupply.battlefieldHistory;assert.equal(H.scars.length,1);const s=H.scars[0];assert.equal(s.ageYears,60);assert.ok(s.significance>=.6);assert.equal(s.archaeologyEligible,true);assert.equal(s.heritageEligible,true);assert.equal(w.archaeology.warfareBattlefields.length,1);assert.equal(w.heritage.warfareBattlefields.length,1);assert.ok(w.worldbuilding.profiles[0].landmarks.some(l=>l.id===s.id));
const snapshot=JSON.stringify(H.scars);B.apply(w,true);assert.equal(H.scars.length,1);assert.equal(JSON.stringify(H.scars),snapshot,'same-year force apply must be idempotent');
w.warfareSupply.currentYear=120;w.history.currentYear=120;B.apply(w,true);assert.equal(H.scars[0].ageYears,80);assert.equal(H.scars.length,1);assert.ok(H.scars[0].condition<s.condition||H.scars[0].condition<=s.condition,'condition must not improve with age');
console.log('WorldForge v5.0 battlefield history behavioral tests passed.');