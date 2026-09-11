(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeStructureArchetypes=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const VERSION='4.0.0';
const ARCHETYPES=[
 {id:'house',label:'Town House',category:'residential',districts:['old_town','residential','market','outskirts'],footprint:[3,3],height:2,props:['chimney','barrel','garden']},
 {id:'poor_house',label:'Poor Dwelling',category:'residential',districts:['slums','residential','outskirts'],footprint:[3,2],height:1,props:['patches','laundry','crate']},
 {id:'merchant_house',label:'Merchant House',category:'residential',districts:['market','old_town','noble'],footprint:[4,3],height:2,props:['awning','sign','crate']},
 {id:'noble_house',label:'Noble House',category:'residential',districts:['noble','civic'],footprint:[5,4],height:3,props:['banner','garden','statue']},
 {id:'barracks',label:'Barracks',category:'military',districts:['military','civic'],footprint:[5,3],height:2,props:['banner','weapon_rack','yard']},
 {id:'watchtower',label:'Watchtower',category:'military',districts:['military','old_town','outskirts'],footprint:[2,2],height:4,props:['banner','brazier']},
 {id:'wall_segment',label:'Fortification Wall',category:'military',districts:['military','outskirts'],footprint:[6,1],height:2,props:['merlons']},
 {id:'gate',label:'City Gate',category:'military',districts:['military','old_town'],footprint:[4,2],height:3,props:['banner','portcullis']},
 {id:'market_stall',label:'Market Stall',category:'commerce',districts:['market','old_town','slums'],footprint:[2,2],height:1,props:['awning','crates']},
 {id:'warehouse',label:'Warehouse',category:'commerce',districts:['harbor','industrial','market'],footprint:[5,3],height:2,props:['crates','hoist']},
 {id:'dock',label:'Dock',category:'maritime',districts:['harbor'],footprint:[6,2],height:1,props:['bollards','crates']},
 {id:'shipyard',label:'Shipyard',category:'maritime',districts:['harbor','industrial'],footprint:[7,4],height:2,props:['slipway','timber','crane']},
 {id:'temple',label:'Temple',category:'civic',districts:['temple','old_town','civic'],footprint:[5,5],height:4,props:['banner','statue','garden']},
 {id:'workshop',label:'Workshop',category:'industry',districts:['industrial','market','old_town'],footprint:[4,3],height:2,props:['chimney','yard','crates']},
 {id:'farm_cluster',label:'Farm Cluster',category:'agriculture',districts:['outskirts'],footprint:[6,5],height:1,props:['field','fence','hay']},
 {id:'granary',label:'Granary',category:'agriculture',districts:['outskirts','market','industrial'],footprint:[4,4],height:2,props:['sacks','cart']},
 {id:'civic_hall',label:'Civic Hall',category:'civic',districts:['civic','old_town'],footprint:[6,4],height:3,props:['banner','statue','steps']},
 {id:'well',label:'Public Well',category:'utility',districts:['residential','market','old_town','slums','outskirts'],footprint:[2,2],height:1,props:['bucket']},
 {id:'road_segment',label:'Road',category:'utility',districts:['old_town','residential','market','harbor','temple','military','noble','civic','industrial','slums','outskirts'],footprint:[5,1],height:0,props:[]}
];
const MAP=new Map(ARCHETYPES.map(x=>[x.id,Object.freeze({...x,footprint:Object.freeze(x.footprint.slice()),districts:Object.freeze(x.districts.slice()),props:Object.freeze(x.props.slice())})]));
const CULTURE_STYLES=Object.freeze(['imperial','northern','coastal','highland','frontier','mercantile','riverine','steppe']);
const BIOME_STYLES=Object.freeze(['temperate','forest','arid','tundra','steppe','tropical','highland']);
function get(id){return MAP.get(String(id))||null}
function list(category=null){return ARCHETYPES.filter(x=>!category||x.category===category).map(x=>MAP.get(x.id))}
function forDistrict(kind){return ARCHETYPES.filter(x=>x.districts.includes(kind)).map(x=>MAP.get(x.id))}
function validate(){const e=[],seen=new Set;for(const a of ARCHETYPES){if(!a.id||seen.has(a.id))e.push(`archetype id ${a.id}`);seen.add(a.id);if(!a.label||!a.category)e.push(`archetype metadata ${a.id}`);if(!Array.isArray(a.districts)||!a.districts.length)e.push(`archetype districts ${a.id}`)}return e}
return{VERSION,ARCHETYPES:Object.freeze(ARCHETYPES.map(x=>MAP.get(x.id))),MAP,CULTURE_STYLES,BIOME_STYLES,get,list,forDistrict,validate};
});