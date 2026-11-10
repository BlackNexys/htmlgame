const {test,expect}=require('@playwright/test');
const rebuilt=require('../../public/levels/last-platform-rebuild.json');
const get=page=>page.evaluate(()=>window.levelEditor.getDocument());
async function downloaded(download){const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);return JSON.parse(Buffer.concat(chunks).toString());}

test('workshop places and mounts furniture, preserves it through parent edits, history and export, and plays the new file',async({page},info)=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await page.getByRole('button',{name:'New level',exact:true}).click();
    await page.getByRole('button',{name:'Prop',exact:true}).click();
    for(const [asset,x,y] of [['confluence-bench',400,-104],['confluence-lamp',700,-176],['confluence-canopy',800,-198]]){
        await page.locator('#prop-asset').selectOption(asset);await page.locator('#level-canvas').click({position:{x:200,y:200}});
        await page.locator('#object-properties input[name=parent]').fill('floor');await page.locator('#object-properties input[name=socket]').fill('topLeft');
        await page.locator('#object-properties input[name=x]').fill(String(x));await page.locator('#object-properties input[name=y]').fill(String(y));
        await page.getByRole('button',{name:'Apply properties',exact:true}).click();
        await expect.poll(async()=>(await get(page)).props.find(p=>p.asset===asset)?.mount?.parent).toBe('floor');
    }
    await expect.poll(async()=>(await get(page)).props.length).toBe(3);
    await page.locator('#object-list').selectOption('terrain:floor');
    await page.locator('#object-properties input[name=x]').fill('24');await page.locator('#object-properties input[name=width]').fill('1896');
    await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await expect.poll(async()=>(await get(page)).terrain[0].x).toBe(24);
    await page.getByRole('button',{name:'Undo',exact:true}).click();await expect.poll(async()=>(await get(page)).terrain[0].x).toBe(0);
    await page.getByRole('button',{name:'Redo',exact:true}).click();await expect.poll(async()=>(await get(page)).terrain[0].x).toBe(24);
    await page.locator('#level-properties input[name=id]').fill('authored-furniture');await page.getByRole('button',{name:'Apply level properties',exact:true}).click();
    await expect.poll(async()=>(await get(page)).id).toBe('authored-furniture');
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();const d=await downloaded(await pending);
    await page.locator('#level-file').setInputFiles({name:'furniture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(d))});
    await expect.poll(async()=>(await get(page)).revision).toBe(d.revision);expect(await get(page)).toEqual(d);
    const requests=[];page.on('request',r=>requests.push(r.url()));await page.route('**/levels/authored-furniture.json',r=>r.fulfill({json:d}));
    await page.clock.install();await page.goto('/?level=authored-furniture&preview=1&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(200);
    const snapshot=await page.evaluate(()=>window.gameObservation({includeProps:true}));expect(snapshot.level.id).toBe(d.id);expect(snapshot.props.map(p=>p.x)).toEqual([424,724,824]);
    expect(snapshot.props.map(p=>p.y+p.height)).toEqual([576,576,576]);expect(snapshot.collision).toHaveLength(1);
    expect(requests.some(u=>u.endsWith('/props-v4.png'))).toBe(true);expect(requests.some(u=>u.endsWith('/canopy-v6.png'))).toBe(true);expect(requests.some(u=>u.endsWith('/city-v3.png'))).toBe(false);
    await page.screenshot({path:`artifacts/${info.project.name}-authored-furniture.png`});expect(errors).toEqual([]);
});

test('story-art editor changes only its visual anchor and renamed Confluence levels retain their presentation',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await page.locator('#level-file').setInputFiles({name:'rebuilt.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(rebuilt))});
    await expect.poll(async()=>(await get(page)).id).toBe(rebuilt.id);
    const before=(await get(page)).interactables.find(o=>o.id==='registry-transfer-ledger');
    await page.locator('#object-list').selectOption('interactables:registry-transfer-ledger');await page.locator('#object-properties input[name=visualX]').fill(String(before.visual.x+8));await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await expect.poll(async()=>(await get(page)).interactables.find(o=>o.id===before.id).visual.x).toBe(before.visual.x+8);
    const d=await get(page),after=d.interactables.find(o=>o.id===before.id);expect(after.x).toBe(before.x);expect(after.y).toBe(before.y);expect(after.reach).toBe(before.reach);expect(after.mount).toEqual(before.mount);expect(after.visual.x-before.visual.x).toBe(8);
    d.id='another-station';const requests=[];page.on('request',r=>requests.push(r.url()));await page.route('**/levels/another-station.json',r=>r.fulfill({json:d}));
    await page.clock.install();await page.goto('/?level=another-station&preview=1&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    expect(requests.some(u=>u.endsWith('/city-v3.png'))).toBe(true);expect(await page.evaluate(()=>window.gameObservation({includeProps:true}).props.length)).toBe(d.props.length);
});

test('observations require explicit opt-in and cannot mutate the running game',async({page})=>{
    await page.clock.install();await page.goto('/?level=construction-study');await page.getByRole('button',{name:'Play',exact:true}).click();expect(await page.evaluate(()=>typeof window.gameObservation)).toBe('undefined');
    await page.goto('/?level=construction-study&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(100);
    const result=await page.evaluate(()=>{const read=window.gameObservation,a=read(),x=a.player.x;a.player.x=-999;a.collision[0].width=1;a.props.length=0;const b=read();return {x,bx:b.player.x,width:b.collision[0].width,commands:Object.values(b).some(v=>typeof v==='function')};});
    expect(result.bx).toBe(result.x);expect(result.width).toBeGreaterThan(1);expect(result.commands).toBe(false);
    await page.keyboard.down('KeyD');await page.clock.runFor(100);await page.keyboard.up('KeyD');expect(await page.evaluate(()=>window.gameObservation().player.x)).toBeGreaterThan(result.x);
});
