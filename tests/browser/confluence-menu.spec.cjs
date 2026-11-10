const {test,expect}=require('@playwright/test');
const art=JSON.parse(require('node:fs').readFileSync('public/assets/mainmenu/confluence-v1/scene-v2.json','utf8'));
const scene=page=>page.locator('.title-art'),canvas=page=>page.locator('.menu-scene-motion');
async function clock(page){await page.clock.install({time:new Date('2026-11-09T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-09T12:00:01Z'));}
async function open(page){await page.goto('/');await expect(page.getByRole('button',{name:'Play',exact:true})).toBeEnabled();await expect(scene(page)).toHaveAttribute('data-renderer','ready');await expect(scene(page)).toHaveAttribute('data-scene','confluence');}
const hash=(page,rect)=>canvas(page).evaluate((c,r)=>{let n=0;for(const v of c.getContext('2d').getImageData(...r).data)n=(Math.imul(n,31)+v)|0;return n;},rect);

test('Confluence is the main menu; complete actors animate while architecture and seated contacts stay still',async({page},info)=>{
 const old=[],errors=[];page.on('request',r=>{if(/mainmenu\/(v[23]\/|stills\/)/.test(r.url()))old.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await clock(page);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);
 const regions=[[1220,360,250,180],[250,790,150,80],[1190,660,190,105],[220,300,170,210]],first=[];for(const r of regions)first.push(await hash(page,r));
 await page.clock.runFor(300);expect(await hash(page,regions[0])).not.toBe(first[0]);expect(await hash(page,regions[1])).not.toBe(first[1]);
 expect(await hash(page,regions[2])).toBe(first[2]);expect(await hash(page,regions[3])).toBe(first[3]);
 expect(Number(await canvas(page).getAttribute('data-art-mib'))).toBeLessThan(64);expect(old).toEqual([]);expect(errors).toEqual([]);
 await page.screenshot({path:`artifacts/${info.project.name}-confluence-title.png`});
});

test('water does not paint the foreground bank and every authored actor support stays registered',async({page})=>{
 await clock(page);await open(page);
 const checks=await page.evaluate(async()=>{
  const root='/assets/mainmenu/confluence-v1/',meta=await(await fetch(root+'scene-v2.json')).json(),load=async file=>{const im=new Image();im.src=root+file;await im.decode();return im;};
  const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=1672;c.height=941;ctx.drawImage(await load(meta.images.plate.file),0,0);
  const bank=[665,815,40,15],base=ctx.getImageData(...bank).data,live=document.querySelector('.menu-scene-motion').getContext('2d').getImageData(...bank).data;let bankDifferences=0;for(let i=0;i<base.length;i++)if(base[i]!==live[i])bankDifferences++;
  let supportDifferences=0;
  for(const[id,top]of [['cole',310],['cat',130]]){
   const clip=meta.clips[id],im=await load(meta.images[clip.image].file),w=clip.frames[0].rect[2],h=clip.frames[0].rect[3];c.width=im.width;c.height=im.height;ctx.drawImage(im,0,0);const first=ctx.getImageData(0,top,w,h-top).data;
   for(const f of clip.frames){const data=ctx.getImageData(f.rect[0],top,w,h-top).data;for(let i=0;i<data.length;i++)if(data[i]!==first[i])supportDifferences++;}
  }
  return{bankDifferences,supportDifferences};
 });expect(checks).toEqual({bankDifferences:0,supportDifferences:0});
});

test('new-scene motion override persists; hidden time and gameplay freeze every decorative channel',async({page})=>{
 await clock(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);await expect(scene(page)).toHaveAttribute('data-motion','still');
 const still=await hash(page,[0,0,1672,941]);await page.clock.runFor(1000);expect(await hash(page,[0,0,1672,941])).toBe(still);
 await page.getByRole('button',{name:'Reduced motion · Enable animation',exact:true}).click();await page.clock.runFor(300);await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const time=await canvas(page).getAttribute('data-time');await page.clock.fastForward(45000);expect(await canvas(page).getAttribute('data-time')).toBe(time);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(100);expect(Number(await canvas(page).getAttribute('data-time'))-Number(time)).toBeLessThan(200);
 await page.reload();await expect(scene(page)).toHaveAttribute('data-renderer','ready');await expect(scene(page)).toHaveAttribute('data-motion','animated');
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(scene(page)).toHaveAttribute('data-playing','false');const frozen=await canvas(page).getAttribute('data-time');await page.clock.fastForward(45000);expect(await canvas(page).getAttribute('data-time')).toBe(frozen);
});

test('essential-art failure uses the matching poster and missing optional train art keeps animation usable',async({page})=>{
 await page.route('**/confluence-v1/cole-v1.png',r=>r.abort());await page.goto('/');await expect(scene(page)).toHaveAttribute('data-renderer','fallback');
 await expect(page.locator('.menu-poster')).toHaveAttribute('src',/confluence-v1\/poster-v2\.png$/);await expect(page.locator('.menu-poster')).toBeVisible();await expect(canvas(page)).toBeHidden();
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();await page.unroute('**/confluence-v1/cole-v1.png');
 await page.route('**/confluence-v1/train-v1.png',r=>r.abort());await clock(page);await open(page);await page.clock.runFor(24000);await expect(scene(page)).toHaveAttribute('data-renderer','ready');await expect(canvas(page)).toHaveAttribute('data-train-active','false');
});

test('a failed decorative context preserves the Confluence poster and real menu controls',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){if(this.classList.contains('menu-scene-motion'))return null;return get.apply(this,args);};});
 await page.goto('/');await expect(scene(page)).toHaveAttribute('data-renderer','fallback');await expect(page.locator('.menu-poster')).toBeVisible();
 await page.getByRole('button',{name:'Options',exact:true}).click();await expect(page.getByRole('dialog',{name:'Options',exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();
});

test('production preview inspects the real renderer, masks, sparse train events and narrow layouts',async({page})=>{
 const levels=[],errors=[];page.on('request',r=>{if(/\/levels\//.test(r.url()))levels.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/menu-production.html');await expect(page.getByRole('button',{name:'Play animation',exact:true})).toBeEnabled();
 const c=page.locator('#scene'),first=await c.getAttribute('data-actor-frame');await page.getByRole('button',{name:'Step one frame',exact:true}).click();expect(await c.getAttribute('data-actor-frame')).not.toBe(first);
 await expect(page.getByRole('slider',{name:'Time',exact:true})).toHaveAttribute('max','90000');
 await page.getByRole('combobox',{name:'Layer',exact:true}).selectOption('cole');await page.getByLabel('Show only selected').check();
 const solo=await c.evaluate(c=>{const p=c.getContext('2d').getImageData(100,100,1,1).data;return p[3];});expect(solo).toBe(0);
 await page.getByLabel('Hide selected').check();expect(await c.evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v))).toBe(false);
 await page.getByLabel('Hide selected').uncheck();await page.getByLabel('Show only selected').uncheck();await page.getByLabel('Masks and anchors').check();await page.getByLabel('Masks and anchors').uncheck();
 await page.getByRole('button',{name:'Next train',exact:true}).click();await expect(c).toHaveAttribute('data-train-active','true');
 for(const width of [390,844,1600]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(levels).toEqual([]);expect(errors).toEqual([]);
});

test('the composed scene keeps one transform at desktop, ultrawide and portrait ratios',async({page})=>{
 await clock(page);await open(page);
 for(const[width,height]of [[1600,900],[2560,1080],[390,844],[844,390]]){
  await page.setViewportSize({width,height});const b=await page.locator('.menu-scene').boundingBox(),c=await canvas(page).boundingBox();expect(Math.abs(b.width/b.height-art.width/art.height)).toBeLessThan(.005);expect(Math.abs(b.x-c.x)+Math.abs(b.y-c.y)+Math.abs(b.width-c.width)).toBeLessThan(3);
  await expect(page.getByRole('button',{name:'Play',exact:true})).toBeInViewport();await expect(scene(page)).toHaveCSS('overflow','hidden');
 }
});

test('the water current crosses a mirrored-tile boundary without flipping the field',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/menu-production.html');await expect(page.getByRole('button',{name:'Play animation',exact:true})).toBeEnabled();
 await page.getByRole('combobox',{name:'Layer',exact:true}).selectOption('canal');await page.getByLabel('Show only selected').check();
 const seek=ms=>page.getByRole('slider',{name:'Time',exact:true}).evaluate((input,ms)=>{input.value=String(ms);input.dispatchEvent(new Event('input',{bubbles:true}));},ms);
 const pixels=()=>page.locator('#scene').evaluate(c=>Array.from(c.getContext('2d').getImageData(10,920,200,15).data));
 // The near-current band crosses one tile width here. Its full pattern repeats
 // over two mirrored tiles; the authored material remains on the same frame.
 await seek(21316);const before=await pixels();expect(before.some(v=>v)).toBe(true);await seek(21318);expect(await pixels()).toEqual(before);
});
