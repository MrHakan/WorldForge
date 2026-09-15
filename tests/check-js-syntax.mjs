import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
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

for(const root of roots)await walk(root);
files.sort();
let failed=0;
for(const file of files){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0){
    failed++;
    console.error(`\nSyntax error: ${relative(process.cwd(),file)}`);
    console.error((result.stderr||result.stdout||'Unknown syntax error').trim());
  }
}
if(failed){
  console.error(`\n${failed} of ${files.length} JavaScript files failed syntax validation.`);
  process.exit(1);
}
console.log(`JavaScript syntax OK: ${files.length} files checked.`);
