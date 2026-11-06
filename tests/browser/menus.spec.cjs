const {test, expect} = require('@playwright/test');

async function start(page) {
    await page.clock.install({time: new Date('2026-11-05T12:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-05T12:00:01Z'));
    await page.goto('/');
    await page.getByRole('button', {name: 'Play', exact: true}).click();
    await expect(page.locator('#game')).toBeFocused();
}

test('the title menu supports keyboard navigation, dialogs and remembered options', async ({page}) => {
    await page.goto('/');
    const play = page.getByRole('button', {name: 'Play', exact: true});
    await expect(play).toBeEnabled(); await expect(play).toBeFocused();
    await expect(page.getByRole('heading', {name: 'Underworld', exact: true})).toBeVisible();
    await expect.poll(() => page.locator('#main-menu img[src]').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.getByRole('button', {name: 'Continue', exact: true})).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', {name: 'Options', exact: true})).toBeFocused();
    await page.keyboard.press('Enter');
    const options = page.getByRole('dialog', {name: 'Options', exact: true});
    await expect(options).toBeVisible();
    await options.getByLabel('Music and sound').uncheck();
    await options.getByLabel('Encounter hints').uncheck();
    await page.keyboard.press('Escape');
    await expect(options).toBeHidden();
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', {name: 'Controls', exact: true})).toBeVisible();
    await page.keyboard.press('Escape'); await page.keyboard.press('Home');
    await expect(play).toBeFocused(); await page.keyboard.press('Enter');
    await expect(page.locator('#game')).toBeFocused();
    await expect(page.getByRole('button', {name: 'Sound off', exact: true})).toBeVisible();
    await expect(page.locator('#encounter')).toBeHidden();
    await page.reload(); await expect(page.getByRole('button', {name: 'Play', exact: true})).toBeEnabled();
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await expect(options.getByLabel('Music and sound')).not.toBeChecked();
    await expect(options.getByLabel('Encounter hints')).not.toBeChecked();
    await options.getByRole('button', {name: 'Back', exact: true}).click();
    await expect(options).toBeHidden();
});

test('the game fits the browser at its original ratio across wide, tall and small windows', async ({page}) => {
    await start(page);
    for (const [width, height] of [[1600, 900], [900, 1200], [2560, 1080], [540, 950], [844, 390], [320, 568]]) {
        await page.setViewportSize({width, height});
        const geometry = await page.locator('#game').evaluate(canvas => {
            const rect = canvas.getBoundingClientRect();
            return {x: rect.x, y: rect.y, width: rect.width, height: rect.height, ratio: canvas.width / canvas.height,
                viewportWidth: innerWidth, viewportHeight: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight};
        });
        expect(Math.abs(geometry.width / geometry.height - geometry.ratio)).toBeLessThan(.002);
        expect(geometry.x).toBeGreaterThanOrEqual(-1); expect(geometry.y).toBeGreaterThanOrEqual(-1);
        expect(geometry.x + geometry.width).toBeLessThanOrEqual(width + 1);
        expect(geometry.y + geometry.height).toBeLessThanOrEqual(height + 1);
        expect(Math.min(Math.abs(geometry.width - width), Math.abs(geometry.height - height))).toBeLessThan(1);
        expect(geometry.scrollWidth).toBe(width); expect(geometry.scrollHeight).toBe(height);
    }
});

test('pause, options and the main menu freeze a run; Continue resumes and New game resets', async ({page}) => {
    await start(page);
    const initial = await page.locator('#progress').getAttribute('style');
    await page.keyboard.down('KeyD'); await page.clock.runFor(200); await page.keyboard.up('KeyD');
    await page.keyboard.press('KeyP');
    await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    const progress = await page.locator('#progress').getAttribute('style');
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await page.clock.runFor(3000);
    await expect(page.locator('#progress')).toHaveAttribute('style', progress);
    await page.keyboard.press('Escape');
    await expect(page.locator('#panel-title')).toHaveText('Take a breather');
    await page.getByRole('button', {name: 'Main menu', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Continue', exact: true})).toBeVisible();
    await page.clock.runFor(3000);
    await expect(page.locator('#progress')).toHaveAttribute('style', progress);
    await page.keyboard.press('Escape');
    await expect(page.locator('#overlay')).toBeHidden();
    await expect(page.locator('#game')).toBeFocused();
    await page.keyboard.press('KeyP'); await page.keyboard.press('KeyP');
    await expect(page.locator('#overlay')).toBeHidden();
    await page.keyboard.press('KeyP');
    await page.getByRole('button', {name: 'Main menu', exact: true}).click();
    const workshop = page.getByRole('link', {name: 'Level workshop'});
    await expect(workshop).toHaveAttribute('target', '_blank');
    await page.setViewportSize({width: 844, height: 390});
    const menuBounds = await page.locator('#main-menu').boundingBox();
    const actionsBounds = await page.locator('.title-actions').boundingBox();
    expect(menuBounds.y).toBeGreaterThanOrEqual(0);
    expect(actionsBounds.y + actionsBounds.height).toBeLessThanOrEqual(390);
    await page.getByRole('button', {name: 'New game', exact: true}).click();
    await expect(page.locator('#overlay')).toBeHidden();
    await expect(page.locator('#health')).toHaveText('5 / 5');
    await expect(page.locator('#count')).toHaveText('0 / 8');
    await expect(page.locator('#progress')).toHaveAttribute('style', initial);
});
