import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Deterministic export preparation: crop, register, hold contact pixels and pack
// authored drawings. Creative changes belong in the preserved imagegen sources.
const root='public/assets/mainmenu/confluence-v1/';await mkdir(root+'review',{recursive:true});
await copyFile('public/assets/mainmenu/v3/production/vines-v1.png',root+'vines-v1.png');
const encoded={};for(const key of ['plate','cole','cat','water','outfall','reflections','train'])encoded[key]=(await readFile(root+'source/'+(key==='plate'?'plate-no-sign-v2.png':key+'-v1.png'))).toString('base64');
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async encoded=>{
  const sources={},exports={},images={},clips={},preparation={};
  for(const[key,data]of Object.entries(encoded)){const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);sources[key]={image,c};}
  const bounds=(key,rect,threshold=160)=>{const[x,y,w,h]=rect,p=sources[key].c.getImageData(x,y,w,h).data;let l=w,t=h,r=-1,b=-1;for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>=threshold){l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}if(r<l)throw Error('Empty '+key+' frame');return{x:x+l,y:y+t,w:r-l+1,h:b-t+1};};
  const grid=(key,cols,rows)=>Array.from({length:cols*rows},(_,i)=>{const im=sources[key].image,x=Math.round(i%cols*im.width/cols),y=Math.round(Math.floor(i/cols)*im.height/rows),w=Math.round((i%cols+1)*im.width/cols)-x,h=Math.round((Math.floor(i/cols)+1)*im.height/rows)-y;return bounds(key,[x,y,w,h]);});
  const create=(id,w,h,optional=false)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;images[id]={file:id+'-v1.png',width:w,height:h,...optional?{optional:true}:{}};return{canvas,c,finish(threshold=160){const p=c.getImageData(0,0,w,h);for(let i=0;i<p.data.length;i+=4)if(p.data[i+3]<threshold)p.data.fill(0,i,i+4);else if(threshold>=160)p.data[i+3]=255;c.putImageData(p,0,0);exports[id+'-v1.png']=canvas.toDataURL('image/png').split(',')[1];}};};
  const root=(key,b)=>{const h=Math.max(1,Math.ceil(b.h*.055)),y=b.y+b.h-h,p=sources[key].c.getImageData(b.x,y,b.w,h).data;let sum=0,x=0;for(let i=0;i<p.length;i+=4)if(p[i+3]>=160){sum++;x+=i/4%b.w;}return{x:b.x+(sum?x/sum:b.w/2),y:b.y+b.h};};
  const pack=(id,cols,rows,w,h,at,maxW,maxH,duration,position,holdY,optional=false)=>{
   const frames=grid(id,cols,rows),scale=Math.min(maxW/Math.max(...frames.map(b=>b.w)),maxH/Math.max(...frames.map(b=>b.h))),roots=frames.map(b=>root(id,b)),target=create(id,w*frames.length,h,optional);
   frames.forEach((b,i)=>target.c.drawImage(sources[id].image,b.x,b.y,b.w,b.h,i*w+at.x+(b.x-roots[i].x)*scale,at.y+(b.y-roots[i].y)*scale,b.w*scale,b.h*scale));
   if(holdY!==undefined)for(let i=1;i<frames.length;i++){target.c.clearRect(i*w,holdY,w,h-holdY);target.c.drawImage(target.canvas,0,holdY,w,h-holdY,i*w,holdY,w,h-holdY);}
   target.finish(id==='reflections'?32:160);
   const clip={image:id,width:target.canvas.width,height:h,anchor:at,position,frames:frames.map((_,i)=>({rect:[i*w,0,w,h],durationMs:duration}))};clips[id]=clip;
   preparation[id]={bounds:frames,roots,scale,heldSupportY:holdY};
   const review=document.createElement('canvas');review.width=w*4;review.height=h*Math.ceil(frames.length/4);const c=review.getContext('2d');c.fillStyle='#101724';c.fillRect(0,0,review.width,review.height);frames.forEach((_,i)=>{c.drawImage(target.canvas,i*w,0,w,h,i%4*w,Math.floor(i/4)*h,w,h);c.strokeStyle='#344554';c.strokeRect(i%4*w+.5,Math.floor(i/4)*h+.5,w-1,h-1);});exports['review/'+id+'-v1.png']=review.toDataURL('image/png').split(',')[1];
   return target;
  };
  if(sources.plate.image.width!==1672||sources.plate.image.height!==941)throw Error('Background must retain the approved scene dimensions');
  images.plate={file:'plate-v2.png',width:1672,height:941};
  const cole=pack('cole',4,2,512,512,{x:200,y:488},340,420,175,{x:1255,y:780},310);
  const counts=[];
  for(let frame=0;frame<8;frame++){
   const p=cole.c.getImageData(frame*512,0,512,300).data;let sum=0,x=0,y=0;
   for(let py=0;py<300;py++)for(let px=0;px<512;px++){const i=(py*512+px)*4;if(p[i+3]>=160&&p[i]>130&&p[i+2]>60&&p[i]>p[i+1]*1.6){sum++;x+=px;y+=py;}}
   clips.cole.frames[frame].emitter={x:Math.round(x/Math.max(1,sum)),y:Math.round(y/Math.max(1,sum))};counts.push(sum);
  }
  clips.cole.frames.forEach((f,i)=>f.intensity=Number((.72+.28*counts[i]/Math.max(...counts)).toFixed(3)));
  pack('cat',4,2,256,160,{x:128,y:145},142,83,350,{x:1520,y:646},130);
  pack('outfall',4,2,160,192,{x:80,y:174},100,140,80,{x:558,y:704});
  pack('reflections',4,2,384,160,{x:192,y:145},330,105,175,{x:1300,y:908},undefined,true);
  const water=create('water',256*8,128);clips.water={image:'water',width:2048,height:128,anchor:{x:0,y:0},position:{x:0,y:680},frames:[]};
  for(let i=0;i<8;i++){const im=sources.water.image,x=Math.round(i%4*im.width/4)+3,y=Math.round(Math.floor(i/4)*im.height/2)+3,w=Math.round((i%4+1)*im.width/4)-x-3,h=Math.round((Math.floor(i/4)+1)*im.height/2)-y-3;water.c.drawImage(im,x,y,w,h,i*256,0,256,128);clips.water.frames.push({rect:[i*256,0,256,128],durationMs:190});}water.finish();
  const b=bounds('train',[0,0,sources.train.image.width,sources.train.image.height]),train=create('train',224,40,true),scale=Math.min(210/b.w,31/b.h);train.c.drawImage(sources.train.image,b.x,b.y,b.w,b.h,7,36-b.h*scale,b.w*scale,b.h*scale);train.finish();clips.train={image:'train',width:224,height:40,anchor:{x:0,y:36},position:{x:580,y:313},frames:[{rect:[0,0,224,40],durationMs:1000}]};preparation.train={bounds:b,scale};
  // Physical front bench supports, cropped from the clean plate. The cloak
  // drapes in front of the central seat lip, which must not be drawn over it.
  const front=create('bench-front',560,152);front.c.save();front.c.beginPath();for(const[x,y,w,h]of [[1137,650,39,124],[1555,652,45,132],[1590,650,44,30]])front.c.rect(x-1120,y-640,w,h);front.c.clip();front.c.drawImage(sources.plate.image,-1120,-640);front.c.restore();front.finish();
  images.vines={file:'vines-v1.png',width:360,height:172,optional:true};clips.vines={image:'vines',width:360,height:172,anchor:{x:45,y:8},position:{x:1650,y:665},scale:.45,frames:Array.from({length:4},(_,i)=>({rect:[i*90,0,90,172],durationMs:850}))};
  const points=items=>items.map(([x,y])=>({x,y}));
  const canal=points([[0,744],[190,727],[520,703],[700,683],[887,669],[887,709],[910,725],[881,737],[854,741],[809,756],[782,765],[745,773],[735,781],[695,792],[689,798],[643,808],[632,819],[584,827],[571,838],[533,848],[525,857],[477,867],[465,878],[428,891],[421,899],[391,911],[383,922],[369,927],[361,941],[0,941]]);
  const wet=points([[1065,770],[1664,774],[1672,941],[950,941]]);
  const layers=[
   {id:'city-station',kind:'image',image:'plate',position:{x:0,y:0}},
   {id:'train',kind:'train',clip:'train',from:{x:345,y:313},to:{x:1060,y:313},firstMs:18000,durationMs:16000,gapMs:[25000,45000],mask:points([[590,277],[948,277],[948,315],[590,315]])},
   {id:'mist',kind:'mist',region:[545,610,430,110],mask:points([[500,605],[1005,605],[1005,735],[500,735]])},
   {id:'canal',kind:'water',clip:'water',speed:16,opacity:.66,mask:canal},
   {id:'outfall',kind:'clip',clip:'outfall'},
   {id:'wet-reflections',kind:'reflection',clip:'reflections',sourceClip:'cole',opacity:.6,mask:wet},
   {id:'contacts',kind:'shadows',contacts:[{position:{x:1327,y:653},width:125,height:14,opacity:.36},{position:{x:1205,y:780},width:76,height:10,opacity:.42},{position:{x:1300,y:780},width:72,height:10,opacity:.42},{position:{x:1520,y:647},width:155,height:8,opacity:.32}]},
   {id:'cole',kind:'clip',clip:'cole'},
   {id:'cat',kind:'clip',clip:'cat',offsetMs:420},
   {id:'bench-front',kind:'image',image:'bench-front',position:{x:1120,y:640}},
   {id:'foliage',kind:'clip',clip:'vines',offsetMs:730},
   {id:'local-light',kind:'lights',sourceClip:'cole',points:[{position:{x:1226,y:309},radius:60,color:'#f3bc6c',opacity:.025},{position:{x:563,y:699},radius:70,color:'#4ce9ec',opacity:.04}]},
   {id:'terminal',kind:'screen',position:{x:1102,y:562},width:38,height:26,angle:-.1},
   {id:'sleep',kind:'sleep',position:{x:1534,y:563}}
  ];
  return{exports,preparation,art:{version:2,width:1672,height:941,poster:'poster-v2.png',images,clips,layers}};
 },encoded);
 for(const[file,data]of Object.entries(result.exports))await writeFile(root+file,Buffer.from(data,'base64'));
 await copyFile(root+'source/plate-no-sign-v2.png',root+'plate-v2.png');
 await writeFile(root+'scene-v2.json',JSON.stringify(result.art,null,2)+'\n');
 await writeFile(root+'source/export-v1.json',JSON.stringify(result.preparation,null,2)+'\n');
 console.log('Packed Confluence title art: '+Object.keys(result.art.clips).join(', '));
}finally{await browser.close();}
