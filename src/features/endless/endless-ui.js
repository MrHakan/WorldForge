(() => {
'use strict';
const X=window.WorldForgeEndless,S=window.WorldForgeSociety;
if(!X||!S||!window.WorldRenderer)return;
const $=s=>document.querySelector(s),fmt=(n,d=0)=>Number(n||0).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d});
const ui={world:null,viewYear:null,running:false,jobId:0};
const baseSim=S.simulateYears.bind(S),baseTo=S.simulateTo?.bind(S);X.setBaseSimulator(baseSim);S.simulateYears=function(world,years,options){X.simulateYears(world,years,options);return world.society};S.simulateTo=function(world,target,options){X.simulateTo(world,target,options);return world.society};S.__worldforgeV09BaseSimulate=baseSim;S.__worldforgeV09BaseTo=baseTo;
function install(){window.WorldForgeReleaseInfo?.apply();const v=$('.version-pill');if(v)window.WorldForgeReleaseInfo?.apply();const f=document.querySelector('footer span');if(f)window.WorldForgeReleaseInfo?.apply();const sim=$('#simState');if(sim)sim.textContent='ENDLESS EMERGENT SIMULATION READY';const arch=$('.architecture-panel');if(arch){arch.querySelector('h2').textContent='v0.9 Endless Simulation State Contract';arch.querySelector('.status-ready').textContent='ENDLESS CORE READY';arch.querySelector('.architecture-grid').innerHTML='<div><b>Absolute World Clock</b><span>No 5,000-year ceiling · epoch rebasing keeps legacy engines inside stable numeric ranges</span></div><div><b>Bounded History</b><span>Recent detail · tiered snapshots · ancient checkpoints · era summaries</span></div><div><b>Entity Lifecycle</b><span>Old people · houses · gangs · sites · quests · organizations compact into archival skeletons</span></div><div><b>Deterministic Epochs</b><span>Each epoch gets a unique seeded random stream while the public world seed remains unchanged</span></div>';arch.querySelector('.help').textContent='The simulation can continue for practical browser-scale time horizons without linear growth of detailed history. v1.0 will integrate culture, factions and archive-era records into the final encyclopedia and release UI.'}
 const marker=$('.history-charts-panel');if(marker&&!$('#endlessPanel'))marker.insertAdjacentHTML('beforebegin',`<section id="endlessPanel" class="panel endless-panel"><div class="panel-head"><div><span class="eyebrow">ENDLESS WORLD KERNEL</span><h2>Long-Run Simulation & Memory Budget</h2></div><span id="endlessState" class="status-ready">READY</span></div><div class="endless-kpis"><div><span>ABSOLUTE YEAR</span><b id="endlessYear">0</b></div><div><span>LOCAL EPOCH YEAR</span><b id="endlessLocal">0</b></div><div><span>EPOCH OFFSET</span><b id="endlessOffset">0</b></div><div><span>REBASES</span><b id="endlessRebases">0</b></div><div><span>LIVE EVENTS</span><b id="endlessEvents">0</b></div><div><span>ARCHIVED EVENTS</span><b id="endlessArchivedEvents">0</b></div><div><span>SNAPSHOTS</span><b id="endlessSnapshots">0</b></div><div><span>ARCHIVED PEOPLE</span><b id="endlessArchivedPeople">0</b></div><div><span>ERA ARCHIVES</span><b id="endlessEras">0</b></div></div><div class="endless-actions"><button data-endless-years="500">+500 years</button><button data-endless-years="1000">+1,000</button><button data-endless-years="10000" class="primary">+10,000 async</button><button id="endlessCancel" disabled>Cancel</button></div><div class="endless-progress"><div><span id="endlessProgressLabel">Recent history remains detailed; ancient history is progressively summarized.</span><b id="endlessProgressPct">IDLE</b></div><i><b id="endlessProgressBar" style="width:0%"></b></i></div><div class="retention-grid"><div><b>Recent replay</b><span>~500 absolute years at normal detail</span></div><div><b>Middle history</b><span>Tiered 25-year checkpoints</span></div><div><b>Ancient history</b><span>100–5,000 year archive sampling + era summaries</span></div><div><b>Simulation clock</b><span>Absolute years survive internal epoch rebases</span></div></div></section>`);
 const target=$('#targetYearInput');if(target){target.removeAttribute('max');target.setAttribute('min','1');target.setAttribute('step','100');target.title='Absolute world year — no fixed simulation cap';}
 document.querySelectorAll('[data-endless-years]').forEach(b=>b.addEventListener('click',()=>runAsync(Number(b.dataset.endlessYears))));$('#endlessCancel')?.addEventListener('click',()=>{if(ui.world)X.cancel(ui.world)});
 $('#runTargetBtn')?.addEventListener('click',e=>{if(!ui.world)return;e.preventDefault();e.stopImmediatePropagation();const target=Math.floor(Number($('#targetYearInput').value)||0),now=X.absoluteYear(ui.world);if(target<=now){setProgress(`Target must be later than Year ${fmt(now)}.`,0,'INVALID');return}runToAsync(target)},true)
}
function setProgress(text,pct=0,state='RUNNING'){const l=$('#endlessProgressLabel'),p=$('#endlessProgressPct'),bar=$('#endlessProgressBar'),s=$('#endlessState');if(l)l.textContent=text;if(p)p.textContent=state;if(bar)bar.style.width=`${Math.max(0,Math.min(100,pct))}%`;if(s)s.textContent=state}
function refreshYearLabels(){if(!ui.world)return;const e=ui.world.endless,offset=e?.epochOffset||0,abs=X.absoluteYear(ui.world),local=ui.world.history.currentYear,hist=ui.viewYear==null?abs:offset+ui.viewYear;const pairs=[['#currentYear',`YEAR ${fmt(hist)}`],['#timelineYear',`Year ${fmt(hist)}`],['#endlessYear',fmt(abs)],['#endlessLocal',fmt(local)],['#endlessOffset',fmt(offset)]];for(const [sel,text] of pairs){const el=$(sel);if(el)el.textContent=text}for(const sel of['#societyYearBadge','#adventureYear','#storyYear','#wikiYear','#cultureYear','#factionYear']){const el=$(sel);if(el)el.textContent=`YEAR ${fmt(hist)}`}const timeline=$('#timelineSlider');if(timeline){const cap=Math.max(0,local);timeline.max=cap;timeline.min=0}const captions=document.querySelectorAll('.timeline-caption span');if(captions.length>=2){captions[0].textContent=`Year ${fmt(offset)}`;captions[captions.length-1].textContent=`Year ${fmt(abs)}`}}
function render(){if(!ui.world||!$('#endlessPanel'))return;const m=X.memoryStats(ui.world);$('#endlessYear').textContent=fmt(m.absoluteYear);$('#endlessLocal').textContent=fmt(m.localYear);$('#endlessOffset').textContent=fmt(m.epochOffset);$('#endlessRebases').textContent=fmt(m.rebases);$('#endlessEvents').textContent=fmt(m.events);$('#endlessArchivedEvents').textContent=fmt(m.archivedEvents);$('#endlessSnapshots').textContent=fmt(m.snapshots);$('#endlessArchivedPeople').textContent=fmt(m.peopleArchived);$('#endlessEras').textContent=fmt(m.eraArchives);refreshYearLabels()}
function lock(on,autoplay=false){
  ui.running=on;
  document.querySelectorAll('[data-endless-years],.history-action').forEach(b=>b.disabled=on);const play=$('#playBtn');if(play)play.disabled=on&&!autoplay;
  document.querySelectorAll('#endlessCancel,#cancelSimBtn').forEach(b=>b.disabled=!on);
}
async function runAsync(years,{autoplay=false}={}){
  if(!ui.world||ui.running||X.isRunning(ui.world))return;
  if(window.WorldForgeLoader&&!window.WorldForgeLoader.ready){setProgress('Loading simulation systems…',0,'LOADING');return}
  const world=ui.world,id=++ui.jobId,current=()=>ui.world===world&&ui.jobId===id;
  lock(true,autoplay);window.dispatchEvent(new CustomEvent('worldforge:simulation-start',{detail:{autoplay}}));
  setProgress(autoplay?'Automatic simulation running…':'Simulating '+fmt(years)+' years…',0,'RUNNING');
  let lastRender=0;
  try{
    const result=await X.simulateYearsAsync(world,years,{batchSize:1,pauseEveryYears:autoplay?5:0,pauseMs:650,onProgress:p=>{
      if(!current())return;
      const pct=p.total?100*p.done/p.total:100;
      setProgress('Year '+fmt(p.absoluteYear)+(autoplay?' · automatic 5-year steps':' · '+fmt(p.done)+' / '+fmt(p.total)+' years'),autoplay?100:pct,autoplay?'LIVE':pct.toFixed(0)+'%');
      if(p.synced!==false&&Date.now()-lastRender>350){lastRender=Date.now();render();if(!window.WorldForgeRuntime||window.WorldForgeRuntime.stats.backend!=='worker')window.dispatchEvent(new CustomEvent('worldforge:state-commit',{detail:{world,progress:p}}))}
    }});
    if(current()){
      setProgress((result.cancelled?'Stopped at Year ':'Reached Year ')+fmt(result.absoluteYear)+'.',100,result.cancelled?'CANCELLED':'COMPLETE');
      render();$('#presentBtn')?.click();
    }
    return result;
  }catch(err){if(current()){console.error(err);setProgress('Simulation error: '+err.message,0,'ERROR')}}
  finally{if(current())lock(false)}
}
async function runToAsync(target){
  if(!ui.world)return;
  const now=X.absoluteYear(ui.world);
  if(!Number.isSafeInteger(target)||target<=now){setProgress('Target must be a safe integer later than Year '+fmt(now)+'.',0,'INVALID');return}
  return runAsync(target-now);
}
install();const proto=window.WorldRenderer.prototype,oldSetWorld=proto.setWorld,oldSetHistoryView=proto.setHistoryView;proto.setWorld=function(world){if(ui.world!==world){if(ui.world)X.cancel(ui.world);ui.jobId++;lock(false);setProgress('Ready to simulate.',0,'READY')}ui.world=world;X.initialize(world);const r=oldSetWorld.call(this,world);ui.viewYear=null;render();return r};proto.setHistoryView=function(v){const r=oldSetHistoryView.call(this,v);if(this.world){ui.world=this.world;ui.viewYear=v?.isPresent?null:(v?.year??null);render()}return r};window.WorldForgeEndlessUI={version:'0.9.0',render,runAsync,runToAsync,state:ui};
})();

// Both compatibility bootstraps share the same in-flight script promises.
(async()=>{
  if(typeof document==='undefined')return;
  try{
    const loader=window.WorldForgeLoader;
    loader.style('src/features/creator/creator-suite.css');
    await loader.script('src/features/creator/creator-suite-engine.js',()=>window.WorldForgeCreatorSuite);
    await loader.script('src/features/creator/creator-suite-ui.js',()=>window.WorldForgeCreatorUI);
    const current=window.WorldForgeExtensions?.state?.world||window.WorldForgeEndlessUI?.state?.world;
    if(current){window.WorldForgeCreatorUI.state.world=current;window.WorldForgeCreatorSuite.initialize(current);window.WorldForgeCreatorSuite.starterPack(current);window.WorldForgeCreatorUI.render()}
  }catch(error){console.error('Creator Toolkit bootstrap failed',error)}
})();

