import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:0}});let browser;
try{await server.listen();browser=await chromium.launch();const page=await browser.newPage();await page.goto(server.resolvedUrls.local[0]);
const results=await page.evaluate(async()=>{
 const {CharacterRenderer}=await import('/src/renderers/CharacterRenderer.ts');
 const {heroPaletteImage}=await import('/src/renderers/HeroPalette.ts');
 const {characterAtlas}=await import('/src/game/animation/CharacterAtlas.ts');
 const {characterAimAtlas}=await import('/src/game/animation/CharacterAimAtlas.ts');
 const images=await Promise.all([characterAtlas.image,characterAimAtlas.image].map(async file=>{const im=new Image();im.src='/assets/'+file;await im.decode();return im;}));
 const results={};
 for(const motion of ['idle','running','sprinting','crouching','airborne'])for(const facing of [1,-1]){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1000;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#172032';c.fillRect(0,0,1200,1000);
 for(const [row,aim]of [{x:1,y:0},{x:0,y:-1},{x:1,y:-1},{x:1,y:1},{x:0,y:1}].entries())for(const [col,time]of [0,.05,.09,.14,.185].entries()){
 const p={x:0,y:0,y2:0,width:32,facing,grounded:motion!=='airborne',crouched:motion==='crouching',motion,vx:motion==='sprinting'?480*facing:0,vy:0,sprintCharge:0,aim:{x:aim.x*facing,y:aim.y},invulnerable:0,firing:true};
 const renderer=new CharacterRenderer(c,...images);renderer.update(p,0,['fire'],false);if(time)renderer.update(p,time,[],false);
 c.save();c.translate(col*240+100,row*200+180);c.scale(2,2);renderer.draw(p,time);c.restore();
 c.fillStyle='#c5d3de';c.font='12px monospace';c.fillText(`${motion} ${p.aim.x},${p.aim.y} · ${time}s`,col*240+8,row*200+18);
 }results[motion+(facing<0?'-left':'')]=canvas.toDataURL().split(',')[1];}
 const comparison=document.createElement('canvas');comparison.width=1200;comparison.height=480;const cc=comparison.getContext('2d');cc.imageSmoothingEnabled=false;cc.fillStyle='#172032';cc.fillRect(0,0,1200,480);
 for(let n=0;n<6;n++){const source=n<3?images[0]:heroPaletteImage(images[0]);const col=n%3;cc.drawImage(source,col*256,0,256,256,col*400+70,n<3?42:264,196,196);}
 cc.fillStyle='#dce4ed';cc.font='15px monospace';cc.fillText('Source colors',20,24);cc.fillText('Shared material palette',20,246);
 results.palette=comparison.toDataURL().split(',')[1];return results;
});await mkdir('public/assets/hero/canon-v4/review',{recursive:true});for(const [name,data]of Object.entries(results))await writeFile('public/assets/hero/canon-v4/review/'+name+'.png',Buffer.from(data,'base64'));console.log('Saved throw and palette review.');
}finally{await browser?.close();await server.close();}
