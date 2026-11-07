import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {characterAtlas} from '../src/game/animation/CharacterAtlas.ts';

// Deterministic export preparation: crop, register and pack authored drawings.
// Preserve source colour detail; no palette mapping, invented poses or deformation.
const directory=fileURLToPath(new URL('../public/assets/mainmenu/v3/production/',import.meta.url));
const encoded={};
for(const key of ['lantern','cat','vines','soul','foreground'])encoded[key]=(await readFile(`${directory}/source/${key}-v1.png`)).toString('base64');
for(const key of ['sitting','leaning'])encoded[key]=(await readFile(`${directory}/source/gameplay-${key}-v5.png`)).toString('base64');
encoded.gameplay=(await readFile(new URL('../public/assets/'+characterAtlas.image,import.meta.url))).toString('base64');
await mkdir(`${directory}/review`,{recursive:true});
await copyFile(`${directory}/source/background-v1.png`,`${directory}/background-v1.png`);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async({encoded,gameplayAtlas})=>{
  const sources={},exports={},clips={},preparation={};
  for(const [key,data]of Object.entries(encoded)){
   const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);sources[key]={image,c};
  }
  // The generated foreground is one row shorter than the common canvas.
  // Pad with transparency, preserving every drawn pixel and its placement.
  const foreground=document.createElement('canvas');foreground.width=1672;foreground.height=941;
  foreground.getContext('2d').drawImage(sources.foreground.image,0,0);
  exports['foreground-v1.png']=foreground.toDataURL('image/png').split(',')[1];
  const bounds=(key,rect)=>{
   const [x,y,w,h]=rect,p=sources[key].c.getImageData(x,y,w,h).data;let l=w,t=h,r=-1,b=-1;
   for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>=160){l=Math.min(l,px);t=Math.min(t,py);r=Math.max(r,px);b=Math.max(b,py);}
   if(r<l)throw Error(`Empty ${key} source`);return {x:x+l,y:y+t,w:r-l+1,h:b-t+1};
  };
  const cells=(key,columns,rows)=>Array.from({length:columns*rows},(_,i)=>{
   const im=sources[key].image,x=Math.round(i%columns*im.width/columns),y=Math.round(Math.floor(i/columns)*im.height/rows);
   const right=Math.round((i%columns+1)*im.width/columns),bottom=Math.round((Math.floor(i/columns)+1)*im.height/rows);
   return bounds(key,[x,y,right-x,bottom-y]);
  });
  const create=(id,w,h,count,anchor,durations,revision=1)=>{
   const canvas=document.createElement('canvas');canvas.width=w*count;canvas.height=h;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
   const stem=id==='headFire'?'head-fire':id;
   const clip={image:`${stem}-v${revision}.png`,width:canvas.width,height:h,anchor,frames:Array.from({length:count},(_,i)=>({rect:[i*w,0,w,h],durationMs:durations[i%durations.length]}))};
   clips[id]=clip;
   return {c,canvas,clip,finish(preservePixels=false){
    const p=c.getImageData(0,0,canvas.width,canvas.height);
    if(!preservePixels){for(let i=0;i<p.data.length;i+=4)if(p.data[i+3]<32)p.data.fill(0,i,i+4);c.putImageData(p,0,0);}
    exports[clip.image]=canvas.toDataURL('image/png').split(',')[1];
    if(count>1){
     const cols=Math.min(4,count),review=document.createElement('canvas');review.width=w*cols;review.height=h*Math.ceil(count/cols);const rc=review.getContext('2d');rc.fillStyle='#101422';rc.fillRect(0,0,review.width,review.height);
     clip.frames.forEach((frame,i)=>{const x=i%cols*w,y=Math.floor(i/cols)*h;rc.drawImage(canvas,...frame.rect,x,y,w,h);rc.fillStyle='#bdb4ca';rc.font='12px monospace';rc.fillText(String(i+1),x+4,y+14);});
     exports[`review/${stem}-frames-v${revision}.png`]=review.toDataURL('image/png').split(',')[1];
    }
   }};
  };
  const paint=(key,target,b,root,scale,index=0)=>target.c.drawImage(sources[key].image,b.x,b.y,b.w,b.h,index*target.clip.frames[0].rect[2]+target.clip.anchor.x+(b.x-root.x)*scale,target.clip.anchor.y+(b.y-root.y)*scale,b.w*scale,b.h*scale);
  const centroid=(key,b,top,height)=>{
   const p=sources[key].c.getImageData(b.x,Math.round(top),b.w,Math.max(1,Math.round(height))).data;let sum=0,x=0;
   for(let n=0;n<p.length;n+=4)if(p[n+3]>=160){sum++;x+=(n/4)%b.w;}
   return b.x+(sum?x/sum:b.w/2);
  };
  const heroes={},positions={standing:{x:1120,y:722},sitting:{x:1460,y:750},leaning:{x:1355,y:724}};
  const idle=gameplayAtlas.anchors.idle,cell=gameplayAtlas.cell;
  const standing=create('standing',cell,cell,6,{x:idle.x[0],y:idle.y[0]},[125],5);
  standing.c.drawImage(sources.gameplay.image,0,0,cell*6,cell,0,0,cell*6,cell);
  standing.clip.frames.forEach((frame,i)=>frame.anchor={x:idle.x[i],y:idle.y[i]});
  standing.clip.scale=1.35;standing.finish(true);
  // Reuse the live gameplay texture itself. Canvas re-encoding can round
  // translucent RGB differently between browsers; the original has no drift.
  delete exports['standing-v5.png'];
  standing.clip.image='../../../'+gameplayAtlas.image;
  standing.clip.width=gameplayAtlas.width;standing.clip.height=gameplayAtlas.height;
  heroes.standing={body:'standing',position:positions.standing,ground:positions.standing,light:{x:111,y:65}};
  preparation.standing={source:gameplayAtlas.image,row:0,cell,frames:6,pixels:'unchanged gameplay idle row',timing:'125 ms per frame, matching gameplay idle at 8 fps',anchors:idle};
  // Keep a lossless reference strip so identity can be inspected beside the menu.
  exports['source/gameplay-idle-reference-v5.png']=standing.canvas.toDataURL('image/png').split(',')[1];
  for(const key of ['sitting','leaning']){
   const frameBounds=cells(key,3,2),roots=frameBounds.map(b=>({x:centroid(key,b,b.y+b.h*.94,b.h*.06),y:b.y+b.h}));
   const scale=(key==='sitting'?170:190)/Math.max(...frameBounds.map(b=>b.h));
   const target=create(key,209,209,6,{x:104,y:200},[125],5);target.clip.scale=1.35;
   frameBounds.forEach((b,i)=>paint(key,target,b,roots[i],scale,i));
   // Fixed boot/seat folds keep support contacts stable; the whole hero remains
   // one frame at runtime, with all upper flame/cloth drawings intact.
   const supportY=key==='sitting'?130:170;
   for(let i=1;i<6;i++){target.c.clearRect(i*209,supportY,209,209-supportY);target.c.drawImage(target.canvas,0,supportY,209,209-supportY,i*209,supportY,209,209-supportY);}
   target.finish();
   heroes[key]={body:key,position:positions[key],ground:positions[key],light:{x:104,y:key==='sitting'?94:65}};
   preparation[key]={bounds:frameBounds,roots,scale,reference:'gameplay-idle-reference-v5.png',heldSupportRect:[0,supportY,209,209-supportY]};
  }

  for(const key of ['cat','vines','soul']){
   const frameBounds=cells(key,2,2);
   const settings={cat:{w:100,h:66,anchor:{x:50,y:59},maxW:90,maxH:50,d:[2600,220,1800,240]},vines:{w:90,h:172,anchor:{x:45,y:8},maxW:76,maxH:158,d:[650,650,650,650]},soul:{w:44,h:64,anchor:{x:22,y:32},maxW:34,maxH:54,d:[180,180,180,180]}}[key];
   const roots=frameBounds.map(b=>{
    if(key==='vines'){
     const h=Math.max(1,Math.ceil(b.h*.055)),p=sources.vines.c.getImageData(b.x,b.y,b.w,h).data;let x=0,sum=0;
     for(let py=0;py<h;py++)for(let px=0;px<b.w;px++)if(p[(py*b.w+px)*4+3]>=160){sum++;x+=px;}
     return {x:b.x+(sum?x/sum:b.w/2),y:b.y};
    }
    return {x:b.x+b.w/2,y:b.y+(key==='cat'?b.h:b.h/2)};
   });
   let scale=Math.min(settings.maxW/Math.max(...frameBounds.map(b=>b.w)),settings.maxH/Math.max(...frameBounds.map(b=>b.h)));
   frameBounds.forEach((b,i)=>{const root=roots[i];for(const[room,extent]of [[settings.anchor.x-2,root.x-b.x],[settings.w-settings.anchor.x-2,b.x+b.w-root.x],[settings.anchor.y-2,root.y-b.y],[settings.h-settings.anchor.y-2,b.y+b.h-root.y]])if(extent>0)scale=Math.min(scale,room/extent);});
   const target=create(key,settings.w,settings.h,frameBounds.length,settings.anchor,settings.d);
   frameBounds.forEach((b,i)=>paint(key,target,b,roots[i],scale,i));target.finish();preparation[key]={bounds:frameBounds,roots,scale};
  }
  const b=bounds('lantern',[0,0,sources.lantern.image.width,sources.lantern.image.height]),scale=166/b.h;
  const lamp=create('lamp',92,188,1,{x:46,y:10},[1000]);paint('lantern',lamp,b,{x:b.x+b.w/2,y:b.y+6},scale);lamp.finish();preparation.lamp={bounds:b,scale};
  return {exports,preparation,art:{version:1,width:1672,height:941,background:'background-v1.png',foreground:'foreground-v1.png',clips,heroes,lamp:{position:{x:1308,y:136},glass:{x:46,y:112}},clock:{position:{x:1519,y:166},radius:66},board:{position:{x:1488,y:358},width:265,height:80,angle:-.10},cat:{x:1555,y:681},vines:[{x:820,y:760},{x:1004,y:799}]} };
 },{encoded,gameplayAtlas:characterAtlas});
 for(const[file,data]of Object.entries(result.exports))await writeFile(directory+file,Buffer.from(data,'base64'));
 await writeFile(directory+'scene-v1.json',JSON.stringify(result.art,null,2)+'\n');
 await writeFile(directory+'source/export-v1.json',JSON.stringify(result.preparation,null,2)+'\n');
 console.log(JSON.stringify({clips:Object.keys(result.art.clips),heroes:result.art.heroes},null,2));
}finally{await browser.close();}
