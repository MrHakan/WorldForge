(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeEngine=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';

const VERSION='0.1.0';
const SCHEMA_VERSION=1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const idx=(x,y,w)=>y*w+x;

function xmur3(str){
  let h=1779033703^str.length;
  for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^h>>>16)>>>0}
}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function rngFromSeed(seed){const h=xmur3(String(seed||'WORLD'))();return mulberry32(h)}
function hash2(x,y,seed){
  let h=(x*374761393+y*668265263+seed*1442695041)|0;
  h=(h^(h>>>13))*1274126177;h^=h>>>16;return(h>>>0)/4294967295
}
function valueNoise(x,y,seed,wrapX=0){
  let x0=Math.floor(x),y0=Math.floor(y),tx=x-x0,ty=y-y0;
  const wx=v=>wrapX?((v%wrapX)+wrapX)%wrapX:v;
  const a=hash2(wx(x0),y0,seed),b=hash2(wx(x0+1),y0,seed),c=hash2(wx(x0),y0+1,seed),d=hash2(wx(x0+1),y0+1,seed);
  const sx=smooth(tx),sy=smooth(ty);
  return lerp(lerp(a,b,sx),lerp(c,d,sx),sy);
}
function fbm(x,y,seed,octaves=5,scale=1,wrapX=0){
  let sum=0,amp=.5,freq=scale,norm=0;
  for(let o=0;o<octaves;o++){sum+=valueNoise(x*freq,y*freq,seed+o*1013,wrapX?wrapX/freq:0)*amp;norm+=amp;freq*=2;amp*=.5}
  return sum/norm;
}
function distWrap(a,b,w){
  const dx0=Math.abs(a.x-b.x),dx=Math.min(dx0,w-dx0),dy=a.y-b.y;return Math.hypot(dx,dy)
}
const syllA=['Aer','Ash','Bel','Caer','Dun','Eld','Fal','Gal','High','Iri','Kel','Lor','Mor','Nor','Or','Raven','Sol','Thorn','Val','West','Yar'];
const syllB=['ador','crest','dell','dor','fall','gard','haven','helm','ia','mere','mont','ora','reach','rest','run','spire','stead','vale','watch','wick'];
const realmForms=['Kingdom','Crown','Realm','Marches','Dominion','Principality','Highlands','League'];
function makeName(rng,used,prefix=''){
  for(let k=0;k<100;k++){
    const n=prefix+(rng()<.28?syllA[Math.floor(rng()*syllA.length)]+' ': '')+syllA[Math.floor(rng()*syllA.length)]+syllB[Math.floor(rng()*syllB.length)];
    const name=n.replace(/\s+/g,' ').replace(/(\w)(\w*)/g,(m,a,b)=>a.toUpperCase()+b.toLowerCase());
    if(!used.has(name)){used.add(name);return name}
  }
  return 'Unnamed '+used.size;
}
function worldName(seed,rng){
  const used=new Set();const core=makeName(rng,used);
  const suffix=['',' World',' Expanse',' Reach',' Sphere',' Lands'][Math.floor(rng()*6)];
  return suffix?core+suffix:core;
}
const BIOMES={
  ocean:{label:'Ocean',color:'#173c49'},
  deepOcean:{label:'Deep Ocean',color:'#102c3a'},
  ice:{label:'Ice',color:'#dce9e5'},
  tundra:{label:'Tundra',color:'#8f9d8e'},
  taiga:{label:'Taiga',color:'#476b52'},
  grassland:{label:'Grassland',color:'#72934e'},
  forest:{label:'Temperate Forest',color:'#3f7544'},
  rainforest:{label:'Rainforest',color:'#2f6b3b'},
  savanna:{label:'Savanna',color:'#a49b4e'},
  desert:{label:'Desert',color:'#c3a85d'},
  steppe:{label:'Steppe',color:'#94905b'},
  mountain:{label:'Mountains',color:'#77796f'},
  alpine:{label:'Alpine',color:'#aeb7ad'},
  wetland:{label:'Wetland',color:'#4f8069'}
};
function biomeFor(e,t,m,sea){
  if(e<sea-.12)return'deepOcean';
  if(e<sea)return'ocean';
  if(e>.86)return t<.32?'alpine':'mountain';
  if(t<.12)return'ice';
  if(t<.25)return m>.45?'taiga':'tundra';
  if(t>.72&&m<.28)return'desert';
  if(t>.68&&m>.68)return'rainforest';
  if(t>.62&&m<.48)return'savanna';
  if(m>.76&&e<sea+.12)return'wetland';
  if(m>.58)return'forest';
  if(m<.30)return'steppe';
  return'grassland';
}
function generateTerrain(settings,rng){
  const w=settings.width,h=settings.height,sea=settings.seaLevel;
  const elevation=new Float32Array(w*h),temperature=new Float32Array(w*h),moisture=new Float32Array(w*h),biome=new Array(w*h),resources=new Uint8Array(w*h);
  const seedInt=xmur3(settings.seed)();
  const ageAmp=settings.age==='young'?1.12:settings.age==='ancient'?.88:1;
  for(let y=0;y<h;y++){
    const lat=Math.abs((y/(h-1))*2-1);
    for(let x=0;x<w;x++){
      const i=idx(x,y,w);
      const warpX=(fbm(x,y,seedInt+11,3,.025,w)*2-1)*9;
      const warpY=(fbm(x,y,seedInt+23,3,.025,w)*2-1)*9;
      let e=fbm(x+warpX,y+warpY,seedInt+41,6,.018,w);
      const broad=fbm(x,y,seedInt+71,3,.008,w);
      e=(e*.72+broad*.28);
      e=clamp(.5+(e-.5)*ageAmp,0,1);
      const polarPenalty=Math.pow(lat,2.2)*.11;
      e=clamp(.47+(e-polarPenalty-.40)*1.80,0,1);
      const tempNoise=(fbm(x,y,seedInt+99,3,.028,w)-.5)*.22;
      const t=clamp(1-lat*.94+tempNoise-(Math.max(0,e-sea)*.48),0,1);
      const moistNoise=fbm(x+17,y-11,seedInt+151,5,.024,w);
      const coastHint=clamp(1-Math.abs(e-sea)*6,0,1);
      const m=clamp(moistNoise*.82+coastHint*.18,0,1);
      elevation[i]=e;temperature[i]=t;moisture[i]=m;biome[i]=biomeFor(e,t,m,sea);
      if(e>=sea){
        let r=0;if(e>.72&&hash2(x,y,seedInt+205)>.72)r|=1;if(m>.62&&hash2(x,y,seedInt+207)>.75)r|=2;if(t>.58&&m>.5&&hash2(x,y,seedInt+211)>.79)r|=4;if(hash2(x,y,seedInt+213)>.89)r|=8;resources[i]=r
      }
    }
  }
  return{elevation,temperature,moisture,biome,resources};
}
function neighbors8(x,y,w,h){
  const a=[];for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){if(!ox&&!oy)continue;const ny=y+oy;if(ny<0||ny>=h)continue;const nx=(x+ox+w)%w;a.push({x:nx,y:ny})}return a
}
function generateRivers(world,rng){
  const {width:w,height:h,seaLevel:sea}=world.settings,{elevation,moisture}=world.layers;
  const candidates=[];
  for(let y=2;y<h-2;y++)for(let x=0;x<w;x++){const i=idx(x,y,w);if(elevation[i]>sea+.18&&moisture[i]>.42)candidates.push({x,y,score:(elevation[i]-sea)*.7+moisture[i]*.3+rng()*.08})}
  candidates.sort((a,b)=>b.score-a.score);
  const target=clamp(Math.round((w*h)/1350),5,18),rivers=[],occupied=new Set();
  for(const src of candidates){
    if(rivers.length>=target)break;
    if([...occupied].some(k=>{const [x,y]=k.split(',').map(Number);return distWrap(src,{x,y},w)<8}))continue;
    const path=[{x:src.x,y:src.y}],seen=new Set([src.x+','+src.y]);let cur={x:src.x,y:src.y};
    for(let step=0;step<Math.max(w,h);step++){
      const ci=idx(cur.x,cur.y,w);if(elevation[ci]<sea+.01&&path.length>5)break;
      let opts=neighbors8(cur.x,cur.y,w,h).filter(p=>!seen.has(p.x+','+p.y));
      if(!opts.length)break;
      opts.sort((a,b)=>(elevation[idx(a.x,a.y,w)]+hash2(a.x,a.y,311)*.012)-(elevation[idx(b.x,b.y,w)]+hash2(b.x,b.y,311)*.012));
      let next=opts[0];
      if(elevation[idx(next.x,next.y,w)]>elevation[ci]+.025)break;
      cur=next;path.push(cur);seen.add(cur.x+','+cur.y);
      if(occupied.has(cur.x+','+cur.y)&&path.length>8)break;
    }
    if(path.length>=8){rivers.push({id:rivers.length,name:null,path});for(const p of path)occupied.add(p.x+','+p.y)}
  }
  const used=new Set();for(const r of rivers)r.name=makeName(rng,used)+' River';
  return rivers;
}
function isCoast(world,x,y){
  const {width:w,height:h,seaLevel:sea}=world.settings,{elevation}=world.layers;
  if(elevation[idx(x,y,w)]<sea)return false;
  return neighbors8(x,y,w,h).some(p=>elevation[idx(p.x,p.y,w)]<sea);
}
function riverDistance(world,x,y,max=5){
  let best=999;
  for(const r of world.rivers)for(const p of r.path){const d=distWrap({x,y},p,world.settings.width);if(d<best)best=d;if(best<=1)return best}
  return Math.min(best,max+1);
}
function siteScore(world,x,y){
  const {width:w,seaLevel:sea}=world.settings,i=idx(x,y,w),L=world.layers;
  if(L.elevation[i]<sea||['mountain','alpine','ice'].includes(L.biome[i]))return-1;
  const temp=1-Math.abs(L.temperature[i]-.56),moist=1-Math.abs(L.moisture[i]-.55);
  const coast=isCoast(world,x,y)?1:0,river=riverDistance(world,x,y,4)<=2?1:0;
  const resourceBits=L.resources[i],res=((resourceBits&1?1:0)+(resourceBits&2?1:0)+(resourceBits&4?1:0)+(resourceBits&8?1:0))/4;
  const terrain=clamp(1-Math.abs(L.elevation[i]-(sea+.09))*2.6,0,1);
  return clamp(temp*.22+moist*.18+coast*.17+river*.21+res*.12+terrain*.10,0,1);
}
function generateSettlements(world,count,rng){
  const {width:w,height:h}=world.settings,cands=[];
  for(let y=2;y<h-2;y++)for(let x=0;x<w;x++){const s=siteScore(world,x,y);if(s>.34)cands.push({x,y,score:s+rng()*.08})}
  cands.sort((a,b)=>b.score-a.score);
  const picked=[],minDist=Math.max(3.4,Math.sqrt((w*h)/Math.max(1,count))*0.42),used=new Set();
  for(const c of cands){
    if(picked.length>=count)break;
    if(picked.every(p=>distWrap(c,p,w)>=minDist)){
      const score=siteScore(world,c.x,c.y),pop=Math.round(250+Math.pow(score,2.2)*14500*(.65+rng()*.7));
      picked.push({id:picked.length,name:makeName(rng,used),x:c.x,y:c.y,score,population:pop,type:'Village',kingdomId:null,capital:false});
    }
  }
  picked.sort((a,b)=>b.population-a.population);
  const cityCut=Math.max(3,Math.round(picked.length*.16)),townCut=Math.max(cityCut+4,Math.round(picked.length*.46));
  picked.forEach((p,i)=>{p.id=i;p.type=i<cityCut?'City':i<townCut?'Town':'Village'});
  return picked;
}
const REALM_COLORS=['#d16b5d','#6e9bc3','#c4a54f','#7ca760','#9a78b5','#c77eab','#d68f52','#5ea6a0','#a7a35c','#7e86c5','#b55f76','#70a57d'];
function generateKingdoms(world,count,rng){
  const settlements=world.settlements,w=world.settings.width,used=new Set(),capitals=[];
  const sorted=[...settlements].sort((a,b)=>b.score-a.score||b.population-a.population);
  for(const s of sorted){
    if(capitals.length>=count)break;
    if(capitals.every(c=>distWrap(s,c,w)>Math.max(9,w/count*.34)))capitals.push(s)
  }
  while(capitals.length<count&&sorted[capitals.length])capitals.push(sorted[capitals.length]);
  const kingdoms=capitals.map((c,i)=>{
    c.capital=true;c.type='Capital';
    const base=makeName(rng,used);
    return{id:i,name:`${realmForms[Math.floor(rng()*realmForms.length)]} of ${base}`,shortName:base,capitalId:c.id,color:REALM_COLORS[i%REALM_COLORS.length],settlementIds:[],areaTiles:0,foundingPopulation:0};
  });
  for(const s of settlements){
    let best=0,bestD=1e9;
    kingdoms.forEach((k,i)=>{const c=settlements[k.capitalId],d=distWrap(s,c,w)*(1.0+(hash2(s.x,s.y,700+i)-.5)*.10);if(d<bestD){bestD=d;best=i}});
    s.kingdomId=best;kingdoms[best].settlementIds.push(s.id);kingdoms[best].foundingPopulation+=s.population
  }
  const political=new Int16Array(w*world.settings.height);political.fill(-1);
  for(let y=0;y<world.settings.height;y++)for(let x=0;x<w;x++){
    const i=idx(x,y,w);if(world.layers.elevation[i]<world.settings.seaLevel)continue;
    let best=-1,bestScore=1e9;
    for(const k of kingdoms){
      const c=settlements[k.capitalId];let d=distWrap({x,y},c,w);
      d*=1+(hash2(Math.floor(x/3),Math.floor(y/3),900+k.id)-.5)*.22;
      const mountainPenalty=['mountain','alpine'].includes(world.layers.biome[i])?2.4:0;
      d+=mountainPenalty;
      if(d<bestScore){bestScore=d;best=k.id}
    }
    political[i]=best;if(best>=0)kingdoms[best].areaTiles++;
  }
  return{kingdoms,political};
}
function generateRoads(world){
  const roads=[],seen=new Set(),w=world.settings.width;
  for(const k of world.kingdoms){
    const ids=k.settlementIds,capital=world.settlements[k.capitalId];
    for(const id of ids){
      const s=world.settlements[id];if(s.id===capital.id)continue;
      const candidates=ids.filter(o=>o!==id).map(o=>world.settlements[o]).sort((a,b)=>distWrap(s,a,w)-distWrap(s,b,w));
      const dest=(s.type==='City'||s.type==='Capital')?capital:(candidates[0]||capital);
      const a=Math.min(s.id,dest.id),b=Math.max(s.id,dest.id),key=a+'-'+b;if(a===b||seen.has(key))continue;seen.add(key);
      const points=[];let dx=dest.x-s.x;if(Math.abs(dx)>w/2)dx+=dx>0?-w:w;const dy=dest.y-s.y,steps=Math.max(5,Math.ceil(Math.hypot(dx,dy)));
      for(let q=0;q<=steps;q++){const t=q/steps;points.push({x:(s.x+dx*t+w)%w,y:s.y+dy*t})}
      roads.push({id:roads.length,from:s.id,to:dest.id,kingdomId:k.id,points})
    }
  }
  return roads;
}
function summarize(world){
  const total=world.settings.width*world.settings.height,land=world.layers.elevation.reduce((a,e)=>a+(e>=world.settings.seaLevel?1:0),0),counts={};
  world.layers.biome.forEach(b=>{counts[b]=(counts[b]||0)+1});
  const landBiomes=Object.entries(counts).filter(([b])=>!['ocean','deepOcean'].includes(b)).sort((a,b)=>b[1]-a[1]);
  const pop=world.settlements.reduce((a,s)=>a+s.population,0);
  return{landTiles:land,landPercent:land/total*100,riverCount:world.rivers.length,settlementCount:world.settlements.length,kingdomCount:world.kingdoms.length,foundingPopulation:pop,biomes:counts,dominantBiome:landBiomes[0]?.[0]||'ocean'}
}
function generateWorld(options={}){
  const settings={
    seed:String(options.seed||'EMBER-CROWN-01'),
    width:clamp(Math.round(Number(options.width)||160),80,260),
    height:clamp(Math.round(Number(options.height)||90),48,150),
    seaLevel:clamp(Number(options.seaLevel)||.53,.35,.72),
    age:['young','mature','ancient'].includes(options.age)?options.age:'mature',
    settlementTarget:clamp(Math.round(Number(options.settlementTarget)||45),10,120),
    kingdomTarget:clamp(Math.round(Number(options.kingdomTarget)||7),2,16)
  };
  const rng=rngFromSeed(settings.seed+'|'+settings.width+'x'+settings.height+'|'+settings.seaLevel+'|'+settings.age+'|'+settings.settlementTarget+'|'+settings.kingdomTarget);
  const world={schemaVersion:SCHEMA_VERSION,engineVersion:VERSION,createdAt:new Date().toISOString(),settings,name:worldName(settings.seed,rng),layers:null,rivers:[],settlements:[],kingdoms:[],roads:[],summary:null,epoch:{year:0,label:'Founding Age'}};
  world.layers=generateTerrain(settings,rng);
  world.rivers=generateRivers(world,rng);
  world.settlements=generateSettlements(world,settings.settlementTarget,rng);
  const pol=generateKingdoms(world,Math.min(settings.kingdomTarget,Math.max(2,world.settlements.length)),rng);
  world.kingdoms=pol.kingdoms;world.layers.political=pol.political;
  world.roads=generateRoads(world);
  world.summary=summarize(world);
  return world;
}
function serialize(world){
  const copy={...world,layers:{
    elevation:Array.from(world.layers.elevation),
    temperature:Array.from(world.layers.temperature),
    moisture:Array.from(world.layers.moisture),
    biome:[...world.layers.biome],
    resources:Array.from(world.layers.resources),
    political:Array.from(world.layers.political)
  }};
  return JSON.stringify(copy);
}
function deserialize(text){
  const w=typeof text==='string'?JSON.parse(text):text;
  if(!w||w.schemaVersion!==SCHEMA_VERSION)throw new Error(`Unsupported WorldForge schema: ${w?.schemaVersion}`);
  const len=w.settings.width*w.settings.height;
  for(const key of['elevation','temperature','moisture','biome','resources','political'])if(!w.layers||w.layers[key]?.length!==len)throw new Error(`Invalid world layer: ${key}`);
  w.layers.elevation=Float32Array.from(w.layers.elevation);w.layers.temperature=Float32Array.from(w.layers.temperature);w.layers.moisture=Float32Array.from(w.layers.moisture);w.layers.resources=Uint8Array.from(w.layers.resources);w.layers.political=Int16Array.from(w.layers.political);
  w.summary=summarize(w);return w
}
function fingerprint(world){
  const s=world.summary,k=world.kingdoms.map(x=>`${x.shortName}:${x.areaTiles}:${x.capitalId}`).join('|'),p=world.settlements.slice(0,8).map(x=>`${x.name}:${x.x},${x.y}`).join('|');
  return xmur3(`${world.name}|${s.landTiles}|${s.riverCount}|${s.settlementCount}|${k}|${p}`)().toString(16).padStart(8,'0')
}
function validateWorld(world){
  const errors=[],w=world?.settings?.width,h=world?.settings?.height,len=w*h;
  if(!world||world.schemaVersion!==SCHEMA_VERSION)errors.push('schema version');
  if(!Number.isFinite(w)||!Number.isFinite(h)||w<1||h<1)errors.push('dimensions');
  for(const k of['elevation','temperature','moisture','biome','resources','political'])if(world?.layers?.[k]?.length!==len)errors.push(`layer:${k}`);
  if(!world?.settlements?.length)errors.push('settlements');
  if(!world?.kingdoms?.length)errors.push('kingdoms');
  if(world?.settlements?.some(s=>s.kingdomId==null))errors.push('unowned settlement');
  if(world?.kingdoms?.some(k=>!world.settlements[k.capitalId]?.capital))errors.push('capital link');
  if(world?.roads?.some(r=>!world.settlements[r.from]||!world.settlements[r.to]))errors.push('road link');
  return errors
}
return{VERSION,SCHEMA_VERSION,BIOMES,generateWorld,serialize,deserialize,fingerprint,validateWorld,siteScore,rngFromSeed};
});