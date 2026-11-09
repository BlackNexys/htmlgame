const {test,expect}=require('@playwright/test');
const {main,document}=require('../helpers/rebuilt-platform-route.cjs');
const {pilotInput}=require('../helpers/last-platform-route.cjs');

test('missing drainage art and water texture preserve play and the neutral interaction',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/confluence/v7/**',route=>route.abort());
    await page.route('**/water-v4.png',route=>route.abort());
    await page.clock.install();await page.goto('/?level=last-platform-rebuild');
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await page.keyboard.down('KeyD');await page.clock.runFor(1350);await page.keyboard.up('KeyD');await page.clock.runFor(200);
    await page.keyboard.press('KeyF');await expect(page.getByRole('button',{name:'Skip exchange',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
});
async function enableDebugReading(page){
    // Observe the shipped F2 debug drawing; no access to Game/World internals.
    await page.evaluate(()=>{
        const stroke=CanvasRenderingContext2D.prototype.strokeRect,fill=CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.strokeRect=function(x,y,width,height){
            if(this.strokeStyle==='#e9f279')window.debugDrawing={x,y,width,height,enemies:[]};
            else if(this.strokeStyle==='#ff7e88' && window.debugDrawing)window.debugDrawing.enemies.push({x,y,width,height,health:1});
            return stroke.call(this,x,y,width,height);
        };
        CanvasRenderingContext2D.prototype.fillText=function(text,...args){
            if(window.debugDrawing){
                const speed=/^x .+ y .+ vx (-?\d+) vy (-?\d+)$/.exec(String(text));
                if(speed){window.debugDrawing.vx=Number(speed[1]);window.debugDrawing.vy=Number(speed[2]);}
                const motion=/^(.+) · aim .+ · wall (-?\d+)$/.exec(String(text));
                if(motion){window.debugDrawing.grounded=['idle','running','sprinting','crouching'].includes(motion[1]);window.debugDrawing.movement={wallSide:Number(motion[2])};}
            }
            return fill.call(this,text,...args);
        };
    });
    await page.keyboard.press('F2');await page.clock.runFor(50);
}
async function navigate(page,points){
    const held={left:false,right:false,fire:false,jumpHeld:false},timer={time:0,lastJump:-100,held:0};
    const send=async input=>{
        for(const [action,key] of [['left','KeyA'],['right','KeyD'],['fire','KeyJ']])if(input[action]!==held[action]){
            await page.keyboard[input[action]?'down':'up'](key);held[action]=input[action];
        }
        if(input.jump){await page.keyboard.up('Space');await page.keyboard.down('Space');held.jumpHeld=true;}
        else if(!!input.jumpHeld!==held.jumpHeld){await page.keyboard[input.jumpHeld?'down':'up']('Space');held.jumpHeld=!!input.jumpHeld;}
        await page.clock.runFor(50);
        timer.time+=.05;timer.held-=.05;
    };
    for(const point of points){
        let reached=false,last;
        for(let i=0;i<500;i++){
            if(await page.locator('#overlay').getAttribute('data-screen')==='won'){reached=true;break;}
            const p=await page.evaluate(()=>window.debugDrawing);expect(p?.movement).toBeTruthy();last=p;
            p.x2=p.x+p.width;p.y2=p.y+p.height;
            if(Math.abs(point.x-p.x)<20 && Math.abs(p.y2-point.y)<3 && p.grounded){reached=true;break;}
            await send(pilotInput(p,document.terrain,p.enemies,point,timer));
        }
        expect(reached,`Route stopped at ${last?.x},${last?.y}, target ${point.x},${point.y}`).toBe(true);
        for(let i=0;i<6;i++)await send({left:false,right:false,fire:true,jump:false,jumpHeld:false});
    }
    for(const key of ['KeyA','KeyD','KeyJ','Space'])await page.keyboard.up(key);
    await expect(page.locator('#health')).not.toHaveText('0 / 5');
}

test('rebuilt preview completes with real inputs and leaves campaign storage intact',async({page},info)=>{
    test.setTimeout(180000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.clock.install({time:new Date('2026-11-08T00:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-08T00:00:01Z'));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?level=last-platform-rebuild');
    await page.evaluate(()=>localStorage.setItem('underworld-campaign:v1','existing-campaign-sentinel'));
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    await page.screenshot({path:`artifacts/${info.project.name}-rebuilt-arrival.png`});
    await enableDebugReading(page);
    const interact=async(title,action)=>{
        await page.keyboard.press('KeyF');await expect(page.getByRole('dialog',{name:title,exact:true})).toBeVisible();
        await page.getByRole('button',{name:action,exact:true}).click();await page.clock.runFor(100);
    };
    await navigate(page,main.slice(0,11));
    await interact('Arrivals / Transfer ledger','Record discovery');
    await navigate(page,main.slice(11,14));
    await interact('Deadways route index','Follow this lead');
    await navigate(page,main.slice(14));
    await interact('Departure shutter','Release shutter');
    await navigate(page,[{x:10420,y:1440}]);
    await expect(page.locator('#panel-title')).toHaveText('A lead, not an answer');
    expect(await page.evaluate(()=>localStorage.getItem('underworld-campaign:v1'))).toBe('existing-campaign-sentinel');
    expect(errors).toEqual([]);
});
