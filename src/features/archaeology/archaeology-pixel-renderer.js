(function(root,factory){
  const api=factory(root&&root.WorldForgePixelRenderer,root&&root.WorldForgeArchaeology);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeArchaeologyPixel=api;
})(typeof window!=='undefined'?window:globalThis,function(Renderer,Archaeology){
'use strict';
if(!Renderer||!Archaeology)throw new Error('WorldForge v4.2 Archaeology Pixel Renderer requires PixelRenderer and Archaeology');
const VERSION='4.2.0',BASE_RENDER=Renderer.renderSettlement,BASE_PALETTE=Renderer.palette;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),n=v=>Math.round(Number(v)||0);
function hash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${Math.max(1,n(w))}" height="${Math.max(1,n(h))}" fill="${fill}" ${extra}/>`;
const line=(x1,y1,x2,y2,stroke,width=1)=>`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${Math.max(1,n(width))}" stroke-linecap="square"/>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stageGlyph(site,x,y,s,p,stage=site.lifecycleStage){
 const id=esc(site.id),type=site.siteType||'ruin',u=Math.max(1,n(s)),dark=p.dark,wall=p.wall,light=p.light,wood=p.wood,accent=p.accent,ground=p.ground,green=(p.ground===p.water?p.light:p.ground);
 let out=`<g data-archaeology-site="${id}" data-site-type="${esc(type)}" data-ruin-stage="${esc(stage)}">`;
 if(type==='battlefield'){
  out+=line(x+2*u,y,x+2*u,y+7*u,dark,1)+line(x+u,y+u,x+5*u,y+3*u,accent,1)+line(x+7*u,y+u,x+3*u,y+6*u,wood,1)+line(x+3*u,y+u,x+7*u,y+6*u,wood,1);
  if(stage==='overgrown')out+=rect(x,y+6*u,9*u,2*u,green,'opacity=".8"')+rect(x+u,y+5*u,u,u,light)+rect(x+6*u,y+5*u,u,u,light);
  if(stage==='excavated')out+=line(x,y+8*u,x+10*u,y+8*u,accent,1)+line(x+1*u,y+5*u,x+1*u,y+9*u,light,1)+line(x+5*u,y+5*u,x+5*u,y+9*u,light,1)+line(x+9*u,y+5*u,x+9*u,y+9*u,light,1);
 }else if(stage==='pristine'){
  out+=rect(x,y+3*u,9*u,5*u,wall)+rect(x-u,y+2*u,11*u,2*u,light)+rect(x+2*u,y,5*u,3*u,accent)+rect(x+3*u,y+5*u,3*u,3*u,dark)+rect(x+u,y+4*u,u,3*u,light)+rect(x+7*u,y+4*u,u,3*u,light);
 }else if(stage==='damaged'){
  out+=rect(x,y+4*u,8*u,4*u,wall)+rect(x-u,y+3*u,5*u,u,light)+rect(x+5*u,y+2*u,4*u,2*u,light)+rect(x+2*u,y+6*u,2*u,2*u,dark)+line(x+5*u,y+3*u,x+4*u,y+7*u,dark,1)+rect(x+8*u,y+7*u,2*u,u,dark,'opacity=".45"');
 }else if(stage==='ruined'){
  out+=rect(x,y+6*u,9*u,2*u,wall)+rect(x,y+2*u,2*u,5*u,wall)+rect(x+6*u,y+3*u,2*u,4*u,wall)+rect(x+2*u,y+7*u,2*u,u,dark,'opacity=".55"')+rect(x+8*u,y+6*u,2*u,2*u,light,'opacity=".8"')+rect(x+4*u,y+7*u,u,u,dark);
 }else if(stage==='overgrown'){
  out+=rect(x,y+6*u,9*u,2*u,wall)+rect(x,y+3*u,2*u,4*u,wall)+rect(x+6*u,y+4*u,2*u,3*u,wall)+rect(x-u,y+7*u,11*u,2*u,green,'opacity=".9"')+rect(x+u,y+2*u,u,5*u,green,'opacity=".78"')+rect(x+7*u,y+3*u,u,4*u,green,'opacity=".78"')+rect(x+3*u,y+5*u,u,u,light);
 }else{
  out+=rect(x,y+6*u,9*u,2*u,wall)+rect(x,y+3*u,2*u,4*u,wall)+rect(x+6*u,y+4*u,2*u,3*u,wall)+rect(x-u,y+8*u,11*u,u,ground)+line(x-u,y+2*u,x+10*u,y+2*u,accent,1)+line(x-u,y+5*u,x+10*u,y+5*u,accent,1)+line(x+2*u,y+u,x+2*u,y+10*u,accent,1)+line(x+5*u,y+u,x+5*u,y+10*u,accent,1)+line(x+8*u,y+u,x+8*u,y+10*u,accent,1)+rect(x+4*u,y+7*u,u,u,light)+rect(x+8*u,y+7*u,u,u,dark);
 }
 return out+'</g>'
}
function inject(svg,markup,version=VERSION){return String(svg).replace(/^<svg\b/,`<svg data-worldforge-archaeology="${version}"`).replace(/<\/svg>\s*$/,`${markup}</svg>`)}
function renderSettlement(profile,options={}){
 const W=Math.max(320,Number(options.width)||720),H=Math.max(220,Number(options.height)||440),p=BASE_PALETTE(profile),sites=profile.archaeology?.sites||[];let svg=BASE_RENDER(profile,options),overlay='<g data-archaeology-overlay="v4.2">';
 for(const site of sites){const s=Math.max(2,Math.floor(W/310)),x=clamp(Number(site.x||.5)*W,10,W-80),y=clamp(Number(site.y||.5)*H,15,H-75);overlay+=stageGlyph(site,x,y,s,p);if(options.archaeologyLabels!==false)overlay+=`<text x="${n(x+4*s)}" y="${n(y+12*s)}" text-anchor="middle" font-family="monospace" font-size="${Math.max(7,Math.floor(W/96))}" fill="${p.dark}" opacity=".92">${esc(String(site.lifecycleStage||'site').replaceAll('_',' ').toUpperCase())}</text>`}
 overlay+='</g>';return inject(svg,overlay)
}
function renderReconstruction(profile,site,mode='now',options={}){
 const W=Math.max(320,Number(options.width)||520),H=Math.max(220,Number(options.height)||320),clone=JSON.parse(JSON.stringify(profile));delete clone.archaeology;clone.landmarks=(clone.landmarks||[]).filter(l=>String(l.id)!==String(site.landmarkId));const p=BASE_PALETTE(profile),stage=mode==='then'?'pristine':site.lifecycleStage,svg=BASE_RENDER(clone,{...options,width:W,height:H}),s=Math.max(3,Math.floor(W/220)),x=clamp(Number(site.x||.5)*W,20,W-100),y=clamp(Number(site.y||.5)*H,30,H-95),label=mode==='then'?(site.reconstruction?.thenYear==null?'THEN · RECONSTRUCTED':`THEN · YEAR ${site.reconstruction.thenYear}`):`NOW · ${String(stage).replaceAll('_',' ').toUpperCase()}`,markup=`<g data-reconstruction-mode="${esc(mode)}">${stageGlyph(site,x,y,s,p,stage)}<rect x="8" y="${H-34}" width="${Math.min(W-16,240)}" height="24" fill="${p.light}" opacity=".9"/><text x="16" y="${H-18}" font-family="monospace" font-size="12" font-weight="700" fill="${p.dark}">${esc(label)}</text></g>`;return inject(svg,markup)
}
function renderLifecycleStrip(profile,site,options={}){
 const stages=Archaeology.STAGES,W=Math.max(500,Number(options.width)||760),H=Math.max(120,Number(options.height)||150),p=BASE_PALETTE(profile),cell=W/stages.length,s=Math.max(2,Math.floor(W/360));let out=`<svg data-worldforge-archaeology-strip="${VERSION}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rect(0,0,W,H,p.ground)}`;
 stages.forEach((stage,i)=>{const x=i*cell+cell*.36,y=H*.28;out+=stageGlyph(site,x,y,s,p,stage)+`<text x="${n(i*cell+cell/2)}" y="${H-16}" text-anchor="middle" font-family="monospace" font-size="11" fill="${p.dark}">${esc(stage.toUpperCase())}</text>`;if(i)out+=line(i*cell,10,i*cell,H-10,p.dark,1)});return out+'</svg>'
}
function fingerprint(profile){return hash(renderSettlement(profile,{width:480,height:300})).toString(16).padStart(8,'0')}
Renderer.renderSettlement=renderSettlement;Renderer.fingerprint=fingerprint;Renderer.ARCHAEOLOGY_VERSION=VERSION;
return{VERSION,stageGlyph,renderSettlement,renderReconstruction,renderLifecycleStrip,fingerprint};
});