const {test,expect}=require('@playwright/test');
const route=require('../helpers/lantern-quay-route.cjs');
const {navigate}=require('../helpers/browser-route.cjs');
const state=page=>page.evaluate(()=>window.gameObservation());
async function start(page){
    await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=lantern-quay&observe=1');
    await page.evaluate(()=>localStorage.setItem('underworld-campaign:v1','keep-this-save'));
    await page.getByRole('button',{name:'Play',exact:true}).click();
}
async function finishFight(page,kind){
    const snapshot=await state(page),target=snapshot.enemies.find(e=>e.health>0&&e.kind===kind);
    if(target){const key=target.x>snapshot.player.x?'KeyD':'KeyA';await page.keyboard.down(key);await page.clock.runFor(50);await page.keyboard.up(key);}
    await page.keyboard.down('KeyJ');
    for(let i=0;i<60&&(await state(page)).enemies.some(e=>e.health>0&&e.kind===kind);i++)await page.clock.runFor(50);
    await page.keyboard.up('KeyJ');
    expect((await state(page)).enemies.filter(e=>e.kind===kind).every(e=>e.health<=0),JSON.stringify(await state(page))).toBe(true);
    expect((await state(page)).player.health).toBeGreaterThan(0);
}
test('the upper crossing, fight and quiet exchange lead to the exit through real input',async({page},info)=>{
    await start(page);await page.screenshot({path:`artifacts/${info.project.name}-lantern-quay-arrival.png`});
    await navigate(page,route.main,route.pilotInput);await page.screenshot({path:`artifacts/${info.project.name}-lantern-quay-crossing.png`});
    await navigate(page,[route.yard[0]],route.pilotInput);await finishFight(page,'zombie');
    await navigate(page,[route.yard[1]],route.pilotInput);await finishFight(page,'skeleton');
    await navigate(page,[route.quiet[0]],route.pilotInput);await page.keyboard.press('KeyF');
    await expect(page.getByRole('dialog',{name:'A saved seat',exact:true})).toBeVisible();
    const frozen=(await state(page)).time;await page.clock.runFor(600);expect((await state(page)).time).toBe(frozen);
    await page.getByRole('button',{name:'Leave the seat free',exact:true}).click();
    await navigate(page,[route.quiet[1]],route.pilotInput);await page.keyboard.press('KeyF');
    await expect(page.getByRole('dialog',{name:'A light left on',exact:true})).toBeVisible();
    const paused=(await state(page)).time;await page.clock.runFor(600);expect((await state(page)).time).toBe(paused);
    await page.screenshot({path:`artifacts/${info.project.name}-lantern-quay-exchange.png`});
    let heardSearch=false,heardLamp=false;
    for(let i=0;i<20&&await page.locator('.kinetic-dialogue').isVisible();i++){
        const line=await page.locator('.kinetic-line').textContent();heardSearch ||= line.includes('for me.');heardLamp ||= line.includes('keep this light on');
        await page.keyboard.press('Enter');await page.clock.runFor(60);
    }
    expect(heardSearch).toBe(true);expect(heardLamp).toBe(true);await expect(page.locator('.kinetic-dialogue')).toHaveCount(0);
    await navigate(page,route.exit,route.pilotInput);await expect(page.locator('#panel-title')).toHaveText('The passage is open');
    expect(await page.evaluate(()=>localStorage.getItem('underworld-campaign:v1'))).toBe('keep-this-save');
});
test('a missed crossing uses the low recovery walk and still completes',async({page})=>{
    await start(page);await navigate(page,[...route.recovery,route.yard[0]],route.pilotInput);await finishFight(page,'zombie');
    await navigate(page,[route.yard[1]],route.pilotInput);await finishFight(page,'skeleton');
    await navigate(page,[...route.quiet,...route.exit],route.pilotInput);
    await expect(page.locator('#panel-title')).toHaveText('The passage is open');
});
test('the slice opens as source-backed assemblies in the workshop',async({page})=>{
    await page.goto('/editor.html');await page.locator('#source-level').selectOption('lantern-quay');
    await page.getByRole('button',{name:'Open level source',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor?.getDocument().id)).toBe('lantern-quay');
    await page.locator('#assembly-list').selectOption('courtyard');
    await page.locator('#assembly-properties [name="param-building"]').fill('400');
    await page.getByRole('button',{name:'Apply assembly',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().props.find(p=>p.id==='courtyard--quay--rear-wall').height)).toBe(400);
    expect(await page.evaluate(()=>window.levelEditor.getLayout().operations.length)).toBe(0);
    await page.getByRole('button',{name:'Undo',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().props.find(p=>p.id==='courtyard--quay--rear-wall').height)).toBe(384);
});
