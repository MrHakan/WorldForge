(function(root,factory){
  const api=factory(root&&root.WorldForgeEngine);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeHistory=api;
})(typeof window!=='undefined'?window:globalThis,function(Core){
'use strict';

const VERSION='0.2.0';
const HISTORY_SCHEMA=1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=3)=>Number(Number(v).toFixed(d));
const pairKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
const EXTRA_COLORS=['#cf7c4f','#4d9f91','#b46e9d','#8a9dcc','#a7a84f','#d06f72','#6baf78','#9c7dc4'];

function fallbackRng(seed){
  let h=2166136261>>>0;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
  return function(){h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
}
function rngFor(world,year,salt=''){return (Core?.rngFromSeed||fallbackRng)(`${world.settings.seed}|HISTORY|${year}|${salt}`)}
function realmMetaFromWorld(world){return world.kingdoms.map(k=>({id:k.id,name:k.name,shortName:k.shortName,color:k.color,capitalId:k.capitalId,formedYear:0,collapsedYear:null,parentId:null}))}
function relationGet(h,a,b){if(a===b)return 100;return Number(h.current.relations[pairKey(a,b)]??0)}
function relationSet(h,a,b,v){if(a===b)return;h.current.relations[pairKey(a,b)]=clamp(round(v,1),-100,100)}
function activeRealmIds(h){return h.current.realmState.filter(Boolean).filter(r=>r.active).map(r=>r.id)}
function realmSettlements(h,id){const out=[];for(let i=0;i<h.current.settlementKingdomIds.length;i++)if(h.current.settlementKingdomIds[i]===id)out.push(i);return out}
function realmPopulation(h,id){let p=0;for(let i=0;i<h.current.settlementPopulation.length;i++)if(h.current.settlementKingdomIds[i]===id)p+=h.current.settlementPopulation[i];return p}
function activeWarBetween(h,a,b){return h.current.activeWarIds.map(id=>h.wars[id]).find(w=>w&&w.endYear==null&&pairKey(w.attackerId,w.defenderId)===pairKey(a,b))||null}
function isAtWar(h,id){return h.current.activeWarIds.some(wid=>{const w=h.wars[wid];return w&&w.endYear==null&&(w.attackerId===id||w.defenderId===id)})}
function pushEvent(h,e){h.events.push({id:h.events.length,year:h.currentYear,...e})}
function rleEncode(values){const out=[];if(!values?.length)return out;let last=values[0],count=1;for(let i=1;i<values.length;i++){if(values[i]===last)count++;else{out.push(last,count);last=values[i];count=1}}out.push(last,count);return out}
function rleDecode(data,len){const out=new Int16Array(len);let p=0;for(let i=0;i<data.length;i+=2){const value=data[i],count=data[i+1];out.fill(value,p,Math.min(len,p+count));p+=count}if(p!==len)throw new Error('Invalid political snapshot RLE');return out}

function initialize(world,options={}){
  if(world.history&&world.history.schemaVersion===HISTORY_SCHEMA)return world.history;
  const realms=realmMetaFromWorld(world),n=world.settlements.length;
  const settlementPopulation=world.settlements.map(s=>Math.max(1,Math.round(s.population)));
  const settlementWealth=world.settlements.map(s=>round(35+s.score*55,2));
  const settlementProsperity=world.settlements.map(s=>round(clamp(.32+s.score*.55,0,1),3));
  const settlementKingdomIds=world.settlements.map(s=>s.kingdomId);
  const realmState=realms.map(r=>({id:r.id,active:true,stability:round(58+rngFor(world,0,'stability-'+r.id)()*27,1),treasury:round(realmPopulationLike(settlementPopulation,settlementKingdomIds,r.id)*.004,1),military:round(35+rngFor(world,0,'mil-'+r.id)()*35,1),prestige:round(35+rngFor(world,0,'prestige-'+r.id)()*35,1)}));
  const relations={};
  for(let a=0;a<realms.length;a++)for(let b=a+1;b<realms.length;b++)relations[pairKey(a,b)]=round(-38+rngFor(world,0,`rel-${a}-${b}`)()*65,1);
  const history={schemaVersion:HISTORY_SCHEMA,engineVersion:VERSION,startYear:0,currentYear:0,snapshotInterval:clamp(Math.round(Number(options.snapshotInterval)||5),1,25),realms,current:{settlementPopulation,settlementWealth,settlementProsperity,settlementKingdomIds,political:Array.from(world.layers.political),realmState,relations,alliances:[],activeWarIds:[],tradeVolumes:new Array(world.roads.length).fill(0)},wars:[],events:[],snapshots:[],stats:{yearsSimulated:0,realmsFormed:0,realmsCollapsed:0,warsStarted:0,settlementsCaptured:0}};
  world.history=history;
  updateTrade(world,history);
  recomputeRealmDerived(world,history);
  pushEvent(history,{type:'founding',importance:3,title:'The Founding Age begins',text:`${world.name} enters recorded history with ${realms.length} realms and ${world.settlements.length} known settlements.`});
  takeSnapshot(world,history,true);
  return history;
}
function realmPopulationLike(pop,owners,id){let n=0;for(let i=0;i<pop.length;i++)if(owners[i]===id)n+=pop[i];return n}
function roadLength(world,road){const a=world.settlements[road.from],b=world.settlements[road.to],w=world.settings.width;let dx=Math.abs(a.x-b.x);dx=Math.min(dx,w-dx);return Math.max(1,Math.hypot(dx,a.y-b.y))}
function biomeYield(world,sid){const s=world.settlements[sid],b=world.layers.biome[s.y*world.settings.width+s.x];return ({grassland:1.12,forest:1.02,rainforest:.95,savanna:.92,wetland:.98,steppe:.86,taiga:.82,tundra:.58,desert:.52,mountain:.62,alpine:.45,ice:.25}[b]||.9)}
function resourceScore(world,sid){const s=world.settlements[sid],bits=world.layers.resources[s.y*world.settings.width+s.x]||0;return (bits&1?1:0)+(bits&2?1:0)+(bits&4?1:0)+(bits&8?1:0)}
function realmState(h,id){return h.current.realmState[id]||null}
function recomputeRealmDerived(world,h){
  for(const rs of h.current.realmState.filter(Boolean)){
    const ids=realmSettlements(h,rs.id);rs.settlementCount=ids.length;rs.population=ids.reduce((a,i)=>a+h.current.settlementPopulation[i],0);rs.meanProsperity=ids.length?ids.reduce((a,i)=>a+h.current.settlementProsperity[i],0)/ids.length:0;
    if(rs.active&&!ids.length){rs.active=false;const meta=h.realms[rs.id];if(meta&&meta.collapsedYear==null)meta.collapsedYear=h.currentYear;h.stats.realmsCollapsed++;pushEvent(h,{type:'collapse',importance:3,realmIds:[rs.id],title:`${meta?.shortName||'A realm'} collapses`,text:'Its last recorded settlement passes into foreign control.'})}
  }
}
function updateTrade(world,h){
  let total=0;
  for(let ri=0;ri<world.roads.length;ri++){
    const road=world.roads[ri],a=road.from,b=road.to,pa=h.current.settlementPopulation[a],pb=h.current.settlementPopulation[b],oa=h.current.settlementKingdomIds[a],ob=h.current.settlementKingdomIds[b];
    const rel=oa===ob?1.15:clamp(.55+(relationGet(h,oa,ob)+100)/220,.25,1.4);
    const war=oa!==ob&&activeWarBetween(h,oa,ob)?0.12:1;
    const prosperity=.55+(h.current.settlementProsperity[a]+h.current.settlementProsperity[b])*.35;
    const volume=Math.sqrt(Math.max(1,pa)*Math.max(1,pb))*prosperity*rel*war/Math.pow(roadLength(world,road),.52);
    h.current.tradeVolumes[ri]=round(volume,1);total+=volume;
  }
  h.current.tradeTotal=round(total,1);return total
}
function updateSettlements(world,h,rng){
  const pop=h.current.settlementPopulation,pros=h.current.settlementProsperity,wealth=h.current.settlementWealth,owners=h.current.settlementKingdomIds;
  const warPenalty=new Set(activeRealmIds(h).filter(id=>isAtWar(h,id)));
  for(let i=0;i<pop.length;i++){
    const s=world.settlements[i],rs=realmState(h,owners[i]),yieldFactor=biomeYield(world,i),resources=resourceScore(world,i),stability=(rs?.stability??50)/100;
    let p=pros[i];p+=((yieldFactor-.8)*.015+(resources*.006)+(stability-.5)*.018+(rng()-.5)*.018);if(warPenalty.has(owners[i]))p-=.018;p=clamp(p,.08,1.18);pros[i]=round(p,4);
    const cap=1400+Math.pow(s.score,1.6)*115000*(.72+yieldFactor*.38+resources*.07);
    const base=.016*(.55+p*.6)*(warPenalty.has(owners[i])?.62:1);
    let delta=pop[i]*base*(1-pop[i]/cap);
    if(delta<0)delta*=.35;
    pop[i]=Math.max(40,Math.round(pop[i]+delta));
    wealth[i]=round(clamp(wealth[i]*(.993+p*.008)+resources*.22+(rng()-.5)*.45,4,500),2);
  }
  for(const road of world.roads){
    const a=road.from,b=road.to,pa=pros[a],pb=pros[b],diff=pb-pa;if(Math.abs(diff)<.16)continue;const from=diff>0?a:b,to=diff>0?b:a,move=Math.min(Math.round(pop[from]*Math.min(.0025,Math.abs(diff)*.004)),Math.max(0,pop[from]-40));if(move>0){pop[from]-=move;pop[to]+=move}
  }
}
function updateEconomy(world,h,rng){
  updateTrade(world,h);
  const roadIncome=new Array(world.settlements.length).fill(0);
  world.roads.forEach((r,i)=>{const v=h.current.tradeVolumes[i]||0;roadIncome[r.from]+=v;roadIncome[r.to]+=v});
  for(let i=0;i<h.current.settlementWealth.length;i++)h.current.settlementWealth[i]=round(clamp(h.current.settlementWealth[i]+Math.log1p(roadIncome[i])*.022*h.current.settlementProsperity[i],4,500),2);
  for(const rs of h.current.realmState.filter(Boolean).filter(x=>x.active)){
    const ids=realmSettlements(h,rs.id),tax=ids.reduce((a,i)=>a+h.current.settlementWealth[i]*h.current.settlementPopulation[i]*.000012,0);rs.treasury=round(Math.max(0,rs.treasury+tax-rs.military*.055-(isAtWar(h,rs.id)?rs.military*.08:0)),1);
    if(rs.treasury>150)rs.military=round(clamp(rs.military+(rng()-.38)*1.1,10,160),1);else rs.military=round(clamp(rs.military-(.2+rng()*.35),8,160),1)
  }
}
function updateDiplomacy(world,h,rng){
  const ids=activeRealmIds(h);
  for(let ai=0;ai<ids.length;ai++)for(let bi=ai+1;bi<ids.length;bi++){
    const a=ids[ai],b=ids[bi],key=pairKey(a,b);if(activeWarBetween(h,a,b)){relationSet(h,a,b,relationGet(h,a,b)-1.5-rng()*1.7);continue}
    const allied=h.current.alliances.includes(key),tradeAffinity=tradeBetweenRealms(world,h,a,b)>0?0.35:0;
    let rel=relationGet(h,a,b)+(rng()-.5)*3.2+tradeAffinity+(allied?.45:0);rel+=rel>0?-.08:.08;if(rng()<.012){rel-=10+rng()*22;if(rel<-34)pushEvent(h,{type:'diplomacy',importance:1,realmIds:[a,b],title:`Border incident: ${realmName(h,a)} and ${realmName(h,b)}`,text:'A frontier dispute, raid or customs confrontation sharply worsens relations.'})}relationSet(h,a,b,rel);
    if(!allied&&rel>68&&rng()<.025){h.current.alliances.push(key);pushEvent(h,{type:'alliance',importance:2,realmIds:[a,b],title:'Alliance concluded',text:`${realmName(h,a)} and ${realmName(h,b)} sign a defensive compact.`})}
    if(allied&&rel<28){h.current.alliances=h.current.alliances.filter(x=>x!==key);pushEvent(h,{type:'diplomacy',importance:1,realmIds:[a,b],title:'Alliance dissolved',text:`The compact between ${realmName(h,a)} and ${realmName(h,b)} is abandoned.`})}
    const rsA=realmState(h,a),rsB=realmState(h,b);const powerRatio=(rsA?.population||1)/(rsB?.population||1);
    if(rel<-46&&rng()<.045&&powerRatio>.28&&powerRatio<3.6)startWar(h,a,b,rng)
  }
}
function tradeBetweenRealms(world,h,a,b){let v=0;world.roads.forEach((r,i)=>{const x=h.current.settlementKingdomIds[r.from],y=h.current.settlementKingdomIds[r.to];if(pairKey(x,y)===pairKey(a,b)&&x!==y)v+=h.current.tradeVolumes[i]||0});return v}
function realmName(h,id){return h.realms[id]?.shortName||`Realm ${id}`}
function startWar(h,a,b,rng){
  if(activeWarBetween(h,a,b))return null;const attacker=rng()<.5?a:b,defender=attacker===a?b:a,id=h.wars.length;const war={id,attackerId:attacker,defenderId:defender,startYear:h.currentYear,endYear:null,score:0,captures:[],cause:['border dispute','trade rivalry','dynastic claim','frontier raid','broken compact'][Math.floor(rng()*5)]};h.wars.push(war);h.current.activeWarIds.push(id);h.stats.warsStarted++;relationSet(h,a,b,-85);h.current.alliances=h.current.alliances.filter(x=>x!==pairKey(a,b));pushEvent(h,{type:'war',importance:3,realmIds:[attacker,defender],warId:id,title:`War: ${realmName(h,attacker)} vs ${realmName(h,defender)}`,text:`Hostilities begin over a ${war.cause}.`});return war
}
function realmPower(h,id){const rs=realmState(h,id);return Math.max(1,(rs?.population||1)*(.55+(rs?.meanProsperity||.4))*(.55+(rs?.stability||50)/100)*(1+(rs?.military||30)/120))}
function settlementDistance(world,a,b){const A=world.settlements[a],B=world.settlements[b],w=world.settings.width;let dx=Math.abs(A.x-B.x);dx=Math.min(dx,w-dx);return Math.hypot(dx,A.y-B.y)}
function captureSettlement(world,h,winner,loser,rng,war){
  const loserIds=realmSettlements(h,loser);if(!loserIds.length)return false;const winnerIds=realmSettlements(h,winner);if(!winnerIds.length)return false;
  const loserMeta=h.realms[loser];let candidates=loserIds.filter(id=>id!==loserMeta?.capitalId);if(!candidates.length)candidates=loserIds;
  candidates.sort((a,b)=>Math.min(...winnerIds.map(x=>settlementDistance(world,a,x)))-Math.min(...winnerIds.map(x=>settlementDistance(world,b,x))));
  const sid=candidates[Math.min(candidates.length-1,Math.floor(rng()*Math.min(3,candidates.length)))];h.current.settlementKingdomIds[sid]=winner;h.current.settlementProsperity[sid]=round(Math.max(.12,h.current.settlementProsperity[sid]-.12),3);h.current.settlementPopulation[sid]=Math.max(40,Math.round(h.current.settlementPopulation[sid]*(.91+rng()*.05)));
  const s=world.settlements[sid],radius=3.5+rng()*3,W=world.settings.width,H=world.settings.height,P=h.current.political;
  for(let y=Math.max(0,Math.floor(s.y-radius));y<=Math.min(H-1,Math.ceil(s.y+radius));y++)for(let dx=-Math.ceil(radius);dx<=Math.ceil(radius);dx++){const x=(s.x+dx+W)%W,adx=Math.min(Math.abs(x-s.x),W-Math.abs(x-s.x)),d=Math.hypot(adx,y-s.y);if(d<=radius&&P[y*W+x]===loser)P[y*W+x]=winner}
  war.captures.push({year:h.currentYear,settlementId:sid,winnerId:winner,loserId:loser});h.stats.settlementsCaptured++;pushEvent(h,{type:'conquest',importance:2,realmIds:[winner,loser],settlementIds:[sid],warId:war.id,title:`${s.name} changes hands`,text:`Forces of ${realmName(h,winner)} capture ${s.name} from ${realmName(h,loser)}.`});return true
}
function updateWars(world,h,rng){
  for(const wid of [...h.current.activeWarIds]){
    const war=h.wars[wid];if(!war||war.endYear!=null)continue;const a=war.attackerId,b=war.defenderId;if(!realmState(h,a)?.active||!realmState(h,b)?.active){endWar(h,war,'A belligerent ceased to exist.');continue}
    const ratio=realmPower(h,a)/realmPower(h,b),swing=Math.log(ratio)*.55+(rng()-.5)*1.25;war.score=round(war.score+swing,2);const dur=h.currentYear-war.startYear;
    if(dur>=2&&Math.abs(war.score)>1.25&&rng()<.55){const winner=war.score>0?a:b,loser=winner===a?b:a;if(captureSettlement(world,h,winner,loser,rng,war))war.score*=.52}
    const ar=realmState(h,a),br=realmState(h,b);ar.stability=round(clamp(ar.stability-.35-rng()*.45,0,100),1);br.stability=round(clamp(br.stability-.35-rng()*.45,0,100),1);
    if(dur>=4&&(Math.abs(war.score)>4.2||dur>15||rng()<.07))endWar(h,war,Math.abs(war.score)>3?'One side accepts a settlement after sustained losses.':'War exhaustion forces a negotiated peace.')
  }
  recomputeRealmDerived(world,h)
}
function endWar(h,war,reason){war.endYear=h.currentYear;h.current.activeWarIds=h.current.activeWarIds.filter(id=>id!==war.id);relationSet(h,war.attackerId,war.defenderId,-32);pushEvent(h,{type:'peace',importance:2,realmIds:[war.attackerId,war.defenderId],warId:war.id,title:`Peace between ${realmName(h,war.attackerId)} and ${realmName(h,war.defenderId)}`,text:reason})}
function createSplinter(world,h,parentId,rng){
  const parentIds=realmSettlements(h,parentId);if(parentIds.length<5)return null;const parentMeta=h.realms[parentId],capital=parentMeta?.capitalId;let candidates=parentIds.filter(id=>id!==capital);if(!candidates.length)return null;candidates.sort((a,b)=>h.current.settlementPopulation[b]-h.current.settlementPopulation[a]);const seed=candidates[Math.floor(rng()*Math.min(4,candidates.length))],s=world.settlements[seed],id=h.realms.length;
  const forms=['Free State','March','League','Republic','Crown'];const form=forms[Math.floor(rng()*forms.length)],shortName=s.name.replace(/\s+(Town|City)$/i,''),name=form==='Crown'?`Crown of ${shortName}`:`${shortName} ${form}`,color=EXTRA_COLORS[(id-world.kingdoms.length)%EXTRA_COLORS.length];
  h.realms.push({id,name,shortName,color,capitalId:seed,formedYear:h.currentYear,collapsedYear:null,parentId});h.current.realmState[id]={id,active:true,stability:round(52+rng()*22,1),treasury:40+rng()*60,military:28+rng()*26,prestige:22+rng()*25};
  const transfer=[seed];for(const sid of parentIds){if(sid===seed||sid===capital)continue;if(settlementDistance(world,seed,sid)<9&&rng()<.5)transfer.push(sid);if(transfer.length>=Math.max(2,Math.ceil(parentIds.length*.35)))break}for(const sid of transfer)h.current.settlementKingdomIds[sid]=id;
  const W=world.settings.width,H=world.settings.height,P=h.current.political;for(const sid of transfer){const q=world.settlements[sid],radius=4;for(let y=Math.max(0,q.y-radius);y<=Math.min(H-1,q.y+radius);y++)for(let dx=-radius;dx<=radius;dx++){const x=(q.x+dx+W)%W,d=Math.hypot(dx,y-q.y);if(d<=radius&&P[y*W+x]===parentId)P[y*W+x]=id}}
  for(const other of activeRealmIds(h))if(other!==id)relationSet(h,id,other,other===parentId?-72:-12+rng()*32);const prs=realmState(h,parentId);if(prs)prs.stability=round(clamp(prs.stability+9,0,100),1);h.stats.realmsFormed++;pushEvent(h,{type:'realm_formed',importance:3,realmIds:[id,parentId],settlementIds:transfer,title:`${name} is proclaimed`,text:`A separatist movement centered on ${s.name} breaks from ${realmName(h,parentId)}, taking ${transfer.length} settlements.`});return id
}
function updateRealmPolitics(world,h,rng){
  recomputeRealmDerived(world,h);
  for(const id of activeRealmIds(h)){
    const rs=realmState(h,id),war=isAtWar(h,id);rs.stability=round(clamp(rs.stability+(war?-0.15:.22)+(rs.meanProsperity-.55)*.8+(rng()-.5)*1.1,0,100),1);rs.prestige=round(clamp(rs.prestige+(rs.meanProsperity-.5)*.35+(war ? .08 : 0)+(rng()-.5)*.45,0,160),1);
    if(rng()<.008){rs.stability=round(clamp(rs.stability-(10+rng()*15),0,100),1);pushEvent(h,{type:'crisis',importance:2,realmIds:[id],title:`Political crisis in ${realmName(h,id)}`,text:'A disputed transfer of authority fractures the court and provincial administration.'})}
    if(rs.stability<28&&rs.settlementCount>=5&&h.realms.length<world.kingdoms.length+6&&rng()<.035)createSplinter(world,h,id,rng)
    if(rs.meanProsperity>.82&&rng()<.012)pushEvent(h,{type:'trade_boom',importance:1,realmIds:[id],title:`Prosperity rises in ${realmName(h,id)}`,text:'Strong harvests and road traffic create a notable commercial boom.'})
    if(rs.meanProsperity<.28&&rng()<.018){const ids=realmSettlements(h,id);if(ids.length){const sid=ids[Math.floor(rng()*ids.length)];h.current.settlementPopulation[sid]=Math.max(40,Math.round(h.current.settlementPopulation[sid]*(.90+rng()*.04)));h.current.settlementProsperity[sid]=Math.max(.08,h.current.settlementProsperity[sid]-.08);pushEvent(h,{type:'famine',importance:2,realmIds:[id],settlementIds:[sid],title:`Hard season at ${world.settlements[sid].name}`,text:'Crop failure and disrupted supply reduce the local population.'})}}
  }
  recomputeRealmDerived(world,h)
}
function snapshotRealmRows(h){return h.realms.map(meta=>{const rs=realmState(h,meta.id)||{id:meta.id,active:false,stability:0,treasury:0,military:0,prestige:0,population:0,settlementCount:0,meanProsperity:0};return{...meta,active:!!rs.active,stability:round(rs.stability||0,1),treasury:round(rs.treasury||0,1),military:round(rs.military||0,1),prestige:round(rs.prestige||0,1),population:Math.round(rs.population||0),settlementCount:rs.settlementCount||0,meanProsperity:round(rs.meanProsperity||0,3)}})}
function currentMetrics(h){const realms=snapshotRealmRows(h),population=h.current.settlementPopulation.reduce((a,b)=>a+b,0),pros=h.current.settlementProsperity.reduce((a,b)=>a+b,0)/Math.max(1,h.current.settlementProsperity.length);return{population:Math.round(population),trade:round(h.current.tradeTotal||0,1),activeWars:h.current.activeWarIds.length,activeRealms:realms.filter(r=>r.active).length,meanProsperity:round(pros,3),events:h.events.length}}
function takeSnapshot(world,h,force=false){
  const interval=h.snapshotInterval||5;if(!force&&h.currentYear%interval!==0)return null;const snap={year:h.currentYear,settlementPopulation:h.current.settlementPopulation.map(x=>Math.round(x)),settlementWealth:h.current.settlementWealth.map(x=>round(x,2)),settlementProsperity:h.current.settlementProsperity.map(x=>round(x,4)),settlementKingdomIds:[...h.current.settlementKingdomIds],politicalRLE:rleEncode(h.current.political),realms:snapshotRealmRows(h),relations:{...h.current.relations},alliances:[...h.current.alliances],activeWars:h.current.activeWarIds.map(id=>{const w=h.wars[id];return{id:w.id,attackerId:w.attackerId,defenderId:w.defenderId,startYear:w.startYear,score:w.score}}),tradeVolumes:h.current.tradeVolumes.map(x=>round(x,1)),metrics:currentMetrics(h),eventIndex:h.events.length};const last=h.snapshots[h.snapshots.length-1];if(last?.year===snap.year)h.snapshots[h.snapshots.length-1]=snap;else h.snapshots.push(snap);return snap
}
function simulateOneYear(world,h){
  h.currentYear+=1;const rng=rngFor(world,h.currentYear);updateSettlements(world,h,rng);updateEconomy(world,h,rng);recomputeRealmDerived(world,h);updateDiplomacy(world,h,rng);updateWars(world,h,rng);updateRealmPolitics(world,h,rng);updateTrade(world,h);recomputeRealmDerived(world,h);h.stats.yearsSimulated++;
  if(h.currentYear%25===0){const m=currentMetrics(h);pushEvent(h,{type:'era',importance:1,title:`Year ${h.currentYear} recorded`,text:`Recorded population reaches ${m.population.toLocaleString()} across ${m.activeRealms} active realms; ${m.activeWars} wars remain active.`})}
  takeSnapshot(world,h,false)
}
function simulateYears(world,years,options={}){const h=initialize(world,options),n=clamp(Math.round(Number(years)||0),0,5000),target=clamp(h.currentYear+n,0,5000);while(h.currentYear<target)simulateOneYear(world,h);takeSnapshot(world,h,true);return h}
function simulateTo(world,targetYear,options={}){const h=initialize(world,options),target=clamp(Math.round(Number(targetYear)||0),h.currentYear,5000);return simulateYears(world,target-h.currentYear,options)}
function snapshotAt(world,year){const h=initialize(world),target=clamp(Math.round(Number(year)||0),0,h.currentYear);let best=h.snapshots[0];for(const s of h.snapshots){if(s.year<=target&&s.year>=best.year)best=s}return best}
function viewFromSnapshot(world,h,s){return{year:s.year,isPresent:s.year===h.currentYear,settlementPopulation:[...s.settlementPopulation],settlementWealth:[...s.settlementWealth],settlementProsperity:[...s.settlementProsperity],settlementKingdomIds:[...s.settlementKingdomIds],political:rleDecode(s.politicalRLE,world.settings.width*world.settings.height),realms:s.realms.map(x=>({...x})),relations:{...s.relations},alliances:[...s.alliances],activeWars:s.activeWars.map(x=>({...x})),tradeVolumes:[...s.tradeVolumes],metrics:{...s.metrics},eventIndex:s.eventIndex}}
function viewAt(world,year){const h=initialize(world),s=snapshotAt(world,year);return viewFromSnapshot(world,h,s)}
function currentView(world){const h=initialize(world),s={year:h.currentYear,settlementPopulation:h.current.settlementPopulation,settlementWealth:h.current.settlementWealth,settlementProsperity:h.current.settlementProsperity,settlementKingdomIds:h.current.settlementKingdomIds,politicalRLE:rleEncode(h.current.political),realms:snapshotRealmRows(h),relations:h.current.relations,alliances:h.current.alliances,activeWars:h.current.activeWarIds.map(id=>{const w=h.wars[id];return{id:w.id,attackerId:w.attackerId,defenderId:w.defenderId,startYear:w.startYear,score:w.score}}),tradeVolumes:h.current.tradeVolumes,metrics:currentMetrics(h),eventIndex:h.events.length};return viewFromSnapshot(world,h,s)}
function metricsSeries(world){const h=initialize(world);return h.snapshots.map(s=>({year:s.year,...s.metrics}))}
function eventsThrough(world,year,limit=200){const h=initialize(world),y=clamp(Math.round(Number(year)||0),0,h.currentYear);return h.events.filter(e=>e.year<=y).slice(-Math.max(1,limit))}
function historyFingerprint(world){const h=initialize(world),m=currentMetrics(h),owners=h.current.settlementKingdomIds.slice(0,16).join(','),realms=snapshotRealmRows(h).map(r=>`${r.id}:${r.active?1:0}:${r.settlementCount}:${Math.round(r.stability)}`).join('|'),wars=h.wars.map(w=>`${w.attackerId}-${w.defenderId}:${w.startYear}-${w.endYear??'x'}:${w.captures.length}`).join('|');let x=2166136261>>>0;for(const c of `${h.currentYear}|${m.population}|${Math.round(m.trade)}|${owners}|${realms}|${wars}`){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return(x>>>0).toString(16).padStart(8,'0')}
function validateHistory(world){
  const errors=[],h=world?.history,n=world?.settlements?.length||0,len=(world?.settings?.width||0)*(world?.settings?.height||0);if(!h||h.schemaVersion!==HISTORY_SCHEMA)return['history schema'];if(h.current.settlementPopulation.length!==n)errors.push('settlement population');if(h.current.settlementProsperity.length!==n)errors.push('settlement prosperity');if(h.current.settlementKingdomIds.length!==n)errors.push('settlement ownership');if(h.current.political.length!==len)errors.push('political history layer');if(!h.snapshots.length||h.snapshots[0].year!==0)errors.push('founding snapshot');if(h.snapshots[h.snapshots.length-1]?.year!==h.currentYear)errors.push('present snapshot');for(const id of h.current.settlementKingdomIds)if(!h.realms[id]){errors.push('invalid owner');break}for(const id of h.current.activeWarIds)if(!h.wars[id]||h.wars[id].endYear!=null){errors.push('active war link');break}return errors
}

return{VERSION,HISTORY_SCHEMA,initialize,simulateYears,simulateTo,snapshotAt,viewAt,currentView,metricsSeries,eventsThrough,historyFingerprint,validateHistory,relationGet,rleEncode,rleDecode};
});