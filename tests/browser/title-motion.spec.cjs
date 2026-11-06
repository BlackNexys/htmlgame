const {test,expect}=require('@playwright/test');
const scene=page=>page.locator('.title-art');
async function open(page,id='watcher'){
    await page.goto(id?`/?menuScene=${id}`:'/');
    await expect(page.getByRole('button',{name:'Play',exact:true})).toBeEnabled();
    await expect.poll(()=>page.locator('.title-art img[src]').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
}
const sources=page=>page.locator('[data-menu-layer][src]').evaluateAll(images=>images.map(image=>image.getAttribute('src')));

test('the supplied GIFs animate as separate layers and the pose stays fixed within a visit',async({page})=>{
    const errors=[],oldAssets=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(/\/(Foreground|Background)\.png$/.test(request.url()))oldAssets.push(request.url());});
    await open(page);await expect(scene(page)).toHaveAttribute('data-motion','animated');
    await expect(page.locator('.title-background')).toHaveAttribute('src',/station_background_ambient\.gif$/);
    await expect(page.locator('.menu-platform')).toHaveAttribute('src',/station_foreground\.gif$/);
    await expect(page.locator('.menu-character')).toHaveAttribute('src',/hero_standing\.gif$/);
    const first=await page.locator('.menu-character').screenshot();
    await expect.poll(async()=>!first.equals(await page.locator('.menu-character').screenshot())).toBe(true);
    await page.getByRole('button',{name:'Options',exact:true}).click();await page.keyboard.press('Escape');
    await expect(scene(page)).toHaveAttribute('data-scene','watcher');
    expect(await page.locator('.menu-soul').evaluateAll(souls=>new Set(souls.map(soul=>getComputedStyle(soul).animationDuration)).size)).toBe(3);
    expect(oldAssets).toEqual([]);expect(errors).toEqual([]);
});

test('each new menu visit selects a different scene while dialogs preserve the current scene',async({page})=>{
    await page.addInitScript(()=>{Math.random=()=>0;});
    await open(page,null);await expect(scene(page)).toHaveAttribute('data-scene','watcher');
    await page.getByRole('button',{name:'Controls',exact:true}).click();await page.keyboard.press('Escape');
    await expect(scene(page)).toHaveAttribute('data-scene','watcher');
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyP');
    await page.getByRole('button',{name:'Main menu',exact:true}).click();
    await expect(scene(page)).toHaveAttribute('data-scene','patient-traveller');
    await expect(page.locator('.menu-character')).toHaveAttribute('src',/hero_sitting\.gif$/);
    await page.reload();await expect(scene(page)).toHaveAttribute('data-scene','watcher');
});

test('all four scene presets load, including an empty platform with no hidden baked-in hero',async({page})=>{
    for(const [id,asset] of [['watcher','hero_standing'],['patient-traveller','hero_sitting'],['restless-flame','hero_leaning'],['absent-traveller',null]]){
        await open(page,id);await expect(scene(page)).toHaveAttribute('data-scene',id);
        if(asset){
            await expect(page.locator('.menu-character')).toHaveAttribute('src',new RegExp(`${asset}\\.gif$`));
            await expect(page.locator('.menu-hero-shadow')).toBeVisible();
        } else {
            await expect(page.locator('.menu-character')).toBeHidden();expect(await page.locator('.menu-character').getAttribute('src')).toBeNull();
            await expect(page.locator('.menu-hero-shadow')).toBeHidden();
        }
        await expect(page.locator('.menu-platform')).toHaveAttribute('src',/station_foreground\.gif$/);
    }
});

test('reduced motion, hidden tabs and gameplay use static posters and resume the same selected pose',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await open(page,'patient-traveller');
    expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
    await page.emulateMedia({reducedMotion:'no-preference'});await expect(scene(page)).toHaveAttribute('data-motion','animated');
    expect((await sources(page)).every(source=>source.endsWith('.gif'))).toBe(true);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    await expect(scene(page)).toHaveAttribute('data-playing','false');expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await expect(scene(page)).toHaveAttribute('data-scene','patient-traveller');
    await expect(page.locator('.menu-character')).toHaveAttribute('src',/hero_sitting\.gif$/);
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(scene(page)).toHaveAttribute('data-playing','false');expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
});

test('GIF failures fall back to clean stills without blocking the menu or gameplay',async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/assets/mainmenu/*.gif',route=>route.abort());await open(page);
    await expect.poll(async()=>(await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
    await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#overlay')).toBeHidden();
    expect(errors).toEqual([]);
});

test('the saved menu animation option explicitly enables motion or keeps stills',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await open(page);
    await expect(scene(page)).toHaveAttribute('data-motion','still');
    await page.getByRole('button',{name:'Options',exact:true}).click();
    await page.getByRole('combobox',{name:'Menu animation',exact:true}).selectOption('animated');
    await expect(scene(page)).toHaveAttribute('data-motion','animated');
    await page.reload();await expect(scene(page)).toHaveAttribute('data-motion','animated');
    await page.getByRole('button',{name:'Options',exact:true}).click();
    await expect(page.getByRole('combobox',{name:'Menu animation',exact:true})).toHaveValue('animated');
    await page.getByRole('combobox',{name:'Menu animation',exact:true}).selectOption('still');
    await expect(scene(page)).toHaveAttribute('data-motion','still');
    expect((await sources(page)).every(source=>source.endsWith('.png'))).toBe(true);
});

test('character, platform and foreground details share one responsive coordinate space',async({page})=>{
    await open(page,'restless-flame');
    for(const [width,height] of [[1600,900],[2560,1080],[390,844],[844,390]]){
        await page.setViewportSize({width,height});
        const bounds=await page.locator('.menu-scene').boundingBox(),platform=await page.locator('.menu-platform').boundingBox(),details=await page.locator('.menu-details').boundingBox();
        expect(Math.abs(bounds.width/bounds.height-1003/565)).toBeLessThan(.005);
        for(const rect of [platform,details]){expect(Math.abs(rect.x-bounds.x)).toBeLessThan(1);expect(Math.abs(rect.y-bounds.y)).toBeLessThan(1);expect(Math.abs(rect.width-bounds.width)).toBeLessThan(1);}
    }
});
