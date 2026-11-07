const {test,expect}=require('@playwright/test');

async function start(page){
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=npc-study');await page.getByRole('button',{name:'Play',exact:true}).click();
}
async function approach(page){await page.keyboard.down('KeyD');await page.clock.runFor(650);await page.keyboard.up('KeyD');await page.clock.runFor(100);await expect(page.locator('#interaction')).toBeVisible();}

test('approach, interact, freeze, skip, repeat and restart a neutral NPC conversation',async({page})=>{
    await start(page);await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toHaveCount(0);
    await approach(page);await expect(page.locator('#interaction')).toContainText('Talk to Rail attendant');
    await page.screenshot({path:`artifacts/${test.info().project.name}-npc-study.png`});
    await page.keyboard.down('KeyF');await expect(page.locator('.kinetic-dialogue')).toBeVisible();
    const progress=await page.locator('#progress').getAttribute('style');await page.clock.runFor(1500);
    await expect(page.locator('#progress')).toHaveAttribute('style',progress);
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();await page.clock.runFor(100);
    await expect(page.locator('#game')).toBeFocused();await expect(page.locator('#interaction')).toContainText('Talk again');
    await page.keyboard.down('KeyF');await page.clock.runFor(200);await expect(page.locator('.kinetic-dialogue')).toHaveCount(0);
    await page.keyboard.up('KeyF');await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toHaveCount(1);
    await page.getByRole('button',{name:'Skip exchange',exact:true}).click();await page.keyboard.press('KeyR');
    await expect(page.locator('#interaction')).toBeHidden();await approach(page);
    await expect(page.locator('#interaction')).toContainText('Talk to Rail attendant');
});

test('airborne interactions and repeated fire cannot turn the attendant into a combat target',async({page})=>{
    await page.route('**/assets/npcs/rail-attendant-v1.png',route=>route.abort());
    await start(page);await approach(page);await page.keyboard.press('Space');await page.clock.runFor(150);
    await expect(page.locator('#interaction')).toBeHidden();await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toHaveCount(0);
    await page.clock.runFor(1300);await expect(page.locator('#interaction')).toBeVisible();
    const count=await page.locator('#count').textContent();await page.keyboard.down('KeyJ');await page.clock.runFor(700);await page.keyboard.up('KeyJ');
    await expect(page.locator('#interaction')).toBeVisible();await expect(page.locator('#count')).toHaveText(count);
    await page.keyboard.press('KeyF');await expect(page.locator('.kinetic-dialogue')).toBeVisible();
});

test('workshop places, inspects, moves, exports and playtests a neutral NPC with scene references',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>Boolean(window.levelEditor))).toBe(true);
    await page.getByRole('button',{name:'New level',exact:true}).click();
    await page.getByRole('button',{name:'NPC',exact:true}).click();
    await page.locator('#level-canvas').click({position:{x:216,y:288}});
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().npcs.length)).toBe(1);
    await expect(page.locator('#object-properties select[name=scene]')).toHaveValue('station-exchange');
    await page.locator('#object-properties input[name=x]').fill('480');await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().npcs[0].x)).toBe(480);
    await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('#object-properties input[name=x]')).toHaveValue('456');
    await page.getByRole('button',{name:'Redo',exact:true}).click();
    const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();
    const download=await downloadEvent,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    expect(JSON.parse(Buffer.concat(chunks).toString()).npcs[0]).toMatchObject({kind:'rail-attendant',scene:'station-exchange',x:480});
    await page.getByRole('button',{name:'Playtest',exact:true}).click();
    const game=page.frameLocator('#playtest-frame');await game.getByRole('button',{name:'Play',exact:true}).click();
    await game.locator('#game').press('KeyD');
    // This separate real-time game is paused by focus changes; use held input briefly.
    await game.locator('#game').focus();await page.keyboard.down('KeyD');await page.waitForTimeout(850);await page.keyboard.up('KeyD');
    await expect(game.locator('#interaction')).toBeVisible();await page.keyboard.press('KeyF');await expect(game.locator('.kinetic-dialogue')).toBeVisible();
    await page.getByRole('button',{name:'Close playtest',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().npcs[0].x)).toBe(480);
});
