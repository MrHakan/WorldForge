(()=>{
'use strict';
const W=window.WorldForgeWarfareSupply;
if(!W)return;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loadScript(src,test){
 if(test())return Promise.resolve();
 return new Promise((resolve,reject)=>{
  let s=[...document.scripts].find(x=>x.getAttribute('src')===src);
  if(!s){s=document.createElement('script');s.src=src;document.body.appendChild(s)}
  s.addEventListener('load',resolve,{once:true});
  s.addEventListener('error',reject,{once:true});
 });
}
function world(){return window.WorldForgeWorldbuildingUI?.state?.world||window.WorldForgeWorldOrderUI?.state?.world||window.WorldForgeReleaseUI?.state?.world||null}
function ensure(){
 const host=$('#worldbuildingPanel .worldbuilding-layout>div')||$('#worldbuildingPanel');
 if(!host||$('#warfareStrategicAISection'))return;
 host.insertAdjacentHTML('beforeend','<section id="warfareStrategicAISection"><div class="labor-head"><span>STRATEGIC AI & FRONTS</span><b>FRONTS · CAMPAIGNS · OCCUPATIONS · COMMANDERS</b></div><div id="warfareStrategicAISummary" class="worldbuilding-kpis"></div><div id="warfareStrategicAIList" class="worldbuilding-landmarks"></div><div id="warfareCommanderList" class="worldbuilding-landmarks"></div></section>');
}
function render(force=false){
 const w=world();if(!w)return;
 ensure();
 W.initialize(w);
 W.applyStrategicAI?.(w,force);
 W.applyCommanders?.(w,force);
 W.applyStrategicReserves?.(w,force);
 const A=w.warfareSupply?.strategicAI||{};
 const S=A.stats||{};
 const C=w.warfareSupply?.commanders||{};
 const CS=C.stats||{};
 $('#warfareStrategicAISummary').innerHTML=[['FRONTS',S.fronts||0],['CAMPAIGNS',S.campaigns||0],['CONTESTED',S.contestedFronts||0],['OCCUPIED',S.occupiedSettlements||0],['COMMANDERS',CS.activeCommanders||0],['VETERANS',CS.veterans||0]].map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('');
 $('#warfareStrategicAIList').innerHTML=(A.campaigns||[]).map(c=>{
  const f=(A.fronts||[]).find(x=>x.id===c.frontId);
  const balance=f?`${Math.round(Number(f.balance||0)*100)}%`:'—';
  return `<article><small>${esc(String(c.status||'active').toUpperCase())} · ${esc(String(c.objectiveType||'objective').toUpperCase())}</small><h3>War ${esc(c.warId)} · ${esc(c.goal)}</h3><div class="worldbuilding-mini"><span><i>TARGET</i><b>${esc(c.targetCityId??'—')}</b></span><span><i>PRIORITY</i><b>${Math.round(Number(c.priority||0)*100)}%</b></span><span><i>FRONT</i><b>${esc(c.frontId||'—')}</b></span><span><i>BALANCE</i><b>${esc(balance)}</b></span></div></article>`;
 }).join('')||'<article><small>NO ACTIVE CAMPAIGN</small><p>No strategic front is active.</p></article>';
 $('#warfareCommanderList').innerHTML=(C.leaders||[]).slice(0,16).map(c=>`<article><small>${esc(String(c.trait||'officer').toUpperCase())} · ${esc(String(c.status||'active').toUpperCase())}</small><h3>${esc(c.name)}</h3><div class="worldbuilding-mini"><span><i>ARMY</i><b>${esc(c.armyId||'—')}</b></span><span><i>SKILL</i><b>${Math.round(Number(c.skill||0)*100)}%</b></span><span><i>SENIORITY</i><b>${esc(c.seniority||0)}</b></span><span><i>PRESTIGE</i><b>${esc(c.prestige||0)}</b></span></div></article>`).join('')||'<article><small>NO COMMANDERS</small><p>No active commanders are assigned.</p></article>';
}
Promise.all([
 loadScript('warfare-commanders.js',()=>window.WorldForgeWarfareCommanders),
 loadScript('warfare-strategic-reserves.js',()=>window.WorldForgeWarfareStrategicReserves),
 loadScript('warfare-strategic-reserves-ui.js',()=>window.WorldForgeWarfareStrategicReservesUI)
]).then(()=>render(true)).catch(()=>render(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(true)});
window.WorldForgeWarfareStrategicAIUI={render};
})();