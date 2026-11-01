'use strict';
// Existing engines expose their pure APIs on window/globalThis through UMD.
self.window=self;
importScripts('state-delta.js');
let world=null,runId=null,waiting=null;
function wire(){
 const g=self;
 g.WorldForgeCulture.setBaseSimulator((w,y,o)=>{g.WorldForgeStory.simulateYears(w,y,o);g.WorldForgeWiki.initialize(w)});
 g.WorldForgeFactions.setBaseSimulator(g.WorldForgeCulture.simulateYears.bind(g.WorldForgeCulture));
 const chain=['WorldForgeFactions','WorldForgeCalendar','WorldForgeArtifacts','WorldForgeTechnology','WorldForgeResources','WorldForgeInstitutions','WorldForgeMilitary','WorldForgeTreasury','WorldForgeWorkforce'];
 for(let i=1;i<chain.length;i++)g[chain[i]].setBaseSimulator(g[chain[i-1]].simulateYears.bind(g[chain[i-1]]));
 g.WorldForgeWarfareHooks?.activate();
 g.WorldForgeEndless.setBaseSimulator((w,y,o)=>g.WorldForgeWorkforce.simulateYears(w,y,o));
}
async function start(data){
 runId=data.id;
 try{
  const base=new URL('../',self.location.href);
  for(const path of data.scripts){const url=new URL(path,base);if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw new Error('Invalid engine URL');importScripts(url.href)}
  wire();world=data.world;
  const tracker=new self.WorldForgeStateDelta.Tracker(world);let last=performance.now(),lastTick=0,pending=false,progress={done:0,total:data.years,absoluteYear:self.WorldForgeEndless.absoluteYear(world)};
  postMessage({type:'ready',id:runId});
  const publish=(result=null)=>{
   const t=performance.now(),ops=tracker.changes(world);pending=true;
   waiting=delay=>{pending=false;waiting=null;interval=Math.max(interval,Math.min(1500,Number(delay)||350))};
   postMessage({type:'patch',id:runId,ops,progress,result});last=performance.now();
   return performance.now()-t;
  };
  let interval=350;
  const result=await self.WorldForgeEndless.simulateYearsAsync(world,data.years,{batchSize:1,pauseEveryYears:data.pauseEveryYears,pauseMs:data.pauseMs,onProgress:p=>{
   progress=p;const now=performance.now();
   if(now-lastTick>100){postMessage({type:'progress',id:runId,progress:p});lastTick=now}
   if(!pending&&(now-last>=interval||(data.pauseEveryYears>0&&p.done%data.pauseEveryYears===0)))interval=Math.min(1500,Math.max(350,publish()*12));
  }});
  while(pending)await new Promise(resolve=>setTimeout(resolve,4));
  publish(result);
 }catch(error){postMessage({type:'error',id:runId,message:error.message,stack:error.stack})}
}
self.onmessage=event=>{
 const data=event.data;
 if(data.type==='start'&&runId===null)void start(data);
 else if(data.id===runId&&data.type==='ack')waiting?.(data.intervalMs);
 else if(data.id===runId&&data.type==='cancel'&&world)self.WorldForgeEndless.cancel(world);
};
