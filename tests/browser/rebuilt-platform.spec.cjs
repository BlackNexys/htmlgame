const {test,expect}=require('@playwright/test');
const {beats,document,routeInput}=require('../helpers/rebuilt-platform-route.cjs');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const solids=compileLevel(document).solids;

test('missing drainage art and water texture preserve play and the neutral interaction',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/confluence/v7/**',route=>route.abort());
    await page.route('**/water-v4.png',route=>route.abort());
    await page.clock.install();await page.goto('/?level=last-platform-rebuild&observe=1');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await page.keyboard.down('KeyD');await page.clock.runFor(1350);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await page.keyboard.press('KeyF');await expect(page.getByRole('button',{name:'Skip exchange',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
});
const {observe:enableDebugReading,navigate:driveRoute}=require('../helpers/browser-route.cjs');
const navigate=(page,points)=>driveRoute(page,points,routeInput);

test('rebuilt preview completes with real inputs and leaves campaign storage intact',async({page},info)=>{
    test.setTimeout(180000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.clock.install({time:new Date('2026-11-08T00:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-08T00:00:01Z'));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=last-platform-rebuild&observe=1');
    await page.evaluate(()=>localStorage.setItem('underworld-campaign:v1','existing-campaign-sentinel'));
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.screenshot({path:`artifacts/${info.project.name}-rebuilt-arrival.png`});
    await enableDebugReading(page);
    const interact=async(title,action)=>{
        await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:title,exact:true})).toBeVisible();
        await page.getByRole('button',{name:action,exact:true}).click();await page.clock.runFor(100);
    };
    const cards={
        'registry-transfer-ledger':['Arrivals / Transfer ledger','Record discovery'],
        'archive-route-index':['Deadways route index','Follow this lead'],
        'departure-shutter':['Departure shutter','Release shutter'],
    };
    for(const beat of beats){await navigate(page,beat.points);await interact(...cards[beat.object]);}
    const departure=document.terrain.find(r=>r.id==='departure');
    await navigate(page,[{x:document.exit.x+4,y:departure.y}]);
    await expect(page.locator('#panel-title')).toHaveText('A lead, not an answer');
    expect(await page.evaluate(()=>localStorage.getItem('underworld-campaign:v1'))).toBe('existing-campaign-sentinel');
    expect(errors).toEqual([]);
});
