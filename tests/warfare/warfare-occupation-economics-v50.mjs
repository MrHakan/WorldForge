import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const Warfare={initialize:w=>w.warfareSupply,applyStrategicAI:()=>{}};
globalThis.WorldForgeWarfareSupply=Warfare;
const Occupation=require('../../src/features/warfare/warfare-occupation-policy.js');
assert.equal(Occupation.VERSION,'5.0.24');
const w={history:{currentYear:20},warfareSupply:{currentYear:20,strategicAI:{occupations:[{settlementId:7,occupierRealmId:'A',originalRealmId:'B',armyId:null,resistance:.82,administrativeControl:.28,pressure:.18}]}}};
Occupation.apply(w);
let P=w.warfareSupply.occupationPolicy,row=P.settlements[0];
assert.equal(row.policy,'military-rule');
assert.ok(row.economicRetention<.7,'high-resistance occupation should retain limited output');
assert.ok(row.logisticsDisruption>.3,'resistance should disrupt logistics');
assert.ok(row.garrisonShortfall>0,'missing garrison must create shortfall');
assert.ok(row.partisanStrength>0,'partisan network should begin growing');
const firstResistance=row.resistance,firstPartisans=row.partisanStrength,firstEvents=P.events.length;
Occupation.apply(w,true);row=P.settlements[0];assert.equal(row.resistance,firstResistance,'same-year force apply must be idempotent');assert.equal(row.partisanStrength,firstPartisans);assert.equal(P.events.length,firstEvents);
for(let y=21;y<=25;y++){w.history.currentYear=y;w.warfareSupply.currentYear=y;Occupation.apply(w)}
P=w.warfareSupply.occupationPolicy;row=P.settlements[0];
assert.ok(row.partisanStrength>=.28,'persistent harsh occupation should create active partisan network');
assert.ok(P.events.some(e=>e.type==='partisan-sabotage'),'active resistance should produce deterministic sabotage');
assert.ok(P.liberationCampaigns.length===1,'high resistance and garrison shortfall should open liberation campaign');
assert.ok(P.liberationCampaigns[0].progress>0);
assert.ok(P.stats.avgEconomicRetention<1&&P.stats.avgLogisticsDisruption>0);
// Remove occupation and ensure history records liberation once.
w.warfareSupply.strategicAI.occupations=[];w.history.currentYear=26;w.warfareSupply.currentYear=26;Occupation.apply(w);P=w.warfareSupply.occupationPolicy;assert.equal(P.settlements.length,0);assert.equal(P.stats.liberated,1);assert.ok(P.history.some(x=>x.status==='liberated'&&x.settlementId===7));assert.ok(P.events.some(e=>e.type==='settlement-liberated'));
console.log('occupation economics + partisans behavior OK');