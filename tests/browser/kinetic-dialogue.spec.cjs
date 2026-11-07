const {test,expect}=require('@playwright/test');

async function start(page, reduced=true){
    await page.clock.install();
    await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
    await page.goto('/?dialogueDemo=kinetic');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'A moment before departure',exact:true})).toBeVisible();
    await page.clock.runFor(100);
}

test('a centered exchange freezes gameplay and alternates expressive speakers without a dialogue panel',async({page})=>{
    await start(page);await expect(page.locator('#game-hud')).toBeHidden();
    await expect(page.locator('.kinetic-dialogue')).toHaveAttribute('data-side','right');
    const initial=await page.locator('#progress').getAttribute('style');
    await page.keyboard.down('KeyD');await page.keyboard.down('KeyJ');
    await page.clock.runFor(300);
    await expect(page.locator('#progress')).toHaveAttribute('style',initial);
    await expect(page.locator('.kinetic-line')).toContainText('The next train?');
    await page.keyboard.press('Enter');await page.clock.runFor(100);
    await expect(page.locator('.kinetic-dialogue')).toHaveAttribute('data-side','left');
    await expect(page.locator('.kinetic-name')).toHaveText('Traveller');
    await expect(page.locator('.kinetic-portrait')).toHaveAttribute('data-expression','amused');
    await expect(page.locator('.kinetic-echo')).toContainText('The next train?');
    expect(await page.locator('.dialogue-panel').count()).toBe(0);
    await page.screenshot({path:`artifacts/${test.info().project.name}-kinetic-exchange.png`});
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();
    await expect(page.locator('#game')).toBeFocused();await expect(page.locator('#game-hud')).toBeVisible();
    await page.clock.runFor(600);await expect(page.locator('#progress')).toHaveAttribute('style',initial);
    await page.keyboard.up('KeyD');await page.keyboard.up('KeyJ');
    await page.keyboard.down('KeyD');await page.clock.runFor(250);await page.keyboard.up('KeyD');
    expect(await page.locator('#progress').getAttribute('style')).not.toBe(initial);
});

test('autoplay holds and resumes across log, blur and manual advance without granting effects early',async({page})=>{
    await start(page);
    const first=await page.locator('.kinetic-line').textContent();await page.clock.runFor(2500);
    expect(await page.locator('.kinetic-line').textContent()).not.toBe(first);
    await page.keyboard.press('KeyL');await expect(page.getByRole('region',{name:'Conversation log',exact:true})).toBeVisible();
    const before=await page.locator('.kinetic-line').textContent();await page.clock.runFor(5000);
    await expect(page.locator('.kinetic-line')).toHaveText(before);
    await page.keyboard.press('Escape');await expect(page.getByRole('region',{name:'Conversation log',exact:true})).toBeHidden();
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.clock.runFor(5000);
    await expect(page.locator('.kinetic-line')).toHaveText(before);
    expect(await page.locator('#game').getAttribute('data-dialogue-demo')).toBeNull();
    await page.getByRole('button',{name:'Resume exchange',exact:true}).click();
    await page.clock.runFor(40000);
    await expect(page.locator('.kinetic-dialogue')).toHaveCount(0);
    await expect(page.locator('#game')).toHaveAttribute('data-dialogue-demo','heard');
    await expect(page.locator('#game')).toBeFocused();
    await page.keyboard.press('KeyR');await expect(page.locator('.kinetic-dialogue')).toHaveCount(1);
});

test('standalone replay, fallback art, reduced motion and viewport changes remain readable',async({page})=>{
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.route('**/assets/dialogue/portraits-v1.png',route=>route.abort());
    await page.goto('/dialogue.html');await page.getByRole('button',{name:'Play kinetic exchange',exact:true}).click();await page.clock.runFor(100);
    await expect(page.locator('.kinetic-portrait')).toHaveAttribute('data-ready','false');
    expect(await page.locator('.kinetic-dialogue').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
    for(const[width,height]of [[1440,900],[390,844],[320,568],[844,390]]){
        await page.setViewportSize({width,height});
        expect(await page.locator('.kinetic-dialogue').evaluate(e=>e.scrollWidth>innerWidth)).toBe(false);
        const text=await page.locator('.kinetic-line').boundingBox();
        expect(text.x).toBeGreaterThanOrEqual(0);expect(text.x+text.width).toBeLessThanOrEqual(width);
        await page.getByRole('button',{name:'Skip exchange',exact:true}).scrollIntoViewIfNeeded();
        await expect(page.getByRole('button',{name:'Skip exchange',exact:true})).toBeInViewport();
    }
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();
    await expect(page.locator('#demo-effect')).toContainText('applied 1 time');
    await expect(page.getByRole('button',{name:'Replay kinetic exchange',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Replay kinetic exchange',exact:true}).click();
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();
    await expect(page.locator('#demo-effect')).toContainText('applied 1 time');
});

test('turn movement is active normally and cancels immediately when reduced motion is enabled',async({page})=>{
    await start(page,false);
    await page.getByRole('button',{name:'Reveal line',exact:true}).click();
    await page.keyboard.press('Enter');
    const side=await page.locator('.kinetic-dialogue').getAttribute('data-side');
    expect(side).toBe('left');
    // Inspect the animation configuration, rather than relying on a screenshot mid-transition.
    const motion=await page.locator('.kinetic-dialogue').evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.effect.getTiming().duration));
    expect(motion.length).toBeGreaterThan(0);
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect.poll(()=>page.locator('.kinetic-dialogue').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
});
