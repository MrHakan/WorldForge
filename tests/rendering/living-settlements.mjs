import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),A=require('../../src/rendering/living-settlements.js');
const known={},s={id:0,x:4,y:4},world={settings:{seed:'HD',width:10},layers:{moisture:[]},technology:{realms:[{realmId:0,known}]},history:{currentYear:200}};
const r={world,ownerOf:()=>0,popOf:()=>12000,realm:()=>({color:'#abcdef'})};
const fingerprint=JSON.stringify(world);
assert.equal(A.profile(r,s).stage,0);assert.equal(JSON.stringify(world),fingerprint);
for(const [stage,techs]of [[1,['agriculture']],[2,['masonry','bronze_working']],[3,['ironworking','siege_engineering']],[4,['public_sanitation','mechanical_engineering']]]){
 for(const id of techs)known[id]={year:100,adoption:1};assert.equal(A.profile(r,s).stage,stage);
}
assert.equal(A.CATALOG.length,27);
const p=A.profile(r,s);assert.deepEqual(A.plan(p),A.plan(p));assert.notDeepEqual(A.plan(p),A.plan({...p,seed:p.seed+1}));
r.popOf=()=>300;assert.equal(A.profile(r,s).stage,1,'technology alone cannot turn a hamlet into a city');
r.popOf=()=>12000;r.historyView={year:50};assert.equal(A.profile(r,s).stage,0,'future discoveries cannot leak into history');
r.historyView=null;known.masonry.adoption=.3;assert.equal(A.profile(r,s).stage,1,'insufficient adoption should keep traditional housing');
console.log('Living settlements: technology, population, historical gating, variety and determinism passed');
