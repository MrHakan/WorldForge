(() => {
'use strict';

const E=window.WorldForgeEngine;
const BIOMES=E.BIOMES;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hexToRgb=h=>{if(!h||!/^#[0-9a-f]{6}$/i.test(h))return[110,120,110];const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const mix=(a,b,t)=>{const A=hexToRgb(a),B=hexToRgb(b);t=clamp(t,0,1);return'#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,'0')).join('')};

class WorldRenderer{
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});
    this.gpu=null;this.gpuFailure=null;
    try{if(window.WorldForgeWebGL)this.gpu=new window.WorldForgeWebGL.Atlas(this)}catch(error){this.gpuFailure=error.message}
    this.world=null;this.historyView=null;this.mode='terrain';this.projection='relief';this.layers={labels:true,borders:false,roads:false};this.camera={x:.5,y:.5,zoom:1};this.keys=new Set();this.drag=null;this.hover=null;this.selectedSettlementId=null;this.baseDirty=true;this.keyboardFrame=0;
    this.onHover=null;this.onSelectSettlement=null;this.pixelCanvas=document.createElement('canvas');this.pixelCtx=this.pixelCanvas.getContext('2d',{alpha:false});
    this.bind();this.resize();window.addEventListener('resize',()=>this.resize());
    
  }
  resize(){const rect=this.canvas.getBoundingClientRect(),ratio=window.devicePixelRatio||1,dpr=Math.min(3,ratio,Math.sqrt(8000000/Math.max(1,rect.width*rect.height))),atHome=this.home&&['x','y','zoom'].every(key=>Math.abs(this.camera[key]-this.home[key])<.00001);this.canvas.width=Math.max(1,Math.round(rect.width*dpr));this.canvas.height=Math.max(1,Math.round(rect.height*dpr));this.dpr=dpr;this.home=this.homeCamera();if(atHome)this.camera={...this.home};this.requestDraw()}
  setWorld(w){this.world=w;this.historyView=null;this.selectedSettlementId=null;this.baseDirty=true;this.center()}
  setHistoryView(view){const next=view||null;if(this.historyView===next)return;this.historyView=next;this.baseDirty=true;this.draw()}
  setMode(m){if(this.mode===m)return;this.mode=m;this.baseDirty=true;this.draw()}
  homeCamera(){const settlements=this.world?.settlements||[],regional=this.canvas.width/(this.dpr||1)<600;return{x:.5,y:regional&&settlements.length?clamp(settlements.reduce((sum,s)=>sum+s.y+.5,0)/settlements.length/this.world.settings.height,.15,.85):.5,zoom:1}}
  center(){this.home=this.homeCamera();this.camera={...this.home};this.draw()}
  viewRealms(){return this.historyView?.realms||this.world?.kingdoms||[]}
  realm(id){return this.viewRealms().find(k=>k.id===id)||this.world?.kingdoms?.[id]||null}
  ownerOf(s){return this.historyView?.settlementKingdomIds?.[s.id]??s.kingdomId}
  popOf(s){return this.historyView?.settlementPopulation?.[s.id]??s.population}
  prosperityOf(s){return this.historyView?.settlementProsperity?.[s.id]??s.score}
  politicalLayer(){return this.historyView?.political||this.world?.layers?.political}
  tradeVolumes(){return this.historyView?.tradeVolumes||[]}
  setProjection(value){const projection=value==='flat'?'flat':'relief';if(this.projection===projection)return;this.projection=projection;this.baseDirty=true;this.draw()}
  worldToScreen(x,y){if(!this.world)return{x:0,y:0,scale:1};return window.WorldForgeTerrain.project(this,x,y)}
  screenToWorld(x,y){return this.world?window.WorldForgeTerrain.unproject(this,x,y):null}
  requestDraw(){if(this.drawFrame)return;this.drawFrame=requestAnimationFrame(()=>{this.drawFrame=0;this.draw()})}
  realmMetric(id,key,fallback=0){const r=this.realm(id);return Number(r?.[key]??fallback)}
  colorAt(i){
    const w=this.world,L=w.layers,e=L.elevation[i],t=L.temperature[i],m=L.moisture[i],b=L.biome[i],P=this.politicalLayer(),kid=P?.[i]??-1;
    if(this.mode==='biome')return BIOMES[b]?.color||'#444';
    if(this.mode==='elevation'){if(e<w.settings.seaLevel)return mix('#0a2637','#2f7684',clamp(e/w.settings.seaLevel,0,1));return e>.86?mix('#8e8e83','#f1f3ed',clamp((e-.86)/.14,0,1)):mix('#4f6d3c','#9d8c68',clamp((e-w.settings.seaLevel)/(.86-w.settings.seaLevel),0,1))}
    if(this.mode==='temperature')return mix('#4d7fb7','#d86b48',t);
    if(this.mode==='moisture')return mix('#c7a55a','#3d7f6f',m);
    if(e<w.settings.seaLevel)return BIOMES[b].color;
    if(this.mode==='population'){
      const max=this.populationMax||1,density=this.realmMetric(kid,'population',0)/Math.max(1,this.realmMetric(kid,'settlementCount',1)),q=clamp(Math.log1p(density)/Math.log1p(max),0,1);return mix('#263632','#e1a657',q)
    }
    if(this.mode==='prosperity')return mix('#6a3f35','#63a86c',clamp(this.realmMetric(kid,'meanProsperity',.4),0,1));
    if(this.mode==='trade'){const k=this.realm(kid);return k?mix('#202b27',k.color,.22):'#343a32'}
    const k=this.realm(kid);return k?k.color:'#5f675a'
  }
  renderBase(){
    if(!this.world)return;
    const {width:w,height:h}=this.world.settings;
    if(this.pixelCanvas.width!==w||this.pixelCanvas.height!==h){this.pixelCanvas.width=w;this.pixelCanvas.height=h}
    const realms=this.viewRealms();
    this.populationMax=Math.max(1,...realms.map(r=>(r.population||0)/Math.max(1,r.settlementCount||1)));
    const tv=this.tradeVolumes();
    this.maxTradeVolume=Math.max(1,...tv);
    this.maxSettlementPopulation=Math.max(1,...this.world.settlements.map(s=>this.popOf(s)));
    const img=this.pixelCtx.createImageData(w,h),data=img.data;
    for(let i=0;i<w*h;i++){const rgb=hexToRgb(this.colorAt(i));data[i*4]=rgb[0];data[i*4+1]=rgb[1];data[i*4+2]=rgb[2];data[i*4+3]=255}
    this.pixelCtx.putImageData(img,0,0);
    this.baseDirty=false
  }
  draw(){
    const ctx=this.ctx,dpr=this.dpr||1,CW=this.canvas.width/dpr,CH=this.canvas.height/dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,CW,CH);
    if(!this.world){ctx.fillStyle='#11303d';ctx.fillRect(0,0,CW,CH);return}
    if(this.baseDirty){const realms=this.viewRealms();this.populationMax=Math.max(1,...realms.map(r=>(r.population||0)/Math.max(1,r.settlementCount||1)));this.maxTradeVolume=Math.max(1,...this.tradeVolumes());this.maxSettlementPopulation=Math.max(1,...this.world.settlements.map(s=>this.popOf(s)));this.baseDirty=false}
    this.gpuActive=false;
    try{this.gpuActive=Boolean(this.gpu?.draw(this))}catch(error){this.gpuFailure=error.message;this.gpu.canvas.hidden=true;this.gpu.canvas.style.visibility='hidden'}
    if(!this.gpuActive){ctx.fillStyle='#11303d';ctx.fillRect(0,0,CW,CH);window.WorldForgeTerrain.draw(this)}
    this.canvas.dataset.renderer=this.gpuActive?'webgl':'canvas2d';
    const m=window.WorldForgeTerrain.metrics(this),left=this.camera.x*this.world.settings.width-m.viewW/2,top=this.camera.y*this.world.settings.height-m.viewH/2;
    if(this.layers.borders)this.drawPoliticalBorders(ctx,m.scale,left,top,CW,CH);
    this.drawRivers(ctx,m.scale,left,top);
    if(this.layers.roads||this.mode==='trade')this.drawRoads(ctx,m.scale,left,top);
    this.drawSettlements(ctx,m.scale,left,top);
    if(this.gpuActive)this.gpu.finish();
    window.dispatchEvent(new CustomEvent('worldforge:map-draw',{detail:{renderer:this}}));
  }
  mapPoint(x,y){return this.worldToScreen(x,y)}
  drawPoliticalBorders(ctx,scale){
    const W=this.world.settings.width,H=this.world.settings.height,P=this.politicalLayer();if(!P||scale<1.5)return;
    ctx.save();ctx.strokeStyle='rgba(237,226,190,.42)';ctx.lineWidth=.85;ctx.setLineDash([3,3]);ctx.beginPath();
    const segment=(a,b)=>{if(Math.abs(a.x-b.x)>this.canvas.width/(this.dpr||1)*.7)return;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)};
    for(let y=0;y<H-1;y++)for(let x=0;x<W;x++){
      const id=y*W+x,k=P[id];if(k<0)continue;
      if(P[y*W+((x+1)%W)]!==k)segment(this.worldToScreen(x+1,y),this.worldToScreen(x+1,y+1));
      if(P[(y+1)*W+x]!==k)segment(this.worldToScreen(x,y+1),this.worldToScreen(x+1,y+1));
    }
    ctx.stroke();ctx.restore();
  }
  drawRivers(ctx,scale,left,top){ctx.save();ctx.strokeStyle='rgba(133,198,198,.66)';ctx.lineWidth=clamp(scale*.16,.6,1.8);ctx.lineCap='round';for(const r of this.world.rivers){ctx.beginPath();let prev=null;for(const q of r.path){const p=this.mapPoint(q.x+.5,q.y+.5,scale,left,top);if(prev&&Math.abs(p.x-prev.x)<this.canvas.width/(this.dpr||1)*.7)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);prev=p}ctx.stroke()}ctx.restore()}
  drawRoads(ctx,scale,left,top){
    if(scale<2.1)return;const tv=this.tradeVolumes(),maxTrade=this.maxTradeVolume||Math.max(1,...tv);ctx.save();ctx.setLineDash(this.mode==='trade'?[]:[3,3]);for(let ri=0;ri<this.world.roads.length;ri++){const r=this.world.roads[ri],q=this.mode==='trade'?clamp((tv[ri]||0)/maxTrade,0,1):.3;ctx.strokeStyle=this.mode==='trade'?`rgba(247,203,105,${.22+q*.75})`:'rgba(219,189,126,.48)';ctx.lineWidth=this.mode==='trade'?clamp(scale*(.18+q*.38),.8,4):clamp(scale*.22,.7,2.2);ctx.beginPath();let prev=null;for(const pt of r.points){const p=this.mapPoint(pt.x+.5,pt.y+.5,scale,left,top);if(prev&&Math.abs(p.x-prev.x)<500)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);prev=p}ctx.stroke()}ctx.restore()
  }
  drawSettlements(ctx,scale){
    const active=this.viewRealms().filter(r=>r.active!==false),capitals=new Set(active.map(r=>r.capitalId)),CW=this.canvas.width/(this.dpr||1),CH=this.canvas.height/(this.dpr||1),positions=new Map();
    const rows=[...this.world.settlements].sort((a,b)=>a.y-b.y);
    for(const s of rows){
      const p=this.worldToScreen(s.x+.5,s.y+.5);positions.set(s.id,p);
      if(p.x<-400||p.x>CW+400||p.y<-400||p.y>CH+400)continue;
      const capital=capitals.has(s.id),selected=s.id===this.selectedSettlementId,hovered=s.id===this.hover?.id,u=clamp(scale*.72,2.6,5.5)*(capital?1.3:1),realm=this.realm(this.ownerOf(s));
      window.WorldForgeLivingSettlements.draw(this,ctx,s,p,selected||hovered,capital);
    }
    if(!this.layers.labels&&this.selectedSettlementId==null)return;
    const boxes=[],maxLabels=CW<600?4:this.camera.zoom>1.8?18:8;
    const candidates=[...rows].sort((a,b)=>(b.id===this.selectedSettlementId)-(a.id===this.selectedSettlementId)||(capitals.has(b.id)-capitals.has(a.id))||this.popOf(b)-this.popOf(a));
    let labels=0;
    for(const s of candidates){
      const selected=s.id===this.selectedSettlementId,capital=capitals.has(s.id);
      if(!selected&&(!this.layers.labels||(!capital&&this.camera.zoom<1.8)||labels>=maxLabels))continue;
      const p=positions.get(s.id);ctx.font=(selected?'650':'550')+' 11px system-ui';const width=ctx.measureText(s.name).width+16,box={x:p.x+10,y:p.y-20,w:width,h:24};
      if(box.x<0||box.x+box.w>CW||box.y<0||box.y+box.h>CH)continue;
      if(!selected&&boxes.some(b=>box.x<b.x+b.w+12&&box.x+box.w+12>b.x&&box.y<b.y+b.h+8&&box.y+box.h+8>b.y))continue;
      boxes.push(box);labels++;ctx.save();ctx.fillStyle=selected?'rgba(32,51,49,.95)':'rgba(17,43,46,.72)';ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,5);ctx.fill();ctx.fillStyle=selected?'#f1d9a6':'#e4e8d8';ctx.textBaseline='middle';ctx.fillText(s.name,box.x+8,box.y+12);ctx.restore();
    }
  }
  nearestSettlement(x,y){if(!this.world)return null;let best=null,bd=1e9;for(const s of this.world.settlements){let dx=Math.abs(x-s.x);dx=Math.min(dx,this.world.settings.width-dx);const d=Math.hypot(dx,y-s.y);if(d<bd){bd=d;best=s}}return bd<Math.max(2,5/this.worldToScreen(x,y).scale)?best:null}
  bind(){
    const canvas=this.canvas,pointers=new Map(),point=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}},moveZoom=(factor,p)=>{
      const before=this.screenToWorld(p.x,p.y);this.camera.zoom=clamp(this.camera.zoom*factor,.75,40);const after=this.screenToWorld(p.x,p.y);
      if(before&&after&&this.world){this.camera.x=((this.camera.x+(before.x-after.x)/this.world.settings.width)%1+1)%1;this.camera.y=clamp(this.camera.y+(before.y-after.y)/this.world.settings.height,0,1)}this.requestDraw();
    };
    canvas.addEventListener('wheel',e=>{e.preventDefault();moveZoom(Math.exp(-e.deltaY*.0012),point(e))},{passive:false});
    canvas.addEventListener('pointerdown',e=>{const p=point(e);pointers.set(e.pointerId,p);canvas.setPointerCapture?.(e.pointerId);if(pointers.size===1)this.drag={p,origin:p};else{const a=[...pointers.values()];this.pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);this.pinchCenter={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};this.drag=null}});
    canvas.addEventListener('pointermove',e=>{
      const p=point(e);if(pointers.has(e.pointerId))pointers.set(e.pointerId,p);
      if(pointers.size>1){const a=[...pointers.values()],distance=Math.max(1,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),center={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(this.world&&this.pinchCenter){const m=window.WorldForgeTerrain.metrics(this);this.camera.x=((this.camera.x-(center.x-this.pinchCenter.x)/m.scale/this.world.settings.width)%1+1)%1;this.camera.y=clamp(this.camera.y-(center.y-this.pinchCenter.y)/m.scale/m.pitch/this.world.settings.height,0,1)}moveZoom(distance/Math.max(1,this.pinchDistance),center);this.pinchDistance=distance;this.pinchCenter=center;return}
      if(this.drag&&this.world){const m=window.WorldForgeTerrain.metrics(this);this.camera.x=((this.camera.x-(p.x-this.drag.p.x)/m.scale/this.world.settings.width)%1+1)%1;this.camera.y=clamp(this.camera.y-(p.y-this.drag.p.y)/m.scale/m.pitch/this.world.settings.height,0,1);this.drag.p=p;this.requestDraw();return}
      const w=this.screenToWorld(p.x,p.y),settlement=w?this.nearestSettlement(w.x,w.y):null;if(this.hover?.id!==settlement?.id){this.hover=settlement;this.requestDraw()}this.onHover?.(settlement,p);
    });
    const end=(e,cancelled=false)=>{const p=point(e),moved=this.drag&&!this.drag.pinched?Math.hypot(p.x-this.drag.origin.x,p.y-this.drag.origin.y):Infinity;pointers.delete(e.pointerId);this.drag=null;if(pointers.size===1){const remaining=[...pointers.values()][0];this.drag={p:remaining,origin:remaining,pinched:true}}if(!pointers.size){this.pinchDistance=null;this.pinchCenter=null}if(!cancelled&&moved<5){const w=this.screenToWorld(p.x,p.y),s=w?this.nearestSettlement(w.x,w.y):null;if(s){this.selectedSettlementId=s.id;this.onSelectSettlement?.(s);this.draw()}}};
    canvas.addEventListener('pointerup',e=>end(e));canvas.addEventListener('pointercancel',e=>end(e,true));canvas.addEventListener('pointerleave',()=>{if(!this.drag){this.hover=null;this.onHover?.(null,null)}});
    window.addEventListener('keydown',e=>{if(e.target?.isContentEditable||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target?.tagName))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){this.keys.add(key);this.startKeyboardLoop();e.preventDefault()}});
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{pointers.clear();this.drag=null;this.keys.clear();if(this.keyboardFrame){cancelAnimationFrame(this.keyboardFrame);this.keyboardFrame=0}});
  }
  startKeyboardLoop(){
    if(this.keyboardFrame)return;
    const frame=()=>{this.keyboardFrame=0;this.tick();if(this.keys.size)this.keyboardFrame=requestAnimationFrame(frame)};
    this.keyboardFrame=requestAnimationFrame(frame)
  }
  tick(){if(!this.world||!this.keys.size)return;const s=.007/Math.sqrt(this.camera.zoom);let moved=false;if(this.keys.has('a')||this.keys.has('arrowleft')){this.camera.x=(this.camera.x-s+1)%1;moved=true}if(this.keys.has('d')||this.keys.has('arrowright')){this.camera.x=(this.camera.x+s)%1;moved=true}if(this.keys.has('w')||this.keys.has('arrowup')){this.camera.y=clamp(this.camera.y-s,0,1);moved=true}if(this.keys.has('s')||this.keys.has('arrowdown')){this.camera.y=clamp(this.camera.y+s,0,1);moved=true}if(moved)this.draw()}
  focusSettlement(id){const s=this.world?.settlements[id];if(!s)return;this.selectedSettlementId=id;this.camera.x=s.x/this.world.settings.width;this.camera.y=s.y/this.world.settings.height;this.camera.zoom=Math.max(this.camera.zoom,8);this.draw()}
}
window.WorldRenderer=WorldRenderer;
})();

