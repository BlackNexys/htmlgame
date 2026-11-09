const {test,expect}=require('@playwright/test');
const scene=page=>page.locator('.title-art'),canvas=page=>page.locator('.menu-scene-motion');
async function clock(page){await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));}
async function open(page,id='watcher',ready=true){
 await page.goto(id?`/?menuScene=${id}`:'/');await expect(page.getByRole('button',{name:'Play',exact:true})).toBeEnabled();
 if(ready)await expect(scene(page)).toHaveAttribute('data-renderer','ready');
}
const hash=(page,rect)=>canvas(page).evaluate((canvas,rect)=>{
 const [x,y,w,h]=rect??[0,0,canvas.width,canvas.height];let n=0;
 for(const v of canvas.getContext('2d').getImageData(x,y,w,h).data)n=(Math.imul(n,31)+v)|0;return n;
},rect);

test('whole-character frames animate while scenery stays registered; rejected art is not requested',async({page})=>{
 const errors=[],old=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/mainmenu\/(stills\/|.*\.gif$|v2\/)/.test(r.url()))old.push(r.url());});
 await clock(page);await open(page);await expect(scene(page)).toHaveAttribute('data-motion','animated');
 const first=await hash(page),ground=await canvas(page).getAttribute('data-actor-frame');const sources=await page.locator('.title-background,.menu-platform').evaluateAll(images=>images.map(i=>i.src));
 await page.clock.runFor(120);expect(await hash(page)).not.toBe(first);await page.clock.runFor(1100);expect(await canvas(page).getAttribute('data-actor-frame')).not.toBe(ground);
 expect(await page.locator('.title-background,.menu-platform').evaluateAll(images=>images.map(i=>i.src))).toEqual(sources);
 expect(old).toEqual([]);expect(errors).toEqual([]);
});

test('standing reuses the live gameplay atlas; seated support and cloak remain settled',async({page})=>{
 const requested=[];page.on('request',r=>requested.push(r.url()));
 await clock(page);await open(page,'patient-traveller');
 const cloth=await hash(page,[1440,690,70,45]);await page.clock.runFor(1200);expect(await hash(page,[1440,690,70,45])).toBe(cloth);
 const identity=await page.evaluate(async()=>{
  const root='./assets/mainmenu/v3/production/',art=await(await fetch(root+'scene-v1.json')).json();
  const images=await Promise.all(['./assets/hero/canon-v1/gameplay-v1.png',root+art.clips.standing.image].map(async path=>{const im=new Image();im.src=path;await im.decode();return im;}));
  const arrays=images.map(im=>{const c=document.createElement('canvas');c.width=1536;c.height=256;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);return ctx.getImageData(0,0,1536,256).data;});
  let differences=0;for(let i=0;i<arrays[0].length;i++)if(arrays[0][i]!==arrays[1][i])differences++;
  return {differences,keys:Object.keys(art.clips),frames:art.clips.standing.frames.length};
 });
 expect(identity.differences).toBe(0);expect(identity.frames).toBe(6);expect(identity.keys).not.toContain('headFire');expect(identity.keys).not.toContain('cape');
 expect(requested.some(url=>/head-fire-v[234]|punk-body-v3/.test(url))).toBe(false);
});

test('Confluence remains the main composition while dialogs and Continue preserve the run',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0;});await open(page,null);await expect(scene(page)).toHaveAttribute('data-scene','confluence');
 await page.getByRole('button',{name:'Controls',exact:true}).click();await page.keyboard.press('Escape');await expect(scene(page)).toHaveAttribute('data-scene','confluence');
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyP');await page.getByRole('button',{name:'Main menu',exact:true}).click();
 await expect(scene(page)).toHaveAttribute('data-scene','confluence');await expect(page.locator('.menu-poster')).toHaveAttribute('src',/confluence-v1\/poster-v2\.png$/);
 await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();
});

test('all hero presets use the production scene and the empty platform leaves no hero pixels',async({page})=>{
 await clock(page);const hashes=[];
 for(const id of ['watcher','patient-traveller','restless-flame','absent-traveller']){
  await open(page,id);await expect(scene(page)).toHaveAttribute('data-scene',id);await expect(scene(page)).toHaveAttribute('data-hero',String(id!=='absent-traveller'));
  hashes.push(await hash(page));await page.clock.runFor(120);expect(await hash(page)).not.toBe(hashes.at(-1));
 }
 expect(new Set(hashes).size).toBe(4);
 expect(await canvas(page).evaluate(c=>[...c.getContext('2d').getImageData(1060,425,220,300).data].filter((v,i)=>i%4===3&&v>0).length)).toBe(0);
});

test('reduced motion, hidden tabs and gameplay stop decoration without advancing its clock',async({page})=>{
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page,'patient-traveller');
 await expect(scene(page)).toHaveAttribute('data-motion','still');const still=await hash(page);await page.clock.runFor(500);expect(await hash(page)).toBe(still);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.clock.runFor(300);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(scene(page)).toHaveAttribute('data-playing','false');const frozen=await hash(page),time=await canvas(page).getAttribute('data-time');
 await page.clock.runFor(5000);expect(await hash(page)).toBe(frozen);expect(await canvas(page).getAttribute('data-time')).toBe(time);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(120);
 expect(Number(await canvas(page).getAttribute('data-time'))-Number(time)).toBeLessThan(200);await expect(scene(page)).toHaveAttribute('data-scene','patient-traveller');
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(scene(page)).toHaveAttribute('data-playing','false');const gameplay=await hash(page);await page.clock.runFor(500);expect(await hash(page)).toBe(gameplay);
});

