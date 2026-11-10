const {test,expect}=require('@playwright/test');
const route=require('../helpers/sluice-exchange-route.cjs');
const {observe,navigate}=require('../helpers/browser-route.cjs');
const drive=(page,points)=>navigate(page,points,route.routeInput);
async function start(page){
    await page.clock.install({time:new Date('2026-11-09T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-09T00:00:01Z'));await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=sluice-exchange&observe=1');await page.evaluate(()=>localStorage.setItem('underworld-campaign:v1','sluice-save-sentinel'));
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);await observe(page);
}
async function inspect(page,title,action){
    await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:title,exact:true})).toBeVisible();
    const time=await page.evaluate(()=>window.gameObservation().time);await page.clock.runFor(600);expect(await page.evaluate(()=>window.gameObservation().time)).toBe(time);
    await page.getByRole('button',{name:action,exact:true}).click();await page.clock.runFor(100);
}
async function finish(page,errors){
    await expect(page.locator('#overlay')).toHaveAttribute('data-screen','won');expect(await page.evaluate(()=>localStorage.getItem('underworld-campaign:v1'))).toBe('sluice-save-sentinel');expect(errors).toEqual([]);
}

test('Sluice folded main route completes through real combat and optional manifold inspection',async({page},info)=>{
    test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
    await drive(page,route.upper);await drive(page,route.gallery.slice(0,4));await inspect(page,'Exchange manifold','Close diagram');
    await page.screenshot({path:`artifacts/${info.project.name}-sluice-manifold.png`});
    await drive(page,route.gallery.slice(4));await drive(page,route.middle);await page.screenshot({path:`artifacts/${info.project.name}-sluice-pump.png`});
    await drive(page,route.lower);await drive(page,route.finale);await finish(page,errors);
});

test('Sluice roof signal loop reconnects to the main route without changing campaign progress',async({page})=>{
    test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
    await drive(page,route.roof.slice(0,5));await inspect(page,'Signal-room maintenance note','Leave the light on');
    await drive(page,route.roof.slice(5));await drive(page,[...route.gallery,...route.middle,...route.lower,...route.finale]);await finish(page,errors);
});

test('Sluice actual missed jumps and low culvert recover forward with normal keyboard controls',async({page},info)=>{
    test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
    await drive(page,[...route.upperRecovery,...route.middle]);
    await drive(page,route.culvert.slice(0,1));expect(await page.evaluate(()=>window.gameObservation().player.height)).toBe(32);
    await page.screenshot({path:`artifacts/${info.project.name}-sluice-culvert.png`});
    await drive(page,route.culvert.slice(1,2));await inspect(page,'Return-loop pressure slate','Close slate');await drive(page,route.culvert.slice(2));expect(await page.evaluate(()=>window.gameObservation().player.height)).toBe(52);
    await drive(page,route.lowerRecovery);await finish(page,errors);
});

test('Sluice large workshop document retains its layers, water graph and mounts through export',async({page},info)=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await page.locator('#level-file').setInputFiles({name:'sluice.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(route.document))});
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().id)).toBe(route.document.id);
    await page.locator('#object-list').selectOption('terrain:lower-works');await expect(page.locator('#object-properties input[name=y]')).toHaveValue('2592');
    await page.screenshot({path:`artifacts/${info.project.name}-sluice-workshop.png`});
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();const stream=await (await pending).createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(route.document);expect(errors).toEqual([]);
});
