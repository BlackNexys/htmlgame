const {test,expect}=require('@playwright/test');
const scene=page=>page.locator('.title-art');
async function clock(page){await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));}
async function open(page,id='watcher'){
 await page.goto(id?`/?menuScene=${id}`:'/');
 await expect(page.getByRole('button',{name:'Play',exact:true})).toBeEnabled();
 await expect.poll(()=>page.locator('.title-art img[src]').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
}
const sources=page=>page.locator('[data-menu-layer][src]').evaluateAll(images=>images.map(image=>image.getAttribute('src')));
const hash=(page,selector,rect)=>page.locator(selector).evaluate((canvas,rect)=>{
 const [x,y,width,height]=rect??[0,0,canvas.width,canvas.height];
 let value=0;for(const pixel of canvas.getContext('2d').getImageData(x,y,width,height).data)value=(Math.imul(value,31)+pixel)|0;return value;
},rect);

test('flame and cape change between display frames while boots and masonry stay pinned; GIFs are not requested',async({page})=>{
 const errors=[],gifs=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/\/assets\/mainmenu\/.*\.gif$/.test(request.url()))gifs.push(request.url());});
 await clock(page);await open(page);await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await expect(page.locator('.menu-character-motion')).toBeVisible();await expect(page.locator('.menu-platform-motion')).toBeVisible();
 const first=await hash(page,'.menu-character-motion'),boots=await hash(page,'.menu-character-motion',[0,490,520,130]);
 const masonry=await hash(page,'.menu-platform-motion',[800,300,15,20]);
 await page.clock.runFor(34);const second=await hash(page,'.menu-character-motion');
 await page.clock.runFor(34);const third=await hash(page,'.menu-character-motion');
 expect(first).not.toBe(second);expect(second).not.toBe(third);
 await page.clock.runFor(1200);
 expect(await hash(page,'.menu-character-motion',[0,490,520,130])).toBe(boots);
 expect(await hash(page,'.menu-platform-motion',[800,300,15,20])).toBe(masonry);
 await page.getByRole('button',{name:'Options',exact:true}).click();await page.keyboard.press('Escape');
 await expect(scene(page)).toHaveAttribute('data-scene','watcher');
 expect(await page.locator('.menu-soul').evaluateAll(souls=>new Set(souls.map(soul=>getComputedStyle(soul).animationDuration)).size)).toBe(3);
 expect(gifs).toEqual([]);expect(errors).toEqual([]);
});

test('each new menu visit selects a different scene while dialogs preserve the current scene',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0;});await open(page,null);
 await expect(scene(page)).toHaveAttribute('data-scene','watcher');
 await page.getByRole('button',{name:'Controls',exact:true}).click();await page.keyboard.press('Escape');
 await expect(scene(page)).toHaveAttribute('data-scene','watcher');
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyP');
 await page.getByRole('button',{name:'Main menu',exact:true}).click();
 await expect(scene(page)).toHaveAttribute('data-scene','patient-traveller');
 await expect(page.locator('.menu-character')).toHaveAttribute('src',/hero_sitting\.png$/);
 await page.reload();await expect(scene(page)).toHaveAttribute('data-scene','watcher');
});

test('all three poses animate continuously, and the absent traveller leaves no hero or shadow',async({page})=>{
 await clock(page);
 for(const [id,asset]of [['watcher','hero_standing'],['patient-traveller','hero_sitting'],['restless-flame','hero_leaning'],['absent-traveller',null]]){
  await open(page,id);await expect(scene(page)).toHaveAttribute('data-scene',id);
  if(asset){
   await expect(page.locator('.menu-character')).toHaveAttribute('src',new RegExp(`${asset}\\.png$`));
   await expect(page.locator('.menu-character-motion')).toBeVisible();await expect(page.locator('.menu-hero-shadow')).toBeVisible();
   const initial=await hash(page,'.menu-character-motion');await page.clock.runFor(100);
   expect(await hash(page,'.menu-character-motion')).not.toBe(initial);
  }else{
   await expect(page.locator('.menu-character')).toBeHidden();expect(await page.locator('.menu-character').getAttribute('src')).toBeNull();
   await expect(page.locator('.menu-character-motion')).toBeHidden();await expect(page.locator('.menu-hero-shadow')).toBeHidden();
  }
  await expect(page.locator('.menu-platform')).toHaveAttribute('src',/station_foreground\.png$/);
 }
});

