const {test,expect}=require('@playwright/test');

test('runtime review supports slow motion, frame stepping, mirrored aim and every stance',async({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/hero-review.html');await expect(page.locator('#review')).toHaveAttribute('data-ready','true');
 await page.selectOption('#motion','sprinting');await page.selectOption('#speed','0.25');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const time=Number(await page.locator('#review').getAttribute('data-time'));
 await page.waitForTimeout(100);expect(Number(await page.locator('#review').getAttribute('data-time'))).toBe(time);
 await page.getByRole('button',{name:'Step 1/60 s'}).click();expect(Number(await page.locator('#review').getAttribute('data-time'))).toBeCloseTo(time+1/60,6);
 for(const motion of ['idle','running','sprinting','crouching','airborne','wall-slide']){
  await page.selectOption('#motion',motion);
  for(const aim of ['1,0','1,-1','0,-1','-1,-1','-1,0','-1,1','0,1','1,1']){
   await page.selectOption('#aim',aim);await page.getByRole('button',{name:'Step 1/60 s'}).click();
   await expect(page.locator('#status')).toContainText(motion);
  }
 }
 await page.getByRole('button',{name:'Face left',exact:true}).click();await page.getByRole('button',{name:'Step 1/60 s'}).click();
 await expect(page.getByRole('button',{name:'Face right',exact:true})).toBeVisible();
 await page.screenshot({path:`artifacts/${info.project.name}-hero-motion-review.png`});expect(errors).toEqual([]);
});

test('v2 gameplay exports have opaque pixel edges and no clipped occupied cells',async({page})=>{
 await page.goto('/hero-review.html');await expect(page.locator('#review')).toHaveAttribute('data-ready','true');
 const errors=await page.evaluate(async()=>{
  const meta=await(await fetch('/assets/hero/canon-v2/atlas-v2.json')).json(),errors=[];
  for(const [key,atlas] of [['base',meta.base],['aim',meta.aim]]){
   const im=new Image();im.src='/assets/'+atlas.image;await im.decode();
   if(im.width!==atlas.width||im.height!==atlas.height)errors.push(key+' dimensions');
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
   for(let row=0;row<atlas.height/256;row++)for(let col=0;col<(key==='base'?([1,6].includes(row)?8:6):row>=6?5:6);col++){
    c.clearRect(0,0,256,256);c.drawImage(im,col*256,row*256,256,256,0,0,256,256);
    const p=c.getImageData(0,0,256,256).data;let count=0;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){const a=p[(y*256+x)*4+3];if(!a)continue;count++;if(a!==255)errors.push(key+' soft alpha');if(!x||!y||x===255||y===255)errors.push(`${key} ${row},${col} clipping`);}
    if(count<1000)errors.push(key+' empty');
   }
  }return [...new Set(errors)];
 });expect(errors).toEqual([]);
});
