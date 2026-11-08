const {test,expect}=require('@playwright/test');
const root='/assets/environment/confluence/v4/';

test('solid architecture is shaded without exposing scenery through its material',async({page})=>{
    await page.addInitScript(()=>{
        window.solidDraws={architecture:[],canopy:[],landmark:[]};
        const draw=CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage=function(im,...args){
            if(this.canvas.id==='game'&&im instanceof HTMLCanvasElement){
                const kind=im.width===1024&&im.height===768?'architecture':im.width===480&&im.height===198?'canopy':im.width===768&&im.height===512?'landmark':undefined;
                if(kind){window.solidDraws[kind].push(this.globalAlpha);if(kind==='architecture')window.shadedArchitecture=im;}
            }
            return draw.call(this,im,...args);
        };
    });
    await page.clock.install();await page.goto('/?level=last-platform-demo&preview=1');
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    const result=await page.evaluate(async()=>{
        const image=new Image();image.src='/assets/environment/confluence/v6/architecture-v6.png';await image.decode();
        const original=document.createElement('canvas');original.width=image.width;original.height=image.height;
        const c=original.getContext('2d');c.drawImage(image,0,0);
        const a=c.getImageData(0,0,image.width,image.height).data,b=window.shadedArchitecture.getContext('2d').getImageData(0,0,image.width,image.height).data;
        let maxAlphaChange=0;for(let i=3;i<a.length;i+=4)maxAlphaChange=Math.max(maxAlphaChange,Math.abs(a[i]-b[i]));
        return {draws:window.solidDraws,maxAlphaChange};
    });
    for(const draws of Object.values(result.draws)){expect(draws.length).toBeGreaterThan(0);expect(draws.every(a=>a===1)).toBe(true);}
    expect(result.maxAlphaChange).toBeLessThanOrEqual(1);
});

test('missing canopy art leaves the station and interaction usable',async({page})=>{
    await page.route('**/confluence/v6/canopy-v6.png',route=>route.abort());
    await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');expect(errors).toEqual([]);
});

test('building material bodies are opaque and perimeter trims retain real transparency',async({page})=>{
    await page.goto('/docs/confluence-material-check.html');
    const art=await page.evaluate(async()=>{
        const count=async name=>{
            const im=new Image();im.src='/assets/environment/confluence/v5/'+name+'-v5.png';await im.decode();
            const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
            const data=ctx.getImageData(0,0,c.width,c.height).data;let clear=0,solid=0;
            for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;if(data[i]>192)solid++;}
            return {clear,solid,size:[im.width,im.height]};
        };
        return {walls:await count('walls'),trims:await count('trims')};
    });
    expect(art.walls.size).toEqual([384,384]);expect(art.walls.solid).toBe(384*384);
    expect(art.trims.size).toEqual([768,768]);expect(art.trims.clear).toBeGreaterThan(300000);expect(art.trims.solid).toBeGreaterThan(10000);
});

test('missing building materials leave existing scenery and play available',async({page})=>{
    await page.route('**/confluence/v5/**',route=>route.abort());
    await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');expect(errors).toEqual([]);
});

test('the environment gallery contains sixteen material tiles and twelve genuinely transparent prop exports',async({page})=>{
    await page.goto('/docs/confluence-environment.html');
    await expect(page.locator('.sprite img')).toHaveCount(12);
    await expect(page.locator('.module img')).toHaveCount(12);
    await expect.poll(()=>page.evaluate(()=>Array.from(document.images).every(im=>im.complete&&im.naturalWidth>0))).toBe(true);
    const art=await page.evaluate(async root=>{
        const load=async file=>{const im=new Image();im.src=root+file;await im.decode();return im;};
        const image=await load('props-v4.png'),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
        const c=canvas.getContext('2d');c.drawImage(image,0,0);const data=c.getImageData(0,0,canvas.width,canvas.height).data;
        let transparent=0,visible=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]>128)visible++;}
        const tile=await load('terrain-v4.png'),manifest=await fetch(root+'atlas-v4.json').then(r=>r.json());
        const landmarks=await load('../v3/landmarks-v3.png');canvas.width=landmarks.width;canvas.height=landmarks.height;c.drawImage(landmarks,0,0);
        const pixels=c.getImageData(0,0,canvas.width,canvas.height).data;let landmarkClear=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)landmarkClear++;
        canvas.width=tile.width;canvas.height=tile.height;c.drawImage(tile,0,0);
        const capAlpha=c.getImageData(72,1,1,1).data[3],fillAlpha=c.getImageData(168,1,1,1).data[3];
        const facade=await load('../v6/insets-v6.png');canvas.width=facade.width;canvas.height=facade.height;c.drawImage(facade,0,0);
        let facadeClear=0;for(const [i,n] of c.getImageData(0,0,canvas.width,canvas.height).data.entries())if(i%4===3&&n===0)facadeClear++;
        const water=await load('water-v4.png');canvas.width=water.width;canvas.height=water.height;c.drawImage(water,0,0);
        const colors=new Set(),waterPixels=c.getImageData(0,0,canvas.width,canvas.height).data;for(let i=0;i<waterPixels.length;i+=4)colors.add(`${waterPixels[i]},${waterPixels[i+1]},${waterPixels[i+2]}`);
        return {transparent,visible,landmarkClear,tile:[tile.width,tile.height],frames:Object.keys(manifest.frames).length,capAlpha,fillAlpha,facadeClear,waterColors:colors.size};
    },root);
    expect(art.transparent).toBeGreaterThan(100000);expect(art.landmarkClear).toBeGreaterThan(50000);expect(art.visible).toBeGreaterThan(10000);expect(art.tile).toEqual([192,192]);expect(art.frames).toBe(12);
    expect(art.capAlpha).toBe(0);expect(art.fillAlpha).toBeGreaterThan(192);expect(art.facadeClear).toBeGreaterThan(1000);expect(art.waterColors).toBeGreaterThan(256);
    const architecture=await page.evaluate(async()=>{
        const im=new Image();im.src='/assets/environment/confluence/v6/architecture-v6.png';await im.decode();
        const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
        const pixels=ctx.getImageData(0,0,c.width,c.height).data;let clear=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)clear++;
        return {size:[im.width,im.height],clear};
    });
    expect(architecture.size).toEqual([1024,768]);expect(architecture.clear).toBeGreaterThan(200000);
});

