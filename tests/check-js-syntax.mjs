import {readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {availableParallelism} from 'node:os';
import {join,relative} from 'node:path';

const roots=['src','tests'];
const extensions=new Set(['.js','.mjs','.cjs']);
const ignored=new Set(['node_modules','.git']);
const files=[];

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())await walk(path);
    else if([...extensions].some(ext=>entry.name.endsWith(ext)))files.push(path);
  }
}

function check(file){
  return new Promise(resolve=>{
    const child=spawn(process.execPath,['--check',file],{stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>stdout+=chunk);
    child.stderr.on('data',chunk=>stderr+=chunk);
    child.on('error',error=>resolve({file,ok:false,output:error.stack||error.message}));
    child.on('close',code=>resolve({file,ok:code===0,output:(stderr||stdout||'Unknown syntax error').trim()}));
  });
}

async function runPool(items,limit){
  const results=new Array(items.length);
  let next=0;
  async function worker(){
    while(true){
      const index=next++;
      if(index>=items.length)return;
      results[index]=await check(items[index]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return results;
}

for(const root of roots)await walk(root);
files.sort();
const concurrency=Math.max(1,Math.min(8,availableParallelism?.()||2));
const results=await runPool(files,concurrency);
const failures=results.filter(result=>!result.ok);
for(const result of failures){
  console.error(`\nSyntax error: ${relative(process.cwd(),result.file)}`);
  console.error(result.output);
}
if(failures.length){
  console.error(`\n${failures.length} of ${files.length} JavaScript files failed syntax validation.`);
  process.exit(1);
}
console.log(`JavaScript syntax OK: ${files.length} files checked with up to ${concurrency} parallel workers.`);
