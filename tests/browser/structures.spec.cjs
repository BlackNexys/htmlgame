const {test,expect}=require('@playwright/test');
const document=require('../../public/levels/construction-study.json');
const {pilotInput:basePilotInput}=require('../helpers/last-platform-route.cjs');
function pilotInput(p,solids,enemies,point,timer){
    const input=basePilotInput(p,solids,enemies,point,timer);
    // Thin ledges can sit entirely above a standing player's head; jump toward their top,
    // rather than waiting to collide with a tall wall at foot level.
    const riseAhead=point.y<p.y2-4&&solids.some(r=>r.y<p.y2&&r.y>=p.y2-133&&r.x>=p.x2&&r.x-p.x2<110);
    if(p.grounded&&riseAhead&&timer.time-timer.lastJump>.3&&!input.jump){timer.lastJump=timer.time;timer.held=.35;input.jump=true;input.jumpHeld=true;}
    return input;
}
const {observe:enableDebugReading,navigate:driveRoute}=require('../helpers/browser-route.cjs');
const navigate=(page,points)=>driveRoute(page,points,pilotInput);

test('construction study renders and plays across odd-sized structures and through the doorway',async({page},info)=>{
    test.setTimeout(90000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install({time:new Date('2026-11-09T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-09T00:00:01Z'));
    await page.goto('/?level=construction-study&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await enableDebugReading(page);
    await navigate(page,[{x:530,y:805},{x:1000,y:707},{x:1302,y:721}]);
    await page.keyboard.press('F2');await page.clock.runFor(32);await page.screenshot({path:`artifacts/${info.project.name}-construction-study.png`});await page.keyboard.press('F2');await page.clock.runFor(32);
    await navigate(page,[{x:1850,y:901,drop:true},{x:2350,y:901},{x:2610,y:901}]);
    await expect(page.locator('#overlay')).toHaveAttribute('data-screen','won');expect(errors).toEqual([]);
});

test('workshop edits free dimensions and socket mounts without losing them through export and history',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await page.getByRole('button',{name:'Load construction study',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().id)).toBe(document.id);
    await expect(page.locator('#grid-size')).toHaveValue('1');
    await page.locator('#object-list').selectOption('terrain:thin-ledge');
    await page.locator('#object-properties input[name=width]').fill('319');await page.locator('#object-properties input[name=height]').fill('13');
    await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().terrain.find(r=>r.id==='thin-ledge').width)).toBe(319);
    await page.getByRole('button',{name:'Undo',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().terrain.find(r=>r.id==='thin-ledge').height)).toBe(14);
    await page.getByRole('button',{name:'Redo',exact:true}).click();
    await page.locator('#object-list').selectOption('decorations:mounted-outfall');await expect(page.locator('#object-properties input[name=parent]')).toHaveValue('bridge');
    await expect(page.locator('#object-properties input[name=socket]')).toHaveValue('supportRight');
    const before=await page.evaluate(()=>window.levelEditor.getDocument());
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();
    const stream=await (await pending).createReadStream(),chunks=[];for await(const c of stream)chunks.push(c);
    expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(before);
});
