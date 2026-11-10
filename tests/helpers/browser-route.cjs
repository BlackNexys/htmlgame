const {expect}=require('@playwright/test');
async function observe(page){
    await expect.poll(()=>page.evaluate(()=>!!window.gameObservation?.())).toBe(true);
}
async function navigate(page,points,pilotInput){
    const held={left:false,right:false,fire:false,down:false,up:false,sprint:false,jumpHeld:false},timer={time:0,lastJump:-100,held:0};
    const send=async input=>{
        for(const [action,key] of [['left','KeyA'],['right','KeyD'],['fire','KeyJ'],['down','KeyS'],['up','KeyW'],['sprint','Shift']])if(!!input[action]!==held[action]){
            await page.keyboard[input[action]?'down':'up'](key);held[action]=!!input[action];
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
            const snapshot=await page.evaluate(()=>window.gameObservation()),p={...snapshot.player,enemies:snapshot.enemies};expect(p?.movement).toBeTruthy();last=p;
            p.x2=p.x+p.width;p.y2=p.y+p.height;
            if(Math.abs(point.x-p.x)<20 && Math.abs(p.y2-point.y)<3 && p.grounded){reached=true;break;}
            await send(pilotInput(p,snapshot.collision,p.enemies,point,timer));
        }
        expect(reached,`Route stopped at ${last?.x},${last?.y}, target ${point.x},${point.y}`).toBe(true);
        for(let i=0;i<6;i++)await send({left:false,right:false,fire:true,jump:false,jumpHeld:false});
    }
    for(const key of ['KeyA','KeyD','KeyJ','KeyS','KeyW','Shift','Space'])await page.keyboard.up(key);
    await expect(page.locator('#health')).not.toHaveText('0 / 5');
}

module.exports={observe,navigate};
