import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Constrain the imagegen edit to the removed sign assembly. Every pixel outside
// this region is taken directly from the original, preserving existing anchors.
const root='public/assets/mainmenu/confluence-v1/source/',region=[1318,174,278,244],edgeBlend=18;
const encoded=await Promise.all(['plate-v1.png','sign-removal-v2.png'].map(async file=>(await readFile(root+file)).toString('base64')));
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const output=await page.evaluate(async({encoded,region,edgeBlend})=>{
  // The generated edit is one column shorter at the outer edge. Copy its local
  // patch at native scale; the original supplies the full canvas and all edges.
  const images=await Promise.all(encoded.map(async data=>{const im=new Image();im.src='data:image/png;base64,'+data;await im.decode();if(Math.abs(im.width-1672)>1||im.height!==941)throw Error('Edit must preserve scene registration');return im;}));
  const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=941;const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(images[0],0,0);
  const original=c.getImageData(0,0,1672,941).data,[x,y,w,h]=region;
  const patch=document.createElement('canvas');patch.width=w;patch.height=h;const p=patch.getContext('2d');p.drawImage(images[1],x,y,w,h,0,0,w,h);
  const pixels=p.getImageData(0,0,w,h);
  for(let py=0;py<h;py++)for(let px=0;px<w;px++)pixels.data[(py*w+px)*4+3]=Math.round(255*Math.min(1,Math.min(px,py,w-1-px,h-1-py)/edgeBlend));
  p.putImageData(pixels,0,0);c.drawImage(patch,x,y);
  const result=c.getImageData(0,0,1672,941).data;let changed=0;
  for(let py=0;py<941;py++)for(let px=0;px<1672;px++)for(let channel=0;channel<4;channel++){const i=(py*1672+px)*4+channel;if(original[i]!==result[i]){if(px<x||px>=x+w||py<y||py>=y+h)throw Error('Edit escaped the sign region');changed++;}}
  if(!changed)throw Error('Sign edit did not change the scene');return{png:canvas.toDataURL('image/png').split(',')[1],changed};
 },{encoded,region,edgeBlend});
 await writeFile(root+'plate-no-sign-v2.png',Buffer.from(output.png,'base64'));
 await writeFile(root+'sign-removal-export-v2.json',JSON.stringify({original:'plate-v1.png',editedSource:'sign-removal-v2.png',result:'plate-no-sign-v2.png',region,edgeBlend,outsideRegion:'unchanged',changedChannels:output.changed},null,2)+'\n');
 console.log('Prepared sign-free plate; all pixels outside the sign region remain unchanged.');
}finally{await browser.close();}
