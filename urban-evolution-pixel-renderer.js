(function(root,factory){
 const api=factory(root&&root.WorldForgePixelRenderer,root&&root.WorldForgeUrbanEvolution,root&&root.WorldForgeWorldbuilding);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.WorldForgeUrbanEvolutionPixel=api;
})(typeof window!=='undefined'?window:globalThis,function(Renderer,Urban,Worldbuilding){
'use strict';
if(!Renderer||!Urban||!Worldbuilding)throw new Error('WorldForge v4.5 Urban Pixel dependencies missing');
const VERSION='4.5.0',BASE=Renderer.renderSettlement,PALETTE=Renderer.palette;
const n=v=>Math.round(Number(v)||0),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rect=(x,y,w,h,c,o='')=>`<rect x="${n(x)}" y="${n(y)}" width="${Math.max(1,n(w))}" height="${Math.max(1,n(h))}" fill="${c}" ${o}/>`;
function glyph(d,x,y,u,p){let s=`<g data-urban-state="${d.state}">`;if(d.state==='ruined')s+=rect(x,y+5*u,8*u,2*u,p.wall)+rect(x+u,y+3*u,2*u,2*u,p.dark)+rect(x+5*u,y+2*u,2*u,3*u,p.wall,'opacity=".5"');else if(d.state==='rebuilding')s+=rect(x,y+5*u,8*u,2*u,p.wall)+rect(x+u,y+2*u,5*u,3*u,p.light)+rect(x+6*u,y+u,u,4*u,p.accent);else if(d.state==='growing')s+=rect(x,y+5*u,8*u,2*u,p.wall)+rect(x+u,y+2*u,2*u,3*u,p.light)+rect(x+4*u,y,2*u,5*u,p.accent);else if(d.state==='declining')s+=rect(x,y+3*u,8*u,4*u,p.wall,'opacity=".6"');else s+=rect(x,y+4*u,7*u,3*u,p.wall,'opacity=".45"');if(d.outsideWalls)s+=`<circle cx="${n(x+9*u)}" cy="${n(y+u)}" r="${Math.max(1,n(u))}" fill="${p.accent}"/>`;return s+'</g>'}
function renderSettlement(profile,opt={}){const W=Math.max(320,Number(opt.width)||720),H=Math.max(220,Number(opt.height)||440),p=PALETTE(profile),u=profile.urbanEvolution;if(!u)return BASE(profile,opt);let o='<g data-urban-evolution-overlay="v4.5">';for(let i=0;i<(u.districts||[]).length;i++){const d=u.districts[i],px=Math.max(1,Math.floor(W/560)),x=clamp(W*.08+(i%5)*W*.18,8,W-28),y=clamp(H*.58+Math.floor(i/5)*H*.105,20,H-32);o+=glyph(d,x,y,px,p)}if(u.expansionStage!=='contained')o+=`<ellipse cx="${n(W*.5)}" cy="${n(H*.71)}" rx="${n(W*(u.expansionStage==='outer_ring'?.31:.26))}" ry="${n(H*.13)}" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="5 4"/>`;o+='</g>';return String(BASE(profile,opt)).replace('</svg>',o+'</svg>')}
const baseView=Worldbuilding.settlementView.bind(Worldbuilding);Worldbuilding.settlementView=function(world,sid){const v=baseView(world,sid);try{v.urbanEvolution=Urban.settlementView(world,sid)}catch(_){}return v};
Worldbuilding.URBAN_EVOLUTION_VERSION=VERSION;Renderer.renderSettlement=renderSettlement;Renderer.URBAN_EVOLUTION_VERSION=VERSION;
return{VERSION,renderSettlement,glyph};
});
