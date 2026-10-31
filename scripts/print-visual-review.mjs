import {readFile} from 'node:fs/promises';
for(const name of ['desktop','mobile','failure','legacy']){
  let image;try{image=await readFile(new URL(name==='legacy'?'../test-results/failure.jpg':'../test-results/atlas-'+name+'.jpg',import.meta.url))}catch{continue}
  if(image.length>512000){console.log('Atlas review image is available in the browser artifact: '+name);continue}
  const data=image.toString('base64');
  console.log('ATLAS_IMAGE_BEGIN:'+name);
  for(let i=0;i<data.length;i+=8000)console.log('ATLAS_IMAGE_DATA:'+name+':'+data.slice(i,i+8000));
  console.log('ATLAS_IMAGE_END:'+name);
}
