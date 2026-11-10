const {test,expect}=require('@playwright/test');

test('Flicker remains playable with missing weapon art and unavailable Web Audio; rewards and restart update the HUD',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{window.AudioContext=class{constructor(){throw Error('Audio unavailable');}};});
 await page.route('**/assets/weapons/flicker/flicker-v1.png',route=>route.abort());
 await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));
 require('../register.cjs');
 const level=require('../../src/levels/createEmptyLevel.ts').createEmptyLevel();
 level.enemies=[{id:'target',kind:'zombie',x:500,y:576,patrol:{left:480,right:520}}];
 await page.route(url=>url.pathname==='/test-fixture.json',route=>route.fulfill({json:level}));
 await page.goto('/?levelUrl=/test-fixture.json');await page.getByRole('button',{name:'Play',exact:true}).click();
 await expect(page.locator('#weapon-label')).toHaveText('FLICKER · FREE');await expect(page.locator('#ectoplasm')).toHaveText('6 / 12');
 await page.keyboard.down('KeyD');await page.keyboard.down('KeyJ');await page.clock.runFor(1000);
 await page.keyboard.up('KeyD');await page.keyboard.up('KeyJ');
 await expect(page.locator('#count')).toHaveText('1 / 1');
 expect(parseInt(await page.locator('#ectoplasm').textContent())).toBeGreaterThan(6);
 await page.keyboard.press('KeyR');await expect(page.locator('#ectoplasm')).toHaveText('6 / 12');
 expect(errors).toEqual([]);
});

test('Flicker preview ships transparent 32px directional cells, effects and five distinct quiet shot samples',async({page})=>{
 await page.goto('/docs/flicker.html');await expect(page.locator('article')).toHaveCount(13);
 await expect(page.locator('#status')).toContainText('Sprites ready');
 const result=await page.evaluate(async()=>{
  const atlas=await (await fetch('/assets/weapons/flicker/flicker_atlas.json')).json();
  const image=new Image();image.src='/assets/weapons/flicker/flicker-v1.png';await image.decode();
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
  const centers=[];
  for(let column=0;column<6;column++){
   const data=ctx.getImageData(column*32,0,32,32).data;let x=0,y=0,count=0;
   for(let py=0;py<32;py++)for(let px=0;px<32;px++){const n=(py*32+px)*4;if(data[n]>225&&data[n+1]>175&&data[n+2]>210&&data[n+3]>100){x+=px;y+=py;count++;}}
   centers.push({x:x/count,y:y/count});
  }
  const samples=[];
  for(let i=1;i<=5;i++){
   const data=await(await fetch(`/assets/weapons/flicker/audio/fire-${i}.wav`)).arrayBuffer();
   const view=new DataView(data);let peak=0,hash=0;
   for(let n=44;n<data.byteLength;n+=2){const value=view.getInt16(n,true);peak=Math.max(peak,Math.abs(value)/32768);hash=(Math.imul(hash,31)+value)|0;}
   samples.push({peak,hash,duration:(data.byteLength-44)/2/view.getUint32(24,true)});
  }
  return {width:image.width,height:image.height,cell:atlas.cell,transparent:ctx.getImageData(0,0,1,1).data[3],centers,samples};
 });
 expect(result.width).toBe(192);expect(result.height).toBe(416);expect(result.cell).toEqual({width:32,height:32});expect(result.transparent).toBe(0);
 for(const center of result.centers){expect(Math.abs(center.x-15.5)).toBeLessThan(1);expect(Math.abs(center.y-15.5)).toBeLessThan(1);}
 expect(new Set(result.samples.map(sample=>sample.hash)).size).toBe(5);
 for(const sample of result.samples){expect(sample.peak).toBeGreaterThan(.005);expect(sample.peak).toBeLessThan(.05);expect(sample.duration).toBeCloseTo(.15,2);}
 await page.getByRole('button',{name:'Enemy hit',exact:true}).click();await expect(page.locator('#status')).toHaveText('Playing Enemy hit.');
});
