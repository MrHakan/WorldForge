(()=>{
'use strict';
const W=window.WorldForgeWarfareSupply;if(!W)return;
const $=selector=>document.querySelector(selector);
let last='';
function selectedArmyId(){return window.WorldForgeWarfareSupplyUI?.state?.selectedArmyId??null}
function selectArmy(id){window.WorldForgeWarfareSupplyUI?.selectArmy?.(id);render(true)}
function render(force=false){
  const r=window.WorldForgeApp?.state?.renderer||window.worldRenderer,w=r?.world,panel=$('#mapWrap');if(!w||!panel)return;
  let svg=$('#worldforgeSupplyOverlay');
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='worldforgeSupplyOverlay';svg.setAttribute('aria-label','Military units and supply');Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'4',color:'#e1c997'});panel.appendChild(svg);svg.addEventListener('click',event=>{const unit=event.target.closest('[data-army-id]');if(unit)selectArmy(unit.dataset.armyId)})}
  if((window.WorldForgeMapExperience&&!window.WorldForgeMapExperience.isLayerVisible('military'))||r.historyView?.isPresent===false){svg.innerHTML='';last='';return}
  W.initialize(w);
  const width=r.canvas.width/(r.dpr||1),height=r.canvas.height/(r.dpr||1),S=w.warfareSupply;
  const key=[S.revision,width,height,r.camera.x,r.camera.y,r.camera.zoom,r.projection,selectedArmyId()].join('|');if(!force&&key===last)return;last=key;
  svg.setAttribute('viewBox','0 0 '+width+' '+height);
  const rawCity=id=>window.WorldForgeTerrain.settlementPosition(w,id);
  const project=p=>p&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y))?r.worldToScreen(Number(p.x),Number(p.y)):null;
  const point=id=>project(rawCity(id));
  const line=(a,b,attributes='')=>a&&b&&Math.abs(a.x-b.x)<width*.65?'<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="currentColor" '+attributes+'/>':'';
  const lines=W.supplyLines(w).slice(0,64).map(route=>line(point(route.fromCityId),point(route.toCityId),'stroke-width="1" stroke-dasharray="4 6" opacity=".25" data-supply-status="'+route.status+'" data-route-quality="'+Number(route.roadQuality||0).toFixed(2)+'"')).join('');
  const armies=(S.armies||[]).filter(army=>army.status!=='destroyed').slice(0,96).map(army=>{
    let p=project(army.position);
    if(!p){const a=rawCity(army.homeCityId),b=rawCity(army.targetCityId),t=Math.max(0,Math.min(1,Number(army.marchProgress||0)));if(a&&b){let dx=b.x-a.x;if(dx>w.settings.width/2)dx-=w.settings.width;if(dx<-w.settings.width/2)dx+=w.settings.width;p=project({x:a.x+dx*t,y:a.y+(b.y-a.y)*t})}else p=project(a)}
    if(!p)return'';
    const selected=String(selectedArmyId()??'')===String(army.id),size=selected?6:4;
    return'<g data-army-id="'+army.id+'" data-army-state="'+army.movementState+'" data-route-nodes="'+(Array.isArray(army.route)?army.route.length:0)+'" data-army-readiness="'+army.status+'" data-selected="'+selected+'" style="pointer-events:all;cursor:pointer"><rect x="'+(p.x-size)+'" y="'+(p.y-size)+'" width="'+size*2+'" height="'+size*2+'" rx="2" fill="#193c43" stroke="currentColor" stroke-width="'+(selected?2:1)+'"/><path d="M '+(p.x-2)+' '+(p.y-2)+' L '+(p.x+2)+' '+(p.y+2)+' M '+(p.x+2)+' '+(p.y-2)+' L '+(p.x-2)+' '+(p.y+2)+'" stroke="currentColor" stroke-width="1"/></g>';
  }).join('');
  const fleets=W.fleets(w).slice(0,48).map(fleet=>{
    const p=project(fleet.position)||point(fleet.homeCityId);if(!p)return'';
    return'<g data-fleet-status="'+fleet.status+'" data-fleet-mission="'+(fleet.mission||'patrol')+'" data-fleet-progress="'+Number(fleet.movementProgress||0).toFixed(2)+'" opacity=".8"><path d="M '+(p.x-6)+' '+(p.y+1)+' L '+(p.x+6)+' '+(p.y+1)+' L '+(p.x+3)+' '+(p.y+5)+' L '+(p.x-3)+' '+(p.y+5)+' Z" fill="currentColor"/><path d="M '+p.x+' '+(p.y-6)+' V '+(p.y+1)+' M '+p.x+' '+(p.y-6)+' L '+(p.x+4)+' '+(p.y-1)+' H '+p.x+'" stroke="currentColor" fill="none"/></g>';
  }).join('');
  const fleetRoutes=(S.fleets||[]).filter(fleet=>fleet.mission&&fleet.mission!=='patrol').slice(0,32).map(fleet=>line(project(fleet.homePosition)||point(fleet.homeCityId),project(fleet.destination),'stroke-width="1" stroke-dasharray="3 5" opacity=".22" data-fleet-mission="'+fleet.mission+'"')).join('');
  const battles=(S.navalBattles||[]).slice(-24).map(battle=>{
    const p=project(battle.position)||point(battle.targetCityId);if(!p)return'';
    return'<g data-naval-battle="'+battle.outcome+'" opacity=".85" stroke="#d3a28b" fill="none"><circle cx="'+p.x+'" cy="'+p.y+'" r="6" stroke-width="1.3"/><path d="M '+(p.x-3)+' '+(p.y-3)+' L '+(p.x+3)+' '+(p.y+3)+' M '+(p.x+3)+' '+(p.y-3)+' L '+(p.x-3)+' '+(p.y+3)+'" stroke-width="1.1"/></g>';
  }).join('');
  svg.innerHTML=lines+armies+fleetRoutes+fleets+battles;
}
window.addEventListener('resize',()=>render(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(true)});
setTimeout(()=>render(true),1500);window.WorldForgeWarfareSupplyOverlay={render,selectArmy};
})();