(function(root,factory){
 const api=factory(root&&root.WorldForgeWarfareSupply,root&&root.WorldForgeWorldbuilding);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.WorldForgeWarfareMobilization=api;
})(typeof window!=='undefined'?window:globalThis,function(Warfare,Worldbuilding){
'use strict';
if(!Warfare)throw new Error('WorldForge v4.9 mobilization requires Warfare & Supply');
const VERSION='4.9.4';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=3)=>Number(Number(v).toFixed(d));
const POLICIES={
  peacetime:{id:'peacetime',label:'Peacetime Levy',level:0,activation:.00,recovery:1.00,morale:0,priority:'reserve'},
  limited:{id:'limited',label:'Limited Mobilization',level:1,activation:.035,recovery:1.08,morale:.015,priority:'reinforce'},
  general:{id:'general',label:'General Mobilization',level:2,activation:.075,recovery:1.18,morale:.025,priority:'frontline'},
  emergency:{id:'emergency',label:'Emergency Levy',level:3,activation:.12,recovery:1.28,morale:.035,priority:'survival'}
};
function yearOf(w){return Worldbuilding&&typeof Worldbuilding.absYear==='function'?Worldbuilding.absYear(w):Number(w?.year??w?.currentYear??0)}
function ensure(w){const s=w.warfareSupply||(w.warfareSupply={});s.mobilization=s.mobilization||{version:VERSION,realms:{},lastAppliedYear:null,revision:0};s.mobilization.version=VERSION;s.mobilization.realms=s.mobilization.realms||{};return s.mobilization}
function realmId(v){return v===null||v===undefined?'unaffiliated':String(v)}
function choosePolicy(metrics){
 if(metrics.defensiveSieges>0||metrics.casualtyRate>=.08||metrics.criticalArmies>=2)return POLICIES.emergency;
 if(metrics.battles>0||metrics.offensiveSieges>0||metrics.casualtyRate>=.035)return POLICIES.general;
 if(metrics.marching>0||metrics.undersupplied>0)return POLICIES.limited;
 return POLICIES.peacetime;
}
function collect(w){
 const s=w.warfareSupply||{},armies=s.armies||[],sieges=s.sieges||[],battles=s.battles||[],pools=s.manpower||{},realms={};
 const touch=id=>realms[realmId(id)]||(realms[realmId(id)]={ownerId:id,armies:0,marching:0,undersupplied:0,criticalArmies:0,offensiveSieges:0,defensiveSieges:0,battles:0,casualties:0,fieldStrength:0,manpowerAvailable:0,manpowerCapacity:0,cityIds:[]});
 for(const a of armies){const r=touch(a.ownerId);r.armies++;r.fieldStrength+=Number(a.size||0);r.casualties+=Number(a.casualties||0);if(a.movementState==='marching'||a.movementState==='relief')r.marching++;if(Number(a.supply||0)<.5)r.undersupplied++;if(a.status==='critical')r.criticalArmies++;}
 for(const c of w.cities?.cities||[]){const id=c.kingdomId??c.realmId??c.factionId??c.ownerId??null,r=touch(id),p=pools[Number(c.id)];r.cityIds.push(Number(c.id));if(p){r.manpowerAvailable+=Number(p.available||0);r.manpowerCapacity+=Number(p.capacity||0)}}
 for(const sg of sieges){const atk=armies.find(a=>a.id===sg.armyId);if(atk)touch(atk.ownerId).offensiveSieges++;touch(sg.defenderOwnerId).defensiveSieges++;}
 for(const b of battles){const atk=armies.find(a=>a.id===b.attackerArmyId),def=armies.find(a=>a.id===b.defenderArmyId);if(atk)touch(atk.ownerId).battles++;if(def)touch(def.ownerId).battles++;}
 for(const r of Object.values(realms)){r.casualtyRate=round(r.casualties/Math.max(1,r.fieldStrength+r.casualties));r.reserveRatio=round(r.manpowerAvailable/Math.max(1,r.manpowerCapacity));}
 return realms;
}
function apply(w,force=false){
 const s=w.warfareSupply;if(!s)return null;const m=ensure(w),year=yearOf(w);if(!force&&m.lastAppliedYear===year)return m;
 const metrics=collect(w),next={};let emergency=0,general=0,activated=0;
 for(const [id,r] of Object.entries(metrics)){
   const policy=choosePolicy(r);if(policy.id==='emergency')emergency++;if(policy.id==='general')general++;
   let realmActivated=0;
   for(const cityId of r.cityIds){const pool=s.manpower?.[cityId];if(!pool)continue;const capacity=Math.max(0,Number(pool.capacity||0)),headroom=Math.max(0,capacity-Number(pool.available||0)),levy=Math.min(headroom,Math.round(capacity*policy.activation));pool.available=Math.min(capacity,Number(pool.available||0)+levy);pool.recovery=Math.round(Number(pool.recovery||0)*policy.recovery);pool.mobilizationLaw=policy.id;pool.mobilizationLevel=policy.level;pool.activatedThisYear=levy;realmActivated+=levy;}
   for(const army of s.armies||[])if(realmId(army.ownerId)===id){army.mobilizationLaw=policy.id;army.mobilizationLevel=policy.level;army.reinforcementPriority=policy.priority;army.mobilizationMoraleBonus=policy.morale;army.morale=round(clamp(Number(army.morale||0)+policy.morale,0,1));}
   activated+=realmActivated;next[id]={...r,policy:policy.id,policyLabel:policy.label,level:policy.level,reinforcementPriority:policy.priority,activatedManpower:realmActivated};
 }
 m.realms=next;m.lastAppliedYear=year;m.revision=Number(m.revision||0)+1;m.stats={realms:Object.keys(next).length,emergency,general,activatedManpower:activated};
 s.stats=s.stats||{};s.stats.mobilizedRealms=Object.values(next).filter(x=>x.level>0).length;s.stats.emergencyMobilizations=emergency;s.stats.activatedManpower=activated;
 return m;
}
function realmView(w,id){apply(w);return ensure(w).realms[realmId(id)]||null}
function summary(w){const m=apply(w);return{year:yearOf(w),revision:m?.revision||0,...(m?.stats||{})}}
function patch(){
 if(Warfare.__mobilizationPatched)return;Warfare.__mobilizationPatched=true;
 if(typeof Warfare.summary==='function'){const original=Warfare.summary;Warfare.summary=function(w,...args){const out=original.call(this,w,...args);apply(w,false);return{...out,mobilization:summary(w)}}}
 if(typeof Warfare.cityMilitaryView==='function'){const original=Warfare.cityMilitaryView;Warfare.cityMilitaryView=function(w,id,...args){const out=original.call(this,w,id,...args);apply(w,false);const city=(w.cities?.cities||[]).find(c=>Number(c.id)===Number(id));const owner=city?(city.kingdomId??city.realmId??city.factionId??city.ownerId??null):null;return{...out,mobilization:realmView(w,owner)}}}
}
patch();
return{VERSION,POLICIES,apply,realmView,summary,patch};
});
