const {test,expect}=require('@playwright/test');

async function demo(page){
    await page.clock.install(); await page.goto('/dialogue.html');
    await page.getByRole('button',{name:'Play conversation',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'The next departure',exact:true})).toBeVisible();
}

test('expressions, emphasized text, transcript, speed, keyboard reveal and completion replay',async({page})=>{
    await demo(page);
    await page.getByLabel('Text speed',{exact:true}).selectOption('36');
    await page.keyboard.press('Enter'); await expect(page.locator('.dialogue-body')).toContainText('take a seat.');
    await expect(page.locator('.dialogue-body .strong')).toHaveText('take a seat.');
    await page.keyboard.press('Enter');
    await expect(page.locator('.dialogue-portrait[data-active="true"]')).toHaveAttribute('data-expression','amused');
    await page.keyboard.press('KeyL'); await expect(page.getByLabel('Conversation log')).toBeVisible();
    await expect(page.getByLabel('Conversation log')).toContainText('Attendant');
    await page.keyboard.press('Escape'); await expect(page.getByLabel('Conversation log')).toBeHidden();
    await page.getByLabel('Text speed',{exact:true}).selectOption('0');
    // Clicking advances also works when the selector has focus; dialogue never injects HTML.
    for(let i=0;i<14;i++){
        if(!await page.locator('.dialogue-overlay').count())break;
        await page.clock.runFor(1000);
        const next=page.getByRole('button',{name:'Continue',exact:true});
        if(await next.count())await next.click();
    }
    await page.clock.runFor(1000);
    await expect(page.locator('.dialogue-overlay')).toHaveCount(0);
    await expect(page.locator('#demo-effect')).toContainText('applied 1 time');
    await expect(page.getByRole('button',{name:'Replay conversation',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Replay conversation',exact:true}).click();
    await page.getByRole('button',{name:'Skip scene',exact:true}).click();
    await expect(page.locator('#demo-effect')).toContainText('applied 1 time');
});

test('pausing, window blur, missing portraits, reduced motion and small windows remain usable',async({page})=>{
    await page.route('**/assets/dialogue/portraits-v1.png',route=>route.abort());
    await page.emulateMedia({reducedMotion:'reduce'}); await demo(page); await page.clock.runFor(100);
    await expect(page.locator('.dialogue-body')).toContainText('take a seat.');
    await page.getByLabel('Text speed',{exact:true}).selectOption('22');
    await page.getByRole('button',{name:'Continue',exact:true}).click(); await page.clock.runFor(100);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    const before=await page.locator('.dialogue-body').textContent(); await page.clock.runFor(2000);
    await expect(page.locator('.dialogue-body')).toHaveText(before);
    await expect(page.getByRole('button',{name:'Resume scene',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Resume scene',exact:true}).click(); await page.clock.runFor(1000);
    expect((await page.locator('.dialogue-body').textContent()).length).toBeGreaterThan(before.length);
    for(const[width,height]of [[320,568],[844,390],[2560,1080]]){
        await page.setViewportSize({width,height});
        const overflow=await page.locator('.dialogue-overlay').evaluate(e=>e.scrollWidth>innerWidth);
        expect(overflow).toBe(false);
        await page.getByRole('button',{name:'Skip scene',exact:true}).scrollIntoViewIfNeeded();
        await expect(page.getByRole('button',{name:'Skip scene',exact:true})).toBeInViewport();
    }
    await page.getByRole('button',{name:'Skip scene',exact:true}).click(); await expect(page.locator('.dialogue-overlay')).toHaveCount(0);
});

test('gameplay intro freezes combat, clears input and resumes once after skip and restart',async({page})=>{
    await page.clock.install(); await page.goto('/?dialogueDemo=1');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.locator('.dialogue-overlay')).toBeVisible();
    const initial=await page.locator('#progress').getAttribute('style');
    await page.keyboard.down('KeyD'); await page.keyboard.down('KeyJ'); await page.clock.runFor(5000);
    await expect(page.locator('#progress')).toHaveAttribute('style',initial);
    await expect(page.locator('#health')).toHaveText('5 / 5');
    await page.getByRole('button',{name:'Skip scene',exact:true}).click();
    await expect(page.locator('#game')).toBeFocused(); await expect(page.locator('#game')).toHaveAttribute('data-dialogue-demo','heard');
    await page.clock.runFor(1000); await expect(page.locator('#progress')).toHaveAttribute('style',initial);
    await page.keyboard.up('KeyD');await page.keyboard.up('KeyJ');
    await page.keyboard.down('KeyD');await page.clock.runFor(300);await page.keyboard.up('KeyD');
    expect(await page.locator('#progress').getAttribute('style')).not.toBe(initial);
    await page.keyboard.press('KeyR');await expect(page.locator('.dialogue-overlay')).toHaveCount(1);
    await page.getByRole('button',{name:'Skip scene',exact:true}).click();await expect(page.locator('#game')).toBeFocused();
});
