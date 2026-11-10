const {test,expect}=require('@playwright/test');
const document=require('../../public/levels/last-platform-demo.json');
const {groups,balconyRoute,pilotInput}=require('../helpers/last-platform-route.cjs');
const key='underworld-campaign:v1';
async function start(page,preview=false){
    await page.clock.install({time:new Date('2026-11-08T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-08T00:00:01Z'));await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`/?level=last-platform-demo&observe=1${preview?'&preview=1':''}`);
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
}
async function position(page){return page.locator('#progress').evaluate((el,x)=>parseFloat(el.style.width)*x/100,document.exit.x);}
async function drive(page,goal){
    await page.keyboard.down('KeyD');await page.keyboard.down('KeyJ');let lastJump=-100,release=0,lastX=-100,stuck=0;
    for(let i=0;i<700 && await position(page)<goal;i++){
        const x=await position(page);if(i===release)await page.keyboard.up('Space');
        stuck=Math.abs(x-lastX)<.2?stuck+1:0;lastX=x;
        const surface=Math.min(...document.terrain.filter(r=>r.x<x+32 && r.x+r.width>x).map(r=>r.y));
        const obstacle=document.terrain.some(r=>r.x>=x+32-.1 && r.x<x+32+85 && r.y<surface);
        const enemy=document.enemies.some(e=>e.x>x && e.x-x<130);
        if(i-lastJump>=8 && (obstacle||enemy||stuck>2)){await page.keyboard.up('Space');await page.keyboard.down('Space');lastJump=i;release=i+3;stuck=0;}
        await page.clock.runFor(100);if(await page.locator('#overlay').isVisible())break;
    }
    await page.keyboard.up('KeyD');await page.keyboard.up('Space');await page.clock.runFor(900);await page.keyboard.up('KeyJ');
    expect(await position(page),`route stopped before ${goal}`).toBeGreaterThan(goal-50);
    await expect(page.locator('#health')).not.toHaveText('0 / 5');
}
async function interact(page,title,action){
    await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:title,exact:true})).toBeVisible();
    if(action){await page.getByRole('button',{name:action,exact:true}).click();await page.clock.runFor(100);}
}
async function save(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);}
async function cameraFromPrompt(page,objectId){
    return page.evaluate(()=>window.gameObservation().camera.y);
}
async function artScreenshot(page,path){
    await page.keyboard.press('F2');await page.clock.runFor(32);
    await page.screenshot({path});
    await page.keyboard.press('F2');await page.clock.runFor(32);
}
const {observe:enableDebugReading,navigate:driveRoute}=require('../helpers/browser-route.cjs');
const navigate=(page,points)=>driveRoute(page,points,pilotInput);

test('draft attendant dialogue and Journey work in an isolated demo preview',async({page})=>{
    await start(page,true);await drive(page,550);await page.keyboard.press('KeyF');
    await expect(page.locator('.kinetic-dialogue')).toBeVisible();await page.getByRole('button',{name:'Skip exchange',exact:true}).click();
    await page.keyboard.press('KeyK');await expect(page.locator('.journey-facts')).toContainText('upper viaduct');
    await expect(page.locator('.journey-save-note')).toContainText('never change the saved journey');
    expect(await save(page)).toBeNull();
});

test('complete the climbing and descending demo with physical clues and a real shutter release',async({page},info)=>{
    test.setTimeout(180000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(exit=>{
        window.waterDraws=0;window.blackExitBackings=0;
        const draw=CanvasRenderingContext2D.prototype.drawImage,fill=CanvasRenderingContext2D.prototype.fillRect;
        CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im instanceof HTMLImageElement&&im.src.endsWith('/water-v4.png'))window.waterDraws++;return draw.call(this,im,...args);};
        CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas.id==='game'&&this.fillStyle==='#070b10'&&x===exit.x&&y===exit.y&&w===exit.width&&h===exit.height)window.blackExitBackings++;return fill.call(this,x,y,w,h);};
    },document.exit);
    await start(page);await page.screenshot({path:`artifacts/${info.project.name}-last-platform-arrival.png`});
    await enableDebugReading(page);await navigate(page,groups.find(g=>g.name==='service').points);
    await artScreenshot(page,`artifacts/${info.project.name}-last-platform-service.png`);
    await navigate(page,groups.find(g=>g.name==='ledger').points);await expect(page.locator('#interaction')).toContainText('Transfer ledger');
    expect(await cameraFromPrompt(page,'registry-transfer-ledger')).toBeLessThan(1200);
    await artScreenshot(page,`artifacts/${info.project.name}-last-platform-registry.png`);
    await interact(page,'Arrivals / Transfer ledger','Leave');expect((await save(page)).facts).not.toContain('platform-found-transfer');
    await interact(page,'Arrivals / Transfer ledger','Record discovery');
    expect((await save(page)).facts).toContain('platform-found-transfer');expect((await save(page)).facts).not.toContain('platform-met-attendant');
    await navigate(page,groups.find(g=>g.name==='index').points);await expect(page.locator('#interaction')).toContainText('Route index');
    expect(await cameraFromPrompt(page,'archive-route-index')).toBeGreaterThan(2400);
    await interact(page,'Deadways route index','Follow this lead');
    await navigate(page,groups.find(g=>g.name==='shutter').points);await expect(page.locator('#interaction')).toBeInViewport();
    await artScreenshot(page,`artifacts/${info.project.name}-last-platform-shutter.png`);await interact(page,'Departure shutter','Release shutter');
    await navigate(page,groups.find(g=>g.name==='exit').points);await expect(page.locator('#panel-title')).toHaveText('A lead, not an answer');
    expect(await page.evaluate(()=>window.waterDraws)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.blackExitBackings)).toBe(0);
    const progress=await save(page);expect(progress.completedStages).toContain('last-platform-demo');expect(progress.unlockedStages).toContain('outbound-line');
    expect(progress.keepsakes).toEqual([]);expect(progress.completedStages).not.toContain('narrative-study');
    await expect(page.getByRole('link',{name:'Continue along the next line'})).toBeHidden();
    await page.screenshot({path:`artifacts/${info.project.name}-last-platform-complete.png`});
    await page.getByRole('button',{name:'Play again',exact:true}).click();await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-facts')).toContainText('Her name appears');await expect(page.locator('.journey-next')).toContainText('beyond this demo');
    expect(errors).toEqual([]);
});

test('the balcony Keepsake and freight entrance are playable with ordinary controls and normal combat',async({page},info)=>{
    test.setTimeout(120000);
    await start(page,true);await enableDebugReading(page);
    await navigate(page,balconyRoute[0].points);
    await expect(page.locator('#interaction')).toContainText('Unfinished letter');
    await artScreenshot(page,`artifacts/${info.project.name}-last-platform-balcony.png`);
    await interact(page,'An unfinished letter','Keep letter');
    await navigate(page,balconyRoute[1].points);
    await expect(page.locator('#interaction')).toContainText('Transfer ledger');
    await interact(page,'Arrivals / Transfer ledger','Record discovery');
    await page.keyboard.press('KeyK');
    await expect(page.locator('.journey-facts')).toContainText('Her name appears');
    await expect(page.locator('.journey-keepsakes')).toContainText('An unfinished letter');
    expect(await save(page)).toBeNull();
});
