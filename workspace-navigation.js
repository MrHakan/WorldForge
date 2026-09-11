(()=>{
'use strict';
if(typeof document==='undefined'||window.__worldforgeWorkspaceNavigation)return;window.__worldforgeWorkspaceNavigation=true;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CATEGORIES=[
 {id:'overview',label:'Overview',match:['generator-panel','summary-panel','history-panel','history-charts-panel','chronicle-panel']},
 {id:'society',label:'Society',match:['society-overview-panel','thrones-panel','people-panel','dynasty-panel']},
 {id:'realms',label:'Realms',match:['diplomacy-panel','kingdoms-panel','politics-panel','world-order-panel']},
 {id:'places',label:'Places & Cities',match:['places-panel','city-panel','housing-panel','municipal-panel','workforce-panel','urbanEvolutionSection','urbanInfrastructureSection']},
 {id:'culture',label:'Culture & Faith',match:['culture-panel','religion-panel','heritage-panel','tourism-panel','archaeology-panel']},
 {id:'factions',label:'Factions & Economy',match:['faction-panel','organization-panel','economy-panel','trade-panel','crime-panel']},
 {id:'adventure',label:'Adventure & Story',match:['adventure-panel','story-panel','quest-panel','site-panel']},
 {id:'worldbuilding',label:'Worldbuilding',match:['worldbuilding-panel','worldbuildingPanel','architecture-panel','wiki-panel','encyclopedia-panel']}
];
const STYLE=`
.workspace-tabs{position:sticky;top:92px;z-index:35;display:flex;gap:6px;overflow-x:auto;margin-top:10px;padding:8px;border:1px solid var(--line);border-radius:12px;background:rgba(14,20,15,.96);backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(0,0,0,.24);scrollbar-width:thin}
.workspace-tabs button{flex:0 0 auto;padding:8px 12px;border-radius:8px;font-size:10px;font-weight:800;white-space:nowrap;background:#131d15}
.workspace-tabs button.active{border-color:#a78345;background:#3d321e;color:#f5d699}
.layout{align-items:start}
.layout>.map-panel{grid-column:2;grid-row:1;position:sticky;top:148px;z-index:12;max-height:calc(100vh - 164px);min-height:0}
.layout>.map-panel .map-wrap,.layout>.map-panel .map-wrap canvas{height:min(610px,calc(100vh - 250px));min-height:360px}
.layout>.panel:not(.map-panel){grid-column:1;content-visibility:auto;contain-intrinsic-size:420px}
.layout>.panel[hidden]{display:none!important}
#worldbuildingPanel[hidden]{display:none!important}
@media(min-width:1201px){.layout{grid-template-columns:minmax(300px,430px) minmax(560px,1fr)}.layout>.panel:not(.map-panel){grid-column:1}.layout>.places-panel,.layout>.architecture-panel{grid-column:1}.layout>.map-panel{grid-column:2}}
@media(max-width:1200px){.workspace-tabs{top:8px}.layout>.map-panel{position:sticky;top:64px;grid-column:1;grid-row:auto;max-height:none}.layout>.map-panel .map-wrap,.layout>.map-panel .map-wrap canvas{height:460px;min-height:360px}.layout>.panel:not(.map-panel){grid-column:1}}
@media(max-width:760px){.workspace-tabs{position:sticky;top:0;margin-top:7px;border-radius:10px}.layout>.map-panel{top:54px}.layout>.map-panel .map-wrap,.layout>.map-panel .map-wrap canvas{height:340px;min-height:300px}.workspace-tabs button{padding:7px 10px;font-size:9px}}
`;
let active=localStorage.getItem('worldforge.workspace.tab')||'overview',raf=0;
function injectStyle(){if($('#workspaceNavigationStyle'))return;const s=document.createElement('style');s.id='workspaceNavigationStyle';s.textContent=STYLE;document.head.appendChild(s)}
function categoryFor(el){const key=`${el.id||''} ${el.className||''}`;for(const c of CATEGORIES)if(c.match.some(x=>key.includes(x)))return c.id;return'overview'}
function ensureNav(){injectStyle();if($('#workspaceTabs'))return;const header=$('.topbar');if(!header)return;header.insertAdjacentHTML('afterend',`<nav id="workspaceTabs" class="workspace-tabs" aria-label="WorldForge sections">${CATEGORIES.map(c=>`<button type="button" role="tab" data-workspace-tab="${c.id}">${c.label}</button>`).join('')}</nav>`);$('#workspaceTabs').addEventListener('click',e=>{const b=e.target.closest('[data-workspace-tab]');if(!b)return;activate(b.dataset.workspaceTab)})}
function classify(){const layout=$('.layout');if(!layout)return;$$('.layout > .panel').forEach(p=>{if(p.classList.contains('map-panel')){p.dataset.workspacePersistent='map';p.hidden=false;return}p.dataset.workspacePage=categoryFor(p)});const wb=$('#worldbuildingPanel');if(wb)wb.dataset.workspacePage='worldbuilding'}
function activate(id){if(!CATEGORIES.some(c=>c.id===id))id='overview';active=id;localStorage.setItem('worldforge.workspace.tab',id);document.documentElement.dataset.workspaceTab=id;$$('[data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});$$('.layout > .panel').forEach(p=>{if(p.dataset.workspacePersistent==='map'){p.hidden=false;return}p.hidden=p.dataset.workspacePage!==id});window.dispatchEvent(new CustomEvent('worldforge:workspace-tab',{detail:{tab:id}}))}
function refresh(){ensureNav();classify();activate(active)}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;refresh()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',refresh,{once:true});setTimeout(refresh,250);setTimeout(refresh,1400);
window.WorldForgeWorkspaceNavigation={activate,refresh,get active(){return active},categories:CATEGORIES.map(c=>({id:c.id,label:c.label}))};
})();