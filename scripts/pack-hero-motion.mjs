import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Deterministic export preparation: crop, register at the hip, pack, and record sockets.
// Original generated images and v1 exports remain untouched.
const root='public/assets/hero/';
const data={};
for(const [key,path] of Object.entries({motion:'canon-v2/source/motion-v2.png',held:'canon-v2/source/aim-v2.png',base:'canon-v1/gameplay-v1.png',aim:'canon-v1/aiming-v1.png'}))data[key]=(await readFile(root+path)).toString('base64');
const old=JSON.parse(await readFile(root+'canon-v1/atlas-v1.json','utf8'));
const browser=await chromium.launch();
try{
const page=await browser.newPage();
const result=await page.evaluate(async({data,old})=>{
 const sources={};
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;return {c,ctx};};
 for(const [key,encoded] of Object.entries(data)){const im=new Image();im.src='data:image/png;base64,'+encoded;await im.decode();const s=canvas(im.width,im.height);s.ctx.drawImage(im,0,0);sources[key]=s;}
 function region(key,x,y,w,h){const p=sources[key].ctx.getImageData(x,y,w,h);let l=w,t=h,r=-1,b=-1,sx=0,sy=0,n=0;
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*4;if(p.data[i+3]<160){p.data.fill(0,i,i+4);continue;}p.data[i+3]=255;l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);
   const [red,g,blue]=p.data.slice(i,i+3);if(g>110&&blue>100&&g>red*1.6&&blue>red*1.5){sx+=px;sy+=py;n++;}}
  sources[key].ctx.putImageData(p,x,y);
  if(!n)throw Error('Missing hip vial '+key+' '+x+','+y);
  return {x:x+l,y:y+t,w:r-l+1,h:b-t+1,hip:{x:x+sx/n,y:y+sy/n}};
 }
 function grid(key,cols,rows){const {width,height}=sources[key].c;return Array.from({length:cols*rows},(_,i)=>{const x=Math.round(i%cols*width/cols),y=Math.round(Math.floor(i/cols)*height/rows);return region(key,x,y,Math.round((i%cols+1)*width/cols)-x,Math.round((Math.floor(i/cols)+1)*height/rows)-y);});}
 const idle=region('base',0,0,256,256),hip={x:Math.round(idle.hip.x),y:Math.round(idle.hip.y)};
 const motion=grid('motion',8,2),held=grid('held',5,3);
 const scaleMotion=185/[...motion.slice(0,8)].map(b=>b.h).sort((a,b)=>a-b)[4];
 const scaleHeld=185/Math.max(...held.slice(0,5).map(b=>b.h));
 const base=canvas(2048,1792),aim=canvas(1536,2304);
 base.ctx.drawImage(sources.base.c,0,0);aim.ctx.drawImage(sources.aim.c,0,0);
 // Copy old rows individually: the larger row stride does not change source cells.
 for(let row=0;row<7;row++){base.ctx.clearRect(0,row*256,2048,256);base.ctx.drawImage(sources.base.c,0,row*256,1536,256,0,row*256,1536,256);}
 function paint(key,b,target,col,row,scale,bob=0){
  // Contact poses cannot sink below the shared ground line. Flight poses stay lifted.
  let y=Math.round(hip.y+(b.y-b.hip.y)*scale+bob),height=Math.round(b.h*scale);
  if(key==='motion')y=Math.min(y,240-height);
  target.ctx.drawImage(sources[key].c,b.x,b.y,b.w,b.h,Math.round(col*256+hip.x+(b.x-b.hip.x)*scale),row*256+y,Math.round(b.w*scale),height);
 }
 for(let row=0;row<2;row++){const dest=row?6:1;base.ctx.clearRect(0,dest*256,2048,256);for(let col=0;col<8;col++)paint('motion',motion[row*8+col],base,col,dest,scaleMotion,[0,2,0,-2,0,2,0,-2][col]);}
 // The legacy action sheet was drawn at a larger anatomical scale than idle.
 // Normalize the complete jump drawings, not their flame-dependent bounding height.
 // Flight remains registered at the hip; takeoff/landing retain ground contact.
 const airScale=.8,airRegistration=[];
 for(let col=0;col<6;col++){
  const b=region('base',col*256,512,256,256);
  const grounded=col===0||col===5;
  const pivot=grounded?{x:128,y:240}:{x:b.hip.x-col*256,y:b.hip.y-512};
  const x=Math.round(pivot.x+(b.x-col*256-pivot.x)*airScale);
  const y=Math.round(pivot.y+(b.y-512-pivot.y)*airScale);
  base.ctx.clearRect(col*256,512,256,256);
  base.ctx.drawImage(sources.base.c,b.x,b.y,b.w,b.h,col*256+x,512+y,Math.round(b.w*airScale),Math.round(b.h*airScale));
  airRegistration.push({scale:airScale,pivot,grounded});
 }
 for(let row=0;row<3;row++)for(let col=0;col<5;col++)paint('held',held[row*5+col],aim,col,row+6,scaleHeld);
 const meta=structuredClone(old);meta.base.image='hero/canon-v2/gameplay-v2.png';meta.base.width=2048;
 meta.aim.image='hero/canon-v2/aiming-v2.png';meta.aim.height=2304;
 for(const name of ['run','sprint'])meta.base.anchors[name]={x:Array(8).fill(128),y:Array(8).fill(240),mirror:false};
 for(let row=6;row<9;row++)meta.aim.rows.push({x:Array(6).fill(128),y:Array(6).fill(240),sourceY:row*256,height:256});
 // Reviewed sole centres. A wide boot must not be mistaken for two feet.
 const soles={
  1:[[[73,229],[165,235]],[[97,219],[141,236]],[[125,236],[147,196]],[[103,234],[129,213]],[[73,227],[166,237]],[[103,217],[139,235]],[[114,237],[135,201]],[[100,231],[132,211]]],
  6:[[[57,233],[151,233]],[[104,232],[143,202]],[[94,236],[129,214]],[[84,230],[129,211]],[[61,233],[174,234]],[[103,231],[145,203]],[[90,237],[132,216]],[[83,232],[135,209]]],
 };
 for(const row of [1,6])meta.base.boots[row]=soles[row].map(pair=>pair.map(([x,y])=>({x,y})));
 const output={};for(const [name,obj] of [['gameplay-v2',base],['aiming-v2',aim]])output[name]=obj.c.toDataURL().split(',')[1];
 const review=canvas(2048,512);review.ctx.fillStyle='#151d2c';review.ctx.fillRect(0,0,2048,512);for(let r=0;r<2;r++)review.ctx.drawImage(base.c,0,(r?6:1)*256,2048,256,0,r*256,2048,256);
 for(let r=0;r<2;r++)for(let col=0;col<8;col++){
  for(let n=32;n<256;n+=32){review.ctx.strokeStyle='#ffffff20';review.ctx.beginPath();review.ctx.moveTo(col*256+n,r*256);review.ctx.lineTo(col*256+n,(r+1)*256);review.ctx.moveTo(col*256,r*256+n);review.ctx.lineTo((col+1)*256,r*256+n);review.ctx.stroke();review.ctx.fillStyle='#ffffff90';review.ctx.font='9px monospace';review.ctx.fillText(String(n),col*256+n,r*256+10);review.ctx.fillText(String(n),col*256,r*256+n);}
  for(const sole of meta.base.boots[r?6:1][col]){review.ctx.fillStyle='#67f9ff';review.ctx.fillRect(col*256+sole.x-2,r*256+sole.y,5,1);}
 }
 output.review=review.c.toDataURL().split(',')[1];
 const reviewAim=canvas(1280,768);reviewAim.ctx.fillStyle='#151d2c';reviewAim.ctx.fillRect(0,0,1280,768);reviewAim.ctx.drawImage(aim.c,0,1536,1280,768,0,0,1280,768);
 for(let r=0;r<3;r++)for(let col=0;col<5;col++){for(let n=32;n<256;n+=32){reviewAim.ctx.strokeStyle='#ffffff20';reviewAim.ctx.beginPath();reviewAim.ctx.moveTo(col*256+n,r*256);reviewAim.ctx.lineTo(col*256+n,(r+1)*256);reviewAim.ctx.moveTo(col*256,r*256+n);reviewAim.ctx.lineTo((col+1)*256,r*256+n);reviewAim.ctx.stroke();reviewAim.ctx.fillStyle='#ffffff90';reviewAim.ctx.font='9px monospace';reviewAim.ctx.fillText(String(n),col*256+n,r*256+10);reviewAim.ctx.fillText(String(n),col*256,r*256+n);}}
 output['review/held-v2']=reviewAim.c.toDataURL().split(',')[1];
 const airReview=canvas(1792,440);
 airReview.ctx.fillStyle='#151d2c';airReview.ctx.fillRect(0,0,1792,440);
 for(let col=0;col<7;col++){
  const sourceCol=col?col-1:0,sourceRow=col?2:0;
  airReview.ctx.fillStyle='#dbe4ef';airReview.ctx.font='14px monospace';airReview.ctx.fillText(col?'Jump '+col:'Standing',col*256+8,20);
  for(let r=0;r<2;r++){
   const im=r?base.c:sources.base.c;
   airReview.ctx.drawImage(im,sourceCol*256,sourceRow*256,256,256,col*256+12,r*190+30,196,196);
  }
 }
 output['review/jump-scale-v2']=airReview.c.toDataURL().split(',')[1];
 return {output,meta,export:{hip,scaleMotion,scaleHeld,motion,held,airRegistration}};
},{data,old});
await mkdir(root+'canon-v2/review',{recursive:true});
for(const [key,encoded] of Object.entries(result.output))await writeFile(root+'canon-v2/'+(key==='review'?'review/motion-v2':key)+'.png',Buffer.from(encoded,'base64'));
await writeFile(root+'canon-v2/atlas-v2.json',JSON.stringify(result.meta,null,2)+'\n');
await writeFile(root+'canon-v2/export-v2.json',JSON.stringify(result.export,null,2)+'\n');
for(const [name,key] of [['CharacterAtlas','base'],['CharacterAimAtlas','aim']])await writeFile('src/game/animation/'+name+'.ts','/** Registered canon v2 gameplay export. See scripts/pack-hero-motion.mjs. */\nexport const '+(key==='base'?'characterAtlas':'characterAimAtlas')+' = '+JSON.stringify(result.meta[key],null,2)+' as const;\n');
console.log(JSON.stringify({hip:result.export.hip,scaleMotion:result.export.scaleMotion,scaleHeld:result.export.scaleHeld}));
}finally{await browser.close();}
