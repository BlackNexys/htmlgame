const {test,expect}=require('@playwright/test');
const study=require('../../public/levels/construction-study.json');
const snapshot=page=>page.evaluate(()=>window.levelEditor.getDocument());

test('workshop edits receiving water and creates validated connections with history and export',async({page})=>{
    await page.goto('/editor.html');await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
    await page.getByRole('button',{name:'Load construction study',exact:true}).click();
    await expect.poll(async()=>(await snapshot(page)).id).toBe('construction-study');
    await page.locator('#object-list').selectOption('water:study-river');
    await page.locator('#object-properties input[name=y]').fill('1090');
    await page.locator('#object-properties input[name=height]').fill('211');
    await page.getByRole('button',{name:'Apply properties',exact:true}).click();
    await expect.poll(async()=>(await snapshot(page)).water.find(w=>w.id==='study-river').y).toBe(1090);
    await page.getByRole('button',{name:'Undo',exact:true}).click();
    await expect.poll(async()=>(await snapshot(page)).water.find(w=>w.id==='study-river').y).toBe(1080);
    await page.getByRole('button',{name:'Redo',exact:true}).click();
    await page.locator('#water-source').selectOption('study-river');await page.locator('#water-target').selectOption('study-basin');
    const before=await snapshot(page);await page.getByRole('button',{name:'Connect water',exact:true}).click();
    await expect(page.locator('#editor-status')).toContainText('downward');expect(await snapshot(page)).toEqual(before);
    await page.locator('#water-source').selectOption('study-basin');await page.locator('#water-target').selectOption('study-river');
    await page.getByRole('button',{name:'Connect water',exact:true}).click();
    await expect.poll(async()=>(await snapshot(page)).water.length).toBe(5);
    await expect(page.locator('#object-properties input[name=sourceSocket]')).toHaveValue('spill');
    await expect(page.locator('#object-properties select[name=receiver]')).toHaveValue('study-river');
    const expected=await snapshot(page),download=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();
    const stream=await (await download).createReadStream(),chunks=[];for await(const c of stream)chunks.push(c);
    expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(expected);
});

test('water renders and freezes on a newly named level with no demo-specific scenery dependency',async({page},info)=>{
    const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/environment/'))requests.push(r.url());});
    await page.route('**/levels/custom-water-level.json',r=>r.fulfill({json:{...study,presentation:undefined,id:'custom-water-level'}}));
    await page.clock.install({time:new Date('2026-11-09T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-09T00:00:01Z'));
    await page.goto('/?level=custom-water-level');await page.getByRole('button',{name:'Play',exact:true}).click();await page.clock.runFor(200);
    expect(requests.some(r=>r.endsWith('/water-v4.png'))).toBe(true);expect(requests.some(r=>r.endsWith('/city-v3.png'))).toBe(false);
    await page.keyboard.press('KeyP');await page.clock.runFor(100);
    const frozen=await page.locator('#game').evaluate(c=>c.toDataURL());await page.clock.runFor(700);
    expect(await page.locator('#game').evaluate(c=>c.toDataURL())).toBe(frozen);
    await page.screenshot({path:`artifacts/${info.project.name}-custom-water-network.png`});expect(errors).toEqual([]);
});