test('facade shading preserves cutouts when the game is drawn against white',async({page},info)=>{
    await page.addInitScript(()=>{
        window.facadeAlphas=[];
        const draw=CanvasRenderingContext2D.prototype.drawImage,fill=CanvasRenderingContext2D.prototype.fillRect;
        CanvasRenderingContext2D.prototype.drawImage=function(im,...args){
            if(im instanceof HTMLImageElement&&im.src.endsWith('/city-v3.png'))return;
            if(this.canvas.id==='game'&&im instanceof HTMLCanvasElement&&im.width===768&&im.height===768)window.facadeAlphas.push(im.getContext('2d').getImageData(96,0,1,1).data[3]);
            return draw.call(this,im,...args);
        };
        CanvasRenderingContext2D.prototype.fillRect=function(...args){
            if(this.canvas.id==='game'&&(this.fillStyle==='#07131c70'||String(this.fillStyle).replace(/\s/g,'').startsWith('rgba(7,19,28,')))return;
            if(this.canvas.id==='game'&&this.fillStyle==='#0a141d'){this.save();this.fillStyle='white';fill.apply(this,args);this.restore();return;}
            return fill.apply(this,args);
        };
    });
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    const alphas=await page.evaluate(()=>window.facadeAlphas);expect(alphas.length).toBeGreaterThan(0);expect(alphas.every(a=>a===0)).toBe(true);
    const backing=await page.locator('#game').evaluate(c=>Array.from(c.getContext('2d').getImageData(900,500,1,1).data));expect(backing).toEqual([255,255,255,255]);
    await page.screenshot({path:`artifacts/${info.project.name}-confluence-white-background.png`});
});

test('missing water art leaves normal play and NPC interaction available',async({page})=>{
    await page.route('**/confluence/v4/water-v4.png',route=>route.abort());
    await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');expect(errors).toEqual([]);
});

test('missing architectural sprites preserve the district and base art',async({page})=>{
    await page.route('**/confluence/v6/architecture-v6.png',route=>route.abort());
    await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');expect(errors).toEqual([]);
});

test('a missing city backdrop preserves the other scenery layers and neutral interaction',async({page},info)=>{
    const requests=[];page.on('request',r=>{if(r.url().includes('/environment/confluence/'))requests.push(r.url());});
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{window.environmentDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&image.src.includes('/environment/')){const name=image.src.split('/').pop();if(!window.environmentDraws.includes(name))window.environmentDraws.push(name);}return draw.call(this,image,...args);};});
    await page.route('**/environment/confluence/v3/city-v3.png',route=>route.abort());
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/?level=last-platform-demo&preview=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    expect(await page.evaluate(()=>window.environmentDraws)).toEqual(expect.arrayContaining(['terrain-v4.png','insets-v6.png','props-v4.png']));
    expect(requests.length).toBeGreaterThan(0);expect(requests.every(url=>/\/confluence\/v[3456]\//.test(url))).toBe(true);
    await page.keyboard.down('KeyD');await page.clock.runFor(1200);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await expect(page.locator('#interaction')).toContainText('Rail attendant');await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toBeVisible();
    await page.screenshot({path:`artifacts/${info.project.name}-environment-layer-fallback.png`});expect(errors).toEqual([]);
});

test('the original mechanics levels do not request the Confluence kit',async({page})=>{
    const requested=[];page.on('request',request=>{if(request.url().includes('/environment/'))requested.push(request.url());});
    await page.goto('/?level=movement-course');await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.locator('#game')).toBeFocused();expect(requested).toEqual([]);
});
