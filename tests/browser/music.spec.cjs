const {test, expect} = require('@playwright/test');

test('Mechanical Heartbeat loops in the title menu, follows sound preferences and stops during gameplay', async ({page}) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('button', {name: 'Play', exact: true})).toBeEnabled();
    const music = page.locator('#menu-music');
    await expect(music).toHaveAttribute('src', './assets/music/Mechanical%20Heartbeat.mp3');
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await expect.poll(() => music.evaluate(audio => !audio.paused && audio.currentTime > 0 && audio.readyState >= 2)).toBe(true);
    expect(await music.evaluate(audio => audio.loop && audio.volume === .35 && Number.isFinite(audio.duration) && audio.duration > 0)).toBe(true);
    const sound = page.getByLabel('Music and sound');
    await sound.uncheck(); await expect.poll(() => music.evaluate(audio => audio.paused)).toBe(true);
    await sound.check(); await expect.poll(() => music.evaluate(audio => !audio.paused)).toBe(true);
    await page.getByRole('dialog', {name: 'Options', exact: true}).getByRole('button', {name: 'Back', exact: true}).click();
    await page.getByRole('button', {name: 'Play', exact: true}).click();
    await expect.poll(() => music.evaluate(audio => audio.paused)).toBe(true);
    await page.keyboard.press('KeyP');
    await page.getByRole('button', {name: 'Main menu', exact: true}).click();
    await expect.poll(() => music.evaluate(audio => !audio.paused)).toBe(true);
    await page.getByRole('button', {name: 'Continue', exact: true}).click();
    await expect.poll(() => music.evaluate(audio => audio.paused)).toBe(true);
    expect(errors).toEqual([]);
});

test('a saved mute preference keeps title music silent until sound is enabled', async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await page.getByLabel('Music and sound').uncheck();
    await page.reload();
    await expect(page.getByRole('button', {name: 'Play', exact: true})).toBeEnabled();
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await expect(page.getByLabel('Music and sound')).not.toBeChecked();
    expect(await page.locator('#menu-music').evaluate(audio => audio.paused && audio.muted)).toBe(true);
    await page.getByLabel('Music and sound').check();
    await expect.poll(() => page.locator('#menu-music').evaluate(audio => !audio.paused && audio.currentTime > 0)).toBe(true);
});

test('missing menu music leaves the title menu and gameplay usable', async ({page}) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.route('**/assets/music/**', route => route.abort());
    await page.goto('/');
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await expect(page.getByRole('dialog', {name: 'Options', exact: true})).toBeVisible();
    await expect.poll(() => page.locator('#menu-music').evaluate(audio => audio.error !== null)).toBe(true);
    await page.keyboard.press('Escape'); await page.getByRole('button', {name: 'Play', exact: true}).click();
    await expect(page.locator('#overlay')).toBeHidden(); await expect(page.locator('#game')).toBeFocused();
    expect(errors).toEqual([]);
});
