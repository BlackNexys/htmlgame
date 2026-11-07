const {test,expect}=require('@playwright/test');
const key='underworld-campaign:v1';
async function start(page,suffix=''){
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`/?level=narrative-study${suffix}`);await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
}
async function position(page){return page.locator('#progress').evaluate(el=>parseFloat(el.style.width)*2160/100);}
async function walk(page,x,fire=false){
    const direction=await position(page)<x?'KeyD':'KeyA';await page.keyboard.down(direction);if(fire)await page.keyboard.down('KeyJ');
    for(let i=0;i<100;i++){
        await page.clock.runFor(75);const p=await position(page);
        if(direction==='KeyD'?p>=x:p<=x)break;
    }
    await page.keyboard.up(direction);if(fire)await page.keyboard.up('KeyJ');await page.clock.runFor(150);
}
async function save(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);}
async function interact(page,title,action){
    await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:title,exact:true})).toBeVisible();
    if(action)await page.getByRole('button',{name:action,exact:true}).click();await page.clock.runFor(100);
}

test('explore, cancel, collect, investigate, unlock and continue with immediate durable discoveries',async({page})=>{
    await start(page);
    await page.getByRole('button',{name:'Journey · K',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'Journey',exact:true})).toBeVisible();
    await expect(page.locator('.journey-lead')).toContainText('speak');
    await page.getByRole('button',{name:'Back to game',exact:true}).click();
    await walk(page,630);await interact(page,'An unfinished letter','Leave');
    expect((await save(page)).keepsakes).toEqual([]);
    await interact(page,'An unfinished letter','Keep letter');expect((await save(page)).keepsakes).toEqual(['lost-letter']);
    await walk(page,1040);await interact(page,'Transfer ledger');
    const p=await position(page);await page.clock.runFor(1200);expect(await position(page)).toBe(p);
    await page.keyboard.press('Escape');expect((await save(page)).facts).not.toContain('found-transfer-record');
    await interact(page,'Transfer ledger','Record discovery');
    expect((await save(page)).facts).toContain('found-transfer-record');expect((await save(page)).facts).not.toContain('met-rail-attendant');
    await page.keyboard.press('KeyR');await walk(page,630);await expect(page.locator('#interaction')).toBeHidden();
    await walk(page,1380);await interact(page,'Route index','Follow this lead');
    expect((await save(page)).completedStages).toEqual([]);
    await walk(page,1890,true);await interact(page,'Departure gate','Open gate');
    await walk(page,2160,true);await expect(page.locator('#overlay')).toHaveAttribute('data-screen','won');
    expect((await save(page)).completedStages).toEqual(['narrative-study']);expect((await save(page)).unlockedStages).toContain('departure-study');
    await expect(page.getByRole('link',{name:'Continue along the next line'})).toBeVisible();
    await page.screenshot({path:`artifacts/${test.info().project.name}-narrative-complete.png`});
    await page.getByRole('link',{name:'Continue along the next line'}).click();await expect(page).toHaveURL(/level=departure-study/);
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-keepsakes')).toContainText('An unfinished letter');
});

test('attendant changes after physical evidence; skipping commits knowledge and reload preserves it',async({page})=>{
    await start(page);await walk(page,370);await page.keyboard.press('KeyF');
    await expect(page.locator('.kinetic-dialogue')).toBeVisible();
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();await page.clock.runFor(100);
    expect((await save(page)).facts).toContain('learned-about-registry');expect((await save(page)).facts).not.toContain('found-transfer-record');
    await walk(page,1040);await interact(page,'Transfer ledger','Record discovery');
    await walk(page,460);await page.keyboard.press('KeyF');await page.clock.runFor(250);
    await page.screenshot({path:`artifacts/${test.info().project.name}-narrative-record-reaction.png`});
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();
    expect((await save(page)).facts).toContain('learned-next-destination');
    await page.reload();await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-lead')).toContainText('gate');await expect(page.locator('.journey-facts')).toContainText('A transfer was recorded');
    await page.screenshot({path:`artifacts/${test.info().project.name}-journey-panel.png`});
});

