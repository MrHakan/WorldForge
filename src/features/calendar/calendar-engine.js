(function(root,factory){
  const api=factory(root&&root.WorldForgeHistory);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeCalendar=api;
})(typeof window!=='undefined'?window:globalThis,function(History){
'use strict';

const VERSION='1.5.0';
const SCHEMA=1;
const MONTH_NAMES=['Firstdawn','Thawrise','Rainmoot','Greenwake','Highsun','Goldtide','Embercrest','Harvestwane','Redleaf','Mistfall','Frostcall','Longnight'];
const WEEKDAYS=['Moonday','Tideday','Wyrmday','Kingsday','Hearthday','Starday','Sunsday'];
const BIOME_YIELD={grassland:1.08,forest:1.02,temperateForest:1.02,savanna:.95,rainforest:.9,desert:.42,tundra:.5,taiga:.72,swamp:.76,shrubland:.85,alpine:.48};
let baseSimulator=null;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=3)=>Number(Number(v).toFixed(d));

function hash(text){
  let h=2166136261>>>0;
  for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
  return h>>>0;
}
function rng(seed){
  let x=hash(seed);
  return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
}
function seedOf(world){return world.endless?.baseSeed||String(world.settings?.seed||'WORLD').split('|EPOCH:')[0]}
function keyedRng(world,year,salt){return rng(`${seedOf(world)}|CALENDAR|${year}|${salt}`)}
function absoluteYear(world){return(world.endless?.epochOffset||0)+(world.history?.currentYear||0)}
function setBaseSimulator(fn){if(typeof fn==='function')baseSimulator=fn;return api}

function makeCalendar(){
  return{
    daysPerYear:365,
    epoch:'Founding Reckoning',
    weekdays:[...WEEKDAYS],
    months:MONTH_NAMES.map((name,i)=>({
      id:i,name,days:i===11?35:30,
      northernSeason:(i<2||i===11)?'Winter':i<5?'Spring':i<8?'Summer':'Autumn',
      southernSeason:(i<2||i===11)?'Summer':i<5?'Autumn':i<8?'Winter':'Spring'
    }))
  };
}
function isWater(biome){return biome==='ocean'||biome==='deepOcean'}
function tileIndex(world,s){return s.y*world.settings.width+s.x}
function isCoastal(world,s){
  for(let y=Math.max(0,s.y-3);y<=Math.min(world.settings.height-1,s.y+3);y++){
    for(let x=Math.max(0,s.x-3);x<=Math.min(world.settings.width-1,s.x+3);x++){
      if(isWater(world.layers.biome[y*world.settings.width+x]))return true;
    }
  }
  return false;
}
function nearRiver(world,s){
  return(world.rivers||[]).some(r=>(r.points||[]).some(p=>Math.abs(p.x-s.x)<=2&&Math.abs(p.y-s.y)<=2));
}
function makeProfile(world,s){
  const i=tileIndex(world,s);
  const lat=90-(s.y/Math.max(1,world.settings.height-1))*180;
  const temp=Number(world.layers.temperature[i]||.5);
  const moisture=Number(world.layers.moisture[i]||.5);
  const elevation=Number(world.layers.elevation[i]||.5);
  const biome=world.layers.biome[i];
  const coastal=isCoastal(world,s);
  return{
    id:s.id,
    latitude:round(lat,2),
    elevation:round(elevation,3),
    biome,
    coastal,
    river:nearRiver(world,s),
    baseTempC:round(-13+temp*43-elevation*5,1),
    baseRainMm:round(180+moisture*1850+(coastal?110:0),0),
    seasonAmplitude:round(6+Math.abs(lat)/90*19+(coastal?-3:2),1),
    growingPotential:round(clamp((BIOME_YIELD[biome]||.82)*(1-Math.max(0,elevation-.72)*1.6),.2,1.2),3)
  };
}
function initialize(world){
  if(!world)throw new Error('World required');
  History?.initialize?.(world);
  if(world.calendarClimate&&world.calendarClimate.schemaVersion===SCHEMA){
    world.calendarClimate.engineVersion=VERSION;
    return world.calendarClimate;
  }
  const state={
    schemaVersion:SCHEMA,engineVersion:VERSION,calendar:makeCalendar(),
    profiles:world.settlements.map(s=>makeProfile(world,s)),current:null,
    yearSummaries:[],phenomena:[],archives:[],
    settings:{retainDetailedYears:320,maxPhenomena:420},
    stats:{years:0,droughts:0,floods:0,storms:0,harshWinters:0,heatwaves:0,goodHarvests:0,eclipses:0,comets:0,auroras:0}
  };
  world.calendarClimate=state;
  state.current=computeYear(world,absoluteYear(world),false);
  recordSummary(world,state.current,true);
  return state;
}

function climateOscillation(world,year){
  const r=keyedRng(world,year,'global');
  const temp=.7*Math.sin(year*Math.PI*2/71)+.35*Math.sin(year*Math.PI*2/19)+(r()+r()-1)*1.15;
  const rain=9*Math.sin(year*Math.PI*2/37)+(r()+r()-1)*18;
  return{temp:round(temp,3),rain:round(rain,2)};
}
function seasonalTemp(profile,month){
  const theta=((month+.5)/12)*Math.PI*2-Math.PI/2;
  const hemisphere=profile.latitude>=0?1:-1;
  return profile.baseTempC+Math.sin(theta)*profile.seasonAmplitude*hemisphere;
}
function daylightHours(latitude,month){
  const decl=-23.44*Math.cos(2*Math.PI*(month+.5)/12);
  const phi=latitude*Math.PI/180;
  const dec=decl*Math.PI/180;
  const x=clamp(-Math.tan(phi)*Math.tan(dec),-1,1);
  return clamp(24*Math.acos(x)/Math.PI,0,24);
}
function monthlyWeather(world,sid,year,month){
  const state=initialize(world);
  const p=state.profiles[sid];
  const r=keyedRng(world,year,`month:${sid}:${month}`);
  const osc=climateOscillation(world,year);
  const temp=seasonalTemp(p,month)+(r()+r()+r()-1.5)*3.2+osc.temp;
  const wetSeason=.82+Math.sin(month/12*Math.PI*2+(p.latitude>=0?0:Math.PI))*.2;
  const rain=Math.max(2,(p.baseRainMm/12)*wetSeason*(.55+r()*.95)*(1+osc.rain*.01));
  let condition='Fair';
  if(temp<-8)condition=rain>55?'Snowstorm':'Hard frost';
  else if(temp<1)condition=rain>65?'Snow':'Cold';
  else if(rain>180)condition='Torrential rain';
  else if(rain>105)condition=(p.coastal&&r()>.68)?'Coastal storm':'Heavy rain';
  else if(rain<22&&temp>25)condition='Dry heat';
  else if(temp>34)condition='Heatwave';
  else if(rain>65)condition='Rain';
  else if(r()>.78)condition='Cloudy';
  const season=p.latitude>=0?state.calendar.months[month].northernSeason:state.calendar.months[month].southernSeason;
  return{month,monthName:state.calendar.months[month].name,season,tempC:round(temp,1),rainMm:round(rain,0),condition,daylightHours:round(daylightHours(p.latitude,month),1)};
}
function celestial(world,year){
  const r=keyedRng(world,year,'sky');
  const events=[];
  if(r()<.065){const m=Math.floor(r()*12);events.push({type:'eclipse',month:m,day:1+Math.floor(r()*28),title:'Solar eclipse',importance:2,text:`A solar eclipse crosses part of the known world during ${MONTH_NAMES[m]}.`})}
  if(r()<.022){const m=Math.floor(r()*12);events.push({type:'comet',month:m,day:4+Math.floor(r()*22),title:'Great comet',importance:3,text:'A bright comet remains visible for several nights.'})}
  if(r()<.13)events.push({type:'aurora',month:r()<.5?0:11,day:8+Math.floor(r()*17),title:'Great aurora',importance:1,text:'Unusually strong auroral lights are reported at high latitudes.'});
  return{events,majorMoon:'Silver Moon',synodicDays:29.53};
}
function computeSettlementYear(world,p,year,osc){
  const r=keyedRng(world,year,`settlement:${p.id}`);
  const annualTemp=p.baseTempC+osc.temp+(r()+r()-1)*1.4;
  const annualRain=Math.max(40,p.baseRainMm*(1+osc.rain/100+(r()+r()-1)*.18));
  const summer=annualTemp+p.seasonAmplitude*.62;
  const winter=annualTemp-p.seasonAmplitude*.62;
  const riverBonus=p.river?.18:0;
  const coastalBonus=p.coastal?.18:0;
  const rainStormBonus=annualRain>p.baseRainMm*1.25?.2:0;
  const randomStormBonus=r()>.88?.22:0;
  const hardWinterBonus=r()>.92?.18:0;
  const drought=clamp((p.baseRainMm*.72-annualRain)/Math.max(150,p.baseRainMm*.65)+(summer>31?(summer-31)/18:0),0,1);
  const flood=clamp((annualRain-p.baseRainMm*1.32)/Math.max(180,p.baseRainMm*.55)+riverBonus,0,1);
  const storm=clamp(coastalBonus+rainStormBonus+randomStormBonus,0,1);
  const winterSeverity=clamp((-winter-2)/25+hardWinterBonus,0,1);
  const heat=clamp((summer-31)/18,0,1);
  const tempSuit=clamp(1-Math.abs(annualTemp-13)/25,.15,1);
  const rainSuit=clamp(1-Math.abs(Math.log(Math.max(80,annualRain)/760))*.48,.15,1.08);
  const crop=clamp(p.growingPotential*tempSuit*rainSuit*(1-drought*.55-flood*.28-storm*.12-winterSeverity*.12),.12,1.35);
  const foodStress=clamp((.78-crop)/.72,0,1);
  return{id:p.id,tempC:round(annualTemp,1),rainMm:round(annualRain,0),drought:round(drought),flood:round(flood),storm:round(storm),winterSeverity:round(winterSeverity),heat:round(heat),cropYield:round(crop),foodStress:round(foodStress)};
}
function computeYear(world,year,withEvents=true){
  const state=world.calendarClimate||initialize(world);
  const osc=climateOscillation(world,year);
  const settlement=state.profiles.map(p=>computeSettlementYear(world,p,year,osc));
  const sky=celestial(world,year);
  const mean=key=>settlement.reduce((sum,x)=>sum+Number(x[key]||0),0)/Math.max(1,settlement.length);
  const out={absoluteYear:year,globalTempAnomaly:osc.temp,globalRainAnomaly:osc.rain,meanCropYield:round(mean('cropYield')),meanFoodStress:round(mean('foodStress')),extremeCount:settlement.filter(x=>Math.max(x.drought,x.flood,x.storm,x.winterSeverity,x.heat)>.62).length,settlement,celestial:sky};
  if(withEvents)emitEvents(world,out);
  return out;
}
function pushHistory(world,event){
  const h=History.initialize(world);
  h.events.push({id:h.events.length,year:h.currentYear,absoluteYear:absoluteYear(world),...event});
}
function emitEvents(world,yearState){
  const state=world.calendarClimate;
  const candidates=[];
  for(const x of yearState.settlement){
    const s=world.settlements[x.id];
    const rid=world.history.current.settlementKingdomIds[x.id];
    if(x.drought>.76)candidates.push({sev:x.drought,type:'drought',title:`Drought grips ${s.name}`,text:`Rainfall failure cuts the harvest around ${s.name}.`,sid:x.id,rid,stat:'droughts'});
    if(x.flood>.78)candidates.push({sev:x.flood,type:'flood',title:`Floods strike ${s.name}`,text:`Rivers and saturated ground inundate fields around ${s.name}.`,sid:x.id,rid,stat:'floods'});
    if(x.storm>.82)candidates.push({sev:x.storm,type:'great_storm',title:`Great storm at ${s.name}`,text:'Severe weather disrupts roads, markets and local harvests.',sid:x.id,rid,stat:'storms'});
    if(x.winterSeverity>.78)candidates.push({sev:x.winterSeverity,type:'harsh_winter',title:`The hard winter of ${s.name}`,text:'Cold and frost damage stores and winter crops.',sid:x.id,rid,stat:'harshWinters'});
    if(x.heat>.8)candidates.push({sev:x.heat,type:'heatwave',title:`Heatwave in ${s.name}`,text:'Extreme summer heat strains wells, livestock and crops.',sid:x.id,rid,stat:'heatwaves'});
    if(x.cropYield>1.22)candidates.push({sev:x.cropYield-1,type:'good_harvest',title:`Bountiful harvest at ${s.name}`,text:'Favorable weather produces an exceptional harvest.',sid:x.id,rid,stat:'goodHarvests'});
  }
  candidates.sort((a,b)=>b.sev-a.sev);
  const cap=Math.min(5,1+Math.floor(candidates.length/10));
  for(const e of candidates.slice(0,cap)){
    state.stats[e.stat]++;
    const importance=e.sev>.9?2:1;
    pushHistory(world,{type:e.type,importance,settlementIds:[e.sid],realmIds:[e.rid],title:e.title,text:e.text});
    state.phenomena.push({year:yearState.absoluteYear,type:e.type,title:e.title,settlementId:e.sid,severity:round(e.sev),importance});
  }
  for(const e of yearState.celestial.events){
    if(e.type==='eclipse')state.stats.eclipses++;
    if(e.type==='comet')state.stats.comets++;
    if(e.type==='aurora')state.stats.auroras++;
    pushHistory(world,{type:e.type,importance:e.importance,title:e.title,text:e.text});
    state.phenomena.push({year:yearState.absoluteYear,type:e.type,title:e.title,settlementId:null,severity:e.importance/3,importance:e.importance});
  }
  state.phenomena=state.phenomena.slice(-state.settings.maxPhenomena);
}
function applyFeedback(world,yearState){
  const h=History.initialize(world);
  const realmShock=new Map();
  for(const x of yearState.settlement){
    const sid=x.id;
    const old=h.current.settlementProsperity[sid]??.5;
    const delta=clamp((x.cropYield-1)*.048,-.035,.018);
    h.current.settlementProsperity[sid]=round(clamp(old+delta,.05,.98),4);
    if(x.foodStress>.58){
      const loss=clamp((x.foodStress-.58)*.014,0,.0075);
      h.current.settlementPopulation[sid]=Math.max(20,Math.round(h.current.settlementPopulation[sid]*(1-loss)));
    }
    const rid=h.current.settlementKingdomIds[sid];
    realmShock.set(rid,(realmShock.get(rid)||0)+(x.foodStress-.25));
    const city=world.cities?.cities?.[sid];
    if(city){
      city.prosperity=round(clamp((city.prosperity??old)+delta*.7,.05,.98),4);
      city.priceIndex=round(clamp((city.priceIndex||100)+(x.foodStress-.2)*4-(x.cropYield-1)*2,45,260),2);
      city.unemployment=round(clamp((city.unemployment||.08)+Math.max(0,x.foodStress-.5)*.004,0,.6),4);
      city.crimeRate=round(clamp((city.crimeRate||0)+Math.max(0,x.foodStress-.65)*.7,0,100),2);
    }
  }
  for(const [rid,raw] of realmShock){
    const realm=h.current.realmState[rid];
    if(!realm)continue;
    const count=h.current.settlementKingdomIds.filter(x=>x===rid).length||1;
    const stress=raw/count;
    realm.stability=round(clamp((realm.stability??50)-Math.max(0,stress)*.7+Math.max(0,-stress)*.18,0,100),2);
  }
  const tradeFactor=clamp(1-yearState.meanFoodStress*.035-yearState.extremeCount/Math.max(1,world.settlements.length)*.025,.91,1.01);
  h.current.tradeVolumes=h.current.tradeVolumes.map(v=>round(Number(v||0)*tradeFactor,2));
  if(yearState.celestial.events.some(e=>e.type==='eclipse'||e.type==='comet')&&world.culture?.religions){
    for(const religion of world.culture.religions.filter(x=>x.active!==false))religion.fervor=round(clamp((religion.fervor||50)+.35,0,100),1);
  }
}
function recordSummary(world,yearState,force=false){
  const state=world.calendarClimate;
  if(!force&&state.yearSummaries.at(-1)?.absoluteYear===yearState.absoluteYear)return;
  state.yearSummaries.push({absoluteYear:yearState.absoluteYear,globalTempAnomaly:yearState.globalTempAnomaly,globalRainAnomaly:yearState.globalRainAnomaly,meanCropYield:yearState.meanCropYield,meanFoodStress:yearState.meanFoodStress,extremeCount:yearState.extremeCount,celestial:yearState.celestial.events.map(e=>e.type)});
  compact(world);
}
function compact(world){
  const state=world.calendarClimate;
  const now=state.current?.absoluteYear??absoluteYear(world);
  const cut=now-state.settings.retainDetailedYears;
  if(state.yearSummaries.length<=state.settings.retainDetailedYears+80)return;
  const old=state.yearSummaries.filter(x=>x.absoluteYear<cut);
  state.yearSummaries=state.yearSummaries.filter(x=>x.absoluteYear>=cut);
  for(const x of old){
    const start=Math.floor(x.absoluteYear/250)*250;
    let a=state.archives.find(z=>z.startYear===start);
    if(!a){a={startYear:start,endYear:start+249,years:0,tempSum:0,rainSum:0,cropSum:0,stressSum:0,extremes:0,celestial:0};state.archives.push(a)}
    a.years++;a.tempSum+=x.globalTempAnomaly;a.rainSum+=x.globalRainAnomaly;a.cropSum+=x.meanCropYield;a.stressSum+=x.meanFoodStress;a.extremes+=x.extremeCount;a.celestial+=x.celestial.length;
  }
  state.archives.sort((a,b)=>a.startYear-b.startYear);
  if(state.archives.length>220)state.archives=state.archives.slice(-220);
}
function simulateClimateYear(world){
  const state=initialize(world);
  const y=computeYear(world,absoluteYear(world),true);
  state.current=y;
  state.stats.years++;
  applyFeedback(world,y);
  recordSummary(world,y);
  return y;
}
function simulateYears(world,years,options={}){
  initialize(world);
  const n=Math.max(0,Math.floor(Number(years)||0));
  if(!baseSimulator)throw new Error('Calendar base simulator unavailable');
  for(let i=0;i<n;i++){baseSimulator(world,1,options);simulateClimateYear(world)}
  return world.calendarClimate;
}
function simulateTo(world,target,options={}){
  const t=Math.floor(Number(target)||0),now=absoluteYear(world);
  if(t<now)throw new Error('Calendar simulation cannot run backward');
  return simulateYears(world,t-now,options);
}
function almanac(world,sid,year=absoluteYear(world)){
  initialize(world);
  sid=clamp(Math.floor(Number(sid)||0),0,world.settlements.length-1);
  return{year,settlement:world.settlements[sid],profile:world.calendarClimate.profiles[sid],months:Array.from({length:12},(_,m)=>monthlyWeather(world,sid,year,m)),celestial:celestial(world,year)};
}
function dateInfo(world,sid,year,month,day){
  const a=almanac(world,sid,year);
  const m=clamp(Math.floor(month),0,11);
  const d=clamp(Math.floor(day),1,m===11?35:30);
  const ordinal=m*30+d;
  const moonAge=((year*365+ordinal)%29.53+29.53)%29.53;
  const phase=moonAge<1.85?'New Moon':moonAge<7.38?'Waxing Crescent':moonAge<9.23?'First Quarter':moonAge<14.77?'Waxing Gibbous':moonAge<16.61?'Full Moon':moonAge<22.15?'Waning Gibbous':moonAge<23.99?'Last Quarter':'Waning Crescent';
  return{...a.months[m],day:d,ordinal,weekday:WEEKDAYS[(year*365+ordinal)%7],moonPhase:phase,moonIllumination:round((1-Math.cos(2*Math.PI*moonAge/29.53))/2,2),events:a.celestial.events.filter(e=>e.month===m&&Math.abs(e.day-d)<=2)};
}
function summary(world){const state=initialize(world),y=state.current;return{year:y.absoluteYear,tempAnomaly:y.globalTempAnomaly,rainAnomaly:y.globalRainAnomaly,cropYield:y.meanCropYield,foodStress:y.meanFoodStress,extremes:y.extremeCount,phenomena:state.phenomena.length,archives:state.archives.length,stats:{...state.stats}}}
function fingerprint(world){const state=initialize(world),s=summary(world),text=`${s.year}|${s.tempAnomaly}|${s.rainAnomaly}|${s.cropYield}|${s.foodStress}|${state.stats.droughts}|${state.stats.floods}|${state.stats.eclipses}|${state.yearSummaries.slice(-12).map(x=>`${x.absoluteYear}:${x.meanCropYield}`).join(',')}`;return hash(text).toString(16).padStart(8,'0')}
function validate(world){const state=world.calendarClimate,errors=[];if(!state||state.schemaVersion!==SCHEMA)return['calendar climate schema'];if(state.profiles.length!==world.settlements.length)errors.push('climate profiles');if(state.current?.settlement?.length!==world.settlements.length)errors.push('current climate settlements');if(!state.calendar||state.calendar.months.length!==12||state.calendar.daysPerYear!==365)errors.push('calendar structure');if(state.yearSummaries.some((x,i,a)=>i&&x.absoluteYear<=a[i-1].absoluteYear))errors.push('climate chronology');return errors}

const api={VERSION,SCHEMA,MONTH_NAMES,WEEKDAYS,initialize,setBaseSimulator,absoluteYear,monthlyWeather,almanac,dateInfo,summary,fingerprint,validate,simulateYears,simulateTo,computeYear,climateOscillation};
return api;
});