(function(root,factory){
  const api=factory(root&&root.WorldForgePixelRenderer,root&&root.WorldForgeStructureArchetypes);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgePixelPolish=api;
})(typeof window!=='undefined'?window:globalThis,function(Renderer,Archetypes){
'use strict';
if(!Renderer||!Archetypes)throw new Error('WorldForge Pixel Art Polish requires the v4.1 renderer and structure archetypes');
const VERSION='4.1.1';
const BASE_RENDER=Renderer.renderSettlement;
const BASE_STRUCTURE=Renderer.structureGlyph;
const BASE_PALETTE=Renderer.palette;
function hash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const n=v=>Math.round(Number(v)||0);
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${Math.max(1,n(w))}" height="${Math.max(1,n(h))}" fill="${fill}" ${extra}/>`;
const line=(x1,y1,x2,y2,stroke,width=1)=>`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${Math.max(1,n(width))}" stroke-linecap="square"/>`;
const ENHANCED_VARIANTS=Object.freeze(new Set([
 'gable_house','stucco_house','trading_post','stockade_barracks','caravan_house',
 'arcaded_house','balcony_house','guild_house','row_house','great_hall','khan_hall','frontier_hall',
 'villa','sea_villa','tower_house','merchant_palazzo','river_manor','timber_shrine','steppe_shrine',
 'coastal_temple','forum_hall','timber_hall','exchange_hall','quayside_warehouse','river_warehouse',
 'counting_warehouse','beacon_tower','stone_tower','hill_tower','wood_watchtower','river_quay'
]));
function anchor(group){
 const m=String(group).match(/<rect x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)" fill="([^"]*)"/);
 return m?{x:+m[1],y:+m[2],w:+m[3],h:+m[4],fill:m[5]}:null;
}
function detail(variant,type,a,p,seed){
 if(!a)return'';
 const u=Math.max(1,Math.round(Math.min(Math.max(1,a.w),Math.max(1,a.h))/3));
 const x=a.x,y=a.y,w=a.w,h=a.h,cx=x+w/2,dark=p.dark,light=p.light,accent=p.accent,wood=p.wood,roof=p.roof,wall=p.wall;
 const jitter=hash(`${seed}|${variant}|${type}|${x}|${y}`)%3;
 switch(variant){
  case'gable_house':return rect(cx-u,y-2*u,2*u,u,roof)+rect(cx-2*u,y-u,4*u,u,roof)+rect(cx-u/2,y-u,u,2*u,light);
  case'stucco_house':return rect(x+u,y+u,Math.max(u,w-2*u),Math.max(u,h-u),light,'opacity=".72"')+rect(x+u,y+2*u,u,u,accent)+rect(x+w-2*u,y+2*u,u,u,accent)+line(x,y+h,x+w,y+h,wood,u);
  case'trading_post':return rect(x-u,y+h-u,w+2*u,u,wood)+rect(x+w-u,y+u,2*u,u,accent)+line(x+w,y,x+w,y+2*u,wood,u);
  case'stockade_barracks':return line(x,y,x+w,y+h,dark,u)+line(x+w,y,x,y+h,dark,u)+[0,1,2,3].map(i=>rect(x+i*(w/3),y-u,u,2*u,wood)).join('');
  case'caravan_house':return rect(cx-2*u,y+h-2*u,4*u,2*u,dark)+rect(cx-u,y+h-2*u,2*u,2*u,light)+rect(x+u,y-u,w-2*u,u,accent);
  case'arcaded_house':return [1,3,5].map(i=>rect(x+i*w/7-u/2,y+h-2*u,u,2*u,dark)).join('')+line(x,y+h-2*u,x+w,y+h-2*u,accent,u);
  case'balcony_house':return rect(x+u,y+h/2,w-2*u,u,wood)+[1,2,3,4].map(i=>line(x+i*(w/5),y+h/2,x+i*(w/5),y+h/2+2*u,dark,1)).join('');
  case'guild_house':return rect(x+w-u,y+u,2*u,2*u,accent)+line(x+w,y,x+w+2*u,y-u,wood,1)+rect(x+w+u,y-u,2*u,u,dark);
  case'row_house':return [1,3,5].map(i=>rect(x+i*w/7-u/2,y-u,u,u,light)).join('')+line(x,y+u,x+w,y+u,accent,1);
  case'great_hall':return rect(cx-u,y-2*u,2*u,2*u,accent)+line(cx,y-3*u,cx,y,wood,1);
  case'khan_hall':return rect(x-u,y-u,w+2*u,u,accent)+rect(cx-u,y-2*u,2*u,u,light);
  case'frontier_hall':return line(x,y,x+w,y+h,dark,1)+line(x+w,y,x,y+h,dark,1)+rect(x-u,y+h-u,w+2*u,u,wood);
  case'villa':return rect(x+u,y+h-u,u,u,accent)+rect(x+w-2*u,y+h-u,u,u,accent)+line(x+u,y+h,x+w-u,y+h,light,1);
  case'sea_villa':return rect(x,y+h/2,w,u,accent)+line(x-u,y+h/2,x+w+u,y+h/2,light,1)+rect(x+w-u,y-u,u,2*u,accent);
  case'tower_house':return [0,2,4].map(i=>rect(x+i*w/5,y-u,Math.max(1,w/8),u,light)).join('')+rect(cx-u/2,y+h-u,u,u,dark);
  case'merchant_palazzo':return [1,3,5].map(i=>rect(x+i*w/7-u/2,y+u,u,u,accent)).join('')+line(x,y+h/2,x+w,y+h/2,light,1);
  case'river_manor':return [1,3,5].map(i=>rect(x+i*w/7,y+h,u,2*u,wood)).join('')+line(x-u,y+h+2*u,x+w+u,y+h+2*u,p.water,1);
  case'timber_shrine':return line(cx,y-2*u,cx,y,accent,u)+rect(cx-u,y-2*u,2*u,u,roof);
  case'steppe_shrine':return rect(cx-u,y-2*u,2*u,u,accent)+line(cx,y-3*u,cx,y-u,wood,1);
  case'coastal_temple':return rect(x+w-u,y-u,u,2*u,accent)+line(x+w,y-2*u,x+w+3*u,y-3*u,accent,1);
  case'forum_hall':return [1,3,5].map(i=>rect(x+i*w/7,y+h-u,u,u,light)).join('')+rect(cx-u,y-2*u,2*u,u,accent);
  case'timber_hall':return line(x,y,x+w,y+h,dark,1)+line(x+w,y,x,y+h,dark,1)+rect(x+u,y-u,w-2*u,u,roof);
  case'exchange_hall':return rect(x,y+h/2,w,u,accent)+[1,3,5].map(i=>rect(x+i*w/7,y+u,u,u,dark)).join('');
  case'quayside_warehouse':return rect(x+w-u,y+u,u,2*u,accent)+line(x+w,y,x+w+2*u,y-2*u,wood,1);
  case'river_warehouse':return [1,3,5].map(i=>rect(x+i*w/7,y+h,u,2*u,wood)).join('')+line(x,y+h+2*u,x+w,y+h+2*u,p.water,1);
  case'counting_warehouse':return rect(x+u,y+u,2*u,u,light)+rect(x+w-3*u,y+u,2*u,u,light)+rect(cx-u,y+h-u,2*u,u,accent);
  case'beacon_tower':return line(x+w,y-u,x+w+4*u,y-2*u,accent,1)+line(x+w,y,x+w+4*u,y+u,accent,1);
  case'stone_tower':return [0,2,4].map(i=>rect(x+i*w/5,y-u,Math.max(1,w/8),u,light)).join('');
  case'hill_tower':return rect(x-u,y+h-u,w+2*u,u,dark)+rect(cx-u/2,y+u,u,u,light);
  case'wood_watchtower':return line(x,y,x+w,y+h,dark,1)+line(x+w,y,x,y+h,dark,1);
  case'river_quay':return [1,3,5].map(i=>rect(x+i*w/7,y-u,u,u,accent)).join('');
  default:return jitter===0?rect(x+w-u,y+u,u,u,accent,'opacity=".65"'):jitter===1?rect(x+u,y+u,u,u,light,'opacity=".6"'):line(x,y+h,x+w,y+h,dark,1);
 }
}
function polishStructureGroup(group,profile={},seed=''){
 const m=String(group).match(/^<g data-structure="([^"]+)" data-variant="([^"]+)">/);
 if(!m)return group;
 const type=m[1],variant=m[2],p=BASE_PALETTE(profile),a=anchor(group),extra=detail(variant,type,a,p,seed||profile.previewSeed||'worldforge');
 if(!extra)return group;
 return String(group).replace(/^<g\b/,`<g data-pixel-polish="${VERSION}" data-polish-detail="${variant}"`).replace(/<\/g>$/,`${extra}</g>`);
}
function structureGlyph(type,x,y,s,p,seed,condition=1,profile={}){
 return polishStructureGroup(BASE_STRUCTURE(type,x,y,s,p,seed,condition,profile),profile,seed);
}
function polishSvg(svg,profile={}){
 let out=String(svg).replace(/^<svg\b/,`<svg data-worldforge-polish="${VERSION}"`);
 out=out.replace(/<g data-structure="[^"]+" data-variant="[^"]+">[\s\S]*?<\/g>/g,g=>polishStructureGroup(g,profile,profile.previewSeed||'worldforge'));
 return out;
}
function renderSettlement(profile,options={}){return polishSvg(BASE_RENDER(profile,options),profile)}
function fingerprint(profile){return hash(renderSettlement(profile,{width:480,height:300})).toString(16).padStart(8,'0')}
Renderer.structureGlyph=structureGlyph;
Renderer.renderSettlement=renderSettlement;
Renderer.fingerprint=fingerprint;
Renderer.POLISH_VERSION=VERSION;
return{VERSION,ENHANCED_VARIANTS,polishStructureGroup,polishSvg,renderSettlement,structureGlyph,fingerprint};
});
