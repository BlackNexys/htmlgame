const {test,expect}=require('@playwright/test');
async function clock(page){await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));}
const hash=page=>page.locator('#pilot').evaluate(canvas=>{let value=0;for(const pixel of canvas.getContext('2d').getImageData(0,0,640,360).data)value=(Math.imul(value,31)+pixel)|0;return value;});

test('the new pilot uses only new assets, overrides reduced motion explicitly, pauses and steps authored drawings',async({page})=>{
 const errors=[],old=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/\/assets\/mainmenu\/(stills\/|[^/]+\.gif)/.test(request.url()))old.push(request.url());});
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/menu-pilot.html');
 await expect(page.locator('#status')).toContainText('Still preview');await expect(page.locator('#assets article')).toHaveCount(6);
 await expect(page.locator('.swatch')).toHaveCount(32);await expect(page.locator('#motion-note')).toContainText('reduced motion');
 const initial=await hash(page);await page.clock.runFor(1000);expect(await hash(page)).toBe(initial);
 await page.getByRole('button',{name:'Play animation',exact:true}).click();await page.clock.runFor(270);
 expect(await hash(page)).not.toBe(initial);await expect(page.locator('#pilot')).not.toHaveAttribute('data-flame-frame','0');
 await page.getByRole('button',{name:'Pause animation',exact:true}).click();const stopped=await hash(page);
 await page.clock.runFor(2000);expect(await hash(page)).toBe(stopped);
 await page.getByRole('button',{name:'Step one frame',exact:true}).click();expect(await hash(page)).not.toBe(stopped);
 await page.getByRole('checkbox',{name:'Show attachment points',exact:true}).check();const marked=await hash(page);
 await page.getByRole('checkbox',{name:'Show attachment points',exact:true}).uncheck();expect(await hash(page)).not.toBe(marked);
 expect(old).toEqual([]);expect(errors).toEqual([]);
});

test('native sprite exports use the shared palette, real transparency and identical planted legs in every idle frame',async({page})=>{
 await page.goto('/menu-pilot.html');await expect(page.locator('#status')).not.toHaveText('Loading the new assets…');
 const result=await page.evaluate(async()=>{
  const root='/assets/mainmenu/v2/',manifest=await(await fetch(root+'pilot-v1.json')).json();
  const palette=new Set(manifest.palette.colors.map(c=>c.slice(1).toLowerCase())),invalid=[],boots=[];let transparent=0;
  for(const clip of Object.values(manifest.assets)){
   const image=new Image();image.src=root+clip.image;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);
   if(image.width!==clip.width||image.height!==clip.height)invalid.push(clip.id+' dimensions');
   const pixels=c.getImageData(0,0,image.width,image.height).data;
   for(let n=0;n<pixels.length;n+=4){if(!pixels[n+3]){transparent++;continue;}const hex=[pixels[n],pixels[n+1],pixels[n+2]].map(v=>v.toString(16).padStart(2,'0')).join('');if(pixels[n+3]!==255||!palette.has(hex)){invalid.push(clip.id+' palette');break;}}
   if(clip.id==='body')for(let frame=0;frame<6;frame++){let hash=0;for(const value of c.getImageData(frame*128,113,128,47).data)hash=(Math.imul(hash,31)+value)|0;boots.push(hash);}
  }
  return {invalid,transparent,boots};
 });
 expect(result.invalid).toEqual([]);expect(result.transparent).toBeGreaterThan(1000);expect(new Set(result.boots).size).toBe(1);
});

test('hidden tabs stop the pilot clock, On persists and the fitted scene remains usable on a narrow screen',async({page})=>{
 await clock(page);await page.goto('/menu-pilot.html');await expect(page.locator('#status')).toContainText('Playing');
 await page.clock.runFor(250);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const paused=await hash(page);await page.clock.runFor(5000);expect(await hash(page)).toBe(paused);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(180);expect(await hash(page)).not.toBe(paused);
 await page.getByRole('combobox',{name:'Motion',exact:true}).selectOption('animated');await page.reload();await expect(page.getByRole('combobox',{name:'Motion',exact:true})).toHaveValue('animated');
 await page.setViewportSize({width:390,height:844});const rect=await page.locator('#pilot').boundingBox();
 expect(rect.width/rect.height).toBeCloseTo(16/9,2);expect(rect.x+rect.width).toBeLessThanOrEqual(390);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.getByRole('combobox',{name:'View',exact:true}).selectOption('1');expect((await page.locator('#pilot').boundingBox()).width).toBe(640);
});

test('a missing pilot asset explains the failure and leaves the reference and game link available',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/mainmenu/v2/flame-v1.png',route=>route.abort());await page.goto('/menu-pilot.html');
 await expect(page.locator('#status')).toContainText('The pilot could not load');
 await expect(page.getByRole('link',{name:'← Back to Underworld',exact:true})).toBeVisible();
 await expect(page.locator('.study img')).toBeVisible();expect(errors).toEqual([]);
});
