const {test,expect}=require('@playwright/test');
const root='/assets/environment/confluence/v1/';

test('the environment gallery contains sixteen material tiles and twelve genuinely transparent prop exports',async({page})=>{
    await page.goto('/docs/confluence-environment.html');
    await expect(page.locator('.sprite img')).toHaveCount(12);
    await expect(page.locator('.module img')).toHaveCount(12);
    await expect.poll(()=>page.evaluate(()=>Array.from(document.images).every(im=>im.complete&&im.naturalWidth>0))).toBe(true);
    const art=await page.evaluate(async root=>{
        const load=async file=>{const im=new Image();im.src=root+file;await im.decode();return im;};
        const image=await load('props-v1.png'),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
        const c=canvas.getContext('2d');c.drawImage(image,0,0);const data=c.getImageData(0,0,canvas.width,canvas.height).data;
        let transparent=0,visible=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]>128)visible++;}
        const tile=await load('terrain-v1.png'),manifest=await fetch(root+'atlas-v1.json').then(r=>r.json());
        const landmarks=await load('landmarks-v1.png');canvas.width=landmarks.width;canvas.height=landmarks.height;c.drawImage(landmarks,0,0);
        const pixels=c.getImageData(0,0,canvas.width,canvas.height).data;let landmarkClear=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)landmarkClear++;
        return {transparent,visible,landmarkClear,tile:[tile.width,tile.height],frames:Object.keys(manifest.frames).length};
    },root);
    expect(art.transparent).toBeGreaterThan(100000);expect(art.landmarkClear).toBeGreaterThan(50000);expect(art.visible).toBeGreaterThan(10000);expect(art.tile).toEqual([192,192]);expect(art.frames).toBe(12);
    const architecture=await page.evaluate(async()=>{
        const im=new Image();im.src='/assets/environment/confluence/v2/architecture-v2.png';await im.decode();
        const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
        const pixels=ctx.getImageData(0,0,c.width,c.height).data;let clear=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)clear++;
        return {size:[im.width,im.height],clear};
    });
    expect(architecture.size).toEqual([1024,768]);expect(architecture.clear).toBeGreaterThan(200000);
});

test('missing architectural sprites preserve the district and base art',async({page})=>{
    await page.route('**/confluence/v2/architecture-v2.png',route=>route.abort());
    await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');expect(errors).toEqual([]);
});

test('a missing city backdrop preserves the other scenery layers and neutral interaction',async({page},info)=>{
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{window.environmentDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&image.src.includes('/environment/')){const name=image.src.split('/').pop();if(!window.environmentDraws.includes(name))window.environmentDraws.push(name);}return draw.call(this,image,...args);};});
    await page.route('**/environment/confluence/v1/city-v1.png',route=>route.abort());
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    expect(await page.evaluate(()=>window.environmentDraws)).toEqual(expect.arrayContaining(['terrain-v1.png','facades-v1.png','props-v1.png']));
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toBeVisible();
    await page.screenshot({path:`artifacts/${info.project.name}-environment-layer-fallback.png`});expect(errors).toEqual([]);
});

test('the original mechanics levels do not request the Confluence kit',async({page})=>{
    const requested=[];page.on('request',request=>{if(request.url().includes('/environment/'))requested.push(request.url());});
    await page.goto('/?level=movement-course');await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.locator('#game')).toBeFocused();expect(requested).toEqual([]);
});
