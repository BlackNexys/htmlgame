import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Export preparation: uniform anatomical scale, authored poses, nearest-neighbour packing.
// The versioned originals are preserved; faces/flames/body parts are never redrawn separately.
const root='public/assets/hero/',out=root+'canon-v3/';
const review=JSON.parse(await readFile(out+'source/anatomy-review-v3.json','utf8'));
const old=JSON.parse(await readFile(root+'canon-v2/atlas-v2.json','utf8'));
const encoded={};
for(const [key,file] of Object.entries({gameplay:'canon-v2/gameplay-v2.png',aiming:'canon-v2/aiming-v2.png',crouch:'canon-v3/source/crouch-v3.png'}))encoded[key]=(await readFile(root+file)).toString('base64');
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 const result=await page.evaluate(async({encoded,review,old})=>{
  function surface(w,h){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;return {canvas,c};}
  const sources={};
  for(const [key,data] of Object.entries(encoded)){
   const im=new Image();im.src='data:image/png;base64,'+data;await im.decode();
   const s=surface(key==='crouch'?1536:im.width,key==='crouch'?512:im.height);
   if(key==='crouch')for(let row=0;row<2;row++)for(let col=0;col<6;col++){
    const x=Math.round(col*im.width/6),y=Math.round(row*im.height/2);
    s.c.drawImage(im,x,y,Math.round((col+1)*im.width/6)-x,Math.round((row+1)*im.height/2)-y,col*256,row*256,256,256);
   }else s.c.drawImage(im,0,0);
   sources[key]=s;
  }
  const target={gameplay:surface(2048,1792),aiming:surface(1536,2304)};
  const meta=structuredClone(old);delete meta.menuClips;
  meta.base.image='hero/canon-v3/gameplay-v3.png';meta.aim.image='hero/canon-v3/aiming-v3.png';
  const transforms=[],sockets={},frames=[];
  const occupied=(sheet,row)=>sheet==='gameplay'?([1,6].includes(row)?8:6):row>=6?5:6;
  function bounds(p){let l=256,t=256,r=-1,b=-1;for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(p[(y*256+x)*4+3]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return{x:l,y:t,w:r-l+1,h:b-t+1};}
  function hip(p){let x=0,y=0,n=0;for(let i=0;i<65536;i++){const k=i*4;if(p[k+3]&&p[k+1]>110&&p[k+2]>100&&p[k+1]>p[k]*1.6&&p[k+2]>p[k]*1.5){x+=i%256;y+=i>>8;n++;}}if(!n)throw Error('No vial in frame');return{x:x/n,y:y/n};}
  for(const input of review.frames) {
   const {sheet,row,column:col,face}=input;
   // Both old crouch rows are replaced by complete crouch drawings, not a running torso.
   if(sheet==='aiming'&&row<2)continue;
   const outputSheet=sheet==='crouch'?'aiming':sheet;
   const frame=surface(256,256);frame.c.drawImage(sources[sheet].canvas,col*256,row*256,256,256,0,0,256,256);
   const pixels=frame.c.getImageData(0,0,256,256);
   for(let i=0;i<pixels.data.length;i+=4){if(pixels.data[i+3]<160)pixels.data.fill(0,i,i+4);else pixels.data[i+3]=255;}
   // Remove remote generation debris, retaining the complete connected drawing and nearby flecks.
   if(sheet==='crouch'){
    const seen=new Uint8Array(65536);let largest=[];
    for(let n=0;n<65536;n++)if(!seen[n]&&pixels.data[n*4+3]){
     const queue=[n];seen[n]=1;for(let i=0;i<queue.length;i++){const v=queue[i],x=v%256,y=v>>8;for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy,j=yy*256+xx;if(xx>=0&&xx<256&&yy>=0&&yy<256&&!seen[j]&&pixels.data[j*4+3]){seen[j]=1;queue.push(j);}}}if(queue.length>largest.length)largest=queue;
    }
    const xs=largest.map(n=>n%256),ys=largest.map(n=>n>>8),l=Math.min(...xs)-3,r=Math.max(...xs)+3,t=Math.min(...ys)-3,b=Math.max(...ys)+3;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(x<l||x>r||y<t||y>b)pixels.data.fill(0,(y*256+x)*4,(y*256+x)*4+4);
   }
   frame.c.putImageData(pixels,0,0);
   const b=bounds(pixels.data),scale=Math.abs(face[3]-review.targetFaceHeight)<=1?1:review.targetFaceHeight/face[3];
   const airborne=sheet==='gameplay'&&(row===1||row===6||(row===2&&col>0&&col<5));
   const held=sheet==='aiming'&&row>=6;
   let pivot=airborne||held?hip(pixels.data):{x:128,y:240};
   let dx=0,dy=0;
   if(sheet==='crouch'){
    const floor=pixels.data;let sum=0,n=0;
    for(let y=Math.max(0,b.y+b.h-5);y<b.y+b.h;y++)for(let x=0;x<256;x++)if(floor[(y*256+x)*4+3]){sum+=x;n++;}
    pivot={x:sum/n,y:b.y+b.h};dx=128-pivot.x;dy=240-pivot.y;
   }
   let x=Math.round(pivot.x+(b.x-pivot.x)*scale+dx),y=Math.round(pivot.y+(b.y-pivot.y)*scale+dy);
   const w=Math.round(b.w*scale),h=Math.round(b.h*scale);
   if(!held && !(sheet==='gameplay'&&row===2&&col>0&&col<5))y=Math.min(y,240-h);
   if(x<1||y<1||x+w>255||y+h>255)throw Error(`Clipped ${sheet}/${row}/${col}: ${x},${y} ${w},${h}`);
   const transform=([px,py])=>[Math.round(x+(px-b.x)*w/b.w),Math.round(y+(py-b.y)*h/b.h)];
   target[outputSheet].c.drawImage(frame.canvas,b.x,b.y,b.w,b.h,col*256+x,row*256+y,w,h);
   if(sheet==='gameplay'&&[1,6].includes(row))meta.base.boots[row][col]=meta.base.boots[row][col].map(p=>{const [xx,yy]=transform([p.x,p.y]);return{x:xx,y:yy};});
   const palm=sheet==='crouch'&&row===1?review.palms.crouch[col]:held?review.palms[row][col]:undefined;
   if(palm){sockets[row]??=[];sockets[row][col]=transform(palm);}
   const [fx,fy]=transform(face);
   const transformedFace=[fx,fy,Math.round(face[2]*w/b.w),Math.round(face[3]*h/b.h)];
   const record={sheet:outputSheet,row,column:col,source:sheet,sourceFace:face,face:transformedFace,scale,pivot,rect:[x,y,w,h]};
   transforms.push(record);frames.push(record);
  }
  // Both complete crouch rows use the same grounded cell registration.
  for(let row=0;row<2;row++)meta.aim.rows[row]={x:Array(6).fill(128),y:Array(6).fill(240),sourceY:row*256,height:256};
  const exports={};
  for(const [key,s]of Object.entries(target))exports[key+'-v3.png']=s.canvas.toDataURL().split(',')[1];
  const report={reference:review.reference,targetFaceHeight:review.targetFaceHeight,frames,palms:sockets};
  for(const [key,rows]of [['gameplay',7],['aiming',9]]){
   const contact=surface(8*192,rows*160);contact.c.fillStyle='#151d2c';contact.c.fillRect(0,0,contact.canvas.width,contact.canvas.height);
   for(let row=0;row<rows;row++)for(let col=0;col<occupied(key,row);col++){
    const x=col*192+40,y=row*160+32;
    // Atlas pixels rendered at the actual 98 px gameplay scale.
    contact.c.drawImage(target[key].canvas,col*256,row*256,256,256,x,y,98,98);
    contact.c.strokeStyle='#4c6277';contact.c.beginPath();contact.c.moveTo(col*192+15,y+240/256*98);contact.c.lineTo(col*192+177,y+240/256*98);contact.c.stroke();
    const f=frames.find(f=>f.sheet===key&&f.row===row&&f.column===col);
    contact.c.strokeStyle='#68d9e7';contact.c.strokeRect(x+f.face[0]*98/256,y+f.face[1]*98/256,f.face[2]*98/256,f.face[3]*98/256);
    contact.c.fillStyle='#dbe4ef';contact.c.font='11px monospace';contact.c.fillText(`${key} ${row}:${col} · head ${f.face[3]}`,col*192+8,row*160+18);
   }
   exports['review/'+key+'-all-v3.png']=contact.canvas.toDataURL().split(',')[1];
  }
  return{exports,meta,report,sockets};
 },{encoded,review,old});
 await mkdir(out+'review',{recursive:true});
 for(const [file,data]of Object.entries(result.exports))await writeFile(out+file,Buffer.from(data,'base64'));
 await writeFile(out+'atlas-v3.json',JSON.stringify({...result.meta,palms:result.sockets},null,2)+'\n');
 await writeFile(out+'anatomy-audit-v3.json',JSON.stringify(result.report,null,2)+'\n');
 for(const [name,key]of [['CharacterAtlas','base'],['CharacterAimAtlas','aim']])await writeFile('src/game/animation/'+name+'.ts','/** Canon v3: uniformly scaled anatomy. Generated by scripts/pack-hero-consistency.mjs. */\nexport const '+(key==='base'?'characterAtlas':'characterAimAtlas')+' = '+JSON.stringify(result.meta[key],null,2)+' as const;\n');
 await writeFile('src/game/animation/HeroPoseAtlas.ts','/** Palm centres transformed with the complete authored poses; generated by the v3 packer. */\nexport const heroPoseAtlas = '+JSON.stringify(result.sockets,null,2)+' as const;\n');
 console.log(`Packed and audited ${result.report.frames.length} frames. Head heights: ${Math.min(...result.report.frames.map(f=>f.face[3]))}–${Math.max(...result.report.frames.map(f=>f.face[3]))} px.`);
}finally{await browser.close();}
