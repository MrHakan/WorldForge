(function(root,factory){
  const api=factory(root&&root.WorldForgeStructureArchetypes);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgePixelRenderer=api;
})(typeof window!=='undefined'?window:globalThis,function(Archetypes){
'use strict';
if(!Archetypes)throw new Error('WorldForge Pixel Renderer requires structure archetypes');
const VERSION='4.0.0';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let x=hash(seed);return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const PALETTES={
 temperate:{ground:'#6f8f55',road:'#a58a61',wall:'#8a8172',roof:'#8d4f42',wood:'#75543b',water:'#477fa0',accent:'#d1b45b',dark:'#2e342d',light:'#c9c39f'},
 forest:{ground:'#526f45',road:'#8f7957',wall:'#7f796d',roof:'#6e453b',wood:'#5e4935',water:'#416f85',accent:'#b99c4f',dark:'#263228',light:'#b9b793'},
 arid:{ground:'#b49a63',road:'#9d8157',wall:'#b1a184',roof:'#8f5944',wood:'#75553a',water:'#4d8297',accent:'#d5b458',dark:'#493b2d',light:'#d4c49a'},
 tundra:{ground:'#9ca9a1',road:'#8d8a80',wall:'#9aa0a0',roof:'#5d6571',wood:'#66594a',water:'#557d96',accent:'#c5a75b',dark:'#313942',light:'#d5ddd8'},
 steppe:{ground:'#8d9252',road:'#9d8057',wall:'#8f8670',roof:'#7b513e',wood:'#6e5037',water:'#4f7890',accent:'#c5a24f',dark:'#34362a',light:'#c6c094'},
 tropical:{ground:'#4c8a54',road:'#8a714d',wall:'#7f7565',roof:'#7d4f38',wood:'#64482f',water:'#367d91',accent:'#d0aa43',dark:'#24352a',light:'#b9c88d'},
 highland:{ground:'#66715f',road:'#81735f',wall:'#777879',roof:'#614b46',wood:'#62503e',water:'#4d7188',accent:'#b49a56',dark:'#2d3130',light:'#b9b9a6'}
};
const px=(n)=>Math.round(n);
function palette(profile){const p={...(PALETTES[profile.biomeStyle]||PALETTES.temperate)};const c=String(profile.cultureStyle||'');if(c==='coastal'||c==='riverine')p.accent='#70b8b2';else if(c==='imperial')p.accent='#c98f4f';else if(c==='northern')p.roof='#586272';else if(c==='mercantile')p.accent='#d6b14f';else if(c==='highland')p.wall='#85807b';return p}
function rect(x,y,w,h,fill,extra=''){return`<rect x="${px(x)}" y="${px(y)}" width="${Math.max(1,px(w))}" height="${Math.max(1,px(h))}" fill="${fill}" ${extra}/>`}
function line(x1,y1,x2,y2,stroke,width){return`<line x1="${px(x1)}" y1="${px(y1)}" x2="${px(x2)}" y2="${px(y2)}" stroke="${stroke}" stroke-width="${Math.max(1,px(width))}" stroke-linecap="square"/>`}
function structureGlyph(type,x,y,s,p,seed,condition=1){const r=rng(`${seed}|${type}|${x}|${y}`),dark=p.dark,roof=p.roof,wall=p.wall,wood=p.wood,light=p.light,accent=p.accent;let out=`<g data-structure="${type}">`;const wear=clamp(1-condition,0,1);switch(type){
 case'poor_house':out+=rect(x,y+2*s,4*s,3*s,wood)+rect(x+s,y+s,3*s,2*s,roof)+rect(x+2*s,y+3*s,s,2*s,dark);break;
 case'house':case'merchant_house':case'noble_house':{const w=type==='noble_house'?7:type==='merchant_house'?6:5,h=type==='noble_house'?5:4;out+=rect(x,y+2*s,w*s,h*s,wall)+rect(x-s,y+s,(w+2)*s,2*s,roof)+rect(x+2*s,y+(h+1)*s,s,2*s,dark)+rect(x+(w-2)*s,y+3*s,s,s,light);if(type!=='house')out+=rect(x+(w-1)*s,y+2*s,s,2*s,accent);break}
 case'barracks':out+=rect(x,y+2*s,8*s,4*s,wall)+rect(x-s,y+s,10*s,2*s,roof)+rect(x+3*s,y+4*s,2*s,2*s,dark)+rect(x+7*s,y,s,4*s,accent);break;
 case'watchtower':out+=rect(x+s,y,3*s,7*s,wall)+rect(x,y,5*s,2*s,dark)+rect(x+2*s,y+3*s,s,s,light)+rect(x+4*s,y-s,s,3*s,accent);break;
 case'wall_segment':out+=rect(x,y+2*s,9*s,2*s,p.wall)+[0,2,4,6,8].map(i=>rect(x+i*s,y+s,s,s,p.light)).join('');break;
 case'gate':out+=rect(x,y+s,8*s,5*s,wall)+rect(x+2*s,y+3*s,4*s,3*s,dark)+rect(x+s,y,2*s,2*s,light)+rect(x+5*s,y,2*s,2*s,light);break;
 case'market_stall':out+=rect(x,y+2*s,5*s,2*s,wood)+rect(x,y+s,5*s,s,accent)+rect(x,y,5*s,s,r()>.5?roof:light);break;
 case'warehouse':out+=rect(x,y+2*s,8*s,5*s,wall)+rect(x-s,y+s,10*s,2*s,roof)+rect(x+3*s,y+4*s,2*s,3*s,dark)+rect(x+6*s,y+5*s,s,s,wood);break;
 case'dock':out+=rect(x,y,10*s,2*s,wood)+[0,3,6,9].map(i=>rect(x+i*s,y+2*s,s,2*s,dark)).join('');break;
 case'shipyard':out+=rect(x,y+3*s,10*s,3*s,wood)+line(x+s,y+3*s,x+5*s,y-s,dark,s)+line(x+5*s,y-s,x+9*s,y+3*s,dark,s)+rect(x+4*s,y,2*s,5*s,accent);break;
 case'temple':out+=rect(x,y+3*s,8*s,5*s,wall)+rect(x-s,y+2*s,10*s,2*s,light)+rect(x+2*s,y,4*s,3*s,roof)+rect(x+3*s,y+5*s,2*s,3*s,dark)+rect(x+4*s,y-s,s,3*s,accent);break;
 case'workshop':out+=rect(x,y+2*s,7*s,4*s,wall)+rect(x-s,y+s,8*s,2*s,roof)+rect(x+5*s,y-s,s,4*s,dark)+rect(x+s,y+4*s,2*s,2*s,wood);break;
 case'farm_cluster':out+=rect(x,y+2*s,5*s,3*s,wood)+rect(x-s,y+s,7*s,2*s,roof)+rect(x+7*s,y,6*s,5*s,'none','stroke="'+p.accent+'" stroke-width="1"')+[0,2,4].map(i=>line(x+8*s,y+(i+1)*s,x+12*s,y+(i+1)*s,p.accent,1)).join('');break;
 case'granary':out+=rect(x,y+2*s,6*s,5*s,wood)+rect(x-s,y+s,8*s,2*s,roof)+rect(x+s,y+6*s,s,2*s,dark)+rect(x+4*s,y+6*s,s,2*s,dark);break;
 case'civic_hall':out+=rect(x,y+3*s,10*s,5*s,wall)+rect(x-s,y+2*s,12*s,2*s,light)+rect(x+3*s,y,4*s,3*s,roof)+rect(x+4*s,y+5*s,2*s,3*s,dark)+rect(x+9*s,y+s,s,4*s,accent);break;
 case'well':out+=rect(x,y+2*s,4*s,2*s,wall)+rect(x+s,y+s,2*s,2*s,p.water)+line(x,y,x,y+3*s,wood,1)+line(x+4*s,y,x+4*s,y+3*s,wood,1)+line(x,y,x+4*s,y,wood,1);break;
 default:out+=rect(x,y,4*s,4*s,wall);
 }
 if(wear>.25&&type!=='dock'&&type!=='wall_segment')out+=rect(x+(1+Math.floor(r()*3))*s,y+(2+Math.floor(r()*3))*s,s,s,dark,'opacity=".45"');return out+'</g>'}
function districtLabel(kind){return String(kind||'district').replaceAll('_',' ').toUpperCase()}
function renderSettlement(profile,options={}){const W=Math.max(320,Number(options.width)||720),H=Math.max(220,Number(options.height)||440),p=palette(profile),r=rng(`${profile.previewSeed}|scene`),cx=W/2,cy=H/2;let out=`<svg data-worldforge-pixel="v4.0" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Pixel settlement preview of ${String(profile.name||'settlement').replace(/[&<>"']/g,'')}">`;
 out+=rect(0,0,W,H,p.ground);for(let i=0;i<22;i++){const x=r()*W,y=r()*H,s=2+Math.floor(r()*4);out+=rect(x,y,s,s,r()>.55?p.light:p.dark,'opacity=".12"')}
 if(profile.flags?.coastal)out+=`<path d="M ${W*.78} 0 L ${W} 0 L ${W} ${H} L ${W*.72} ${H} Q ${W*.66} ${H*.7} ${W*.76} ${H*.48} Q ${W*.84} ${H*.25} ${W*.78} 0 Z" fill="${p.water}"/>`;
 if(profile.flags?.river)out+=`<path d="M ${W*.08} 0 Q ${W*.25} ${H*.28} ${W*.42} ${H*.45} T ${W*.86} ${H}" fill="none" stroke="${p.water}" stroke-width="${Math.max(8,W*.018)}"/>`;
 const ds=profile.districts||[];for(const d of ds){const x=d.x*W,y=d.y*H;out+=line(cx,cy,x,y,p.road,Math.max(3,W*.007))}
 if(profile.flags?.fortified){out+=`<rect x="${W*.09}" y="${H*.08}" width="${W*.72}" height="${H*.84}" rx="0" fill="none" stroke="${p.wall}" stroke-width="${Math.max(5,W*.01)}" stroke-dasharray="${Math.max(8,W*.018)} ${Math.max(4,W*.009)}"/>`}
 for(const d of ds){const x=d.x*W,y=d.y*H,scale=Math.max(2,Math.floor(W/260)),entries=(d.structures||[]).slice().sort((a,b)=>b.count-a.count);out+=`<g data-district="${d.kind}">`;const total=Math.min(9,Math.max(3,Math.round(Math.sqrt(entries.reduce((n,a)=>n+a.count,0)))));for(let i=0;i<total;i++){const e=entries[i%Math.max(1,entries.length)]||{type:'house'},ang=(i/total)*Math.PI*2+r()*.3,rad=12+Math.floor(i/3)*10+Math.floor(r()*8),gx=clamp(x+Math.cos(ang)*rad,8,W-60),gy=clamp(y+Math.sin(ang)*rad,8,H-45);out+=structureGlyph(e.type,gx,gy,scale,p,`${profile.previewSeed}|${d.id}|${i}`,d.condition??profile.condition)}out+=`<text x="${px(x)}" y="${px(y-10)}" text-anchor="middle" font-family="monospace" font-size="${Math.max(8,Math.floor(W/78))}" fill="${p.dark}" opacity=".88">${districtLabel(d.kind)}</text></g>`}
 out+=`<g><text x="12" y="22" font-family="monospace" font-size="14" font-weight="700" fill="${p.dark}">${String(profile.name||'SETTLEMENT').replace(/[&<>"']/g,'')}</text><text x="12" y="40" font-family="monospace" font-size="10" fill="${p.dark}">${String(profile.settlementType||'town').replaceAll('_',' ').toUpperCase()} · ${String(profile.cultureStyle||'').toUpperCase()} · ${String(profile.biomeStyle||'').toUpperCase()}</text></g>`;
 return out+'</svg>'}
function fingerprint(profile){return hash(renderSettlement(profile,{width:480,height:300})).toString(16).padStart(8,'0')}
return{VERSION,PALETTES,palette,structureGlyph,renderSettlement,fingerprint};
});