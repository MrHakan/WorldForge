(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*clamp(t,0,1)));
const rgb=c=>'rgb('+c.map(v=>clamp(Math.round(v),0,255)).join(',')+')';
const caches=new WeakMap();
const OCEAN=[17,48,61],SHALLOWS=[44,104,113],BEACH=[187,182,138];
function sample(layer,w,h,x,y){
  x=((x%w)+w)%w;y=clamp(y,0,h-1);
  const x0=Math.floor(x),y0=Math.floor(y),x1=(x0+1)%w,y1=Math.min(h-1,y0+1),tx=x-x0,ty=y-y0;
  const a=Number(layer[y0*w+x0]||0),b=Number(layer[y0*w+x1]||0),c=Number(layer[y1*w+x0]||0),d=Number(layer[y1*w+x1]||0);
  return (a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
}
function elevation(w,x,y){return sample(w.layers.elevation,w.settings.width,w.settings.height,x,y)}
function height(w,x,y,projection='relief'){
  if(projection==='flat')return 0;
  const e=elevation(w,x,y),s=w.settings.seaLevel;
  return Math.pow(clamp((e-s)/Math.max(.05,1-s),0,1),1.55)*9;
}
function pitch(projection){return projection==='flat'?1:.72}
function metrics(renderer){
  const w=renderer.world,px=renderer.canvas.width/(renderer.dpr||1),py=renderer.canvas.height/(renderer.dpr||1),p=pitch(renderer.projection);
  const scale=Math.min(px/w.settings.width,py/(w.settings.height*p+12))*.96*renderer.camera.zoom;
  return {width:px,height:py,scale,pitch:p,viewW:px/scale,viewH:py/(scale*p)};
}
function project(renderer,x,y){
  const w=renderer.world,m=metrics(renderer),width=w.settings.width;
  let dx=x-renderer.camera.x*width;
  if(dx>width/2)dx-=width;if(dx<-width/2)dx+=width;
  return {x:m.width/2+dx*m.scale,y:m.height/2+(y-renderer.camera.y*w.settings.height)*m.scale*m.pitch-height(w,x,y,renderer.projection)*m.scale,...m};
}
function unproject(renderer,sx,sy){
  const w=renderer.world,m=metrics(renderer);
  const x=((renderer.camera.x*w.settings.width+(sx-m.width/2)/m.scale)%w.settings.width+w.settings.width)%w.settings.width;
  const base=renderer.camera.y*w.settings.height+(sy-m.height/2)/(m.scale*m.pitch);
  // Fixed point inversion of the same bilinear heightfield used by the surface.
  let y=base;
  for(let i=0;i<12;i++)y=base+height(w,x,y,renderer.projection)/m.pitch;
  if(y<-.5||y>w.settings.height+.5)return null;
  return {x,y:clamp(y,0,w.settings.height-1)};
}
function color(value){
  if(Array.isArray(value))return value;
  if(/^#[0-9a-f]{6}$/i.test(value||'')){const n=parseInt(value.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
  const parts=String(value).match(/[\d.]+/g);
  return parts?.length>=3?parts.slice(0,3).map(Number):[112,131,99];
}
function natural(w,x,y){
  const W=w.settings.width,H=w.settings.height,L=w.layers,sea=w.settings.seaLevel,e=elevation(w,x,y);
  if(e<sea){
    const depth=sea-e;
    if(depth<.022)return mix(SHALLOWS,BEACH,.27*(1-depth/.022));
    return mix(SHALLOWS,OCEAN,clamp((depth-.022)/.19,0,1));
  }
  const q=(e-sea)/Math.max(.05,1-sea),m=sample(L.moisture,W,H,x,y),t=sample(L.temperature,W,H,x,y);
  let c=mix([166,155,102],[91,132,106],m);
  if(m>.58)c=mix(c,[53,101,83],(m-.58)*1.5);
  if(t>.7&&m<.32)c=mix(c,[199,175,118],.6);
  if(t<.25)c=mix(c,[143,155,139],.55);
  if(q>.27)c=mix(c,[123,132,110],(q-.27)*1.4);
  if(q>.52)c=mix(c,[139,142,132],(q-.52)*2.5);
  if(q>.77)c=mix(c,[224,225,211],(q-.77)*4.4);
  if(t<.14)c=mix(c,[221,229,218],.7);
  if(e-sea<.017)c=mix(BEACH,c,(e-sea)/.017);
  return c;
}
function shade(w,x,y){
  const dx=height(w,x+.65,y)-height(w,x-.65,y),dy=height(w,x,y+.65)-height(w,x,y-.65);
  const inv=1/Math.hypot(dx,dy,1.35),light=(-dx*-.57-dy*-.64+1.35*.76)*inv;
  return clamp(.65+light*.46,.52,1.23);
}
function terrainColor(renderer,x,y){
  const w=renderer.world,W=w.settings.width,H=w.settings.height;
  const i=Math.floor(clamp(y,0,H-1))*W+Math.floor(((x%W)+W)%W),e=elevation(w,x,y),sea=w.settings.seaLevel;
  let c=natural(w,x,y);
  if(e>=sea&&renderer.mode==='political'){
    const owner=renderer.politicalLayer()?.[i],realm=renderer.realm(owner);
    if(realm)c=mix(c,color(realm.color),.23);
  }else if(e>=sea&&!['terrain','political'].includes(renderer.mode)){
    c=mix(c,color(renderer.colorAt(i)),renderer.mode==='biome'?.56:.86);
  }
  if(e>=sea)c=c.map(v=>v*shade(w,x,y));
  return rgb(c);
}
function hash(x,y){let a=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);a=Math.imul(a^(a>>>13),1274126177);return((a^(a>>>16))>>>0)/4294967295}
function build(renderer){
  const w=renderer.world,mode=renderer.mode,projection=renderer.projection||'relief',p=pitch(projection),naturalMode=mode==='terrain';
  let entries=caches.get(w);if(!entries){entries=[];caches.set(w,entries)}
  const previous=entries.find(entry=>entry.mode===mode&&entry.projection===projection&&(naturalMode||entry.view===renderer.historyView));
  if(previous)return previous;
  const W=w.settings.width,H=w.settings.height,res=5,pad=11;
  const canvas=document.createElement('canvas');
  canvas.width=W*res;canvas.height=Math.ceil((H*p+pad+2)*res);
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle=rgb(OCEAN);ctx.fillRect(0,0,canvas.width,canvas.height);
  const point=(x,y)=>[x*res,(pad+y*p-height(w,x,y,projection))*res];
  const step=.5;
  for(let y=0;y<H;y+=step){
    for(let x=0;x<W;x+=step){
      const c=terrainColor(renderer,x+step/2,y+step/2),a=point(x,y),b=point(x+step,y),d=point(x,y+step),f=point(x+step,y+step);
      ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...f);ctx.lineTo(...d);ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
  if(['terrain','political','biome'].includes(mode)){
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const index=y*W+x,biome=w.layers.biome[index],n=hash(x,y),e=elevation(w,x,y);
      if(e<w.settings.seaLevel-.07&&n<.025){
        const [px,py]=point(x+.5,y+.5);ctx.strokeStyle='rgba(128,190,193,.11)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+3,py-1,px+6,py);ctx.stroke();
      }
      if(projection==='flat'||!['forest','taiga','rainforest'].includes(biome)||n>.14||e<w.settings.seaLevel+.025)continue;
      const [px,py]=point(x+.25+n*2,y+.5),size=2.1+n*7;
      ctx.fillStyle='rgba(8,36,32,.16)';ctx.beginPath();ctx.ellipse(px+size*.65,py+size*.3,size*1.2,size*.35,-.3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(37,79,61,.68)';ctx.beginPath();ctx.moveTo(px,py-size*1.8);ctx.lineTo(px-size*.65,py);ctx.lineTo(px+size*.65,py);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(111,151,107,.65)';ctx.beginPath();ctx.moveTo(px,py-size*1.8);ctx.lineTo(px,py);ctx.lineTo(px-size*.65,py);ctx.closePath();ctx.fill();
    }
  }
  const result={canvas,mode,projection,pitch:p,yOrigin:-pad,unitsHigh:H*p+pad+2,view:renderer.historyView};
  entries.push(result);if(entries.length>4)entries.shift();
  return result;
}
function draw(renderer){
  const ctx=renderer.ctx,m=metrics(renderer),W=renderer.world.settings.width,surface=build(renderer),left=renderer.camera.x*W-m.viewW/2,cy=renderer.camera.y*renderer.world.settings.height;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  for(const offset of[-W,0,W]){
    const x=(offset-left)*m.scale,y=m.height/2+(surface.yOrigin-cy*m.pitch)*m.scale;
    ctx.drawImage(surface.canvas,x,y,W*m.scale,surface.unitsHigh*m.scale);
  }
  return surface;
}
function settlementPosition(world,city){
  if(typeof city!=='object')city=(world.cities?.cities||[]).find(c=>String(c.id)===String(city));
  if(!city)return null;
  const id=city.settlementId??city.id;
  const settlement=world.settlements?.find(s=>Number(s.id)===Number(id));
  if(settlement)return{x:settlement.x+.5,y:settlement.y+.5};
  const x=Number(city.x??city.mapX),y=Number(city.y??city.mapY);
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
const api={VERSION:'5.2.0',sample,elevation,height,pitch,metrics,project,unproject,natural,color,build,draw,settlementPosition};
if(root)root.WorldForgeTerrain=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
