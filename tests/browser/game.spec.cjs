const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
require('../register.cjs');
const {createActionLevel} = require('../../src/maps/actionLevel.ts');

async function start(page) {
    await page.clock.install({time: new Date('2026-11-04T12:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-04T12:00:01Z'));
    await page.goto('/');
    await expect(page.getByRole('button', {name: 'Enter the underworld'})).toBeEnabled();
    await page.getByRole('button', {name: 'Enter the underworld'}).click();
    await expect(page.locator('#overlay')).toBeHidden();
}
async function advance(page, milliseconds) { await page.clock.runFor(milliseconds); }

test('movement, combat, pause, focus loss, resize and a clean restart', async ({page}, testInfo) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await start(page);
    fs.mkdirSync('artifacts', {recursive: true});
    await page.screenshot({path: `artifacts/${testInfo.project.name}-start.png`, fullPage: true});
    await page.keyboard.down('KeyD'); await page.keyboard.down('KeyJ');
    await advance(page, 1000);
    await page.keyboard.up('KeyD'); await page.keyboard.up('KeyJ');
    await expect(page.locator('#count')).not.toHaveText('0 / 8');
    await page.getByRole('button', {name: 'Pause', exact: true}).click();
    await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    const progress = await page.locator('#progress').getAttribute('style');
    await advance(page, 3000);
    await expect(page.locator('#progress')).toHaveAttribute('style', progress);
    await page.getByRole('button', {name: 'Resume', exact: true}).first().click();
    await expect(page.locator('#overlay')).toBeHidden();
    await page.keyboard.down('KeyD'); await advance(page, 300);
    // Native blur handler must pause and clear held movement.
    await page.locator('#game').evaluate(canvas => canvas.blur());
    await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    await page.keyboard.up('KeyD');
    await page.locator('#primary').click();
    const resumed = await page.locator('#progress').getAttribute('style');
    await advance(page, 500);
    // A little friction travel is allowed; after that the player must stay still.
    const settled = await page.locator('#progress').getAttribute('style');
    await advance(page, 500); await expect(page.locator('#progress')).toHaveAttribute('style', settled);
    await page.keyboard.press('KeyM'); await expect(page.locator('#mute')).toHaveText('Sound off');
    await page.setViewportSize({width: 540, height: 950});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path: `artifacts/${testInfo.project.name}-narrow.png`, fullPage: true});
    await page.getByRole('button', {name: 'Restart', exact: true}).click();
    await expect(page.locator('#health')).toHaveText('5 / 5');
    await expect(page.locator('#count')).toHaveText('0 / 8');
    await expect(page.locator('#overlay')).toBeHidden();
    expect(resumed).toBeTruthy(); expect(errors).toEqual([]);
});

test('play through the scrolling level and replay after completion', async ({page}, testInfo) => {
    await start(page);
    const level = createActionLevel();
    await page.keyboard.down('KeyD'); await page.keyboard.down('KeyJ');
    for (let i = 0; i < 250 && await page.locator('#overlay').isHidden(); i++) {
        const x = await page.locator('#progress').evaluate(node => parseFloat(node.style.width) / 100) * level.exit.x;
        const obstacle = level.solids.some(r => r.y < 576 && r.x >= x + 32 && r.x < x + 32 + 65);
        if (obstacle) await page.keyboard.press('Space');
        await advance(page, 100);
        if (i === 30) await page.screenshot({path: `artifacts/${testInfo.project.name}-combat.png`, fullPage: true});
    }
    await page.keyboard.up('KeyD'); await page.keyboard.up('KeyJ');
    await expect(page.locator('#panel-title')).toHaveText('The passage is open');
    await page.screenshot({path: `artifacts/${testInfo.project.name}-complete.png`, fullPage: true});
    await page.getByRole('button', {name: 'Play again', exact: true}).click();
    await expect(page.locator('#health')).toHaveText('5 / 5'); await expect(page.locator('#count')).toHaveText('0 / 8');
    await expect(page.locator('#overlay')).toBeHidden();
});

test('defeat can be followed by a fresh attempt', async ({page}) => {
    await start(page);
    await page.keyboard.down('KeyD'); await advance(page, 1000); await page.keyboard.up('KeyD');
    for (let i = 0; i < 70 && await page.locator('#overlay').isHidden(); i++) await advance(page, 1000);
    await expect(page.locator('#panel-title')).toHaveText('The underworld bites back');
    await page.getByRole('button', {name: 'Try again', exact: true}).click();
    await expect(page.locator('#health')).toHaveText('5 / 5'); await expect(page.locator('#overlay')).toBeHidden();
});

test('asset failure is explained and offers reload', async ({page}) => {
    await page.route('**/assets/wall.png', route => route.abort());
    await page.goto('/');
    await expect(page.locator('#panel-title')).toHaveText('The passage could not load');
    await expect(page.locator('#panel-message')).toContainText('wall.png');
    await expect(page.getByRole('button', {name: 'Reload', exact: true})).toBeEnabled();
});

