(function(root,factory){
  const api=factory(root);
  if(root)root.WorldForgeMetricCharts=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
'use strict';
const VERSION='1.0.2';
const models=new Set();
let resizeFrame=0;
const raf=typeof root.requestAnimationFrame==='function'?root.requestAnimationFrame.bind(root):fn=>setTimeout(fn,16);
const compact=new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1});
const formatValue=value=>{const n=Number(value)||0;return n>=1000?compact.format(n):n.toLocaleString(undefined,{maximumFractionDigits:1});};
const finite=value=>Number.isFinite(Number(value))?Number(value):0;
function maxOf(values){let max=0;for(const value of values)max=Math.max(max,finite(value));return max>0?max:1}
function geometry(canvas){
  if(!canvas||typeof canvas.getContext!=='function')return null;
  const parent=canvas.parentElement;
  const width=Math.max(280,Math.floor(canvas.clientWidth||parent?.clientWidth||640));
  const height=270,dpr=Math.min(2,Math.max(1,Number(root.devicePixelRatio)||1));
  const pixelWidth=Math.round(width*dpr),pixelHeight=Math.round(height*dpr);
  if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}
  canvas.style.width='100%';canvas.style.height=height+'px';
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  return{canvas,ctx,width,height,plot:{left:54,right:width-42,top:28,bottom:height-38}};
}
function xPosition(index,count,plot){return plot.left+(count<=1?0:index/(count-1)*(plot.right-plot.left))}
function yPosition(value,max,plot){return plot.bottom-(finite(value)/max)*(plot.bottom-plot.top)}
function drawAxes(g,labels,leftMax,rightMax,leftLabel,rightLabel){
  const{ctx,width,height,plot}=g;ctx.font='11px system-ui,sans-serif';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y=plot.bottom-(i/4)*(plot.bottom-plot.top);
    ctx.strokeStyle='rgba(160,180,150,.12)';ctx.beginPath();ctx.moveTo(plot.left,y);ctx.lineTo(plot.right,y);ctx.stroke();
    ctx.fillStyle='#7f9081';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(formatValue(leftMax*i/4),plot.left-8,y);
    if(rightMax!=null){ctx.fillStyle='#9b7f7b';ctx.textAlign='left';ctx.fillText(formatValue(rightMax*i/4),plot.right+8,y)}
  }
  const indexes=labels.length?[...new Set([0,Math.floor((labels.length-1)/2),labels.length-1])]:[];
  ctx.fillStyle='#78877a';ctx.textBaseline='alphabetic';ctx.textAlign='center';
  for(const index of indexes)ctx.fillText(String(labels[index]),xPosition(index,labels.length,plot),plot.bottom+19);
  ctx.fillText('Year',(plot.left+plot.right)/2,height-7);
  ctx.save();ctx.translate(13,(plot.top+plot.bottom)/2);ctx.rotate(-Math.PI/2);ctx.fillText(leftLabel,0,0);ctx.restore();
  if(rightLabel){ctx.save();ctx.translate(width-8,(plot.top+plot.bottom)/2);ctx.rotate(Math.PI/2);ctx.fillText(rightLabel,0,0);ctx.restore()}
}
function drawLine(ctx,points,color,width=2){if(!points.length)return;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.stroke()}
function drawLegend(ctx,items,x,y){
  ctx.font='11px system-ui,sans-serif';ctx.textBaseline='middle';let cursor=x;
  for(const item of items){ctx.fillStyle=item.color;ctx.beginPath();if(item.kind==='dot')ctx.arc(cursor+4,y,3,0,Math.PI*2);else{ctx.rect(cursor,y-2,12,4)}ctx.fill();cursor+=19;ctx.fillStyle='#c9d3c3';ctx.textAlign='left';ctx.fillText(item.label,cursor,y);cursor+=ctx.measureText(item.label).width+18}
}
function tooltipElement(canvas){
  const card=canvas.parentElement;if(!card)return null;
  if(canvas.__worldforgeMetricTooltip)return canvas.__worldforgeMetricTooltip;
  const existing=typeof card.querySelector==='function'?card.querySelector('.history-chart-tooltip'):null;
  if(existing){canvas.__worldforgeMetricTooltip=existing;return existing}
  const tip=document.createElement('div');tip.className='history-chart-tooltip';tip.hidden=true;card.appendChild(tip);canvas.__worldforgeMetricTooltip=tip;return tip;
}
function hideTooltip(canvas){if(canvas.__worldforgeMetricTooltip)canvas.__worldforgeMetricTooltip.hidden=true}
function bindTooltip(canvas){
  if(canvas.__worldforgeMetricTooltipBound||typeof canvas.addEventListener!=='function')return;
  let hoverFrame=0,hoverPoint=null;
  const update=()=>{
    hoverFrame=0;const model=canvas.__worldforgeMetricModel;if(!model||!hoverPoint||!model.points.length)return;
    const rect=canvas.getBoundingClientRect(),x=hoverPoint.x-rect.left;let nearest=model.points[0],distance=Math.abs(x-nearest.x);
    for(let i=1;i<model.points.length;i++){const next=model.points[i],candidate=Math.abs(x-next.x);if(candidate<distance){nearest=next;distance=candidate}}
    const step=(model.plot.right-model.plot.left)/Math.max(1,model.points.length-1);if(distance>Math.max(18,step*1.5)){hideTooltip(canvas);return}
    const tip=tooltipElement(canvas);if(!tip)return;tip.textContent=model.tooltip(nearest.index);tip.hidden=false;
    const card=canvas.parentElement,cardRect=card.getBoundingClientRect();
    const left=Math.min(Math.max(8,hoverPoint.x-cardRect.left+12),Math.max(8,cardRect.width-tip.offsetWidth-8));
    const top=Math.max(34,hoverPoint.y-cardRect.top-50);tip.style.left=left+'px';tip.style.top=top+'px';
  };
  canvas.addEventListener('pointermove',event=>{hoverPoint={x:event.clientX,y:event.clientY};if(!hoverFrame)hoverFrame=raf(update)});
  canvas.addEventListener('pointerleave',()=>{hoverPoint=null;if(hoverFrame)hoverFrame=0;hideTooltip(canvas)});
  canvas.__worldforgeMetricTooltipBound=true;
}
function register(canvas,model){
  const previous=canvas.__worldforgeMetricModel;if(previous&&previous!==model)models.delete(previous);
  canvas.__worldforgeMetricModel=model;model.canvas=canvas;models.add(model);bindTooltip(canvas);
}
function drawPopulation(canvas,data,model){
  const g=geometry(canvas);if(!g)return model;
  const{ctx,plot}=g,labels=data.labels,values=data.values,max=maxOf(values),points=values.map((value,index)=>({index,x:xPosition(index,values.length,plot),y:yPosition(value,max,plot)}));
  drawAxes(g,labels,max,null,'Population',null);
  if(points.length){ctx.save();ctx.beginPath();ctx.moveTo(points[0].x,plot.bottom);for(const point of points)ctx.lineTo(point.x,point.y);ctx.lineTo(points[points.length-1].x,plot.bottom);ctx.closePath();ctx.fillStyle='rgba(215,179,108,.11)';ctx.fill();ctx.restore();drawLine(ctx,points,'#d7b36c',2)}
  const marker=Number.isInteger(data.markerIndex)&&points[data.markerIndex];if(marker){ctx.fillStyle='#f4efe0';ctx.beginPath();ctx.arc(marker.x,marker.y,4,0,Math.PI*2);ctx.fill()}
  drawLegend(ctx,[{label:'Population',color:'#d7b36c'},{label:'Viewed year',color:'#f4efe0',kind:'dot'}],plot.left,13);
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Population history chart');
  model.points=points;model.plot=plot;model.tooltip=index=>'Year '+String(labels[index])+'\nPopulation '+formatValue(values[index]);return model;
}
function drawTrade(canvas,data,model){
  const g=geometry(canvas);if(!g)return model;
  const{ctx,plot}=g,labels=data.labels,tradeMax=maxOf(data.trade),warsMax=maxOf(data.wars),tradePoints=data.trade.map((value,index)=>({index,x:xPosition(index,data.trade.length,plot),y:yPosition(value,tradeMax,plot)}));
  drawAxes(g,labels,tradeMax,warsMax,'Trade index','Active wars');
  const barWidth=Math.max(2,Math.min(18,(plot.right-plot.left)/Math.max(1,data.wars.length-1)*.6));
  ctx.fillStyle='rgba(196,86,75,.46)';for(let i=0;i<data.wars.length;i++){const x=xPosition(i,data.wars.length,plot)-barWidth/2,y=yPosition(data.wars[i],warsMax,plot);ctx.fillRect(x,y,barWidth,plot.bottom-y)}
  drawLine(ctx,tradePoints,'#72a983',2);
  drawLegend(ctx,[{label:'Trade index',color:'#72a983'},{label:'Active wars',color:'#c4564b'}],plot.left,13);
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Trade and active wars chart');
  model.points=tradePoints;model.plot=plot;model.tooltip=index=>'Year '+String(labels[index])+'\nTrade index '+formatValue(data.trade[index])+'\nActive wars '+formatValue(data.wars[index]);return model;
}
function render({populationCanvas,tradeCanvas,series=[],viewYear=null}={}){
  const rows=Array.isArray(series)?series:[],labels=rows.map(row=>row.year),population=rows.map(row=>finite(row.population)),trade=rows.map(row=>finite(row.trade)),wars=rows.map(row=>finite(row.activeWars));
  if(populationCanvas){let model=populationCanvas.__worldforgeMetricModel;if(!model||model.type!=='population')model={type:'population',points:[],plot:null};model.data={labels,values:population,markerIndex:labels.indexOf(viewYear)};model.draw=()=>drawPopulation(populationCanvas,model.data,model);drawPopulation(populationCanvas,model.data,model);register(populationCanvas,model)}
  if(tradeCanvas){let model=tradeCanvas.__worldforgeMetricModel;if(!model||model.type!=='trade')model={type:'trade',points:[],plot:null};model.data={labels,trade,wars};model.draw=()=>drawTrade(tradeCanvas,model.data,model);drawTrade(tradeCanvas,model.data,model);register(tradeCanvas,model)}
}
function scheduleResize(){if(resizeFrame)return;resizeFrame=raf(()=>{resizeFrame=0;for(const model of models){if(model.canvas?.isConnected===false){models.delete(model);continue}model.draw()}})}
if(root.addEventListener)root.addEventListener('resize',scheduleResize,{passive:true});
return{VERSION,render};
});