test('missing animation artwork or a failed decorative context restores the matching still and leaves Play usable',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/hero/canon-v1/sitting-v1.png',route=>route.abort());await open(page,'patient-traveller',false);await expect(scene(page)).toHaveAttribute('data-renderer','fallback');
 await expect(page.locator('.menu-poster')).toBeVisible();await expect(canvas(page)).toBeHidden();
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();
 await page.unroute('**/hero/canon-v1/sitting-v1.png');
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){if(this.classList.contains('menu-scene-motion'))return null;return get.apply(this,args);};});
 await open(page,'restless-flame',false);await expect(scene(page)).toHaveAttribute('data-renderer','fallback');await expect(page.locator('.menu-poster')).toBeVisible();expect(errors).toEqual([]);
});

test('Enable animation overrides Windows reduced motion and persists; Off immediately holds the still pose',async({page})=>{
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);
 await page.getByRole('button',{name:'Reduced motion · Enable animation',exact:true}).click();await expect(scene(page)).toHaveAttribute('data-motion','animated');await page.clock.runFor(160);
 await page.reload();await expect(scene(page)).toHaveAttribute('data-renderer','ready');await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await page.getByRole('button',{name:'Options',exact:true}).click();await page.getByRole('combobox',{name:'Menu animation',exact:true}).selectOption('still');
 await expect(scene(page)).toHaveAttribute('data-motion','still');const stopped=await hash(page);await page.clock.runFor(500);expect(await hash(page)).toBe(stopped);expect(await canvas(page).getAttribute('data-time')).toBe('0');
});

test('clock, lantern and cat animate independently and all artwork stays registered inside the clipped scene at every browser ratio',async({page})=>{
 await clock(page);await open(page,'absent-traveller');const regions=[[1260,140,100,175],[1470,110,100,115],[1500,600,120,90]],first=[];
 for(const rect of regions)first.push(await hash(page,rect));await page.clock.runFor(900);
 for(let i=0;i<regions.length;i++)expect(await hash(page,regions[i])).not.toBe(first[i]);
 for(const[width,height]of [[1600,900],[2560,1080],[390,844],[844,390]]){
  await page.setViewportSize({width,height});const b=await page.locator('.menu-scene').boundingBox();expect(Math.abs(b.width/b.height-1672/941)).toBeLessThan(.005);
  const frame=await page.locator('.title-art').boundingBox();
  expect(frame.x).toBeGreaterThanOrEqual(-1);expect(frame.y).toBeGreaterThanOrEqual(-1);expect(frame.x+frame.width).toBeLessThanOrEqual(width+1);expect(frame.y+frame.height).toBeLessThanOrEqual(height+1);
  expect(b.x).toBeLessThanOrEqual(frame.x+1);expect(b.y).toBeLessThanOrEqual(frame.y+1);expect(b.x+b.width).toBeGreaterThanOrEqual(frame.x+frame.width-1);expect(b.y+b.height).toBeGreaterThanOrEqual(frame.y+frame.height-1);
  await expect(page.locator('.title-art')).toHaveCSS('overflow','hidden');
  for(const selector of ['.title-background','.menu-platform','.menu-scene-motion']){const r=await page.locator(selector).boundingBox();expect(Math.abs(r.x-b.x)).toBeLessThan(1);expect(Math.abs(r.y-b.y)).toBeLessThan(1);expect(Math.abs(r.width-b.width)).toBeLessThan(1);expect(Math.abs(r.height-b.height)).toBeLessThan(1);}
 }
});

test('production preview supports frame inspection and exports retain rich colour and clean transparency',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/menu-production.html?legacy=1');await expect(page.getByRole('button',{name:'Play animation',exact:true})).toBeEnabled();
 const first=await page.locator('#scene').getAttribute('data-actor-frame');await page.getByRole('button',{name:'Step one frame',exact:true}).click();expect(await page.locator('#scene').getAttribute('data-actor-frame')).not.toBe(first);
 await page.getByRole('combobox',{name:'Traveller',exact:true}).selectOption('sitting');await expect(page.locator('#status')).toContainText('Seated');
 const pixels=await page.evaluate(async()=>{
  const im=new Image();im.src='./assets/hero/canon-v1/sitting-v1.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
  const p=ctx.getImageData(0,0,im.width,im.height).data,colors=new Set();let transparent=0;for(let i=0;i<p.length;i+=4){if(!p[i+3])transparent++;else colors.add(p[i]*65536+p[i+1]*256+p[i+2]);}return {colors:colors.size,transparent,corner:p[3]};
 });
 expect(pixels.colors).toBeGreaterThan(100);expect(pixels.transparent).toBeGreaterThan(10000);expect(pixels.corner).toBe(0);
});
