const {test,expect}=require('@playwright/test');
require('../register.cjs');
const {createEmptyLevel}=require('../../src/levels/createEmptyLevel.ts');
const {defineLevel,defineAssembly}=require('../../src/levels/source/index.ts');

test('the empty workspace plays, jumps, pauses and restarts without a shipped level request',async({page})=>{
    const requests=[],errors=[];page.on('request',r=>{if(/\/levels\/.*\.json/.test(r.url()))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install();await page.goto('/?sandbox=1&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();
    const state=()=>page.evaluate(()=>window.gameObservation());
    const before=await state();expect(before.enemies).toHaveLength(0);
    await page.keyboard.down('KeyD');await page.keyboard.press('Space');await page.clock.runFor(150);await page.keyboard.up('KeyD');
    const moving=await state();expect(moving.player.x).toBeGreaterThan(before.player.x);expect(moving.player.y).toBeLessThan(before.player.y);
    await page.keyboard.press('KeyP');const paused=await state();await page.clock.runFor(1000);expect((await state()).time).toBe(paused.time);
    await page.getByRole('button',{name:'Resume',exact:true}).first().click();await page.keyboard.press('KeyR');
    expect((await state()).player.health).toBe(5);expect(requests).toEqual([]);expect(errors).toEqual([]);
});

test('missing source modules show a useful error instead of silently loading another layout',async({page})=>{
    await page.goto('/?level=not-a-level');await expect(page.locator('#overlay')).toBeVisible();
    await expect(page.locator('#overlay')).toContainText('No authored level named not-a-level');
});

test('a source-built assembly snapshot loads and plays through the real data boundary',async({page})=>{
    const base=createEmptyLevel(),{terrain,...metadata}=base;
    const floor=defineAssembly(s=>s.add('terrain',{...terrain[0],x:0,y:0}));
    const source=defineLevel({id:'browser-source-proof',name:'Browser source proof',width:base.width,height:base.height,spawn:base.spawn,exit:base.exit},s=>s.place('room',{x:0,y:576},floor));
    await page.route(url=>url.pathname==='/source-proof.json',r=>r.fulfill({json:source.document()}));
    await page.clock.install();await page.goto('/?levelUrl=/source-proof.json&observe=1');await page.getByRole('button',{name:'Play',exact:true}).click();
    const observation=await page.evaluate(()=>window.gameObservation());expect(observation.level.id).toBe('browser-source-proof');
    expect(observation.collision.some(c=>c.owner==='room--floor')).toBe(true);
    await page.keyboard.down('KeyD');await page.clock.runFor(5200);await page.keyboard.up('KeyD');
    await expect(page.locator('#panel-title')).toHaveText('The passage is open');
});

test('workshop focuses deep selections, groups assembly children and exports genuine TypeScript',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    const document=createEmptyLevel();document.width=8640;document.height=4096;document.terrain[0].width=8640;
    document.decorations=[{id:'lower-room--wall',x:7000,y:3000,width:200,height:300}];
    await page.evaluate(d=>{
        const current=window.levelEditor.getDocument();
        window.levelEditor.applyChanges({levelId:current.id,baseRevision:current.revision,operations:[{op:'set',field:'width',value:d.width},{op:'set',field:'height',value:d.height},{op:'upsert',collection:'terrain',value:d.terrain[0]},{op:'upsert',collection:'decorations',value:d.decorations[0]}]});
    },document);
    await page.locator('#object-filter').fill('lower-room');
    expect(await page.locator('#object-list optgroup[label="lower-room"] option').count()).toBe(1);
    await page.locator('#object-list').selectOption('decorations:lower-room--wall');
    const focused=await page.locator('.editor-stage').evaluate(stage=>({top:stage.scrollTop,left:stage.scrollLeft}));
    expect(focused.top).toBeGreaterThan(0);expect(focused.left).toBeGreaterThan(0);
    const visible=await page.evaluate(()=>{
        const stage=document.querySelector('.editor-stage'),canvas=document.querySelector('#level-canvas'),a=stage.getBoundingClientRect(),b=canvas.getBoundingClientRect();
        const scale=canvas.width/8640,x=b.left+7100*scale,y=b.top+3150*scale;
        return x>a.left&&x<a.right&&y>a.top&&y<a.bottom;
    });expect(visible).toBe(true);
    const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export TypeScript',exact:true}).click();
    const download=await downloadPromise;expect(download.suggestedFilename()).toBe('untitled-level.level.ts');
    const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    const source=Buffer.concat(chunks).toString();expect(source).toContain('export default defineLevel(');expect(source).toContain('lower-room--wall');
    await expect(page.getByRole('button',{name:'Open level source',exact:true})).toBeEnabled();
});

test('a broken source draft remains recoverable and cannot silently reopen as a flat snapshot',async({page})=>{
    await page.addInitScript(()=>{
        localStorage.setItem('underworld-source-layout:v1','{"version":99}');
    });
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await expect(page.locator('#editor-status')).toContainText('Could not restore source layout');
    expect(await page.evaluate(()=>localStorage.getItem('underworld-source-layout:v1'))).toBe('{"version":99}');
    expect(await page.evaluate(()=>window.levelEditor.getDocument().id)).toBe('untitled-level');
    await page.getByRole('button',{name:'New level',exact:true}).click();
    expect(await page.evaluate(()=>localStorage.getItem('underworld-source-layout:v1'))).toBeNull();
    expect(errors).toEqual([]);
});
