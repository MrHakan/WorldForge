(function(root,factory){
 const api=factory(root&&root.WorldForgeWarfareSupply,root&&root.WorldForgeHeritage,root&&root.WorldForgeWorldbuilding);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.WorldForgeWarfareCommanderLegacies=api;
})(typeof window!=='undefined'?window:globalThis,function(Warfare,Heritage,Worldbuilding){
'use strict';
if(!Warfare)throw new Error('WorldForge commander legacies requires Warfare & Supply');
const VERSION='5.0.8',round=(v,d=3)=>Number(Number(v).toFixed(d));
function memorialType(l){return l.reason==='killed-in-action'?'battlefield-monument':l.tier==='legendary'?'commander-statue':l.tier==='renowned'?'memorial-hall':'memorial-plaque'}
function homeCity(S,armyId){return (S.armies||[]).find(a=>String(a.id)===String(armyId))?.homeCityId??null}
function memorialFor(S,l){const settlementId=homeCity(S,l.armyId);return{id:`memorial:${l.commanderId}`,commanderId:l.commanderId,name:l.name,title:l.reason==='killed-in-action'?`Memorial to ${l.name}`:`${l.name} Memorial`,type:memorialType(l),settlementId,realmId:l.realmId,year:l.year,tier:l.tier,legacyScore:round(l.score),battles:l.battles,prestige:l.prestige,reason:l.reason,publicMemory:l.tier==='legendary'?'national':l.tier==='renowned'?'regional':'local',protected:l.score>=.6||l.reason==='killed-in-action'} }
function apply(w){const S=w.warfareSupply;if(!S?.commanders)return S;const C=S.commanders,memorials=(C.legacies||[]).filter(l=>l.memorialEligible).map(l=>memorialFor(S,l));C.memorials=memorials;C.stats=C.stats||{};C.stats.memorials=memorials.length;S.stats=S.stats||{};S.stats.commanderMemorials=memorials.length;
 if(w.heritage){w.heritage.commanderMemorials=memorials.map(m=>({...m,heritageStatus:m.tier==='legendary'?'national_heritage':m.protected?'protected':'local_register'}));w.heritage.stats=w.heritage.stats||{};w.heritage.stats.commanderMemorials=memorials.length}
 return S}
const baseInitialize=Warfare.initialize?.bind(Warfare),baseSim=Warfare.simulateWarfareYear?.bind(Warfare),baseSummary=Warfare.summary?.bind(Warfare),baseCity=Warfare.cityMilitaryView?.bind(Warfare);
if(baseInitialize)Warfare.initialize=function(w,force=false){const s=baseInitialize(w,force);return apply(w)||s};
if(baseSim)Warfare.simulateWarfareYear=function(w,y){const s=baseSim(w,y);return apply(w)||s};
if(baseSummary)Warfare.summary=function(w){const s=baseSummary(w),C=w.warfareSupply?.commanders||{};return{...s,commanderMemorials:Number(C.memorials?.length||0)}};
if(baseCity)Warfare.cityMilitaryView=function(w,id){const v=baseCity(w,id),ms=(w.warfareSupply?.commanders?.memorials||[]).filter(m=>Number(m.settlementId)===Number(id));return{...v,commanderMemorials:ms}};
Warfare.applyCommanderLegacies=apply;Warfare.COMMANDER_LEGACIES_VERSION=VERSION;
return{VERSION,memorialType,memorialFor,apply};
});