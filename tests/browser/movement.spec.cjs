const {test, expect} = require('@playwright/test');

async function start(page) {
    await page.clock.install({time: new Date('2026-11-05T12:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-05T12:00:01Z'));
    await page.goto('/');
    await page.getByRole('link', {name: 'Movement course', exact: true}).click();
    await expect(page).toHaveURL(/level=movement-course/);
    await page.getByRole('button', {name: 'Play', exact: true}).click();
    await expect(page.locator('#game')).toBeFocused();
}
const position = page => page.locator('#progress').evaluate(node => parseFloat(node.style.width));

test('direction keys crouch, aim vertically and diagonally, and clear on pause and restart', async ({page}) => {
    await page.addInitScript(() => {
        const original = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
            if (String(text).includes(' · aim ')) window.lastMovementDebug = text;
            return original.call(this, text, ...args);
        };
    });
    await start(page); await page.keyboard.press('F2');
    const state = () => page.evaluate(() => window.lastMovementDebug);
    await page.keyboard.down('ArrowDown'); await page.clock.runFor(100);
    expect(await state()).toContain('crouching · aim 1,0');
    await page.keyboard.up('ArrowDown'); await page.keyboard.down('ArrowUp'); await page.clock.runFor(100);
    expect(await state()).toContain('idle · aim 0,-1');
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('KeyJ'); await page.clock.runFor(100);
    expect(await state()).toContain('aim 1,-1');
    await page.keyboard.up('ArrowUp'); await page.keyboard.down('Space'); await page.clock.runFor(100);
    await page.keyboard.down('ArrowDown'); await page.clock.runFor(100);
    expect(await state()).toContain('airborne · aim 1,1');
    await page.keyboard.up('ArrowRight'); await page.clock.runFor(50);
    expect(await state()).toContain('aim 0,1');
    await page.keyboard.press('KeyP');
    await page.getByRole('button', {name:'Resume',exact:true}).first().click(); await page.clock.runFor(50);
    expect(await state()).toContain('aim 1,0');
    await page.keyboard.up('ArrowDown'); await page.keyboard.up('Space'); await page.keyboard.up('KeyJ');
    await page.keyboard.press('KeyR'); await page.clock.runFor(100);
    expect(await state()).toContain('idle · aim 1,0');
});

test('movement course loads independently, sprint increases travel, and K has no movement action', async ({page}) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await start(page);
    const initial = await position(page);
    await page.keyboard.down('KeyD'); await page.clock.runFor(700); await page.keyboard.up('KeyD');
    const running = (await position(page)) - initial;
    await page.keyboard.press('KeyR');
    await page.keyboard.down('KeyD'); await page.keyboard.down('Shift'); await page.clock.runFor(700);
    await page.keyboard.up('KeyD'); await page.keyboard.up('Shift');
    expect((await position(page)) - initial).toBeGreaterThan(running * 1.2);
    await page.keyboard.press('KeyR');
    await expect(page.locator('#dash-state')).toHaveCount(0);
    await page.keyboard.down('KeyK'); await page.clock.runFor(500);
    expect(await position(page)).toBe(initial);
    await page.keyboard.up('KeyK');
    await page.keyboard.press('KeyP');
    await page.getByRole('button', {name: 'Controls', exact: true}).click();
    const controls = page.getByRole('dialog', {name: 'Controls', exact: true});
    await expect(controls).not.toContainText(/dash/i);
    await expect(controls).toContainText('Sprint');
    expect(errors).toEqual([]);
});

test('pausing a jump clears held movement and restart restores the course spawn', async ({page}) => {
    await start(page);
    const initial = await position(page);
    await page.keyboard.down('Space'); await page.keyboard.down('KeyD'); await page.clock.runFor(100);
    await page.keyboard.press('KeyP');
    await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    const paused = await position(page); await page.clock.runFor(2000);
    expect(await position(page)).toBe(paused);
    await page.getByRole('button', {name: 'Resume', exact: true}).first().click();
    await page.clock.runFor(500);
    const settled = await position(page);
    await page.clock.runFor(500); expect(await position(page)).toBe(settled);
    await page.keyboard.up('Space'); await page.keyboard.up('KeyD');
    await page.keyboard.press('KeyR'); await page.clock.runFor(100);
    expect(await position(page)).toBe(initial);
    await expect(page.locator('#health')).toHaveText('5 / 5');
    await expect(page.locator('#count')).toHaveText('0 / 2');
});
