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
let active=localStorage.getItem('worldforge.workspace.tab')||'overview',raf=0;
function categoryFor(el){const key=`${el.id||''} ${el.className||''}`;for(const c of CATEGORIES)if(c.match.some(x=>key.includes(x)))return c.id;return'overview'}
function ensureNav(){if($('#workspaceTabs'))return;const header=$('.topbar');if(!header)return;header.insertAdjacentHTML('afterend',`<nav id="workspaceTabs" class="workspace-tabs" aria-label="WorldForge sections">${CATEGORIES.map(c=>`<button type="button" data-workspace-tab="${c.id}">${c.label}</button>`).join('')}</nav>`);$('#workspaceTabs').addEventListener('click',e=>{const b=e.target.closest('[data-workspace-tab]');if(!b)return;activate(b.dataset.workspaceTab)})}
function classify(){const layout=$('.layout');if(!layout)return;$$('.layout > .panel').forEach(p=>{if(p.classList.contains('map-panel')){p.dataset.workspacePersistent='map';return}p.dataset.workspacePage=categoryFor(p)});const wb=$('#worldbuildingPanel');if(wb)wb.dataset.workspacePage='worldbuilding'}
function activate(id){if(!CATEGORIES.some(c=>c.id===id))id='overview';active=id;localStorage.setItem('worldforge.workspace.tab',id);document.documentElement.dataset.workspaceTab=id;$$('[data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});$$('.layout > .panel').forEach(p=>{if(p.dataset.workspacePersistent==='map')return;p.hidden=p.dataset.workspacePage!==id});window.dispatchEvent(new CustomEvent('worldforge:workspace-tab',{detail:{tab:id}}))}
function refresh(){ensureNav();classify();activate(active)}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;refresh()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',refresh,{once:true});setTimeout(refresh,250);setTimeout(refresh,1400);
window.WorldForgeWorkspaceNavigation={activate,refresh,get active(){return active},categories:CATEGORIES.map(c=>({id:c.id,label:c.label}))};
})();