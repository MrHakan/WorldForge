(function(root,factory){
 const api=factory(root&&root.WorldForgeWarfareSupply);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.WorldForgeWarfareCampaignPlanning=api;
})(typeof window!=='undefined'?window:globalThis,function(Warfare){
'use strict';
if(!Warfare)throw new Error('WorldForge v5.0 Campaign Planning requires Warfare & Supply');
const VERSION='5.0.3',clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),round=(v,d=3)=>Number(Number(v).toFixed(d));
function state(S){S.campaignPlanning=S.campaignPlanning||{version:VERSION,lastAppliedYear:null,plans:[],history:[],stats:{campaigns:0,advancing:0,stalled:0,retreating:0,reassessed:0}};S.campaignPlanning.version=VERSION;S.campaignPlanning.plans=S.campaignPlanning.plans||[];S.campaignPlanning.history=S.campaignPlanning.history||[];return S.campaignPlanning}
function planFor(A,warId){return (A.campaigns||[]).find(c=>String(c.warId)===String(warId))||null}
function frontFor(A,id){return (A.fronts||[]).find(f=>f.id===id)||null}
function momentum(prev,front,reserves){const bal=Number(front?.balance||0),reinforce=Number(front?.reinforcementFulfillment||0),collapse=Number(front?.collapseRisk||0),last=Number(prev?.momentum||0);return round(clamp(last*.45+bal*.9+reinforce*.22-collapse*.35,-1,1))}
function posture(m){return m>.28?'offensive':m<-.28?'defensive':'balanced'}
function phase(m){return m>.18?'advancing':m<-.38?'retreating':Math.abs(m)<.1?'stalled':'contested'}
function reassessObjective(campaign,prev,m){let objective=campaign?.objectiveType||prev?.objectiveType||'hold-line';let reason='continue-plan';if(m<-.48&&objective!=='hold-line'){objective='hold-line';reason='momentum-collapse'}else if(m>.42&&objective==='hold-line'){objective=campaign?.goal==='conquest'?'capture-capital':'seize-border';reason='momentum-opportunity'}else if(prev&&prev.targetCityId!==campaign?.targetCityId){reason='target-changed'}return{objective,reason}}
function apply(w,force=false){const S=w.warfareSupply||Warfare.initialize(w);if(!S)return S;Warfare.applyStrategicAI?.(w,force);Warfare.applyStrategicReserves?.(w,force);const A=S.strategicAI||{},P=state(S),year=Number(S.currentYear??w.history?.currentYear??0);if(!force&&P.lastAppliedYear===year)return S;const prev=new Map(P.plans.map(x=>[String(x.warId),x])),plans=[];let reassessed=0;for(const c of A.campaigns||[]){const p=prev.get(String(c.warId)),f=frontFor(A,c.frontId),m=momentum(p,f,S.strategicReserves),r=reassessObjective(c,p,m),yearsActive=p?Number(p.yearsActive||1)+1:1;const changed=!!p&&(r.objective!==p.objectiveType||r.reason!=='continue-plan');if(changed)reassessed++;plans.push({id:`plan:${c.warId}`,warId:c.warId,frontId:c.frontId,goal:c.goal,objectiveType:r.objective,targetCityId:c.targetCityId??p?.targetCityId??null,posture:posture(m),phase:phase(m),momentum:m,priority:round(clamp(Number(c.priority||.5)+(m<0?Math.abs(m)*.12:m*.08),0,1)),yearsActive,lastReassessmentYear:changed?year:(p?.lastReassessmentYear??year),reassessmentReason:r.reason,status:'active'})}
for(const p of prev.values())if(!plans.some(x=>String(x.warId)===String(p.warId)))P.history.push({...p,status:'closed',closedYear:year});
P.plans=plans;P.history=P.history.slice(-180);P.lastAppliedYear=year;P.stats={campaigns:plans.length,advancing:plans.filter(x=>x.phase==='advancing').length,stalled:plans.filter(x=>x.phase==='stalled').length,retreating:plans.filter(x=>x.phase==='retreating').length,reassessed};S.stats=S.stats||{};Object.assign(S.stats,{campaignPlans:P.stats.campaigns,advancingCampaigns:P.stats.advancing,stalledCampaigns:P.stats.stalled,retreatingCampaigns:P.stats.retreating,reassessedCampaigns:P.stats.reassessed});return S}
const baseInitialize=Warfare.initialize?.bind(Warfare),baseSim=Warfare.simulateWarfareYear?.bind(Warfare),baseSummary=Warfare.summary?.bind(Warfare);
if(baseInitialize)Warfare.initialize=function(w,force=false){const s=baseInitialize(w,force);return apply(w,force)||s};
if(baseSim)Warfare.simulateWarfareYear=function(w,y){const s=baseSim(w,y);return apply(w,true)||s};
if(baseSummary)Warfare.summary=function(w){const s=baseSummary(w),P=w.warfareSupply?.campaignPlanning?.stats||{};return{...s,campaignPlans:Number(P.campaigns||0),advancingCampaigns:Number(P.advancing||0),stalledCampaigns:Number(P.stalled||0),retreatingCampaigns:Number(P.retreating||0),reassessedCampaigns:Number(P.reassessed||0)}};
Warfare.applyCampaignPlanning=apply;Warfare.CAMPAIGN_PLANNING_VERSION=VERSION;
return{VERSION,momentum,posture,phase,reassessObjective,apply};
});