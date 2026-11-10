const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const folder=path.join(__dirname,'../../public/levels');
const files=fs.readdirSync(folder).filter(f=>f.endsWith('.json')&&f!=='level.schema.json');

for(const file of files){
    const document=JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
    test(`${document.id}: game entry, assets, restart and workshop import/export`,async({page},info)=>{
        const errors=[],failed=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
        await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
        const query=document.id==='dialogue-course'?'dialogueDemo=action&preview=1':`level=${document.id}&preview=1`;
        const loaded=page.waitForResponse(r=>r.url().endsWith(`/levels/${document.id}.json`)&&r.ok());
        await page.goto('/?'+query);
        await page.getByRole('button',{name:'Play',exact:true}).click();
        expect(await (await loaded).json()).toEqual(document);
        await expect(page.locator('#overlay')).toBeHidden();
        await page.clock.runFor(500);
        await expect(page.locator('#health')).toHaveText('5 / 5');
        await expect(page.locator('#count')).toHaveText(`0 / ${document.enemies.length}`);
        const entry=await page.locator('#progress').getAttribute('style');
        if(document.id==='dialogue-course')await expect(page.locator('.action-dialogue')).toBeVisible();
        await page.screenshot({path:`artifacts/level-audit/${info.project.name}-${document.id}.png`});
        await page.keyboard.down('KeyD');await page.clock.runFor(200);await page.keyboard.up('KeyD');
        await page.keyboard.press('KeyR');await page.clock.runFor(100);
        await expect(page.locator('#progress')).toHaveAttribute('style',entry);
        await expect(page.locator('#health')).toHaveText('5 / 5');
        await page.goto('/editor.html');
        await expect.poll(()=>page.evaluate(()=>!!window.levelEditor)).toBe(true);
        await page.locator('#level-file').setInputFiles(path.join(folder,file));
        await expect.poll(()=>page.evaluate(()=>window.levelEditor.getDocument().id)).toBe(document.id);
        expect(await page.evaluate(()=>window.levelEditor.getDocument())).toEqual(document);
        const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();
        const stream=await (await pending).createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
        expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(document);
        expect(errors).toEqual([]);expect(failed).toEqual([]);
    });
}
