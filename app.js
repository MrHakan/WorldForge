(() => {
'use strict';
const E=window.WorldForgeEngine;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=0)=>Number(n).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d});
const state={world:null,renderer:null,mode:'political'};

function toast(text){const t=$('#toast');t.textContent=text;t.style.opacity='1';clearTimeout(t._x);t._x=setTimeout(()=>t.style.opacity='0',1700)}
function settingsFromUI(){return{
  seed:$('#seedInput').value.trim()||'WORLD',
  width:Number($('#widthInput').value),
  height:Number($('#heightInput').value),
  seaLevel:Number($('#seaLevelInput').value),
  age:$('#ageInput').value,
  settlementTarget:Number($('#settlementInput').value),
  kingdomTarget:Number($('#kingdomInput').value)
}}
function randomSeed(){
  const a=['ASH','EMBER','IVORY','THORN','SILVER','RAVEN','MOON','CINDER','FROST','GOLDEN','HOLLOW','STAR'];
  const b=['CROWN','VALE','SPIRE','REACH','WILD','MARCH','REALM','FALL','WATCH','TIDE','STONE','DAWN'];
  return `${a[Math.floor(Math.random()*a.length)]}-${b[Math.floor(Math.random()*b.length)]}-${Math.floor(10+Math.random()*90)}`
}
function updateRangeLabels(){$('#seaLevelValue').textContent=Number($('#seaLevelInput').value).toFixed(2);$('#settlementValue').textContent=$('#settlementInput').value;$('#kingdomValue').textContent=$('#kingdomInput').value}
function narrative(w){
  const b=E.BIOMES[w.summary.dominantBiome]?.label||w.summary.dominantBiome;
  const largest=[...w.kingdoms].sort((a,b)=>b.foundingPopulation-a.foundingPopulation)[0];
  const riverText=w.rivers.length>9?'river-cut':w.rivers.length>5?'well-watered':'sparsely watered';
  return `<b>${esc(w.name)}</b> begins in the Founding Age as a ${riverText} world with ${fmt(w.summary.landPercent,1)}% dry land. Its most common terrestrial biome is <b>${esc(b)}</b>. ${fmt(w.summary.foundingPopulation)} people live across ${w.settlements.length} recorded settlements, divided among ${w.kingdoms.length} nascent realms. The strongest founding population belongs to <b>${esc(largest?.name||'no realm')}</b>.`
}
function renderBiomeBars(w){
  const host=$('#biomeBars'),land=w.summary.landTiles;
  const rows=Object.entries(w.summary.biomes).filter(([k])=>!['ocean','deepOcean'].includes(k)).sort((a,b)=>b[1]-a[1]).slice(0,7);
  host.innerHTML=rows.map(([k,v])=>{const p=v/land*100;return `<div class="biome-row"><span>${esc(E.BIOMES[k]?.label||k)}</span><i><b style="width:${p.toFixed(1)}%"></b></i><strong>${p.toFixed(1)}%</strong></div>`}).join('')
}
function renderKingdoms(w){
  $('#kingdomList').innerHTML=w.kingdoms.map(k=>{
    const c=w.settlements[k.capitalId];
    return `<article class="kingdom-card" data-kingdom="${k.id}" data-settlement="${c.id}">
      <h3><i class="realm-dot" style="background:${k.color}"></i>${esc(k.name)}</h3>
      <dl><dt>Capital</dt><dd>${esc(c.name)}</dd><dt>Settlements</dt><dd>${k.settlementIds.length}</dd><dt>Founding population</dt><dd>${fmt(k.foundingPopulation)}</dd><dt>Claimed tiles</dt><dd>${fmt(k.areaTiles)}</dd></dl>
    </article>`
  }).join('');
  const f=$('#settlementFilter');f.innerHTML='<option value="all">All kingdoms</option>'+w.kingdoms.map(k=>`<option value="${k.id}">${esc(k.shortName)}</option>`).join('')
}
function renderSettlements(){
  const w=state.world;if(!w)return;const filter=$('#settlementFilter').value,sort=$('#settlementSort').value;
  let rows=[...w.settlements];if(filter!=='all')rows=rows.filter(s=>s.kingdomId===Number(filter));
  rows.sort(sort==='population'?(a,b)=>b.population-a.population:sort==='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>b.score-a.score);
  $('#settlementTable').innerHTML=rows.map(s=>{
    const k=w.kingdoms[s.kingdomId],biome=E.BIOMES[w.layers.biome[s.y*w.settings.width+s.x]]?.label||'—';
    return `<tr data-settlement="${s.id}"><td class="place-name">${s.capital?'★ ':''}${esc(s.name)}</td><td><span style="color:${k.color}">●</span> ${esc(k.shortName)}</td><td>${s.type}</td><td>${esc(biome)}</td><td>${fmt(s.population)}</td><td>${(s.score*100).toFixed(0)}/100</td></tr>`
  }).join('')||'<tr><td colspan="6" class="empty">No settlements match this filter.</td></tr>'
}
function renderLegend(){
  const h=$('#legend'),w=state.world;if(!w)return;
  if(state.mode==='political')h.innerHTML=w.kingdoms.map(k=>`<span><i style="background:${k.color}"></i>${esc(k.shortName)}</span>`).join('')+'<span><i style="background:#e5e0c7;border-radius:50%"></i>Settlement</span><span><i style="background:#6ba3b5"></i>River</span>';
  else if(state.mode==='biome')h.innerHTML=Object.entries(E.BIOMES).map(([k,b])=>`<span><i style="background:${b.color}"></i>${esc(b.label)}</span>`).join('');
  else if(state.mode==='elevation')h.innerHTML='<span><i style="background:#143346"></i>Deep</span><span><i style="background:#2f7684"></i>Shallow</span><span><i style="background:#53713f"></i>Lowland</span><span><i style="background:#9d8c68"></i>Highland</span><span><i style="background:#eef1ea"></i>Peak</span>';
  else if(state.mode==='temperature')h.innerHTML='<span><i style="background:#4d7fb7"></i>Cold</span><span><i style="background:#a9897e"></i>Temperate</span><span><i style="background:#d86b48"></i>Hot</span>';
  else h.innerHTML='<span><i style="background:#c7a55a"></i>Dry</span><span><i style="background:#7c9470"></i>Moderate</span><span><i style="background:#3d7f6f"></i>Wet</span>'
}
function renderWorld(){
  const w=state.world;if(!w)return;
  $('#worldName').textContent=w.name;$('#landPct').textContent=fmt(w.summary.landPercent,1)+'%';$('#riverCount').textContent=w.rivers.length;$('#settlementCount').textContent=w.settlements.length;$('#kingdomCount').textContent=w.kingdoms.length;$('#landBadge').textContent=`SEED ${w.settings.seed}`;$('#worldNarrative').innerHTML=narrative(w);
  renderBiomeBars(w);renderKingdoms(w);renderSettlements();renderLegend();state.renderer.setWorld(w);updateZoom()
}
function forge(){
  const settings=settingsFromUI();$('#generateBtn').disabled=true;$('#generateBtn').textContent='FORGING…';
  requestAnimationFrame(()=>setTimeout(()=>{
    try{state.world=E.generateWorld(settings);renderWorld();toast(`World forged · ${E.fingerprint(state.world)}`)}
    catch(err){console.error(err);toast('World generation failed')}
    finally{$('#generateBtn').disabled=false;$('#generateBtn').textContent='FORGE WORLD'}
  },20))
}
function updateZoom(){$('#zoomLabel').textContent=Math.round((state.renderer?.camera.zoom||1)*100)+'%'}
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},0)}
function bind(){
  state.renderer=new WorldRenderer($('#worldCanvas'));
  state.renderer.onHover=(s,p)=>{const tip=$('#mapTooltip');if(!s||!p){tip.classList.add('hidden');return}const w=state.world,k=w.kingdoms[s.kingdomId],biome=E.BIOMES[w.layers.biome[s.y*w.settings.width+s.x]]?.label;tip.innerHTML=`<b>${esc(s.name)}</b>${s.capital?'Capital · ':''}${esc(s.type)}<br>${esc(k.name)}<br>${esc(biome)} · pop. ${fmt(s.population)}<br>Site score ${(s.score*100).toFixed(0)}/100`;tip.style.left=Math.min(p.x+14,$('#mapWrap').clientWidth-255)+'px';tip.style.top=Math.max(12,p.y-20)+'px';tip.classList.remove('hidden')};
  state.renderer.onSelectSettlement=s=>{const row=document.querySelector(`[data-settlement="${s.id}"]`);row?.scrollIntoView({behavior:'smooth',block:'center'});toast(`${s.name} selected`)};
  $('#generateBtn').addEventListener('click',forge);$('#randomSeedBtn').addEventListener('click',()=>{$('#seedInput').value=randomSeed();forge()});$('#copySeedBtn').addEventListener('click',async()=>{await navigator.clipboard?.writeText($('#seedInput').value);toast('Seed copied')});
  ['seaLevelInput','settlementInput','kingdomInput'].forEach(id=>$('#'+id).addEventListener('input',updateRangeLabels));
  $$('.map-mode').forEach(b=>b.addEventListener('click',()=>{$$('.map-mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.mode=b.dataset.mode;state.renderer.setMode(state.mode);renderLegend()}));
  $('#zoomInBtn').addEventListener('click',()=>{state.renderer.camera.zoom=Math.min(8,state.renderer.camera.zoom*1.3);state.renderer.draw();updateZoom()});$('#zoomOutBtn').addEventListener('click',()=>{state.renderer.camera.zoom=Math.max(.75,state.renderer.camera.zoom/1.3);state.renderer.draw();updateZoom()});$('#centerBtn').addEventListener('click',()=>{state.renderer.center();updateZoom()});
  $('#worldCanvas').addEventListener('wheel',()=>setTimeout(updateZoom,0),{passive:true});
  $('#kingdomList').addEventListener('click',e=>{const card=e.target.closest('[data-settlement]');if(card)state.renderer.focusSettlement(Number(card.dataset.settlement))});
  $('#settlementTable').addEventListener('click',e=>{const tr=e.target.closest('[data-settlement]');if(tr)state.renderer.focusSettlement(Number(tr.dataset.settlement))});
  $('#settlementFilter').addEventListener('change',renderSettlements);$('#settlementSort').addEventListener('change',renderSettlements);
  $('#saveBtn').addEventListener('click',()=>{if(!state.world)return toast('Forge a world first');localStorage.setItem('worldforge-v01',E.serialize(state.world));toast('World saved locally')});
  $('#loadBtn').addEventListener('click',()=>{const raw=localStorage.getItem('worldforge-v01');if(!raw)return toast('No local save found');try{state.world=E.deserialize(raw);syncControls();renderWorld();toast('Local world loaded')}catch(e){toast('Save could not be loaded')}});
  $('#exportBtn').addEventListener('click',()=>{if(!state.world)return toast('Forge a world first');download(`${state.world.name.replace(/\W+/g,'-').toLowerCase()}.worldforge.json`,E.serialize(state.world))});
  $('#importInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{state.world=E.deserialize(await f.text());syncControls();renderWorld();toast('World imported')}catch(err){console.error(err);toast('Invalid WorldForge file')}e.target.value=''});
}
function syncControls(){const s=state.world.settings;$('#seedInput').value=s.seed;$('#widthInput').value=s.width;$('#heightInput').value=s.height;$('#seaLevelInput').value=s.seaLevel;$('#ageInput').value=s.age;$('#settlementInput').value=s.settlementTarget;$('#kingdomInput').value=s.kingdomTarget;updateRangeLabels()}
updateRangeLabels();bind();forge();
})();