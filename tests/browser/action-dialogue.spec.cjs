const {test,expect}=require('@playwright/test');

async function start(page, url='/?dialogueDemo=action'){
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(url);await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.locator('.action-dialogue')).toBeVisible();await page.clock.runFor(100);
}

test('travelling dialogue keeps focus, movement, jumping and fire; lines advance without a modal',async({page})=>{
    await start(page);await expect(page.locator('#game')).toBeFocused();
    expect(await page.locator('dialog[open]').count()).toBe(0);
    const initial=await page.locator('#progress').getAttribute('style');
    const first=await page.locator('.action-line').textContent();
    await page.keyboard.down('KeyD');await page.keyboard.down('KeyJ');
    await page.clock.runFor(350);await page.keyboard.press('Space');await page.clock.runFor(150);
    expect(await page.locator('#progress').getAttribute('style')).not.toBe(initial);
    await page.keyboard.up('KeyD');await page.keyboard.up('KeyJ');
    await page.clock.runFor(4000);expect(await page.locator('.action-line').textContent()).not.toBe(first);
    await page.keyboard.press('KeyN');await page.clock.runFor(100);
    await expect(page.locator('#game')).toBeFocused();
    // Space remains jump, never an advance key in this presentation.
    const beforeJump=await page.locator('.action-speaker').textContent();
    await page.keyboard.press('Space');await page.clock.runFor(100);
    await expect(page.locator('.action-speaker')).toHaveText(beforeJump);
    await page.screenshot({path:`artifacts/${test.info().project.name}-action-dialogue.png`});
});

test('log, pause, focus loss, title Continue and restart preserve the right scene lifetime',async({page})=>{
    await start(page);
    await page.keyboard.press('KeyL');await expect(page.getByRole('region',{name:'Conversation log',exact:true})).toBeVisible();
    const initial=await page.locator('#progress').getAttribute('style'); const text=await page.locator('.action-line').textContent();
    await page.keyboard.down('KeyD');await page.clock.runFor(5000);await page.keyboard.up('KeyD');
    await expect(page.locator('#progress')).toHaveAttribute('style',initial);await expect(page.locator('.action-line')).toHaveText(text);
    await page.keyboard.press('KeyL');await page.keyboard.down('KeyD');await page.clock.runFor(200);await page.keyboard.up('KeyD');
    expect(await page.locator('#progress').getAttribute('style')).not.toBe(initial);
    await page.keyboard.press('KeyP');await expect(page.locator('.action-dialogue')).toBeHidden();
    const paused=await page.locator('.action-line').textContent();await page.clock.runFor(10000);await expect(page.locator('.action-line')).toHaveText(paused);
    await page.getByRole('button',{name:'Main menu',exact:true}).click();await page.clock.runFor(1000);
    await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('.action-dialogue')).toBeVisible();
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    await page.clock.runFor(10000);await expect(page.locator('.action-line')).toHaveText(paused);
    await page.getByRole('button',{name:'Resume',exact:true}).click();
    await page.keyboard.press('KeyR');await page.clock.runFor(100);
    await expect(page.locator('.action-dialogue')).toHaveCount(1);
    await expect(page.locator('.action-line')).toContainText('Next train is late');
});

test('finishing dialogue does not clear held movement; keyboard controls and missing art remain usable',async({page})=>{
    await page.route('**/assets/dialogue/portraits-v1.png',r=>r.abort());await start(page);
    // Keyboard focus in the card holds both scene and simulation; Escape returns to play.
    await page.getByRole('button',{name:'Next dialogue line',exact:true}).focus();
    const first=await page.locator('.action-line').textContent();await page.clock.runFor(5000);
    await expect(page.locator('.action-line')).toHaveText(first);
    await page.keyboard.press('Escape');await expect(page.locator('#game')).toBeFocused();
    for(const[width,height]of [[320,568],[844,390],[2560,1080]]){
        await page.setViewportSize({width,height});
        const box=await page.locator('.action-dialogue').boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
        expect(box.height).toBeLessThan(160);
    }
    await page.setViewportSize({width:1280,height:800});
    for(let i=0;i<7;i++){await page.keyboard.press('KeyN');await page.clock.runFor(50);}
    await expect(page.locator('.action-line')).toContainText('Walk with me.');
    await page.keyboard.down('KeyD');await page.keyboard.press('KeyN');
    await expect(page.locator('.action-dialogue')).toHaveCount(0);
    await expect(page.locator('#game')).toHaveAttribute('data-dialogue-demo','heard');
    const progress=await page.locator('#progress').getAttribute('style');await page.clock.runFor(250);
    expect(await page.locator('#progress').getAttribute('style')).not.toBe(progress);await page.keyboard.up('KeyD');
});


test('terminal game outcomes cancel travelling dialogue without rewards or resuming gameplay',async({page})=>{
    require('../register.cjs');
    const level=require('../../src/levels/createEmptyLevel.ts').createEmptyLevel();
    level.enemies=[{id:'contact-fixture',kind:'skeleton',x:160,y:576,patrol:{left:160,right:160}}];
    await page.route(url=>url.pathname==='/outcome-proof.json',route=>route.fulfill({json:level}));
    await start(page,'/?dialogueDemo=action&levelUrl=/outcome-proof.json');
    for(let i=0;i<10;i++){if(await page.locator('#overlay[open]').count())break;await page.clock.runFor(1000);}
    await expect(page.locator('#panel-title')).toHaveText('The underworld bites back');
    await expect(page.locator('.action-dialogue')).toHaveCount(0);
    expect(await page.locator('#game').getAttribute('data-dialogue-demo')).toBeNull();
});