test('reduced motion, hidden tabs and gameplay use stills and stop rendering; resume preserves the selected scene',async({page})=>{
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page,'patient-traveller');
 await expect(scene(page)).toHaveAttribute('data-motion','still');await expect(page.locator('.menu-character')).toBeVisible();
 await expect(page.locator('.menu-character-motion')).toBeHidden();
 await page.emulateMedia({reducedMotion:'no-preference'});await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await page.clock.runFor(100);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(scene(page)).toHaveAttribute('data-playing','false');
 const paused=await hash(page,'.menu-character-motion');await page.clock.runFor(5000);expect(await hash(page,'.menu-character-motion')).toBe(paused);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await expect(scene(page)).toHaveAttribute('data-scene','patient-traveller');await page.clock.runFor(100);
 expect(await hash(page,'.menu-character-motion')).not.toBe(paused);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(scene(page)).toHaveAttribute('data-playing','false');
 const hidden=await hash(page,'.menu-character-motion');await page.clock.runFor(1000);expect(await hash(page,'.menu-character-motion')).toBe(hidden);
 expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
});

test('native artwork remains usable when decorative canvas contexts are unavailable',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args){if(this.className.startsWith('menu-'))return null;return original.apply(this,args);};
 });
 await open(page);await expect(page.locator('.menu-character')).toBeVisible();await expect(page.locator('.menu-platform')).toBeVisible();
 await expect(page.locator('.menu-character-motion')).toBeHidden();
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();expect(errors).toEqual([]);
});

test('Enable animation overrides Windows reduced motion and persists; Off restores stills immediately',async({page})=>{
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);
 await expect(scene(page)).toHaveAttribute('data-motion','still');
 await page.getByRole('button',{name:'Reduced motion · Enable animation',exact:true}).click();
 await expect(scene(page)).toHaveAttribute('data-motion','animated');await expect(page.locator('.menu-character-motion')).toBeVisible();
 await page.reload();await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await page.getByRole('button',{name:'Options',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Menu animation',exact:true})).toHaveValue('animated');
 await page.getByRole('combobox',{name:'Menu animation',exact:true}).selectOption('still');
 await expect(scene(page)).toHaveAttribute('data-motion','still');await expect(page.locator('.menu-character')).toBeVisible();
 const stopped=await hash(page,'.menu-character-motion');await page.clock.runFor(500);expect(await hash(page,'.menu-character-motion')).toBe(stopped);
 expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
});

test('lantern, clock and cat effects change independently without moving the foreground registration',async({page})=>{
 await clock(page);await open(page,'absent-traveller');await page.clock.runFor(100);
 const selectors=['.menu-lantern-light','.menu-clock-hand','.menu-cat-sleep'],initial=[];
 for(const selector of selectors)initial.push(await hash(page,selector));
 await page.clock.runFor(900);
 for(let i=0;i<selectors.length;i++)expect(await hash(page,selectors[i])).not.toBe(initial[i]);
 for(const [width,height]of [[1600,900],[2560,1080],[390,844],[844,390]]){
  await page.setViewportSize({width,height});
  const bounds=await page.locator('.menu-scene').boundingBox();
  expect(Math.abs(bounds.width/bounds.height-1003/565)).toBeLessThan(.005);
  for(const selector of ['.menu-platform-motion','.menu-details-motion','.menu-live-effects']){
   const rect=await page.locator(selector).boundingBox();expect(Math.abs(rect.x-bounds.x)).toBeLessThan(1);expect(Math.abs(rect.y-bounds.y)).toBeLessThan(1);expect(Math.abs(rect.width-bounds.width)).toBeLessThan(1);
  }
 }
});
