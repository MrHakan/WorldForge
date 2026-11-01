(function(root){
'use strict';
const jobs=new WeakMap();let serial=0;
const stats={backend:'idle',commits:0,operations:0,lastApplyMs:0};
function scripts(){
 return [...document.scripts].sort((a,b)=>Number(b.defer)-Number(a.defer)).map(s=>s.src).filter(Boolean).map(s=>new URL(s)).filter(u=>u.origin===location.origin&&/\/src\//.test(u.pathname)&&(
  /(?:-engine|-calibration|-wiki-adapter)\.js$/.test(u.pathname)||/\/(?:engine|history-engine|society-engine|release-integration|structure-archetypes)\.js$/.test(u.pathname)||/\/warfare\/(?!.*(?:-ui|-renderer|-overlay|-controls|strategic-map))[^/]+\.js$/.test(u.pathname)
 )).map(u=>u.href);
}
function shouldRender(selector){
 if(typeof document==='undefined')return true;if(document.hidden)return false;
 const panels=[...document.querySelectorAll(selector)],nav=root.WorldForgeWorkspaceNavigation;
 return !nav||!panels.length||panels.some(p=>nav.isVisible(p));
}
function run(world,years,options){
 if(typeof Worker==='undefined'){stats.backend='cooperative';return Promise.resolve(null)}
 return new Promise((resolve,reject)=>{
  let worker,ready=false,closed=false,cancelTimer,bootTimer,last={done:0,total:years,absoluteYear:root.WorldForgeEndless.absoluteYear(world)};
  const id=++serial;
  const finish=(value,error)=>{if(closed)return;closed=true;clearTimeout(cancelTimer);clearTimeout(bootTimer);worker?.terminate();jobs.delete(world);delete options.job.onCancel;if(error)reject(error);else resolve(value)};
  const cancel=()=>{worker?.postMessage({type:'cancel',id});if(!cancelTimer)cancelTimer=setTimeout(()=>finish({...last,cancelled:true}),3000)};
  Object.defineProperty(options.job,'onCancel',{value:cancel,configurable:true});
  try{
   worker=new Worker(new URL('src/runtime/simulation-worker.js',document.baseURI));jobs.set(world,{worker,id});stats.backend='worker';
   bootTimer=setTimeout(()=>finish(null),20000);
   worker.onerror=event=>{event.preventDefault();stats.lastError=event.message;if(!ready){stats.backend='cooperative';finish(null)}else finish(null,new Error(event.message||'Simulation worker failed'))};
   worker.onmessage=event=>{
    const data=event.data;if(closed||data.id!==id)return;
    try{
     if(data.type==='ready'){ready=true;clearTimeout(bootTimer);if(options.job.cancelRequested)cancel()}
     else if(data.type==='error'){stats.lastError=data.message;if(!ready){stats.backend='cooperative';finish(null)}else finish(null,new Error(data.message))}
     else if(data.type==='progress'){stats.simulatedYear=data.progress.absoluteYear;options.onProgress?.({...data.progress,synced:false})}
     else if(data.type==='patch'){
      const start=performance.now();root.WorldForgeStateDelta.apply(world,data.ops);stats.commits++;stats.operations+=data.ops.length;stats.lastApplyMs=performance.now()-start;last=data.progress;stats.visibleYear=last.absoluteYear;stats.worker=data.timings;
      options.onProgress?.({...last,synced:true});
      root.dispatchEvent(new CustomEvent('worldforge:state-commit',{detail:{world,progress:last}}));
      if(data.result)finish(data.result);else{stats.lastCommitMs=performance.now()-start;worker.postMessage({type:'ack',id,intervalMs:Math.max(350,stats.lastCommitMs*12)})}
     }
    }catch(error){finish(null,error)}
   };
   worker.postMessage({type:'start',id,world,years,scripts:scripts(),pauseEveryYears:options.pauseEveryYears,pauseMs:options.pauseMs});
   if(options.job.cancelRequested)cancel();
  }catch(error){stats.lastError=error.message;stats.backend='cooperative';finish(null)}
 });
}
root.WorldForgeRuntime={run,shouldRender,stats,scripts};
root.WorldForgeEndless?.setAsyncDriver(run);
})(typeof window!=='undefined'?window:globalThis);
