(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.WorldForgeStructureArchetypes=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const VERSION='4.1.0';
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
const ARCHITECTURE_FAMILIES=Object.freeze({
 imperial:Object.freeze({id:'imperial',label:'Imperial Masonry',primary:'cut stone',roof:'tile',streetPattern:'orthogonal',signature:'courtyard houses, columned civic buildings and formal walls'}),
 northern:Object.freeze({id:'northern',label:'Northern Timber',primary:'timber',roof:'steep shingle',streetPattern:'organic',signature:'longhouses, steep roofs and timber halls'}),
 coastal:Object.freeze({id:'coastal',label:'Maritime Stucco',primary:'plaster and timber',roof:'low tile',streetPattern:'quayside',signature:'bright waterfront houses, warehouses and beacon towers'}),
 highland:Object.freeze({id:'highland',label:'Highland Stone',primary:'rough stone',roof:'slate',streetPattern:'terraced',signature:'stone houses, hill towers and heavy mountain gates'}),
 frontier:Object.freeze({id:'frontier',label:'Frontier Stockade',primary:'timber and earth',roof:'shingle',streetPattern:'defensive',signature:'palisades, timber houses and compact barracks'}),
 mercantile:Object.freeze({id:'mercantile',label:'Mercantile Urban',primary:'brick and timber',roof:'tile',streetPattern:'market grid',signature:'guild houses, arcades and dense covered markets'}),
 riverine:Object.freeze({id:'riverine',label:'Riverine Timber',primary:'timber and plaster',roof:'pitched tile',streetPattern:'waterside',signature:'stilt houses, bridges and riverfront warehouses'}),
 steppe:Object.freeze({id:'steppe',label:'Steppe Court',primary:'felt, timber and earth',roof:'low pitched',streetPattern:'radial',signature:'yurt clusters, khan halls and open ceremonial yards'})
});
const CULTURE_VARIANTS=Object.freeze({
 imperial:Object.freeze({house:'courtyard_house',merchant_house:'arcaded_house',noble_house:'villa',temple:'columned_temple',civic_hall:'forum_hall',watchtower:'stone_tower'}),
 northern:Object.freeze({house:'longhouse',merchant_house:'gable_house',noble_house:'great_hall',temple:'timber_shrine',civic_hall:'timber_hall',watchtower:'beacon_tower'}),
 coastal:Object.freeze({house:'stucco_house',merchant_house:'balcony_house',noble_house:'sea_villa',warehouse:'quayside_warehouse',watchtower:'beacon_tower',temple:'coastal_temple'}),
 highland:Object.freeze({house:'stone_house',merchant_house:'stone_house',noble_house:'tower_house',watchtower:'hill_tower',gate:'mountain_gate',wall_segment:'dry_stone_wall'}),
 frontier:Object.freeze({house:'timber_house',merchant_house:'trading_post',noble_house:'frontier_hall',barracks:'stockade_barracks',watchtower:'wood_watchtower',wall_segment:'palisade',gate:'stockade_gate'}),
 mercantile:Object.freeze({house:'row_house',merchant_house:'guild_house',noble_house:'merchant_palazzo',market_stall:'covered_market',warehouse:'counting_warehouse',civic_hall:'exchange_hall'}),
 riverine:Object.freeze({house:'stilt_house',merchant_house:'river_house',noble_house:'river_manor',warehouse:'river_warehouse',dock:'river_quay',watchtower:'beacon_tower'}),
 steppe:Object.freeze({house:'yurt_cluster',poor_house:'yurt_cluster',merchant_house:'caravan_house',noble_house:'khan_hall',temple:'steppe_shrine',wall_segment:'earthwork'})
});
const VISUAL_VARIANTS=Object.freeze([...new Set(Object.values(CULTURE_VARIANTS).flatMap(x=>Object.values(x)))]);
function get(id){return MAP.get(String(id))||null}
function list(category=null){return ARCHETYPES.filter(x=>!category||x.category===category).map(x=>MAP.get(x.id))}
function forDistrict(kind){return ARCHETYPES.filter(x=>x.districts.includes(kind)).map(x=>MAP.get(x.id))}
function architecture(style='frontier',biome='temperate',flags={}){const family=ARCHITECTURE_FAMILIES[style]||ARCHITECTURE_FAMILIES.frontier,adaptation=biome==='arid'?'heat-adapted':biome==='tundra'?'cold-adapted':biome==='highland'?'mountain-adapted':biome==='tropical'?'rain-adapted':'temperate-adapted';return Object.freeze({...family,adaptation,maritime:!!flags.coastal,riverine:!!flags.river,fortified:!!flags.fortified})}
function resolveVariant(type,style='frontier'){return CULTURE_VARIANTS[style]?.[type]||type}
function validate(){const e=[],seen=new Set;for(const a of ARCHETYPES){if(!a.id||seen.has(a.id))e.push(`archetype id ${a.id}`);seen.add(a.id);if(!a.label||!a.category)e.push(`archetype metadata ${a.id}`);if(!Array.isArray(a.districts)||!a.districts.length)e.push(`archetype districts ${a.id}`)}for(const s of CULTURE_STYLES)if(!ARCHITECTURE_FAMILIES[s])e.push(`architecture family ${s}`);for(const [style,map] of Object.entries(CULTURE_VARIANTS))for(const [type,variant] of Object.entries(map)){if(!MAP.has(type))e.push(`variant base ${style}:${type}`);if(!variant)e.push(`variant id ${style}:${type}`)}return e}
return{VERSION,ARCHETYPES:Object.freeze(ARCHETYPES.map(x=>MAP.get(x.id))),MAP,CULTURE_STYLES,BIOME_STYLES,ARCHITECTURE_FAMILIES,CULTURE_VARIANTS,VISUAL_VARIANTS,get,list,forDistrict,architecture,resolveVariant,validate};
});