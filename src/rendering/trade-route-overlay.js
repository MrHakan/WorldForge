(()=>{
'use strict';
const E=window.WorldForgeEconomyLogistics;if(!E)return;
const $=selector=>document.querySelector(selector);
let mode='all',good='all',last='';
function renderer(){return window.WorldForgeApp?.state?.renderer||window.worldRenderer}
function ensureControls(panel){
  if($('#tradeRouteControls'))return;
  const box=document.createElement('div');box.id='tradeRouteControls';
  box.innerHTML='<span>TRADE FILTERS</span>'+['all','road','river','sea'].map(value=>'<button data-trade-mode="'+value+'">'+value.toUpperCase()+'</button>').join('')+'<select id="tradeGoodFilter" aria-label="Trade goods"><option value="all">All goods</option>'+E.GOODS.map(value=>'<option value="'+value+'">'+value+'</option>').join('')+'</select>';
  box.onclick=event=>{const button=event.target.closest('[data-trade-mode]');if(button){mode=button.dataset.tradeMode;render(true)}};
  box.querySelector('select').onchange=event=>{good=event.target.value;render(true)};panel.appendChild(box);
}
function render(force=false){
  const r=renderer(),w=r?.world,panel=$('#mapWrap');if(!w||!panel)return;
  ensureControls(panel);
  let svg=$('#worldforgeTradeOverlay');
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='worldforgeTradeOverlay';svg.setAttribute('aria-hidden','true');Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3',color:'#e1c28c'});panel.appendChild(svg)}
  if((window.WorldForgeMapExperience&&!window.WorldForgeMapExperience.isLayerVisible('trade'))||r.historyView?.isPresent===false){svg.innerHTML='';last='';return}
  E.initialize(w);
  const width=r.canvas.width/(r.dpr||1),height=r.canvas.height/(r.dpr||1),rev=w.economyLogistics?.revision||0;
  const key=[rev,width,height,r.camera.x,r.camera.y,r.camera.zoom,r.projection,mode,good].join('|');if(!force&&last===key)return;last=key;
  svg.setAttribute('viewBox','0 0 '+width+' '+height);
  const point=id=>{const p=window.WorldForgeTerrain.settlementPosition(w,id);return p?r.worldToScreen(p.x,p.y):null};
  svg.innerHTML=(w.economyLogistics?.routes||[]).filter(route=>(mode==='all'||route.mode===mode)&&(good==='all'||route.good===good)).slice(0,90).map(route=>{
    const a=point(route.from),b=point(route.to);if(!a||!b||Math.abs(a.x-b.x)>width*.65)return'';
    const bend=Math.min(32,Math.hypot(a.x-b.x,a.y-b.y)*.1),dash=route.status==='blocked'?'2 6':route.mode==='sea'?'3 5':'';
    return'<path d="M '+a.x+' '+a.y+' Q '+((a.x+b.x)/2)+' '+((a.y+b.y)/2-bend)+' '+b.x+' '+b.y+'" fill="none" stroke="currentColor" stroke-width="'+Math.max(.7,Math.min(2,Number(route.volume||0)*2))+'" opacity="'+(route.status==='blocked'?.15:.44)+'" stroke-dasharray="'+dash+'" data-route-mode="'+route.mode+'" data-good="'+route.good+'" data-status="'+route.status+'"/>';
  }).join('');
}
window.addEventListener('resize',()=>render(true));
window.addEventListener('worldforge:map-draw',()=>window.WorldForgeMapExperience?.refreshOverlays());
setTimeout(()=>render(true),1400);
window.WorldForgeTradeRouteOverlay={render,setMode:value=>{mode=value;render(true)},setGood:value=>{good=value;render(true)}};
})();