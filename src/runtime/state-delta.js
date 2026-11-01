(function(root){
'use strict';
const STATIC=new Set(['layers','settings','summary','rivers','roads','settlements','name','schemaVersion','engineVersion']);
const object=v=>v!==null&&typeof v==='object';
function capture(value,field=''){
 if(!object(value))return{value};
 const children=new Map();for(const key of Object.keys(value))children.set(key,field==='snapshots'?{ref:value[key],opaque:true,signature:Number(key)===value.length-1?JSON.stringify(value[key]):null}:capture(value[key],key));
 return{ref:value,array:Array.isArray(value),length:value.length,children};
}
class Tracker{
 constructor(world){this.nodes=new Map();this.epoch=world.endless?.epochOffset||0;for(const key of Object.keys(world))if(!STATIC.has(key))this.nodes.set(key,capture(world[key]))}
 changes(world){
  const ops=[],epoch=world.endless?.epochOffset||0,rebased=epoch!==this.epoch;this.epoch=epoch;
  const visit=(value,prev,path,immutable=false)=>{
   if(!object(value)){if(!prev||prev.children||!Object.is(prev.value,value))ops.push(['set',path,value]);return{value}}
   if(immutable){const signature=Number(value.year)>=world.history.currentYear?JSON.stringify(value):null;if(!rebased&&prev?.ref===value&&(Number(value.year)<world.history.currentYear||prev.signature===signature))return prev;ops.push(['set',path,value]);return{ref:value,opaque:true,signature}}
   if(!prev?.children||Array.isArray(value)!==prev.array){ops.push(['set',path,value]);return capture(value,path.at(-1))}
   // Completed replay snapshots are immutable between epoch rebases. They can be
   // retained by identity rather than rescanned with every live update.

   const keys=Object.keys(value),present=new Set(keys);
   if(!prev.array){
    // Rebuilt job/market dictionaries can insert a new key between existing
    // keys. Preserve iteration order: allocation tie-breaks and fingerprints use it.
    const order=[...prev.children.keys()].filter(k=>present.has(k)).concat(keys.filter(k=>!prev.children.has(k)));
    if(keys.some((key,i)=>key!==order[i])){ops.push(['set',path,value]);return capture(value,path.at(-1))}
   }
   for(const key of keys){const child=path.concat(key);prev.children.set(key,visit(value[key],prev.children.get(key),child,path.at(-1)==='snapshots'))}
   for(const key of prev.children.keys())if(!present.has(key)){if(!prev.array)ops.push(['delete',path.concat(key)]);prev.children.delete(key)}
   if(prev.array&&prev.length!==value.length)ops.push(['set',path.concat('length'),value.length]);
   prev.ref=value;prev.length=value.length;return prev;
  };
  for(const key of Object.keys(world))if(!STATIC.has(key))this.nodes.set(key,visit(world[key],this.nodes.get(key),[key]));
  for(const key of this.nodes.keys())if(!Object.hasOwn(world,key)){ops.push(['delete',[key]]);this.nodes.delete(key)}
  return ops;
 }
}
function apply(world,ops){
 const put=(parent,key,value)=>{const descriptor=Object.getOwnPropertyDescriptor(parent,key);if(descriptor?.writable)parent[key]=value;else Object.defineProperty(parent,key,{value,writable:true,configurable:true,enumerable:true})};
 for(const [type,path,value]of ops){
  if(!path.length||STATIC.has(path[0]))throw new Error('Invalid simulation delta');
  let parent=world;
  for(let i=0;i<path.length-1;i++){
   const key=path[i];if(!Object.hasOwn(parent,key)||!object(parent[key]))throw new Error('Out-of-order simulation delta');
   let child=parent[key];const next=Object.getOwnPropertyDescriptor(child,path[i+1]);
   // Engine profiles contain frozen/read-only derived flags. Replace their small
   // container instead of attempting to redefine an immutable property in place.
   if(Object.isFrozen(child)||(!Object.isExtensible(child)&&!next)||(next&&(!next.writable||(type==='delete'&&!next.configurable)))){child=Array.isArray(child)?[...child]:{...child};put(parent,key,child)}
   parent=child;
  }
  const key=path.at(-1);
  if(type==='delete')Reflect.deleteProperty(parent,key);
  else if(Array.isArray(parent)&&key==='length')parent.length=value;
  else put(parent,key,value);
 }
 return world;
}
root.WorldForgeStateDelta={Tracker,apply,STATIC};
if(typeof module!=='undefined'&&module.exports)module.exports=root.WorldForgeStateDelta;
})(typeof window!=='undefined'?window:globalThis);
