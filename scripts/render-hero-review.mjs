import {writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';

const server=await createServer({server:{host:'127.0.0.1',port:0,strictPort:false}});
let browser;
try {
 await server.listen();browser=await chromium.launch();const page=await browser.newPage();
 await page.goto(server.resolvedUrls.local[0]);
 const results=await page.evaluate(async()=>{
  const {CharacterRenderer}=await import('/src/renderers/CharacterRenderer.ts');
  const {heroMuzzle}=await import('/src/game/animation/HeroPose.ts');
  const {characterAtlas}=await import('/src/game/animation/CharacterAtlas.ts');
  const {characterAimAtlas}=await import('/src/game/animation/CharacterAimAtlas.ts');
  const {World}=await import('/src/game/World.ts');
  const {AssetLoader}=await import('/src/game/AssetLoader.ts');
  const {GameScreen}=await import('/src/renderers/GameScreen.ts');
  const images=await Promise.all([characterAtlas.image,characterAimAtlas.image,'hero/canon-v1/bootfire-v1.png'].map(async file=>{const image=new Image();image.src='/assets/'+file;await image.decode();return image;}));
  const results={};
  for(const facing of [1,-1]) {
   const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1200;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#151d2c';c.fillRect(0,0,canvas.width,canvas.height);
   for(const [row,motion]of ['idle','running','sprinting','crouching','airborne'].entries())for(let col=0;col<6;col++){
    const aim=col===0?{x:facing,y:0}:[{x:facing,y:0},{x:facing,y:-1},{x:0,y:-1},{x:facing,y:1},{x:0,y:1}][col-1];
    const p={x:0,y:0,y2:0,width:32,facing,grounded:motion!=='airborne',crouched:motion==='crouching',motion,vx:motion==='sprinting'?480*facing:330*facing,vy:100,sprintCharge:motion==='sprinting'?1:0,aim,invulnerable:0,firing:col!==0};
    const renderer=new CharacterRenderer(c,...images);renderer.update(p,1/120,col?['fire']:[],false);
    c.save();c.translate(col*256+120,row*240+213);c.scale(2,2);renderer.draw(p,0);
    if(col){const palm=heroMuzzle(p);c.strokeStyle='#6de4f0';c.lineWidth=.5;c.beginPath();c.moveTo(palm.x,palm.y);c.lineTo(palm.x+aim.x*20,palm.y+aim.y*20);c.stroke();c.fillStyle='#fff';c.fillRect(palm.x-1,palm.y-1,2,2);}
    c.restore();c.fillStyle='#dce3ef';c.font='12px monospace';c.fillText(motion+(col?` ${aim.x},${aim.y}`:' relaxed'),col*256+8,row*240+20);
   }
   results[facing===1?'right':'left']=canvas.toDataURL().split(',')[1];
  }
  const assets=await new AssetLoader().load();
  const film=document.createElement('canvas');film.width=1536;film.height=576;const filmContext=film.getContext('2d');filmContext.imageSmoothingEnabled=false;
  const game=document.createElement('canvas'),screen=new GameScreen(game,assets);
  const world=new World({width:3000,height:1200,spawn:{x:300,y:848},solids:[{x:0,y:900,width:3000,height:300}],enemies:[{kind:'zombie',x:470,y:852,left:470,right:470}],exit:{x:2800,y:792,width:64,height:108}});
  world.enemies[0].update=()=>{};
  for(const [index,time]of [0,.033,.067,.1,.167,.233,.3,.4,.6].entries()){
   const target=Math.round(time*120)+1;
   while(world.elapsed*120<target-.001){world.update(1/120,{left:false,right:false,jump:false,fire:true});screen.update(world,1/120,world.events);}
   screen.draw(world);
   const x=Math.max(0,Math.min(448,Math.round(world.player.x-world.camera.x-80))),y=Math.max(0,Math.min(384,Math.round(world.player.y2-world.camera.y-145)));
   filmContext.drawImage(game,x,y,512,192,index%3*512,Math.floor(index/3)*192,512,192);
   filmContext.fillStyle='#dbe4ef';filmContext.font='12px monospace';filmContext.fillText(`Flicker · ${world.elapsed.toFixed(3)} s`,index%3*512+10,Math.floor(index/3)*192+18);
  }
  results.attack=film.toDataURL().split(',')[1];
  return results;
 });
 for(const [facing,data]of Object.entries(results))await writeFile(`public/assets/hero/canon-v3/review/${facing==='attack'?'flicker-live':'combinations-'+facing}-v3.png`,Buffer.from(data,'base64'));
 console.log('Rendered both facings, relaxed and five firing directions, using the production renderer.');
}finally{await browser?.close();await server.close();}