test('malformed saves are preserved with a warning until the player explicitly resets',async({page})=>{
    await page.addInitScript(k=>localStorage.setItem(k,'broken original save'),key);
    await start(page);await expect(page.locator('.save-warning')).toContainText('preserved');
    expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('broken original save');
    await page.keyboard.press('KeyK');page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Reset prototype journey',exact:true}).click();
    expect((await save(page)).keepsakes).toEqual([]);await expect(page.locator('.save-warning')).toBeHidden();
});

test('workshop preview leaves the saved campaign untouched',async({page})=>{
    await start(page,'&preview=1');await walk(page,1040);await interact(page,'Transfer ledger','Record discovery');
    expect(await save(page)).toBeNull();await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-facts')).toContainText('A transfer was recorded');
    await expect(page.locator('.journey-save-note')).toContainText('never change the saved journey');
});

test('storage failure warns without stopping discoveries, and an interrupted exchange grants nothing',async({page})=>{
    await page.addInitScript(k=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===k)throw new DOMException('Storage full','QuotaExceededError');return set.call(this,name,value);};},key);
    await start(page);await expect(page.locator('.save-warning')).toContainText('could not be saved');
    await walk(page,370);await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toBeVisible();
    await page.reload();await page.getByRole('button',{name:'Play',exact:true}).click();await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-facts')).not.toContainText('Met the railway attendant');await page.getByRole('button',{name:'Back to game',exact:true}).click();
    await walk(page,1040);await interact(page,'Transfer ledger','Record discovery');await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-facts')).toContainText('A transfer was recorded');await expect(page.locator('.journey-dialog .journey-warning')).toContainText('could not be saved');
});

test('workshop object presets retain their validated effects through editing, undo and export',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>Boolean(window.levelEditor))).toBe(true);
    await page.getByRole('button',{name:'New level',exact:true}).click();await page.getByRole('button',{name:'Object',exact:true}).click();
    await page.locator('#interaction-preset').selectOption('record');await page.locator('#level-canvas').click({position:{x:300,y:288}});
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().interactables.length)).toBe(1);
    await expect(page.locator('#object-properties select[name=effectId]')).toHaveValue('inspect-transfer-record');
    await page.locator('#object-properties input[name=label]').fill('Arrival records');await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Redo',exact:true}).click();
    const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();
    const download=await event,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    expect(JSON.parse(Buffer.concat(chunks).toString()).interactables[0]).toMatchObject({label:'Arrival records',kind:'inspect',effectId:'inspect-transfer-record'});
});

test('a failed stage-completion save remains visible and withholds onward navigation',async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await start(page);await walk(page,1040);await interact(page,'Transfer ledger','Record discovery');
    await walk(page,1380);await interact(page,'Route index','Follow this lead');
    await walk(page,1890,true);await interact(page,'Departure gate','Open gate');
    await expect(page.locator('#game')).toBeFocused();
    await page.evaluate(k=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===k)throw Error('Storage full');return set.call(this,name,value);};},key);
    await walk(page,2160,true);expect(errors).toEqual([]);await expect(page.locator('#overlay')).toHaveAttribute('data-screen','won');
    await expect(page.locator('#session-menu .journey-warning')).toBeVisible();
    await expect(page.locator('#session-menu .journey-warning')).toContainText('could not be saved');
    await expect(page.getByRole('link',{name:'Continue along the next line'})).toBeHidden();
    expect((await save(page)).completedStages).toEqual([]);
});

test('Journey remains readable and keyboard-dismissible on a small viewport',async({page})=>{
    await page.setViewportSize({width:360,height:640});await start(page);await page.keyboard.press('KeyK');
    const dialog=page.getByRole('dialog',{name:'Journey',exact:true});await expect(dialog).toBeVisible();
    const box=await dialog.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(360);
    await page.getByRole('button',{name:'Back to game',exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:`artifacts/${test.info().project.name}-journey-small.png`});
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(page.locator('#game')).toBeFocused();
});
