const {test,expect}=require('@playwright/test');

test('canon hero exports are transparent, unclipped and available in the production preview',async({page})=>{
 await page.goto('/docs/character-animations.html');await expect(page.locator('article')).toHaveCount(13);await expect(page.locator('#error')).toBeEmpty();
 const result=await page.evaluate(async()=>{
  const root='/assets/hero/canon-v1/',metadata=await(await fetch(root+'atlas-v1.json')).json(),errors=[];
  for(const atlas of [metadata.base,metadata.aim]){
   const im=new Image();im.src='/assets/'+atlas.image;await im.decode();
   if(im.width!==atlas.width||im.height!==atlas.height)errors.push('dimensions');
   const c=document.createElement('canvas');c.width=atlas.cell;c.height=atlas.cell;const ctx=c.getContext('2d');
   for(let row=0;row<atlas.height/atlas.cell;row++)for(let col=0;col<6;col++){
    ctx.clearRect(0,0,atlas.cell,atlas.cell);ctx.drawImage(im,col*atlas.cell,row*atlas.cell,atlas.cell,atlas.cell,0,0,atlas.cell,atlas.cell);
    const p=ctx.getImageData(0,0,atlas.cell,atlas.cell).data;let opaque=0;
    for(let y=0;y<atlas.cell;y++)for(let x=0;x<atlas.cell;x++){
     const a=p[(y*atlas.cell+x)*4+3];if(a){opaque++;if(x===0||y===0||x===atlas.cell-1||y===atlas.cell-1)errors.push(`${atlas.image} ${row},${col} clipped`);if(a!==255)errors.push('soft matte');}
    }
    if(opaque<1000)errors.push('empty frame');
   }
  }
  return errors;
 });expect([...new Set(result)]).toEqual([]);
 await page.getByRole('button',{name:'Face left',exact:true}).click();await expect(page.getByRole('button',{name:'Face right',exact:true})).toBeVisible();
});

test('actual sprint builds its speed and boot fire; release, reversal and pause stop the effect',async({page},testInfo)=>{
 await page.addInitScript(()=>{
  const text=CanvasRenderingContext2D.prototype.fillText,draw=CanvasRenderingContext2D.prototype.drawImage;
  window.bootDraws=0;
  CanvasRenderingContext2D.prototype.fillText=function(value,...args){if(/^x .* vx /.test(String(value)))window.movementDebug=String(value);return text.call(this,value,...args);};
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(this.canvas.id==='game'&&image instanceof HTMLImageElement&&image.src.endsWith('/hero/canon-v1/bootfire-v1.png'))window.bootDraws++;return draw.call(this,image,...args);};
 });
 await page.clock.install({time:new Date('2026-11-09T09:00:00Z')});await page.clock.pauseAt(new Date('2026-11-09T09:00:01Z'));
 await page.goto('/?level=movement-course');await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('F2');
 const velocity=()=>page.evaluate(()=>Number(window.movementDebug?.match(/vx (-?\d+)/)?.[1]));
 const flames=()=>page.evaluate(()=>window.bootDraws);
 await page.keyboard.down('Shift');await page.keyboard.down('KeyD');await page.clock.runFor(150);const early=await velocity();expect(early).toBeGreaterThan(330);expect(early).toBeLessThan(400);
 await page.clock.runFor(500);expect(await velocity()).toBe(480);expect(await flames()).toBeGreaterThan(0);
 await page.screenshot({path:`artifacts/${testInfo.project.name}-canon-sprint.png`});
 await page.keyboard.up('Shift');await page.clock.runFor(30);const stopped=await flames();await page.clock.runFor(60);expect(await flames()).toBe(stopped);
 await page.keyboard.up('KeyD');await page.keyboard.press('KeyP');await page.clock.runFor(500);expect(await flames()).toBe(stopped);
});

test('optional boot artwork can fail without preventing gameplay',async({page})=>{
 await page.route('**/hero/canon-v1/bootfire-v1.png',route=>route.abort());await page.goto('/?level=movement-course');
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();await expect(page.locator('#game')).toBeFocused();
});
