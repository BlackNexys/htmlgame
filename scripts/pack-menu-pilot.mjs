import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

// Export preparation only: align fresh sprite drawings, hold planted legs,
// rasterize at logical size, and map them to the shared palette. No warped poses.
const directory=fileURLToPath(new URL('../public/assets/mainmenu/v2/',import.meta.url));
const files={body:'hero-body-v1',platform:'platform-v1',kit:'lantern-kit-v1',flame:'hero-flame-v1',cape:'hero-cape-v1'};
const encoded={};for(const [key,name]of Object.entries(files))encoded[key]=(await readFile(`${directory}/source/${name}.png`)).toString('base64');
const palette=JSON.parse(await readFile(`${directory}/palette-v1.json`,'utf8'));
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async({encoded,palette})=>{
  const sources={};
  for(const[key,data]of Object.entries(encoded)){
   const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);sources[key]={image,c};
  }
  const colors=palette.colors.map(hex=>[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16))),cache=new Map();
  const quantize=c=>{
   const data=c.getImageData(0,0,c.canvas.width,c.canvas.height);
   for(let i=0;i<data.data.length;i+=4){
    if(data.data[i+3]<200){data.data[i]=data.data[i+1]=data.data[i+2]=data.data[i+3]=0;continue;}
    const key=data.data[i]*65536+data.data[i+1]*256+data.data[i+2];let chosen=cache.get(key);
    if(!chosen){let best=Infinity;for(const color of colors){const distance=color.reduce((sum,v,n)=>sum+(v-data.data[i+n])**2,0);if(distance<best){best=distance;chosen=color;}}cache.set(key,chosen);}
    data.data.set([...chosen,255],i);
   }
   c.putImageData(data,0,0);
  };
  const bounds=(key,rect)=>{
   const [x,y,width,height]=rect.map(Math.floor),pixels=sources[key].c.getImageData(x,y,width,height).data;
   let left=width,top=height,right=-1,bottom=-1;
   for(let py=0;py<height;py++)for(let px=0;px<width;px++)if(pixels[(py*width+px)*4+3]>=200){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}
   if(right<left)throw Error(`Empty ${key} frame`);
   return {x:x+left,y:y+top,width:right-left+1,height:bottom-top+1};
  };
  const all=key=>[0,0,sources[key].image.width,sources[key].image.height];
  const cells=(key,columns,rows)=>Array.from({length:columns*rows},(_,index)=>{
   const image=sources[key].image,x=Math.round(index%columns*image.width/columns),y=Math.round(Math.floor(index/columns)*image.height/rows);
   const right=Math.round((index%columns+1)*image.width/columns),bottom=Math.round((Math.floor(index/columns)+1)*image.height/rows);
   return bounds(key,[x,y,right-x,bottom-y]);
  });
  const exports={},clips={},preparation={};
  const create=(id,name,width,height,count,anchor,durations)=>{
   const canvas=document.createElement('canvas');canvas.width=width*count;canvas.height=height;
   const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
   const clip={id,name,image:id+'-v1.png',width:canvas.width,height:canvas.height,cell:{width,height},anchor,
    frames:Array.from({length:count},(_,i)=>({rect:[i*width,0,width,height],durationMs:durations[i%durations.length]}))};
   clips[id]=clip;return {canvas,c,clip,finish(){quantize(c);exports[clip.image]=canvas.toDataURL('image/png').split(',')[1];}};
  };
  const platformBounds=bounds('platform',all('platform')),platformScale=304/platformBounds.width;
  const platform=create('platform','Violet stone',320,128,1,{x:0,y:0},[1000]);
  platform.c.drawImage(sources.platform.image,...Object.values(platformBounds),8,8,platformBounds.width*platformScale,platformBounds.height*platformScale);platform.finish();
  preparation.platform={bounds:platformBounds,scale:platformScale};

  const kit=sources.kit.image,postBounds=bounds('kit',[0,0,Math.floor(kit.width*.55),kit.height]);
  const postScale=170/postBounds.height,postAnchor={x:Math.round(8+(735-postBounds.x)*postScale),y:178};
  const hook={x:Math.round(8+(458-postBounds.x)*postScale),y:Math.round(8+(233-postBounds.y)*postScale)};
  const post=create('post','Station hanger',112,192,1,postAnchor,[1000]);
  post.c.drawImage(kit,...Object.values(postBounds),8,8,postBounds.width*postScale,170);post.finish();
  const lampBounds=bounds('kit',[Math.floor(kit.width*.55),0,Math.floor(kit.width*.45),kit.height]),lampScale=44/lampBounds.height;
  const lampAnchor={x:Math.round(6+(1252-lampBounds.x)*lampScale),y:Math.round(6+(282-lampBounds.y)*lampScale)};
  const lamp=create('lamp','Cyan lantern',32,56,1,lampAnchor,[1000]);
  lamp.c.drawImage(kit,...Object.values(lampBounds),6,6,lampBounds.width*lampScale,44);lamp.finish();
  preparation.lantern={postBounds,postScale,postAnchor,hook,lampBounds,lampScale,lampAnchor,glass:{x:16,y:35}};

  const bodyBounds=cells('body',3,2),bodyScale=72/Math.max(...bodyBounds.map(b=>b.height));
  const body=create('body','Planted body idle',128,160,6,{x:56,y:144},[2200,180,180,1200,180,180]);
  const renderBody=(index)=>{
   const b=bodyBounds[index],root={x:b.x+b.width/2,y:b.y+b.height};
   body.c.drawImage(sources.body.image,...Object.values(b),index*128+56-(root.x-b.x)*bodyScale,144-b.height*bodyScale,b.width*bodyScale,b.height*bodyScale);
   return root;
  };
  const bodyRoots=bodyBounds.map((_,index)=>renderBody(index));
  // New-body drawings share held legs as an explicit component of the idle.
  // This removes accidental stance changes while retaining authored upper poses.
  for(let index=1;index<6;index++){
   body.c.clearRect(index*128,113,128,47);
   body.c.drawImage(body.canvas,0,113,128,47,index*128,113,128,47);
  }
  body.finish();preparation.body={bounds:bodyBounds,roots:bodyRoots,scale:bodyScale,heldLegsFromFrame:0,heldLegsStartY:113};

  for(const key of ['flame','cape']){
   const frameBounds=cells(key,4,2),roots=frameBounds.map(b=>{
    if(key==='cape')return {x:b.x+4,y:b.y+4};
    const pixels=sources[key].c.getImageData(b.x,b.y,b.width,b.height).data;let sum=0,x=0,y=0;
    for(let py=0;py<b.height;py++)for(let px=0;px<b.width;px++){
     const n=(py*b.width+px)*4;
     if(pixels[n+3]>=200&&pixels[n]>225&&pixels[n+1]>160&&pixels[n+2]>200){const weight=pixels[n+1]-150;sum+=weight;x+=px*weight;y+=py*weight;}
    }
    if(!sum)throw Error('Flame has no pale attachment core');return {x:b.x+x/sum,y:b.y+y/sum};
   });
   const anchor=key==='flame'?{x:12,y:40}:{x:6,y:8};
   let scale=Infinity;
   frameBounds.forEach((b,i)=>{const root=roots[i];for(const [room,extent]of [[anchor.x-2,root.x-b.x],[62-anchor.x,b.x+b.width-root.x],[anchor.y-2,root.y-b.y],[46-anchor.y,b.y+b.height-root.y]])if(extent>0)scale=Math.min(scale,room/extent);});
   const asset=create(key,key==='flame'?'Soul-flame · 8 drawings':'Burgundy cloth · 8 drawings',64,48,8,anchor,key==='flame'?[83,84,83,84,83,84,83,84]:[150,140,150,160,150,160,170,170]);
   frameBounds.forEach((b,index)=>{const root=roots[index];asset.c.drawImage(sources[key].image,...Object.values(b),index*64+anchor.x-(root.x-b.x)*scale,anchor.y-(root.y-b.y)*scale,b.width*scale,b.height*scale);});
   asset.finish();preparation[key]={bounds:frameBounds,roots,scale};
  }

  // Optional emission overlay is exported separately from the lamp housing.
  const mask=document.createElement('canvas');mask.width=32;mask.height=56;const mc=mask.getContext('2d');mc.drawImage(lamp.canvas,0,0);
  const data=mc.getImageData(0,0,32,56);
  for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];const alpha=data.data[i+3]&&g>r*1.3&&b>r*1.3&&g>100?Math.round((g-80)/175*255):0;data.data.set([179,245,237,Math.max(0,Math.min(255,alpha))],i);}
  mc.putImageData(data,0,0);exports['lamp-emission-v1.png']=mask.toDataURL('image/png').split(',')[1];

  const scene={width:640,height:360,background:'#090d16',hero:{x:432,y:284},platform:{x:320,y:256},post:{x:560,y:282},lamp:{x:560+hook.x-postAnchor.x,y:282+hook.y-postAnchor.y}};
  return {exports,manifest:{version:1,status:'First production corner · art and animation review',scene,hero:{head:{x:56,y:76},cape:{x:64,y:90}},assets:clips,palette,preparation}};
 },{encoded,palette});
 for(const[name,data]of Object.entries(result.exports))await writeFile(`${directory}/${name}`,Buffer.from(data,'base64'));
 await writeFile(`${directory}/pilot-v1.json`,JSON.stringify(result.manifest,null,2)+'\n');
 console.log(JSON.stringify({assets:Object.keys(result.exports),scene:result.manifest.scene,bodyScale:result.manifest.preparation.body.scale,flameScale:result.manifest.preparation.flame.scale,capeScale:result.manifest.preparation.cape.scale}));
}finally{await browser.close();}
