(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const STAGES=['Encampment','Clay village','Brick town','Fortified city','Civic metropolis'];
const CATALOG=[
 ['tent',0],['pavilion',0],['campfire',0],['store',0],
 ['adobe',1],['courtyard',1],['granary',1],['well',1],['farm',1],['shrine',1],
 ['townhouse',2],['market',2],['smithy',2],['warehouse',2],['hall',2],['temple',2],
 ['keep',3],['gatehouse',3],['watchtower',3],['barracks',3],['manor',3],
 ['academy',4],['observatory',4],['aqueduct',4],['clocktower',4],['mill',4],['garden',4]
].map(([id,stage])=>({id,stage}));
function hash(s){let n=2166136261;for(const c of String(s)){n=Math.imul(n^c.charCodeAt(0),16777619)}return n>>>0}
function profile(renderer,s){
 const w=renderer.world,rid=renderer.ownerOf(s),known=w.technology?.realms?.find(r=>r.realmId===rid)?.known||{};
 const now=(w.endless?.epochOffset||0)+(w.history?.currentYear||0),year=renderer.historyView?.year==null?now:Number(renderer.historyView.year)+(w.endless?.epochOffset||0),historical=year<now;
 // Past adoption is not recorded by the simulation. Use discovery dates and a
 // conservative diffusion delay, never present-day adoption in a past view.
 const adopted=id=>{const k=known[id];if(!k||Number(k.year)>year)return 0;return historical?clamp(.34+(year-Number(k.year))*.006,0,1):Number(k.adoption||0)};
 const population=Math.max(0,Number(renderer.popOf(s))||0);
 let stage=0;
 if(adopted('agriculture')>=.45)stage=1;
 if(stage&&adopted('masonry')>=.65&&adopted('bronze_working')>=.4&&population>=700)stage=2;
 if(stage===2&&adopted('ironworking')>=.5&&adopted('siege_engineering')>=.5&&population>=2500)stage=3;
 if(stage===3&&adopted('public_sanitation')>=.5&&adopted('mechanical_engineering')>=.5&&population>=8000)stage=4;
 const seed=hash(`${w.settings.seed}|${s.id}`),index=Math.floor(s.y)*w.settings.width+Math.floor(s.x),dry=(w.layers.moisture?.[index]??.5)<.35;
 const palettes=dry?['#d7bc8f','#a27e55','#bb724e']:['#d6cbb0','#8f9b92','#665f71'];
 return{stage,label:STAGES[stage],population,seed,historical,wall:stage===1?'#c6a275':stage===2?'#c39379':palettes[0],side:stage===1?'#92704c':stage===2?'#996650':palettes[1],roof:['#bca27b','#a99772','#985d4d','#647786','#54766d'][stage],accent:renderer.realm(rid)?.color||'#dbba6b',count:clamp(Math.round(Math.sqrt(population)/7),4,64)};
}
function plan(p){
 const homes=p.stage===0?['tent','pavilion']:p.stage===1?['adobe','courtyard']:['townhouse','courtyard','manor'];
 const available=CATALOG.filter(x=>x.stage<=p.stage&&x.stage>0&&!['keep','gatehouse'].includes(x.id));
 const rows=[];const count=p.stage===0?Math.min(8,p.count):p.count;
 for(let i=0;i<count;i++){
  const ring=1+Math.floor(Math.sqrt(i)),angle=i*2.399963+(p.seed%100)*.01,rad=.33+ring*.31;
  const special=i%5===0&&available.length,type=special?available[(p.seed+i)%available.length].id:homes[(p.seed+i)%homes.length];
  const cols=Math.ceil(Math.sqrt(count)),gx=(i%cols-(cols-1)/2)*.52,gy=(Math.floor(i/cols)-(cols-1)/2)*.52;
  rows.push({id:i,type,x:p.stage>=2?gx:Math.cos(angle)*rad,y:p.stage>=2?gy:Math.sin(angle)*rad,w:.23+(hash(p.seed+':'+i)%10)*.012,h:.18+(hash(i+':'+p.seed)%10)*.015});
 }
 rows.push({id:'landmark',type:['campfire','shrine','hall','keep','observatory'][p.stage],x:0,y:0,w:.48,h:p.stage>=3?.95:.5});
 return rows.sort((a,b)=>a.x+a.y-b.x-b.y);
}
function polygon(ctx,points,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(24,35,37,.23)';ctx.lineWidth=.55;ctx.stroke()}
// All faces are projected from local XYZ geometry and rasterized at display DPR.
function building(ctx,b,p,unit){
 const origin=[(b.x-b.y)*unit,(b.x+b.y)*unit*.48],P=(x,y,z)=>[origin[0]+(x-y)*unit,origin[1]+(x+y)*unit*.48-z*unit];
 const box=(x,y,w,d,h,wall=p.wall,side=p.side)=>{
  polygon(ctx,[P(x,y,0),P(x+w,y,0),P(x+w,y,h),P(x,y,h)],wall);
  polygon(ctx,[P(x+w,y,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x+w,y,h)],side);
  polygon(ctx,[P(x,y,h),P(x+w,y,h),P(x+w,y+d,h),P(x,y+d,h)],'#e1d7bd');
 };
 const roof=(x,y,w,d,h)=>{
  polygon(ctx,[P(x-.04,y-.04,h),P(x+w+.04,y-.04,h),P(x+w/2,y-.04,h+.23)],p.roof);
  polygon(ctx,[P(x+w+.04,y-.04,h),P(x+w+.04,y+d+.04,h),P(x+w/2,y+d+.04,h+.23),P(x+w/2,y-.04,h+.23)],p.roof);
  polygon(ctx,[P(x-.04,y-.04,h),P(x+w/2,y-.04,h+.23),P(x+w/2,y+d+.04,h+.23),P(x-.04,y+d+.04,h)],'#b59c80');
  if(unit>20){
   ctx.strokeStyle='rgba(42,38,35,.25)';ctx.lineWidth=.5;
   for(let k=1;k<5;k++){const ry=y+d*k/5;ctx.beginPath();ctx.moveTo(...P(x+w/2,ry,h+.23));ctx.lineTo(...P(x+w+.035,ry,h));ctx.stroke()}
   ctx.strokeStyle='rgba(244,221,177,.6)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...P(x+w/2,y-.04,h+.23));ctx.lineTo(...P(x+w/2,y+d+.04,h+.23));ctx.stroke();
  }
 };
 const w=b.w,d=w*.85,h=b.h,type=b.type;
 polygon(ctx,[P(-.06,0,0),P(w+.22,d*.2,0),P(w+.34,d+.3,0),P(0,d+.15,0)],'rgba(10,24,25,.2)');
 if(type==='tent'||type==='pavilion'){
  polygon(ctx,[P(-w,0,0),P(0,0,h),P(w,0,0)],'#e4d4af');polygon(ctx,[P(0,0,h),P(0,d,h),P(w,d,0),P(w,0,0)],type==='pavilion'?p.accent:'#a99173');
  polygon(ctx,[P(-w*.25,0,0),P(0,0,h*.65),P(w*.25,0,0)],'#3c3830');
  if(unit>20){ctx.strokeStyle='#ad966d';ctx.lineWidth=.65;for(const x of[-w,w]){ctx.beginPath();ctx.moveTo(...P(x,0,h*.15));ctx.lineTo(...P(x*1.35,-.15,0));ctx.stroke()}}
  return;
 }
 if(type==='campfire'){for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*.22,Math.sin(a)*.22,.09,.09,.06,'#9b9e94','#666d67')}polygon(ctx,[P(-.1,0,0),P(0,0,.33),P(.14,0,0)],'#eea452');return}
 if(type==='farm'||type==='garden'){for(let i=0;i<5;i++)polygon(ctx,[P(-w,i*.1,0),P(w,i*.1,0),P(w,i*.1+.05,0),P(-w,i*.1+.05,0)],type==='farm'?'#c1ab62':'#5f9167');return}
 if(type==='well'){box(0,0,w,w,.13);polygon(ctx,[P(.04,.04,.14),P(w-.04,.04,.14),P(w-.04,w-.04,.14),P(.04,w-.04,.14)],'#315a67');return}
 if(type==='aqueduct'){for(let i=0;i<4;i++)box(i*.22,0,.08,.15,.45);polygon(ctx,[P(0,0,.45),P(.8,0,.45),P(.8,0,.55),P(0,0,.55)],p.wall);polygon(ctx,[P(0,0,.55),P(.8,0,.55),P(.8,.15,.55),P(0,.15,.55)],'#ddd5bd');return}
 if(type==='courtyard'){box(-w,-w,w*2,.12,h);box(-w,-w,.12,w*2,h);box(w-.12,-w,.12,w*2,h);box(-w,w-.12,w*2,.12,h*.7);polygon(ctx,[P(-w+.12,-w+.12,0),P(w-.12,-w+.12,0),P(w-.12,w-.12,0),P(-w+.12,w-.12,0)],'#91a07a');return}
 if(type==='store'){for(let i=0;i<3;i++){box(i*.14,i%2*.12,.12,.12,.12,'#b39462','#84683f')}return}
 const tower=['keep','watchtower','clocktower','observatory','gatehouse'].includes(type);
 if(type==='keep'||type==='gatehouse'){
  box(-w,-w,w*2,w*1.6,h*.55);for(const [x,y]of[[-w,-w],[w*.65,-w],[-w,w*.3],[w*.65,w*.3]]){box(x,y,w*.45,w*.45,h);for(let k=0;k<3;k++)box(x+k*w*.15,y,w*.1,w*.12,h+.1)}
 }else if(type==='market'){
  for(const x of[0,w])box(x,0,.04,d,.25,'#9a7955','#635343');roof(0,0,w,d,.3);polygon(ctx,[P(0,0,.3),P(w*.5,0,.3),P(w*.5,d,.3),P(0,d,.3)],p.accent);
 }else{
  box(0,0,w,d,tower?h*1.6:h);
  if(['adobe','courtyard','store'].includes(type)){box(-.025,-.025,w+.05,.035,h+.07);box(w,0,.035,d,h+.07)}
  else if(type==='observatory'){const c=P(w/2,d/2,h*1.6);ctx.fillStyle='#6c9b9c';ctx.beginPath();ctx.ellipse(c[0],c[1],w*unit*.75,w*unit*.65,0,Math.PI,Math.PI*2);ctx.fill()}
  else roof(0,0,w,d,tower?h*1.6:h);
  if(['smithy','mill','warehouse'].includes(type))box(w*.7,d*.7,.09,.09,h+.35,'#9f978b','#655e59');
  if(['temple','academy','hall'].includes(type)){for(let i=0;i<4;i++)box(i*w/4,-.08,.035,.035,h*.85,'#eee0bb','#b5ac97')}
  if(type==='granary'){for(let i=0;i<3;i++)box(i*.12,0,.04,.04,.18,'#917149','#63543f')}
  if(type==='manor'){box(-w*.6,0,w*.6,d*.8,h*.65);roof(-w*.6,0,w*.6,d*.8,h*.65)}
  if(type==='barracks'){for(let i=1;i<3;i++){box(i*w,0,w,d,h);roof(i*w,0,w,d,h)}}
  if(type==='academy'){for(const x of[-w,w]){box(x,0,w*.65,d,h*.7);roof(x,0,w*.65,d,h*.7)}}
  if(type==='temple'||type==='shrine'){box(w*.4,d*.35,w*.2,w*.2,h+.38,'#d9c89a','#a19575');roof(w*.25,d*.2,w*.5,w*.5,h+.35)}
  if(type==='clocktower'){const c=P(w*.5,-.01,h*1.25);ctx.fillStyle='#f2dfad';ctx.beginPath();ctx.arc(c[0],c[1],w*unit*.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#394349';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(c[0],c[1]-w*unit*.18);ctx.lineTo(...c);ctx.lineTo(c[0]+w*unit*.15,c[1]);ctx.stroke()}
 }
 if(unit>20){
  // Masonry courses, shaded window recesses and lintels remain real geometry at
  // every zoom instead of details painted into a low-resolution settlement sprite.
  if(p.stage>=1){ctx.strokeStyle='rgba(62,49,41,.2)';ctx.lineWidth=.45;for(let z=.12;z<h;z+=.14){ctx.beginPath();ctx.moveTo(...P(0,-.004,z));ctx.lineTo(...P(w,-.004,z));ctx.lineTo(...P(w+.004,d,z));ctx.stroke()}}
  const levels=tower?3:p.stage>=2?2:1;
  for(let j=0;j<levels;j++)for(let i=0;i<2;i++)polygon(ctx,[P(w*(.15+i*.5),-.003,h*(.35+j*.25)),P(w*(.3+i*.5),-.003,h*(.35+j*.25)),P(w*(.3+i*.5),-.003,h*(.53+j*.25)),P(w*(.15+i*.5),-.003,h*(.53+j*.25))],'#35434a');
  polygon(ctx,[P(w*.4,-.008,0),P(w*.64,-.008,0),P(w*.64,-.008,h*.33),P(w*.4,-.008,h*.33)],'#514535');
  polygon(ctx,[P(w*.35,-.014,h*.33),P(w*.69,-.014,h*.33),P(w*.69,-.014,h*.38),P(w*.35,-.014,h*.38)],'#e3cc9d');
  if(['townhouse','manor','warehouse'].includes(type)){polygon(ctx,[P(w*.1,-.09,h*.32),P(w*.9,-.09,h*.32),P(w*.9,-.3,h*.24),P(w*.1,-.3,h*.24)],type==='warehouse'?'#788873':p.accent)}
  if(type==='mill'){const c=P(w*.5,0,h+.15);ctx.strokeStyle='#e1d0a4';ctx.lineWidth=2;for(let i=0;i<4;i++){const a=i*Math.PI/2+.5;ctx.beginPath();ctx.moveTo(...c);ctx.lineTo(c[0]+Math.cos(a)*unit*.3,c[1]+Math.sin(a)*unit*.3);ctx.stroke()}}
 }
}
const modelUnit=scale=>clamp(scale*.82,5,300);
function paint(renderer,ctx,s,p,point,selected,capital,close=point.scale>14,unit=modelUnit(point.scale)){
 const onLand=b=>{const x=s.x+.5+(b.x-b.y)*unit/point.scale,y=s.y+.5+(b.x+b.y)*unit*.48/point.scale/(renderer.projection==='flat'?1:.72);return root.WorldForgeTerrain.elevation(renderer.world,x,y)>renderer.world.settings.seaLevel+.002};
 const rows=plan(p).filter(b=>b.id==='landmark'||onLand(b)),visible=close?rows:rows.filter(b=>b.id==='landmark'||b.id<2);
 ctx.save();ctx.translate(point.x,point.y);
 if(close){
  ctx.strokeStyle='rgba(203,183,139,.65)';ctx.lineWidth=clamp(unit*.07,1,6);ctx.lineCap='round';
  for(const b of rows){ctx.beginPath();ctx.moveTo(0,0);if(p.stage>=2)ctx.lineTo(b.x*unit,b.x*unit*.48);ctx.lineTo((b.x-b.y)*unit,(b.x+b.y)*unit*.48);ctx.stroke()}
  if(p.stage>=3){const radius=Math.ceil(Math.sqrt(p.count))*.26+.3,corners=[{x:-radius,y:-radius},{x:radius,y:-radius},{x:radius,y:radius},{x:-radius,y:radius}];if(corners.every(onLand)){ctx.strokeStyle=p.side;ctx.lineWidth=unit*.13;ctx.beginPath();corners.forEach((b,i)=>ctx[i?'lineTo':'moveTo']((b.x-b.y)*unit,(b.x+b.y)*unit*.48));ctx.closePath();ctx.stroke();for(const b of corners)building(ctx,{...b,type:'watchtower',w:.3,h:.5},p,unit)}}
 }
 for(const b of visible)building(ctx,b,p,unit);
 if(capital){ctx.strokeStyle='#d9c896';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-unit*.5);ctx.lineTo(0,-unit*1.6);ctx.stroke();polygon(ctx,[[0,-unit*1.6],[unit*.4,-unit*1.45],[0,-unit*1.3]],p.accent)}
 if(selected){ctx.strokeStyle='#e7c889';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,unit*.2,Math.max(10,unit*1.5),Math.max(5,unit*.7),0,0,Math.PI*2);ctx.stroke()}
 ctx.restore();return p;
}
function draw(renderer,ctx,s,point,selected,capital){
 const p=profile(renderer,s);
 if(renderer.gpuActive&&renderer.gpu.drawSettlement(renderer,s,p,point,capital)){
  if(selected){const unit=modelUnit(point.scale);ctx.save();ctx.strokeStyle='#e7c889';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(point.x,point.y+unit*.2,Math.max(10,unit*1.5),Math.max(5,unit*.7),0,0,Math.PI*2);ctx.stroke();ctx.restore()}
  return p;
 }
 return paint(renderer,ctx,s,p,point,selected,capital);
}
const api={STAGES,CATALOG,profile,plan,building,paint,unit:modelUnit,draw};root.WorldForgeLivingSettlements=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

