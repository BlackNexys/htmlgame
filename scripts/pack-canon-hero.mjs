import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

// Export preparation only: register authored drawings, clean transparent margins
// and pack native cells. No palette reduction, warping or invented poses.
const directory=fileURLToPath(new URL('../public/assets/hero/canon-v1/',import.meta.url));
await mkdir(directory+'review',{recursive:true});
const encoded={};for(const key of ['locomotion','actions','aiming','sitting','leaning','portraits','bootfire'])encoded[key]=(await readFile(directory+`source/${key}-v1.png`)).toString('base64');
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async encoded=>{
  const sources={},exports={},preparation={},clips={};
  for(const[key,data]of Object.entries(encoded)){
   const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);sources[key]={image,c};
  }
  const bounds=(key,rect)=>{
   const[x,y,w,h]=rect,p=sources[key].c.getImageData(x,y,w,h).data;let l=w,t=h,r=-1,b=-1;
   for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>=160){l=Math.min(l,px);t=Math.min(t,py);r=Math.max(r,px);b=Math.max(b,py);}
   if(r<l)throw Error('Empty '+key+' cell');return{x:x+l,y:y+t,w:r-l+1,h:b-t+1};
  };
  const grid=(key,columns,rows)=>Array.from({length:columns*rows},(_,i)=>{
   const im=sources[key].image,x=Math.round(i%columns*im.width/columns),y=Math.round(Math.floor(i/columns)*im.height/rows);
   // Remove detached crop debris from neighbouring drawings, preserving the
   // connected character and small nearby flame flecks. This is matte cleanup.
   if(key==='actions'||key==='aiming'){
    const w=Math.round((i%columns+1)*im.width/columns)-x,h=Math.round((Math.floor(i/columns)+1)*im.height/rows)-y;
    const pixels=sources[key].c.getImageData(x,y,w,h),p=pixels.data,seen=new Uint8Array(w*h);let largest=[];
    for(let n=0;n<w*h;n++)if(!seen[n]&&p[n*4+3]>=160){const q=[n];seen[n]=1;for(let j=0;j<q.length;j++){const k=q[j],px=k%w,py=Math.floor(k/w);for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=px+dx,ny=py+dy,v=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&!seen[v]&&p[v*4+3]>=160){seen[v]=1;q.push(v);}}}if(q.length>largest.length)largest=q;}
    const xs=largest.map(n=>n%w),ys=largest.map(n=>Math.floor(n/w)),left=Math.min(...xs)-8,right=Math.max(...xs)+8,top=Math.min(...ys)-8,bottom=Math.max(...ys)+8;
    for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(px<left||px>right||py<top||py>bottom)p.fill(0,(py*w+px)*4,(py*w+px)*4+4);
    sources[key].c.putImageData(pixels,x,y);sources[key].image=sources[key].c.canvas;
   }
   return bounds(key,[x,y,Math.round((i%columns+1)*im.width/columns)-x,Math.round((Math.floor(i/columns)+1)*im.height/rows)-y]);
  });
  const centroid=(key,b,top,height,predicate=()=>true)=>{
   const h=Math.max(1,Math.round(height)),p=sources[key].c.getImageData(b.x,Math.round(top),b.w,h).data;let sum=0,x=0,y=0;
   for(let py=0;py<h;py++)for(let px=0;px<b.w;px++){const n=(py*b.w+px)*4;if(p[n+3]>=160&&predicate(p[n],p[n+1],p[n+2])){sum++;x+=px;y+=py;}}
   return sum?{x:b.x+x/sum,y:Math.round(top)+y/sum}:undefined;
  };
  const root=(key,b)=>({x:centroid(key,b,b.y+b.h*.94,b.h*.06)?.x??b.x+b.w/2,y:b.y+b.h});
  const vial=(key,b)=>centroid(key,b,b.y,b.h,(r,g,blue)=>g>100&&blue>90&&g>r*1.6&&blue>r*1.5);
  const make=(file,w,h)=>{
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
   return{canvas,c,finish(){const p=c.getImageData(0,0,w,h);for(let n=0;n<p.data.length;n+=4){if(p.data[n+3]<160)p.data.fill(0,n,n+4);else p.data[n+3]=255;}c.putImageData(p,0,0);exports[file]=canvas.toDataURL('image/png').split(',')[1];}};
  };
  const paint=(key,target,b,at,scale,x,y)=>target.c.drawImage(sources[key].image,b.x,b.y,b.w,b.h,x+(b.x-at.x)*scale,y+(b.y-at.y)*scale,b.w*scale,b.h*scale);
  const locomotion=grid('locomotion',6,3),actions=grid('actions',6,4),aiming=grid('aiming',6,6);
  const scales={locomotion:185/Math.max(...locomotion.slice(0,6).map(b=>b.h)),actions:185/Math.max(...actions.slice(6,12).map(b=>b.h)),aiming:185/Math.max(...aiming.slice(18,24).map(b=>b.h))};
  const cell=256,size=98,anchor={x:128,y:240};
  const base=make('gameplay-v1.png',cell*6,cell*7),aim=make('aiming-v1.png',cell*6,cell*6);
  const anchors={},bootRows=[];
  const rows=[['idle','locomotion',0],['run','locomotion',1],['air','actions',0],['attack','actions',1],['hurt','actions',2],['defeat','actions',3],['sprint','locomotion',2]];
  const cellsByKey={locomotion,actions,aiming};
  const idleRoot=root('locomotion',locomotion[0]),idleVial=vial('locomotion',locomotion[0]);
  const vialToGround=idleVial?(idleRoot.y-idleVial.y)*scales.locomotion:65;
  for(const[row,[name,key,sourceRow]]of rows.entries()){
   const frameBounds=cellsByKey[key].slice(sourceRow*6,sourceRow*6+6),scale=scales[key],roots=[];
   frameBounds.forEach((b,column)=>{
    let at=root(key,b);
    if(name==='air'&&column>0&&column<5){const v=vial(key,b);if(v)at={x:v.x+(idleRoot.x-(idleVial?.x??idleRoot.x))*scales.locomotion/scale,y:v.y+vialToGround/scale};}
    roots.push(at);paint(key,base,b,at,scale,column*cell+anchor.x,row*cell+anchor.y);
   });
   anchors[name]={x:Array(6).fill(anchor.x),y:Array(6).fill(anchor.y),mirror:false};preparation[name]={source:key,bounds:frameBounds,roots,scale};
  }
  const aimRows=[];
  for(let row=0;row<6;row++){
   const frameBounds=aiming.slice(row*6,row*6+6),roots=[];
   frameBounds.forEach((b,column)=>{let at=root('aiming',b);if(row>=4){const v=vial('aiming',b);if(v)at={x:v.x+(idleRoot.x-(idleVial?.x??idleRoot.x))*scales.locomotion/scales.aiming,y:v.y+vialToGround/scales.aiming};}roots.push(at);paint('aiming',aim,b,at,scales.aiming,column*cell+anchor.x,row*cell+anchor.y);});
   aimRows.push({x:Array(6).fill(anchor.x),y:Array(6).fill(anchor.y),sourceY:row*cell,height:cell});preparation['aim'+row]={source:'aiming',bounds:frameBounds,roots,scale:scales.aiming};
  }
  base.finish();aim.finish();
  const idlePreview=make('idle-v1.png',cell,cell);idlePreview.c.drawImage(base.canvas,0,0,cell,cell,0,0,cell,cell);idlePreview.finish();
  // Locate boots in the lower-body drawing for both running cycles. The review
  // sheet shows these attachment markers so packing errors can be inspected.
  const boots=(row,column)=>{
   const p=base.c.getImageData(column*cell,row*cell,cell,cell).data,seen=new Uint8Array(cell*cell),parts=[];
   const match=n=>{const i=n*4;return p[i+3]>=160&&p[i]<110&&p[i+1]<95&&p[i+2]<120&&Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2])<65;};
   const top=anchor.y-65;
   for(let y=top;y<cell;y++)for(let x=0;x<cell;x++){const start=y*cell+x;if(seen[start]||!match(start))continue;seen[start]=1;const queue=[start];let maxY=y,l=x,r=x;
    for(let i=0;i<queue.length;i++){const n=queue[i],px=n%cell,py=Math.floor(n/cell);maxY=Math.max(maxY,py);l=Math.min(l,px);r=Math.max(r,px);for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=px+dx,ny=py+dy,k=ny*cell+nx;if(nx>=0&&nx<cell&&ny>=top&&ny<cell&&!seen[k]&&match(k)){seen[k]=1;queue.push(k);}}}
    if(queue.length>=7)parts.push({x:(l+r)/2,y:maxY-2,area:queue.length});
   }
   parts.sort((a,b)=>b.y-a.y||b.area-a.area);const chosen=[];
   for(const part of parts)if(!chosen.some(p=>Math.abs(p.x-part.x)<13)&&chosen.length<2)chosen.push({x:Math.round(part.x),y:part.y});
   if(chosen.length<2){const centre=chosen[0]??{x:anchor.x,y:anchor.y-2};chosen.push({x:centre.x-18,y:centre.y-8});}
   return chosen.slice(0,2);
  };
  for(let row=0;row<7;row++)bootRows.push(Array.from({length:6},(_,column)=>boots(row,column)));
  // Reviewed sole centres for the two locomotion cycles; automatic dark-cluster
  // detection can otherwise choose trouser folds between the feet.
  bootRows[1]=[[[88,235],[163,225]],[[145,235],[129,203]],[[132,235],[146,207]],[[123,235],[151,202]],[[133,235],[150,201]],[[144,235],[151,208]]].map(pair=>pair.map(([x,y])=>({x,y})));
  bootRows[6]=[[[78,235],[170,229]],[[136,235],[153,211]],[[135,235],[160,205]],[[122,235],[155,200]],[[137,235],[153,201]],[[146,235],[158,212]]].map(pair=>pair.map(([x,y])=>({x,y})));
  const contact=(key,target,count,rows,withBoots=false)=>{
   const review=make('review/'+key+'-v1.png',cell*6,cell*rows);review.c.fillStyle='#101422';review.c.fillRect(0,0,review.canvas.width,review.canvas.height);review.c.drawImage(target.canvas,0,0);
   for(let row=0;row<rows;row++)for(let column=0;column<count;column++){
    review.c.strokeStyle='#454054';review.c.strokeRect(column*cell+.5,row*cell+.5,cell-1,cell-1);
    if(withBoots)bootRows[row][column].forEach((p,i)=>{review.c.fillStyle=i?'#63dfeb':'#fff0f8';review.c.fillRect(column*cell+p.x-2,row*cell+p.y,5,1);review.c.fillRect(column*cell+p.x,row*cell+p.y-2,1,5);});
   }
   exports['review/'+key+'-v1.png']=review.canvas.toDataURL('image/png').split(',')[1];
  };
  contact('gameplay',base,6,7,true);contact('aiming',aim,6,6);
  for(const key of ['sitting','leaning']){
   const frameBounds=grid(key,3,2),scale=(key==='sitting'?170:185)/Math.max(...frameBounds.map(b=>b.h)),roots=frameBounds.map(b=>root(key,b));
   const target=make(key+'-v1.png',cell*6,cell);frameBounds.forEach((b,i)=>paint(key,target,b,roots[i],scale,i*cell+anchor.x,anchor.y));
   const held=key==='sitting'?155:205;
   for(let i=1;i<6;i++){target.c.clearRect(i*cell,held,cell,cell-held);target.c.drawImage(target.canvas,0,held,cell,cell-held,i*cell,held,cell,cell-held);}
   target.finish();clips[key]={image:key+'-v1.png',width:cell*6,height:cell,anchor,scale:1.35,mirror:true,frames:Array.from({length:6},(_,i)=>({rect:[i*cell,0,cell,cell],durationMs:125}))};preparation[key]={bounds:frameBounds,roots,scale,heldSupportY:held};
  }
  const portraits=make('portraits-v1.png',1024,512),portraitBounds=grid('portraits',2,2);
  const portraitScale=Math.min(240/Math.max(...portraitBounds.map(b=>b.w)),244/Math.max(...portraitBounds.map(b=>b.h)));
  portraitBounds.forEach((b,i)=>paint('portraits',portraits,b,{x:b.x+b.w/2,y:b.y+b.h},portraitScale,i*256+128,252));portraits.finish();preparation.portraits={bounds:portraitBounds,scale:portraitScale,layout:'4 columns, 2 rows; hero expressions in row 0; lower row transparent'};
  const fire=make('bootfire-v1.png',32*6,24),fireBounds=grid('bootfire',3,2),fireScale=Math.min(28/Math.max(...fireBounds.map(b=>b.w)),20/Math.max(...fireBounds.map(b=>b.h)));
  fireBounds.forEach((b,i)=>paint('bootfire',fire,b,{x:b.x+b.w,y:b.y+b.h},fireScale,i*32+30,22));fire.finish();preparation.bootfire={bounds:fireBounds,scale:fireScale,anchor:{x:30,y:22},cell:{width:32,height:24},frames:6};
  return{exports,preparation,clips,base:{image:'hero/canon-v1/gameplay-v1.png',width:cell*6,height:cell*7,cell,size,hip:-24,anchors,boots:bootRows},aim:{image:'hero/canon-v1/aiming-v1.png',width:cell*6,height:cell*6,cell,size,rows:aimRows}};
 },encoded);
 for(const[file,data]of Object.entries(result.exports))await writeFile(directory+file,Buffer.from(data,'base64'));
 await writeFile(directory+'export-v1.json',JSON.stringify({preparation:result.preparation,menuClips:result.clips},null,2)+'\n');
 await writeFile(directory+'atlas-v1.json',JSON.stringify({base:result.base,aim:result.aim,menuClips:result.clips},null,2)+'\n');
 await writeFile('src/game/animation/CharacterAtlas.ts','/** Canon atlas: authored whole-character frames, stable roots and boot attachments. */\nexport const characterAtlas = '+JSON.stringify(result.base,null,2)+' as const;\n');
 await writeFile('src/game/animation/CharacterAimAtlas.ts','/** Canon companion: crouch and directional firing at the same pixel scale. */\nexport const characterAimAtlas = '+JSON.stringify(result.aim,null,2)+' as const;\n');
 console.log('Packed canon gameplay, aiming, menu, portrait and boot-flame assets.');
}finally{await browser.close();}
