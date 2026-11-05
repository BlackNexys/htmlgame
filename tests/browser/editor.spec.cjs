const {test, expect} = require('@playwright/test');
require('../register.cjs');
const {createBlankLevel} = require('../../src/editor/createBlankLevel.ts');

async function openEditor(page) {
    await page.goto('/editor.html');
    await expect.poll(() => page.evaluate(() => Boolean(window.levelEditor))).toBe(true);
    await page.getByRole('button', {name: 'New level', exact: true}).click();
    await expect(page.locator('#revision')).toHaveText('Revision 1');
}
const snapshot = page => page.evaluate(() => window.levelEditor.getDocument());
async function downloadedJson(download) {
    const stream = await download.createReadStream(), chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
}

test('visual authoring, property editing, history and portable JSON round trip', async ({page}) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await openEditor(page);
    await page.getByRole('button', {name: 'Terrain', exact: true}).click();
    await page.locator('#level-canvas').click({position: {x: 264, y: 264}});
    await expect.poll(async () => (await snapshot(page)).terrain.length).toBe(2);
    await expect(page.locator('#object-properties input[name=x]')).toHaveValue('528');
    await page.locator('#object-properties input[name=width]').fill('96');
    await page.getByRole('button', {name: 'Apply properties', exact: true}).click();
    await expect.poll(async () => (await snapshot(page)).terrain[1].width).toBe(96);
    await page.getByRole('button', {name: 'Undo', exact: true}).click();
    await expect.poll(async () => (await snapshot(page)).terrain[1].width).toBe(48);
    await page.getByRole('button', {name: 'Redo', exact: true}).click();
    await expect.poll(async () => (await snapshot(page)).terrain[1].width).toBe(96);

    await page.getByRole('button', {name: 'Select / move', exact: true}).click();
    const canvas = await page.locator('#level-canvas').boundingBox();
    await page.mouse.move(canvas.x + 276, canvas.y + 276); await page.mouse.down();
    await page.mouse.move(canvas.x + 300, canvas.y + 276); await page.mouse.up();
    await expect.poll(async () => (await snapshot(page)).terrain[1].x).toBe(576);

    const json = await snapshot(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export JSON', exact: true}).click();
    const exported = await download;
    expect(exported.suggestedFilename()).toBe('untitled-level.json');
    expect(await downloadedJson(exported)).toEqual(json);
    const imported = {...json, id: 'shared-level', name: 'Shared by a human', revision: 17};
    await page.locator('#level-file').setInputFiles({name: 'shared-level.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported))});
    await expect(page.locator('#level-properties input[name=name]')).toHaveValue('Shared by a human');
    expect(await snapshot(page)).toEqual(imported);
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.levelEditor?.getDocument().id)).toBe('shared-level');
    expect(errors).toEqual([]);
});

test('AI patches and human JSON drafts detect conflicts without overwriting either revision', async ({page}) => {
    await openEditor(page);
    const current = await snapshot(page);
    const human = {...current, name: 'Unapplied human draft'};
    await page.locator('#level-json').fill(JSON.stringify(human, null, 2));
    await page.evaluate(() => {
        const level = window.levelEditor.getDocument();
        window.levelEditor.applyChanges({levelId: level.id, baseRevision: level.revision, operations: [{op: 'set', field: 'name', value: 'Applied AI change'}]});
    });
    await page.getByRole('button', {name: 'Validate and apply JSON', exact: true}).click();
    await expect(page.locator('#editor-status')).toContainText('Revision conflict');
    await expect(page.locator('#level-json')).toHaveValue(JSON.stringify(human, null, 2));
    expect((await snapshot(page)).name).toBe('Applied AI change');
    const draftDownload = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Download JSON draft', exact: true}).click();
    expect(await downloadedJson(await draftDownload)).toEqual(human);
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.levelEditor?.getDocument().name)).toBe('Applied AI change');
    await expect(page.locator('#level-json')).toHaveValue(JSON.stringify(human, null, 2));
    await page.getByRole('button', {name: 'Reset JSON draft', exact: true}).click();
    const invalid = await snapshot(page); invalid.spawn.y = 600;
    await page.locator('#level-json').fill(JSON.stringify(invalid));
    await page.getByRole('button', {name: 'Validate and apply JSON', exact: true}).click();
    await expect(page.locator('#editor-status')).toContainText('spawn: actor overlaps');
    expect((await snapshot(page)).spawn.y).toBe(576);

    await page.locator('#level-properties input[name=name]').fill('Pending property edit');
    const conflict = await page.evaluate(() => {
        const document = window.levelEditor.getDocument();
        try { window.levelEditor.applyChanges({levelId: document.id, baseRevision: document.revision, operations: [{op: 'set', field: 'name', value: 'Would overwrite'}]}); }
        catch (error) { return error.message; }
    });
    expect(conflict).toContain('pending property edits');
    await expect(page.locator('#level-properties input[name=name]')).toHaveValue('Pending property edit');
});

test('playtesting uses an independent game snapshot and restart retains the chosen map', async ({page}) => {
    await openEditor(page);
    const before = await snapshot(page);
    await page.getByRole('button', {name: 'Playtest', exact: true}).click();
    const game = page.frameLocator('#playtest-frame');
    await expect(game.getByRole('button', {name: 'Enter the underworld', exact: true})).toBeEnabled();
    await game.getByRole('button', {name: 'Enter the underworld', exact: true}).click();
    await expect(game.locator('#count')).toHaveText('0 / 0');
    await expect(game.locator('#overlay')).toBeHidden();
    await game.getByRole('button', {name: 'Restart', exact: true}).click();
    await expect(game.locator('#count')).toHaveText('0 / 0');
    expect(await game.locator('body').evaluate(() => window.levelEditor)).toBeUndefined();
    await page.getByRole('button', {name: 'Close playtest', exact: true}).click();
    await expect(page.locator('#playtest-frame')).toHaveAttribute('src', 'about:blank');
    expect(await snapshot(page)).toEqual(before);
    expect(await page.locator('#game').count()).toBe(0);
});

test('the runtime fetches only its requested JSON and explains invalid or missing levels', async ({page}) => {
    const level = {...createBlankLevel(), id: 'test-level'};
    const requests = []; page.on('request', request => { if (request.url().includes('/levels/')) requests.push(request.url()); });
    await page.route('**/levels/test-level.json', route => route.fulfill({json: level}));
    await page.goto('/?level=test-level');
    await expect(page.getByRole('button', {name: 'Enter the underworld', exact: true})).toBeEnabled();
    expect(requests).toHaveLength(1); expect(requests[0]).toContain('/levels/test-level.json');
    expect(await page.evaluate(() => window.levelEditor)).toBeUndefined();
    await page.route('**/levels/broken-level.json', route => route.fulfill({json: {...level, id: 'broken-level', schemaVersion: 99}}));
    await page.goto('/?level=broken-level');
    await expect(page.locator('#panel-title')).toHaveText('The passage could not load');
    await expect(page.locator('#panel-message')).toContainText('schemaVersion');
    await page.route('**/levels/missing-level.json', route => route.fulfill({status: 404, body: 'Missing'}));
    await page.goto('/?level=missing-level');
    await expect(page.locator('#panel-message')).toContainText('HTTP 404');
});
