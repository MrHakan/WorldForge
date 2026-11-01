(function(root){
'use strict';
// A persistent GPU surface sits below the transparent, accessible 2D label layer.
// Camera changes only update uniforms: no canvas tiles, texture readbacks or LOD rebuilds.
const T=()=>root.WorldForgeTerrain;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const terrainVertex=`
attribute vec4 aPosition;
uniform vec2 uViewport,uCamera,uWorld;
uniform float uScale,uPitch,uRelief,uOffset;
varying vec2 vWorld;
varying float vShade;
void main(){
  vWorld=aPosition.xy;vShade=aPosition.w;
  vec2 screen=vec2((aPosition.x+uOffset-uCamera.x)*uScale,
    ((aPosition.y-uCamera.y)*uPitch-aPosition.z*uRelief)*uScale);
  gl_Position=vec4(screen.x*2.0/uViewport.x,-screen.y*2.0/uViewport.y,0.0,1.0);
}`;
const terrainFragment=`
precision highp float;
uniform sampler2D uFields,uAnalysis;
uniform vec2 uWorld;
uniform float uSea,uMode,uScale;
varying vec2 vWorld;
varying float vShade;
vec4 texel(vec2 p){return texture2D(uFields,(vec2(mod(p.x,uWorld.x),clamp(p.y,0.0,uWorld.y-1.0))+0.5)/uWorld);}
vec4 field(vec2 p){
  vec2 b=floor(p),f=fract(p);
  return mix(mix(texel(b),texel(b+vec2(1,0)),f.x),mix(texel(b+vec2(0,1)),texel(b+vec2(1,1)),f.x),f.y);
}
float random(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 b=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(random(b),random(b+vec2(1,0)),f.x),mix(random(b+vec2(0,1)),random(b+vec2(1,1)),f.x),f.y);}
void main(){
  vec4 f=field(vWorld);
  float e=dot(f.rg,vec2(65280.0,255.0))/65535.0,m=f.b,t=f.a;
  float q=clamp((e-uSea)/max(0.05,1.0-uSea),0.0,1.0);
  vec3 beach=vec3(.78,.73,.49),c;
  if(e<uSea){
    float depth=uSea-e;
    c=mix(vec3(.17,.45,.48),vec3(.045,.16,.22),clamp((depth-.015)/.19,0.0,1.0));
    c=mix(beach,c,smoothstep(0.0,.018,depth));
    float ripples=sin(vWorld.x*18.0+sin(vWorld.y*11.0))*sin(vWorld.y*25.0);
    c+=.009*ripples*smoothstep(6.0,35.0,uScale)*exp(-depth*18.0);
  }else{
    c=mix(vec3(.65,.62,.34),vec3(.31,.51,.32),m);
    c=mix(c,vec3(.13,.32,.23),clamp((m-.55)*1.7,0.0,1.0));
    if(t>.7&&m<.32)c=mix(c,vec3(.8,.68,.4),.6);
    if(t<.25)c=mix(c,vec3(.55,.62,.52),.48);
    c=mix(c,vec3(.46,.49,.4),smoothstep(.28,.66,q));
    c=mix(c,vec3(.59,.6,.55),smoothstep(.5,.8,q));
    c=mix(c,vec3(.91,.93,.88),smoothstep(.76,.94,q));
    if(t<.14)c=mix(c,vec3(.85,.91,.87),.7);
    c=mix(beach,c,smoothstep(0.0,.017,e-uSea));
    vec3 layer=texture2D(uAnalysis,(floor(vWorld)+.5)/uWorld).rgb;
    if(uMode==1.0)c=mix(c,layer,.23);
    if(uMode>1.0)c=mix(c,layer,uMode==2.0?.56:.86);
    float grain=(noise(vWorld*3.0)-.5)*.055+(noise(vWorld*13.0)-.5)*.026*smoothstep(7.0,24.0,uScale);
    // Fine surface detail is evaluated at device pixels rather than magnified texels.
    c=(c+grain)*vShade;
  }
  gl_FragColor=vec4(c,1.0);
}`;
const modelVertex=`
attribute vec2 aPoint;
attribute vec4 aColor;
uniform vec2 uViewport,uOrigin;
uniform float uUnit;
varying vec4 vColor;
void main(){vec2 p=uOrigin+aPoint*uUnit;gl_Position=vec4(p.x*2.0/uViewport.x-1.0,1.0-p.y*2.0/uViewport.y,0,1);vColor=aColor;}`;
const modelFragment=`precision mediump float;varying vec4 vColor;void main(){gl_FragColor=vColor;}`;
function program(gl,vertex,fragment){
  const shaders=[];let p=null;
  try{
    for(const [type,source]of[[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
    }
    p=gl.createProgram();for(const s of shaders)gl.attachShader(p,s);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    return p;
  }catch(error){if(p)gl.deleteProgram(p);throw error}finally{for(const s of shaders)gl.deleteShader(s)}
}
function locations(gl,p,attributes,uniforms){
  const r={program:p};for(const key of attributes)r[key]=gl.getAttribLocation(p,key);
  for(const key of uniforms)r[key]=gl.getUniformLocation(p,key);return r;
}
function color(value){
  if(String(value).startsWith('#'))return [...T().color(value).map(v=>v/255),1];
  const a=String(value).match(/[\d.]+/g)?.map(Number)||[0,0,0,1];return [a[0]/255,a[1]/255,a[2]/255,a[3]??1];
}
// Record the same XYZ-derived building faces as GPU triangles. Keeping one model
// definition also makes the Canvas fallback visually consistent with the GPU path.
class MeshPen{
  constructor(){this.vertices=[];this.path=[];this.fillStyle='#fff';this.strokeStyle='#000';this.lineWidth=.55;this.tx=0;this.ty=0;this.stack=[];this.closed=false}
  save(){this.stack.push([this.tx,this.ty,this.fillStyle,this.strokeStyle,this.lineWidth])}
  restore(){[this.tx,this.ty,this.fillStyle,this.strokeStyle,this.lineWidth]=this.stack.pop()}
  translate(x,y){this.tx+=x;this.ty+=y}
  beginPath(){this.path=[];this.closed=false}
  moveTo(x,y){this.path.push([x+this.tx,y+this.ty])}
  lineTo(x,y){this.moveTo(x,y)}
  closePath(){this.closed=true}
  ellipse(x,y,rx,ry,rotation,start,end){for(let i=0;i<=24;i++){const a=start+(end-start)*i/24;this.lineTo(x+Math.cos(a)*rx,y+Math.sin(a)*ry)}}
  arc(x,y,r,start,end){this.ellipse(x,y,r,r,0,start,end)}
  triangle(a,b,c,rgba){for(const p of[a,b,c])this.vertices.push(p[0]/64,p[1]/64,...rgba)}
  fill(){const c=color(this.fillStyle);for(let i=1;i<this.path.length-1;i++)this.triangle(this.path[0],this.path[i],this.path[i+1],c)}
  stroke(){
    const c=color(this.strokeStyle),n=this.path.length;
    for(let i=1;i<n+(this.closed?1:0);i++){
      const a=this.path[i-1],b=this.path[i%n],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
      if(!length)continue;const nx=-dy/length*this.lineWidth/2,ny=dx/length*this.lineWidth/2;
      const q=[[a[0]+nx,a[1]+ny],[a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny]];
      this.triangle(q[0],q[1],q[2],c);this.triangle(q[0],q[2],q[3],c);
    }
  }
}
class Atlas{
  constructor(renderer){
    this.renderer=renderer;this.canvas=document.createElement('canvas');this.canvas.className='worldforge-gpu-surface';
    this.canvas.setAttribute('aria-hidden','true');this.canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;background:#11303d';
    this.lost=false;this.models=new Map();this.chunks=[];this.stats={meshBuilds:0,textureUploads:0,modelBuilds:0,frames:0};
    this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:true,depth:false,stencil:false,preserveDrawingBuffer:false});
    if(!this.gl)throw new Error('WebGL is unavailable');
    this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;this.canvas.hidden=true;this.canvas.style.visibility='hidden';renderer.requestDraw()});
    this.canvas.addEventListener('webglcontextrestored',()=>{
      try{this.initialize();this.lost=false;renderer.requestDraw()}catch{this.lost=true;this.canvas.hidden=true;this.canvas.style.visibility='hidden';renderer.requestDraw()}
    });
    this.initialize();renderer.canvas.parentNode.insertBefore(this.canvas,renderer.canvas);
    renderer.canvas.style.position='relative';renderer.canvas.style.background='transparent';
  }
  initialize(){
    const gl=this.gl;this.world=null;this.chunks=[];this.models.clear();this.textures=[];this.layerKey=null;
    this.terrain=locations(gl,program(gl,terrainVertex,terrainFragment),['aPosition'],['uViewport','uCamera','uWorld','uScale','uPitch','uRelief','uOffset','uFields','uAnalysis','uSea','uMode']);
    this.model=locations(gl,program(gl,modelVertex,modelFragment),['aPoint','aColor'],['uViewport','uOrigin','uUnit']);
    gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  }
  clearWorld(){
    const gl=this.gl;
    for(const c of this.chunks){gl.deleteBuffer(c.vertices);gl.deleteBuffer(c.indices)}
    for(const m of this.models.values())gl.deleteBuffer(m.buffer);
    for(const t of this.textures)gl.deleteTexture(t);
    this.chunks=[];this.models.clear();this.textures=[];this.layerKey=null;
  }
  texture(width,height,data){
    const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,data);this.stats.textureUploads++;
    return t;
  }
  buildWorld(world){
    this.clearWorld();this.world=world;const gl=this.gl,W=world.settings.width,H=world.settings.height,L=world.layers;
    const data=new Uint8Array(W*H*4);
    for(let i=0;i<W*H;i++){const e=Math.round(clamp(L.elevation[i],0,1)*65535);data.set([e>>8,e&255,Math.round(L.moisture[i]*255),Math.round(L.temperature[i]*255)],i*4)}
    this.textures.push(this.texture(W,H,data),this.texture(W,H,new Uint8Array(W*H*4)));
    // Fixed, half-cell geometry is uploaded once; 16-bit bands also support WebGL 1
    // on iOS without OES_element_index_uint or vertex-texture extensions.
    const cols=W*2+1,bandRows=Math.min(64,Math.floor(65535/cols)-1);
    for(let row=0;row<H*2;row+=bandRows){
      const rows=Math.min(bandRows,H*2-row),v=new Float32Array((rows+1)*cols*4),indices=new Uint16Array(rows*(cols-1)*6);
      for(let y=0;y<=rows;y++)for(let x=0;x<cols;x++){
        const wx=x/2,wy=(row+y)/2,z=T().height(world,wx,wy);
        const dx=T().height(world,wx+.65,wy)-T().height(world,wx-.65,wy),dy=T().height(world,wx,wy+.65)-T().height(world,wx,wy-.65);
        const shade=clamp(.65+(.57*dx+.64*dy+1.35*.76)/Math.hypot(dx,dy,1.35)*.46,.52,1.23);
        v.set([wx,wy,z,shade],(y*cols+x)*4);
      }
      let i=0;for(let y=0;y<rows;y++)for(let x=0;x<cols-1;x++){
        const a=y*cols+x,b=a+1,c=a+cols,d=c+1;indices.set([a,b,c,b,d,c],i);i+=6;
      }
      const vertices=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
      this.chunks.push({vertices,indices:ib,count:indices.length,y0:row/2,y1:(row+rows)/2});
    }
    this.stats.meshBuilds++;
  }
  updateAnalysis(renderer){
    const mode=renderer.mode,view=renderer.historyView,key=mode==='terrain'?'terrain':mode;
    if(this.layerKey===key&&(mode==='terrain'||this.layerView===view))return;
    const W=this.world.settings.width,H=this.world.settings.height,data=new Uint8Array(W*H*4);
    const political=renderer.politicalLayer(),colors=new Map();
    for(let i=0;i<W*H;i++){
      let c;
      if(mode==='terrain')c=[0,0,0];
      else if(mode==='political'){
        const owner=political?.[i];if(!colors.has(owner))colors.set(owner,T().color(renderer.realm(owner)?.color||T().natural(this.world,i%W,Math.floor(i/W))));c=colors.get(owner);
      }else c=T().color(renderer.colorAt(i));
      data.set([...c,255],i*4);
    }
    const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.textures[1]);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,data);
    this.layerKey=key;this.layerView=view;this.stats.textureUploads++;
  }
  draw(renderer){
    if(this.lost)return false;
    const gl=this.gl,m=T().metrics(renderer),W=renderer.world.settings.width,H=renderer.world.settings.height;
    if(this.canvas.width!==renderer.canvas.width||this.canvas.height!==renderer.canvas.height){this.canvas.width=renderer.canvas.width;this.canvas.height=renderer.canvas.height}
    if(this.world!==renderer.world)this.buildWorld(renderer.world);
    this.updateAnalysis(renderer);this.canvas.hidden=false;this.canvas.style.visibility='visible';
    gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(17/255,48/255,61/255,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.BLEND);
    const p=this.terrain;gl.useProgram(p.program);gl.enableVertexAttribArray(p.aPosition);
    gl.uniform2f(p.uViewport,m.width,m.height);gl.uniform2f(p.uCamera,renderer.camera.x*W,renderer.camera.y*H);gl.uniform2f(p.uWorld,W,H);
    gl.uniform1f(p.uScale,m.scale);gl.uniform1f(p.uPitch,m.pitch);gl.uniform1f(p.uRelief,renderer.projection==='flat'?0:1);gl.uniform1f(p.uSea,renderer.world.settings.seaLevel);
    gl.uniform1f(p.uMode,renderer.mode==='terrain'?0:renderer.mode==='political'?1:renderer.mode==='biome'?2:3);
    for(let i=0;i<2;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,this.textures[i])}gl.uniform1i(p.uFields,0);gl.uniform1i(p.uAnalysis,1);
    let calls=0;
    for(const offset of[-W,0,W]){
      if(offset+W<renderer.camera.x*W-m.viewW/2||offset>renderer.camera.x*W+m.viewW/2)continue;
      gl.uniform1f(p.uOffset,offset);
      for(const c of this.chunks){
        if(c.y1<renderer.camera.y*H-m.viewH/2||c.y0>renderer.camera.y*H+m.viewH/2+14)continue;
        gl.bindBuffer(gl.ARRAY_BUFFER,c.vertices);gl.vertexAttribPointer(p.aPosition,4,gl.FLOAT,false,16,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,c.indices);gl.drawElements(gl.TRIANGLES,c.count,gl.UNSIGNED_SHORT,0);calls++;
      }
    }
    gl.disableVertexAttribArray(p.aPosition);this.stats.frames++;
    renderer.terrainDetail={backend:'webgl',resolution:null,tiles:0,drawCalls:calls,pixelsPerCell:m.scale*(renderer.dpr||1),...this.stats};
    return true;
  }
  drawSettlement(renderer,s,profile,point,capital){
    if(this.lost)return false;
    const gl=this.gl,p=this.model,detail=point.scale>14;
    const key=[s.id,profile.stage,profile.count,profile.accent,detail,capital,renderer.projection].join(':');
    let model=this.models.get(key);
    if(!model){
      const pen=new MeshPen();root.WorldForgeLivingSettlements.paint(renderer,pen,s,profile,{x:0,y:0,scale:64/.82},false,capital,detail,64);
      const data=new Float32Array(pen.vertices),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      model={buffer,count:data.length/6};this.models.set(key,model);this.stats.modelBuilds++;
      // Retain only the current version of each settlement/detail level.
      for(const [k,v]of this.models)if(k!==key&&k.startsWith(s.id+':')&&k.split(':')[4]===String(detail)){gl.deleteBuffer(v.buffer);this.models.delete(k)}
    }
    const m=T().metrics(renderer);gl.useProgram(p.program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER,model.buffer);gl.enableVertexAttribArray(p.aPoint);gl.enableVertexAttribArray(p.aColor);
    gl.vertexAttribPointer(p.aPoint,2,gl.FLOAT,false,24,0);gl.vertexAttribPointer(p.aColor,4,gl.FLOAT,false,24,8);
    gl.uniform2f(p.uViewport,m.width,m.height);gl.uniform2f(p.uOrigin,point.x,point.y);gl.uniform1f(p.uUnit,root.WorldForgeLivingSettlements.unit(point.scale));
    gl.drawArrays(gl.TRIANGLES,0,model.count);gl.disableVertexAttribArray(p.aPoint);gl.disableVertexAttribArray(p.aColor);
    return true;
  }
  finish(){if(!this.lost){this.gl.flush();Object.assign(this.renderer.terrainDetail,this.stats)}}
}
root.WorldForgeWebGL={Atlas,MeshPen};
})(typeof window!=='undefined'?window:globalThis);
