(() => {
'use strict';

const E=window.WorldForgeEngine;
const BIOMES=E.BIOMES;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hexToRgb=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const mix=(a,b,t)=>{const A=hexToRgb(a),B=hexToRgb(b);return`rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`};

class WorldRenderer{
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    this.world=null;this.mode='political';this.camera={x:.5,y:.5,zoom:1};this.keys=new Set();this.drag=null;this.hover=null;this.selectedSettlementId=null;
    this.onHover=null;this.onSelectSettlement=null;this.pixelCanvas=document.createElement('canvas');this.pixelCtx=this.pixelCanvas.getContext('2d',{alpha:false});
    this.bind();this.resize();window.addEventListener('resize',()=>this.resize());
    this.loop=()=>{this.tick();requestAnimationFrame(this.loop)};requestAnimationFrame(this.loop)
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(2.5,window.devicePixelRatio||1);
    this.canvas.width=Math.max(1,Math.round(rect.width*dpr));this.canvas.height=Math.max(1,Math.round(rect.height*dpr));this.dpr=dpr;this.draw()
  }
  setWorld(w){this.world=w;this.selectedSettlementId=null;this.center();this.draw()}
  setMode(m){this.mode=m;this.draw()}
  center(){this.camera={x:.5,y:.5,zoom:1};this.draw()}
  worldToScreen(x,y){
    if(!this.world)return{x:0,y:0};const w=this.world.settings.width,h=this.world.settings.height,CW=this.canvas.width/this.dpr,CH=this.canvas.height/this.dpr;
    const scale=Math.min(CW/w,CH/h)*this.camera.zoom,viewW=CW/scale,viewH=CH/scale;
    let cx=this.camera.x*w,cy=this.camera.y*h,dx=x-cx;
    if(dx>w/2)dx-=w;if(dx<-w/2)dx+=w;
    return{x:CW/2+dx*scale,y:CH/2+(y-cy)*scale,scale,viewW,viewH}
  }
  screenToWorld(sx,sy){
    if(!this.world)return null;const w=this.world.settings.width,h=this.world.settings.height,CW=this.canvas.width/this.dpr,CH=this.canvas.height/this.dpr;
    const scale=Math.min(CW/w,CH/h)*this.camera.zoom;let x=this.camera.x*w+(sx-CW/2)/scale,y=this.camera.y*h+(sy-CH/2)/scale;
    x=((x%w)+w)%w;y=clamp(y,0,h-1);return{x,y}
  }
  colorAt(i){
    const w=this.world,L=w.layers,e=L.elevation[i],t=L.temperature[i],m=L.moisture[i],b=L.biome[i];
    if(this.mode==='biome')return BIOMES[b]?.color||'#444';
    if(this.mode==='elevation'){
      if(e<w.settings.seaLevel)return mix('#0a2637','#2f7684',clamp(e/w.settings.seaLevel,0,1));
      return e>.86?mix('#8e8e83','#f1f3ed',clamp((e-.86)/.14,0,1)):mix('#4f6d3c','#9d8c68',clamp((e-w.settings.seaLevel)/(.86-w.settings.seaLevel),0,1))
    }
    if(this.mode==='temperature')return mix('#4d7fb7','#d86b48',t);
    if(this.mode==='moisture')return mix('#c7a55a','#3d7f6f',m);
    if(e<w.settings.seaLevel)return BIOMES[b].color;
    const kid=L.political[i],k=w.kingdoms[kid];return k?k.color:'#5f675a'
  }
  renderBase(){
    if(!this.world)return;
    const {width:w,height:h}=this.world.settings;
    if(this.pixelCanvas.width!==w||this.pixelCanvas.height!==h){this.pixelCanvas.width=w;this.pixelCanvas.height=h}
    const img=this.pixelCtx.createImageData(w,h),data=img.data;
    for(let i=0;i<w*h;i++){const c=this.colorAt(i),rgb=c.startsWith('#')?hexToRgb(c):c.match(/\d+/g).map(Number);data[i*4]=rgb[0];data[i*4+1]=rgb[1];data[i*4+2]=rgb[2];data[i*4+3]=255}
    this.pixelCtx.putImageData(img,0,0);
  }
  draw(){
    const ctx=this.ctx,dpr=this.dpr||1,CW=this.canvas.width/dpr,CH=this.canvas.height/dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#08100d';ctx.fillRect(0,0,CW,CH);
    if(!this.world)return;
    this.renderBase();
    const w=this.world.settings.width,h=this.world.settings.height,center=this.worldToScreen(this.camera.x*w,this.camera.y*h),scale=center.scale;
    ctx.imageSmoothingEnabled=false;
    const viewW=CW/scale,viewH=CH/scale,cx=this.camera.x*w,cy=this.camera.y*h,left=cx-viewW/2,top=cy-viewH/2;
    for(const ox of[-w,0,w]){
      const sx=(ox-left)*scale,sy=(0-top)*scale;
      ctx.drawImage(this.pixelCanvas,sx,sy,w*scale,h*scale)
    }
    this.drawPoliticalBorders(ctx,scale,left,top,CW,CH);
    this.drawRivers(ctx,scale,left,top);
    this.drawRoads(ctx,scale,left,top);
    this.drawSettlements(ctx,scale,left,top);
  }
  mapPoint(x,y,scale,left,top){
    const w=this.world.settings.width;let xx=x;
    while(xx<left-w/2)xx+=w;while(xx>left+w*1.5)xx-=w;
    return{x:(xx-left)*scale,y:(y-top)*scale}
  }
  drawPoliticalBorders(ctx,scale,left,top,CW,CH){
    if(this.mode!=='political'||scale<2)return;
    const W=this.world.settings.width,H=this.world.settings.height,P=this.world.layers.political;
    ctx.save();ctx.strokeStyle='rgba(248,235,198,.35)';ctx.lineWidth=Math.max(1,.7*scale/3);ctx.beginPath();
    for(let y=0;y<H-1;y++)for(let x=0;x<W;x++){const i=y*W+x,k=P[i];if(k<0)continue;const r=P[y*W+((x+1)%W)],b=P[(y+1)*W+x];const p=this.mapPoint(x,y,scale,left,top);if(r!==k){ctx.moveTo(p.x+scale,p.y);ctx.lineTo(p.x+scale,p.y+scale)}if(b!==k){ctx.moveTo(p.x,p.y+scale);ctx.lineTo(p.x+scale,p.y+scale)}}ctx.stroke();ctx.restore()
  }
  drawRivers(ctx,scale,left,top){
    ctx.save();ctx.strokeStyle=this.mode==='political'?'rgba(102,188,220,.88)':'rgba(83,166,199,.92)';ctx.lineWidth=clamp(scale*.34,1,3);ctx.lineCap='round';
    for(const r of this.world.rivers){ctx.beginPath();let prev=null;for(const q of r.path){const p=this.mapPoint(q.x+.5,q.y+.5,scale,left,top);if(prev&&Math.abs(p.x-prev.x)<this.canvas.width/(this.dpr||1)*.7)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);prev=p}ctx.stroke()}ctx.restore()
  }
  drawRoads(ctx,scale,left,top){
    if(scale<2.4)return;ctx.save();ctx.strokeStyle='rgba(219,189,126,.48)';ctx.lineWidth=clamp(scale*.22,.7,2.2);ctx.setLineDash([3,3]);
    for(const r of this.world.roads){ctx.beginPath();let prev=null;for(const q of r.points){const p=this.mapPoint(q.x+.5,q.y+.5,scale,left,top);if(prev&&Math.abs(p.x-prev.x)<500)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);prev=p}ctx.stroke()}ctx.restore()
  }
  drawSettlements(ctx,scale,left,top){
    const selected=this.selectedSettlementId;
    for(const s of this.world.settlements){const p=this.mapPoint(s.x+.5,s.y+.5,scale,left,top),k=this.world.kingdoms[s.kingdomId];if(p.y<-20||p.y>this.canvas.height/(this.dpr||1)+20)continue;
      const capital=s.capital,r=capital?clamp(scale*1.15,5,10):s.type==='City'?clamp(scale*.78,4,7):clamp(scale*.52,2.5,5);
      ctx.beginPath();ctx.arc(p.x,p.y,r+(s.id===selected?3:0),0,Math.PI*2);ctx.fillStyle=s.id===selected?'#fff3b5':capital?'#f6d06f':'#e5e0c7';ctx.fill();ctx.strokeStyle='#1a2119';ctx.lineWidth=1;ctx.stroke();
      if(capital&&scale>2.2){ctx.font='700 10px system-ui';ctx.fillStyle='rgba(250,245,221,.95)';ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=3;ctx.fillText(k?.shortName||s.name,p.x+r+4,p.y-3);ctx.shadowBlur=0}
    }
  }
  nearestSettlement(x,y){
    if(!this.world)return null;let best=null,bd=1e9;for(const s of this.world.settlements){let dx=Math.abs(x-s.x);dx=Math.min(dx,this.world.settings.width-dx);const d=Math.hypot(dx,y-s.y);if(d<bd){bd=d;best=s}}return bd<Math.max(2,5/this.worldToScreen(x,y).scale)?best:null
  }
  bind(){
    const c=this.canvas,point=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
    c.addEventListener('wheel',e=>{e.preventDefault();const p=point(e),before=this.screenToWorld(p.x,p.y);this.camera.zoom=clamp(this.camera.zoom*Math.exp(-e.deltaY*.0012),.75,8);const after=this.screenToWorld(p.x,p.y);if(before&&after&&this.world){this.camera.x=((this.camera.x+(before.x-after.x)/this.world.settings.width)%1+1)%1;this.camera.y=clamp(this.camera.y+(before.y-after.y)/this.world.settings.height,0,1)}this.draw()},{passive:false});
    c.addEventListener('pointerdown',e=>{const p=point(e);this.drag={p,origin:p};c.setPointerCapture?.(e.pointerId)});
    c.addEventListener('pointermove',e=>{const p=point(e);if(this.drag&&this.world){const W=this.world.settings.width,H=this.world.settings.height,s=this.worldToScreen(0,0).scale;this.camera.x=((this.camera.x-(p.x-this.drag.p.x)/s/W)%1+1)%1;this.camera.y=clamp(this.camera.y-(p.y-this.drag.p.y)/s/H,0,1);this.drag.p=p;this.draw();return}const w=this.screenToWorld(p.x,p.y),s=w?this.nearestSettlement(w.x,w.y):null;this.hover=s;this.onHover?.(s,p)});
    c.addEventListener('pointerup',e=>{const p=point(e),moved=this.drag?Math.hypot(p.x-this.drag.origin.x,p.y-this.drag.origin.y):99;this.drag=null;if(moved<5){const w=this.screenToWorld(p.x,p.y),s=w?this.nearestSettlement(w.x,w.y):null;if(s){this.selectedSettlementId=s.id;this.onSelectSettlement?.(s);this.draw()}}});
    c.addEventListener('pointerleave',()=>{if(!this.drag){this.hover=null;this.onHover?.(null,null)}});
    window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){this.keys.add(k);e.preventDefault()}});
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
  }
  tick(){
    if(!this.world||!this.keys.size)return;const s=.007/Math.sqrt(this.camera.zoom);let moved=false;
    if(this.keys.has('a')||this.keys.has('arrowleft')){this.camera.x=(this.camera.x-s+1)%1;moved=true}
    if(this.keys.has('d')||this.keys.has('arrowright')){this.camera.x=(this.camera.x+s)%1;moved=true}
    if(this.keys.has('w')||this.keys.has('arrowup')){this.camera.y=clamp(this.camera.y-s,0,1);moved=true}
    if(this.keys.has('s')||this.keys.has('arrowdown')){this.camera.y=clamp(this.camera.y+s,0,1);moved=true}
    if(moved)this.draw()
  }
  focusSettlement(id){
    const s=this.world?.settlements[id];if(!s)return;this.selectedSettlementId=id;this.camera.x=s.x/this.world.settings.width;this.camera.y=s.y/this.world.settings.height;this.camera.zoom=Math.max(this.camera.zoom,3);this.draw()
  }
}
window.WorldRenderer=WorldRenderer;
})();