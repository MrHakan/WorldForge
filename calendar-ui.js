(()=>{
'use strict';
const Cal=window.WorldForgeCalendar,S=window.WorldForgeSociety,X=window.WorldForgeEndless;
if(!Cal||!S||!window.WorldRenderer)return;
const $=s=>document.querySelector(s),fmt=(n,d=0)=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d}),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={world:null,viewYear:null,settlementId:0,month:0,day:15,last:null};

const underlying=S.__worldforgeV09BaseSimulate||S.__worldforgeV08BaseSimulate||S.__worldforgeV07BaseSimulate||S.__worldforgeV10OriginalSimulate;
if(underlying)Cal.setBaseSimulator(underlying);
if(X?.setBaseSimulator&&underlying){X.setBaseSimulator((world,years,options)=>Cal.simulateYears(world,years,options))}
else if(underlying){S.simulateYears=(world,years,options)=>{Cal.simulateYears(world,years,options);return world.society};S.simulateTo=(world,target,options)=>{Cal.simulateTo(world,target,options);return world.society}}

function world(){return state.world||window.WorldForgeKnowledgeUI?.state?.world||window.WorldForgeChroniclePressUI?.state?.world||window.WorldForgeReleaseUI?.state?.world||null}
function viewedAbsoluteYear(w){return state.viewYear==null?Cal.absoluteYear(w):(w.endless?.epochOffset||0)+Number(state.viewYear||0)}
function ensure(){
  if($('#calendarClimatePanel'))return;
  const anchor=$('#knowledgePanel')||$('#chroniclePressPanel')||$('#wikiPanel')||$('.architecture-panel');
  if(!anchor)return;
  anchor.insertAdjacentHTML(anchor.id==='knowledgePanel'?'afterend':'beforebegin',`<section id="calendarClimatePanel" class="panel calendar-panel"><div class="panel-head"><div><span class="eyebrow">CALENDAR · SEASONS · WEATHER · SKY</span><h2>The Living Almanac</h2></div><span class="status-ready">v1.5</span></div><div class="calendar-kpis" id="calendarKpis"></div><div class="calendar-toolbar"><label>Settlement<select id="calendarSettlement"></select></label><label>Month<select id="calendarMonth"></select></label><label>Day<input id="calendarDay" type="number" min="1" max="35" value="15"></label><button id="calendarFocusMap">Focus on map</button><button id="calendarExport">Export Almanac HTML</button></div><div class="calendar-date-card"><div><span id="calendarDateKicker" class="eyebrow"></span><h3 id="calendarDateTitle"></h3><p id="calendarDateWeather"></p></div><div id="calendarMoon" class="calendar-moon"></div></div><div id="calendarMonths" class="calendar-months"></div><div class="calendar-lower"><div><span class="eyebrow">CELESTIAL DOCKET</span><div id="calendarSky" class="calendar-sky"></div></div><div><span class="eyebrow">CLIMATE CHRONICLE</span><div id="calendarPhenomena" class="calendar-phenomena"></div></div></div><p class="calendar-note">Weather is deterministic for world seed + absolute year. Annual harvest stress feeds prosperity, prices, population, trade and realm stability before the next simulation year.</p></section>`);
  $('#calendarSettlement').onchange=e=>{state.settlementId=Number(e.target.value);render(true)};
  $('#calendarMonth').onchange=e=>{state.month=Number(e.target.value);render(true)};
  $('#calendarDay').oninput=e=>{state.day=Number(e.target.value)||1;render(true)};
  $('#calendarFocusMap').onclick=()=>{const w=world(),s=w?.settlements?.[state.settlementId];if(s){window.WorldForgeKnowledgeUI?.state;const renderer=window.WorldForgeExtensions?.state?.renderer;document.querySelector(`[data-settlement="${s.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('#worldCanvas')?.scrollIntoView({behavior:'smooth',block:'center'})}};
  $('#calendarExport').onclick=exportAlmanac;
}
function monthIcon(m){return m.condition.includes('Snow')||m.condition.includes('frost')?'❄':m.condition.includes('storm')||m.condition.includes('rain')||m.condition==='Rain'?'☂':m.condition.includes('Heat')||m.condition.includes('heat')?'☀':'◌'}
function render(force=false){
  const w=world();if(!w)return;state.world=w;ensure();if(!$('#calendarClimatePanel'))return;
  Cal.initialize(w);
  const year=viewedAbsoluteYear(w),key=`${Cal.fingerprint(w)}|${year}|${state.settlementId}|${state.month}|${state.day}`;
  if(!force&&key===state.last)return;state.last=key;
  const select=$('#calendarSettlement');select.innerHTML=w.settlements.map(s=>`<option value="${s.id}" ${s.id===state.settlementId?'selected':''}>${esc(s.name)} · ${esc(s.type)}</option>`).join('');
  if(!w.settlements[state.settlementId])state.settlementId=0;
  const c=w.calendarClimate;
  $('#calendarMonth').innerHTML=c.calendar.months.map(m=>`<option value="${m.id}" ${m.id===state.month?'selected':''}>${esc(m.name)}</option>`).join('');
  $('#calendarDay').max=state.month===11?35:30;state.day=Math.min(state.day,state.month===11?35:30);$('#calendarDay').value=state.day;
  const a=Cal.almanac(w,state.settlementId,year),d=Cal.dateInfo(w,state.settlementId,year,state.month,state.day),sum=Cal.summary(w),p=a.profile;
  const currentYear=year===Cal.absoluteYear(w),annual=currentYear?c.current.settlement[state.settlementId]:Cal.computeYear(w,year,false).settlement[state.settlementId];
  $('#calendarKpis').innerHTML=[['YEAR',fmt(year)],['LATITUDE',`${fmt(p.latitude,1)}°`],['ANNUAL TEMP',`${fmt(annual.tempC,1)}°C`],['ANNUAL RAIN',`${fmt(annual.rainMm)} mm`],['HARVEST',`${fmt(annual.cropYield*100)}%`],['FOOD STRESS',`${fmt(annual.foodStress*100)}%`],['WORLD TEMP Δ',`${sum.tempAnomaly>=0?'+':''}${fmt(sum.tempAnomaly,1)}°C`],['EXTREMES',sum.extremes]].map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('');
  $('#calendarDateKicker').textContent=`${d.weekday.toUpperCase()} · ${d.monthName.toUpperCase()} ${d.day} · YEAR ${fmt(year)} · ${d.season.toUpperCase()}`;
  $('#calendarDateTitle').textContent=`${w.settlements[state.settlementId].name} — ${d.condition}`;
  $('#calendarDateWeather').textContent=`${fmt(d.tempC,1)}°C · ${fmt(d.rainMm)} mm monthly precipitation · ${fmt(d.daylightHours,1)} hours daylight`;
  $('#calendarMoon').innerHTML=`<span>☾</span><b>${esc(d.moonPhase)}</b><small>${fmt(d.moonIllumination*100)}% illuminated</small>`;
  $('#calendarMonths').innerHTML=a.months.map(m=>`<button class="calendar-month ${m.month===state.month?'active':''}" data-month="${m.month}"><span>${monthIcon(m)}</span><div><b>${esc(m.monthName)}</b><small>${esc(m.season)} · ${esc(m.condition)}</small></div><strong>${fmt(m.tempC,1)}°</strong><em>${fmt(m.rainMm)}mm</em></button>`).join('');
  document.querySelectorAll('.calendar-month').forEach(b=>b.onclick=()=>{state.month=Number(b.dataset.month);render(true)});
  $('#calendarSky').innerHTML=a.celestial.events.length?a.celestial.events.map(e=>`<article><span>${esc(e.type.toUpperCase())} · ${esc(c.calendar.months[e.month].name)} ${e.day}</span><b>${esc(e.title)}</b><p>${esc(e.text)}</p></article>`).join(''):'<article><b>A quiet sky</b><p>No rare celestial phenomenon is recorded for this year. The Silver Moon continues its 29.53-day cycle.</p></article>';
  const ph=c.phenomena.filter(x=>x.year<=year).slice(-10).reverse();
  $('#calendarPhenomena').innerHTML=ph.map(e=>`<article><span>YEAR ${fmt(e.year)} · ${esc(e.type.replaceAll('_',' ').toUpperCase())}</span><b>${esc(e.title)}</b><small>${e.settlementId==null?'World sky':esc(w.settlements[e.settlementId]?.name||'Unknown place')}</small></article>`).join('')||'<article><b>No recorded extremes yet.</b><small>The first simulated years will begin the climate chronicle.</small></article>';
  const pill=$('.version-pill');if(pill)pill.textContent='v1.5 · LIVING ALMANAC';
  const foot=document.querySelector('footer span');if(foot)foot.textContent='WorldForge v1.5 · Calendar, Seasons, Weather & Celestial System';
  document.title=`${w.name} · Year ${year} Almanac · WorldForge v1.5`;
}
function exportAlmanac(){
  const w=world();if(!w)return;const year=viewedAbsoluteYear(w),a=Cal.almanac(w,state.settlementId,year),p=a.profile,s=w.settlements[state.settlementId];
  const months=a.months.map(m=>`<article><h2>${esc(m.monthName)}</h2><b>${esc(m.season)} · ${esc(m.condition)}</b><p>${fmt(m.tempC,1)}°C · ${fmt(m.rainMm)} mm · ${fmt(m.daylightHours,1)}h daylight</p></article>`).join('');
  const sky=a.celestial.events.map(e=>`<li><b>${esc(e.title)}</b> — ${esc(w.calendarClimate.calendar.months[e.month].name)} ${e.day}: ${esc(e.text)}</li>`).join('')||'<li>No rare celestial events recorded.</li>';
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.name)} Almanac · Year ${year}</title><style>body{margin:0;background:#101713;color:#e9eadf;font:16px/1.6 Georgia,serif}.wrap{max-width:1100px;margin:auto;padding:32px}.mast{padding:32px;border:1px solid #526352;background:#18221b;border-radius:24px}.mast h1{font-size:clamp(40px,8vw,80px);margin:.15em 0}.meta{color:#aeba9d}.months{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:20px}.months article{background:#172019;border:1px solid #38483b;border-radius:14px;padding:18px}.months h2{margin:0;color:#d8bd79}</style></head><body><main class="wrap"><header class="mast"><small>WORLDFORGE LIVING ALMANAC · YEAR ${fmt(year)}</small><h1>${esc(s.name)}</h1><p class="meta">Latitude ${fmt(p.latitude,1)}° · ${esc(p.biome)} · baseline ${fmt(p.baseTempC,1)}°C / ${fmt(p.baseRainMm)} mm yearly precipitation</p></header><section class="months">${months}</section><h2>Celestial docket</h2><ul>${sky}</ul></main></body></html>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${String(s.name).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-year-${year}-almanac.html`;document.body.appendChild(link);link.click();setTimeout(()=>{URL.revokeObjectURL(link.href);link.remove()},0);
}
const proto=window.WorldRenderer.prototype,oldSet=proto.setWorld,oldHist=proto.setHistoryView;
proto.setWorld=function(w){state.world=w;state.viewYear=null;state.last=null;Cal.initialize(w);const r=oldSet.call(this,w);setTimeout(()=>render(true),0);return r};
proto.setHistoryView=function(v){const r=oldHist.call(this,v);if(this.world){state.world=this.world;state.viewYear=v?.isPresent?null:(v?.year??null);state.last=null;setTimeout(()=>render(true),0)}return r};
setInterval(()=>render(false),1400);setTimeout(()=>render(true),180);
window.WorldForgeCalendarUI={version:'1.5.0',state,render,exportAlmanac};
})();