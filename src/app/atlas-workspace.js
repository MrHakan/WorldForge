(()=>{
'use strict';
if(typeof document==='undefined'||window.WorldForgeMapExperience)return;
const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const key='worldforge.atlas.v52';
const defaults={labels:true,borders:false,roads:false,trade:false,military:false,operations:false,detailedLabels:false,hubs:false,supply:false,finance:false,jobs:false,migration:false,recruitment:false};
let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const state={projection:saved.projection==='flat'?'flat':'relief',mode:['terrain','political','biome','elevation','temperature','moisture','population','prosperity','trade','fiscal','workforce','migration'].includes(saved.mode)?saved.mode:'terrain',layers:{...defaults},focus:innerWidth<900,wide:false};
for(const name of Object.keys(defaults))if(typeof saved.layers?.[name]==='boolean')state.layers[name]=saved.layers[name];
let renderer=null,lastWorld=null,overlayFrame=0,adoptionFrame=0,observer,mounted=false;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(paths,size=18)=>'<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
const icons={
 overview:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"/>',
 society:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 10v-4a5 5 0 0 0-3-4"/>',
 realms:'<path d="m3 6 4 4 5-7 5 7 4-4-2 13H5L3 6Zm3 10h12"/>',
 places:'<path d="M3 21V9l5-4 5 4v12M13 12l4-3 4 3v9M7 12h2m-2 4h2m8-2h1M1 21h22"/>',
 culture:'<path d="M12 3v18M4 8l8-5 8 5M4 8v10l8 3 8-3V8M4 8l8 4 8-4"/>',
 factions:'<path d="M3 20h18M5 16V9m5 7V5m5 11v-5m5 5V3"/>',
 adventure:'<path d="M12 5c-3-2-7-2-10 0v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15"/>',
 discovery:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
 worldbuilding:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>'
};
const names={overview:'World',society:'People & society',realms:'Realms',places:'Settlements',culture:'Culture & faith',factions:'Economy',adventure:'Story studio',discovery:'Discoveries',worldbuilding:'Worldbuilding'};
const layersIcon=icons.worldbuilding;
function save(){try{localStorage.setItem(key,JSON.stringify({projection:state.projection,mode:state.mode,layers:state.layers}))}catch{}}
function redraw(){if(renderer){renderer.layers={labels:state.layers.labels,borders:state.layers.borders,roads:state.layers.roads};renderer.draw()}}
function refreshOverlays(){
  if(overlayFrame)return;
  overlayFrame=requestAnimationFrame(()=>{overlayFrame=0;for(const name of['WorldForgeTradeRouteOverlay','WorldForgeWarfareSupplyOverlay','WorldForgeWarfareStrategicMapOverlay'])window[name]?.render?.(true)});
}
function setLayer(name,value){if(!(name in defaults))return;state.layers[name]=Boolean(value);save();sync();redraw();refreshOverlays()}
function setProjection(projection){state.projection=projection==='flat'?'flat':'relief';renderer?.setProjection(state.projection);save();sync();refreshOverlays()}
function setMode(mode){
  state.mode=mode;if(mode==='political')state.layers.borders=true;if(mode==='migration')state.layers.migration=true;
  const original=$('.map-mode[data-mode="'+mode+'"]');
  if(original)original.click();else renderer?.setMode(mode);
  save();sync();redraw();
}
function closeLayers(){const panel=$('#atlasLayerPanel'),button=$('#atlasLayersButton');if(panel)panel.hidden=true;button?.setAttribute('aria-expanded','false')}
function closeFiles(){const menu=$('#atlasFileMenu');if(menu)menu.dataset.open='false';$('#atlasFilesButton')?.setAttribute('aria-expanded','false')}
function focusMap(value){state.focus=Boolean(value);document.documentElement.dataset.atlasFocus=String(state.focus);sync();requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')))}
function sync(){
  $$('[data-atlas-layer]').forEach(input=>{input.checked=state.layers[input.dataset.atlasLayer]});
  $$('[data-atlas-projection]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.atlasProjection===state.projection)));
  const select=$('#atlasTheme');if(select)select.value=state.mode;
  const details=$('#atlasDetailsButton');if(details){details.setAttribute('aria-pressed',String(!state.focus));details.title=state.focus?'Show workspace details':'Focus on the map';details.querySelector('span').textContent=innerWidth<900?'Details':state.focus?'Show details':'Focus map'}
}
function adoptPanels(){
  const layout=$('.layout'),inspector=$('#atlasInspector');if(!layout||!inspector)return;
  for(const panel of [...layout.children])if(panel.classList.contains('panel')&&!panel.classList.contains('map-panel'))inspector.appendChild(panel);
}
function decorateNavigation(){
  const nav=$('#workspaceTabs');if(!nav)return;
  if(!$('#atlasNavHeading'))nav.insertAdjacentHTML('afterbegin','<div id="atlasNavHeading">WORKSPACE</div>');
  $$('[data-workspace-tab]').forEach(button=>{
    const id=button.dataset.workspaceTab;if(button.dataset.atlasStyled)return;button.dataset.atlasStyled='true';
    button.title=button.textContent;button.setAttribute('aria-label',names[id]||button.textContent);button.innerHTML=icon(icons[id]||icons.overview)+'<span>'+esc(names[id]||button.textContent)+'</span>';
  });
}
function reconcileLegacyControls(){
  const host=$('#atlasAdvancedControls');if(!host)return;
  for(const id of['strategicMapTools','tradeRouteControls','worldforgeStrategicMapControls']){
    const element=document.getElementById(id);if(element&&element.parentElement!==host)host.appendChild(element);
  }
  host.querySelectorAll('[data-map-pref], [data-workforce-toggle] input').forEach(input=>{
    const raw=input.dataset.mapPref||input.closest('[data-workforce-toggle]')?.dataset.workforceToggle;
    const name=raw==='labels'?'detailedLabels':raw;
    if(!(name in defaults))return;
    if(input.checked!==state.layers[name]){input.checked=state.layers[name];input.dispatchEvent(new Event('change',{bubbles:true}))}
  });
}
function selection(){
  const host=$('#atlasSelection'),world=renderer?.world,id=renderer?.selectedSettlementId;
  const s=world?.settlements?.find(s=>s.id===id);if(!host)return;
  host.hidden=!s;if(!s)return;
  const realm=renderer.realm(renderer.ownerOf(s)),population=Math.round(renderer.popOf(s)).toLocaleString();
  host.innerHTML='<button class="atlas-selection-close" aria-label="Close settlement details">×</button><span class="atlas-kicker">SETTLEMENT</span><strong>'+esc(s.name)+'</strong><p>'+esc(realm?.name||'Independent')+' · '+population+' people</p><button class="atlas-open-settlement">Open settlement '+icon('<path d="M5 12h14m-5-5 5 5-5 5"/>',14)+'</button>';
  host.querySelector('.atlas-selection-close').onclick=()=>{renderer.selectedSettlementId=null;selection();redraw()};
  host.querySelector('.atlas-open-settlement').onclick=()=>{window.WorldForgeWorkspaceNavigation.activateCategory('places');window.WorldForgeWorkspaceNavigation.activatePage('settlements');focusMap(false)};
}
function onDraw(event){
  renderer=event.detail.renderer;window.worldRenderer=renderer;
  const world=renderer.world;if(!world)return;
  const label=$('#atlasDimensions');if(label){const value=world.settings.width+' × '+world.settings.height+' cells';if(label.textContent!==value)label.textContent=value}
  const zoom=$('#atlasZoom');if(zoom)zoom.textContent=Math.round(renderer.camera.zoom*100)+'%';
  if(lastWorld!==world){lastWorld=world;selection()}
  refreshOverlays();
}
function setup(){
  const layout=$('.layout'),panel=$('.map-panel'),header=$('.map-head'),wrap=$('#mapWrap');if(!layout||!panel||!header||!wrap)return;
  document.documentElement.classList.add('atlas-app');document.documentElement.dataset.atlasFocus=String(state.focus);
  const inspector=document.createElement('aside');inspector.id='atlasInspector';inspector.setAttribute('aria-label','Workspace details');
  inspector.innerHTML='<div class="atlas-inspector-heading"><span>Workspace details</span><button id="atlasExpandInspector" aria-label="Expand details panel" aria-pressed="false" title="Expand details panel">'+icon('<path d="M8 3H3v5m18 0V3h-5M3 16v5h5m8 0h5v-5"/>',14)+'</button><button id="atlasCloseInspector" aria-label="Close workspace details">'+icon('<path d="m6 6 12 12M6 18 18 6"/>',16)+'</button></div>';
  layout.prepend(inspector);adoptPanels();
  window.WorldForgeWorkspaceNavigation?.refresh();decorateNavigation();
  const actions=$('.top-actions'),exportButton=$('#exportBtn'),importButton=$('#importInput')?.closest('.file-button');
  if(actions&&exportButton&&importButton){
    actions.insertAdjacentHTML('beforeend','<div class="atlas-files"><button id="atlasFilesButton" aria-expanded="false" aria-controls="atlasFileMenu">Files</button><div id="atlasFileMenu" data-open="false"></div></div>');
    $('#atlasFileMenu').append(exportButton,importButton);
    $('#atlasFilesButton').onclick=()=>{const menu=$('#atlasFileMenu'),open=menu.dataset.open!=='true';menu.dataset.open=String(open);$('#atlasFilesButton').setAttribute('aria-expanded',String(open))};
    exportButton.addEventListener('click',closeFiles);$('#importInput').addEventListener('change',closeFiles);
  }
  const headLabel=header.querySelector('.eyebrow');if(headLabel)headLabel.textContent='WORLD ATLAS';
  header.querySelector('.map-actions')?.setAttribute('hidden','');
  header.insertAdjacentHTML('beforeend','<div class="atlas-map-tools"><div class="atlas-projections" role="group" aria-label="Map projection"><button data-atlas-projection="relief" aria-pressed="true">2.5D</button><button data-atlas-projection="flat" aria-pressed="false">Flat</button></div><label class="atlas-theme-label"><span class="sr-only">Map theme</span><select id="atlasTheme"><optgroup label="Land & realms"><option value="terrain">Natural terrain</option><option value="political">Political</option><option value="biome">Biomes</option><option value="elevation">Elevation</option></optgroup><optgroup label="People & economy"><option value="population">Population</option><option value="prosperity">Prosperity</option><option value="trade">Trade</option><option value="fiscal">Public finance</option><option value="workforce">Workforce</option><option value="migration">Migration</option></optgroup><optgroup label="Climate"><option value="temperature">Temperature</option><option value="moisture">Moisture</option></optgroup></select></label><button id="atlasLayersButton" aria-label="Map layers" aria-expanded="false" aria-controls="atlasLayerPanel">'+icon(layersIcon)+'<span>Layers</span></button><button id="atlasDetailsButton" aria-label="Toggle workspace details" aria-pressed="true">'+icon('<path d="M4 4h16v16H4zM9 4v16"/>')+'<span>Focus map</span></button></div>');
  const layerLabels=[['labels','Place names','Major settlements only; more appear as you zoom.'],['borders','Realm borders','Subtle boundaries over the terrain.'],['roads','Roads','The overland connections between settlements.'],['trade','Trade routes','Road, river and sea trade.'],['military','Armies & fleets','Operational units and supply lines.'],['operations','Strategic operations','Fronts, campaigns and occupation zones.']];
  panel.insertAdjacentHTML('beforeend','<section id="atlasLayerPanel" hidden aria-label="Map layers"><div class="atlas-layer-heading"><div><span class="atlas-kicker">YOUR MAP</span><h3>Layers</h3></div><button id="atlasLayersClose" aria-label="Close map layers">×</button></div><p class="atlas-layer-note">Keep the view quiet. Add only what you need.</p>'+layerLabels.map(([id,label,note])=>'<label class="atlas-layer-row"><span><b>'+label+'</b><small>'+note+'</small></span><input type="checkbox" data-atlas-layer="'+id+'"></label>').join('')+'<details class="atlas-advanced"><summary>Advanced analysis & military tools</summary><div id="atlasAdvancedControls"></div></details><button id="atlasCleanMap">Reset to a clean map</button></section>');
  wrap.insertAdjacentHTML('beforeend','<div class="atlas-compass" aria-hidden="true"><span>N</span>'+icon('<path d="m12 3 5 17-5-4-5 4 5-17Z"/>',26)+'</div><aside id="atlasSelection" hidden aria-label="Selected settlement"></aside>');
  const footer=document.createElement('div');footer.className='atlas-map-footer';footer.innerHTML='<span class="atlas-map-help">Drag to explore <i>·</i> Scroll to zoom</span><div class="atlas-map-status"><span id="atlasDimensions"></span><span id="atlasZoom">100%</span></div>';panel.appendChild(footer);
  const legend=$('#legend');if(legend)footer.prepend(legend);
  const zoom=$('.map-controls');if(zoom){zoom.classList.add('atlas-zoom-controls');footer.appendChild(zoom);zoom.querySelector('#zoomLabel')?.setAttribute('hidden','')}
  $('#zoomInBtn')?.setAttribute('aria-label','Zoom in');$('#zoomOutBtn')?.setAttribute('aria-label','Zoom out');
  $$('.map-hint').forEach(el=>el.hidden=true);
  header.querySelector('[data-atlas-projection="relief"]').onclick=()=>setProjection('relief');header.querySelector('[data-atlas-projection="flat"]').onclick=()=>setProjection('flat');
  $('#atlasTheme').onchange=event=>setMode(event.target.value);
  $('#atlasLayersButton').onclick=()=>{const p=$('#atlasLayerPanel');p.hidden=!p.hidden;$('#atlasLayersButton').setAttribute('aria-expanded',String(!p.hidden))};
  $('#atlasLayersClose').onclick=()=>{closeLayers();$('#atlasLayersButton').focus()};
  $('#atlasDetailsButton').onclick=()=>focusMap(!state.focus);
  $('#atlasCloseInspector').onclick=()=>{focusMap(true);$('#atlasDetailsButton').focus()};
  $('#atlasExpandInspector').onclick=()=>{state.wide=!state.wide;document.documentElement.dataset.atlasWide=String(state.wide);$('#atlasExpandInspector').setAttribute('aria-pressed',String(state.wide));requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')))};
  $('#atlasLayerPanel').onchange=event=>{
    const input=event.target;if(input.dataset.atlasLayer)setLayer(input.dataset.atlasLayer,input.checked);
    const raw=input.dataset.mapPref||input.closest('[data-workforce-toggle]')?.dataset.workforceToggle,name=raw==='labels'?'detailedLabels':raw;
    if(name in defaults&&state.layers[name]!==input.checked)setLayer(name,input.checked);
  };
  $('#atlasLayerPanel').addEventListener('click',event=>{if(event.target.closest('[data-layer]')&&!state.layers.operations)setLayer('operations',true)});
  $('#atlasCleanMap').onclick=()=>{state.layers={...defaults};state.mode='terrain';setMode('terrain');setProjection('relief');reconcileLegacyControls();sync();redraw();refreshOverlays()};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeLayers();closeFiles()}});
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('#atlasLayerPanel,#atlasLayersButton'))closeLayers();if(!event.target.closest('.atlas-files'))closeFiles()});
  renderer=window.WorldForgeApp?.state?.renderer;
  if(renderer){
    window.worldRenderer=renderer;renderer.layers={labels:state.layers.labels,borders:state.layers.borders,roads:state.layers.roads};renderer.projection=state.projection;
    const previous=renderer.onSelectSettlement;renderer.onSelectSettlement=settlement=>{previous?.(settlement);selection()};
    setMode(state.mode);renderer.draw();
  }
  window.WorldForgeWorkspaceNavigation?.onStructureChange('.panel',()=>{
    if(adoptionFrame)return;adoptionFrame=requestAnimationFrame(()=>{adoptionFrame=0;adoptPanels();window.WorldForgeWorkspaceNavigation.refresh()});
  });
  observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('#strategicMapTools,#tradeRouteControls,#worldforgeStrategicMapControls,[data-map-pref],[data-workforce-toggle]')||node.querySelector?.('[data-map-pref],[data-workforce-toggle]')))))reconcileLegacyControls();
  });
  observer.observe(panel,{childList:true,subtree:true});reconcileLegacyControls();sync();mounted=true;requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}
window.WorldForgeMapExperience={state,isLayerVisible:name=>Boolean(state.layers[name]),setLayer,setProjection,setMode,focusMap,refreshOverlays};
window.addEventListener('worldforge:map-draw',onDraw);
window.addEventListener('worldforge:workspace-change',()=>{decorateNavigation();if(mounted&&innerWidth<900)focusMap(false)});
window.addEventListener('worldforge:ready',()=>{adoptPanels();reconcileLegacyControls();sync();redraw();window.WorldForgeReleaseInfo?.apply()});
window.addEventListener('resize',sync);
setup();
})();
