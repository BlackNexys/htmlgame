import { loadAssets } from './game/Assets';
import { Renderer } from './game/Renderer';
import { Input } from './game/Input';
import { FixedClock } from './game/physics';
import { World } from './game/World';
import { Sound } from './game/Sound';
import { tuning } from './game/config';
import { enemyNames, enemyHints } from './game/EnemyVisual';

async function boot() {
    const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
    const panel = document.querySelector<HTMLElement>('#overlay')!;
    const title = document.querySelector<HTMLElement>('#panel-title')!;
    const message = document.querySelector<HTMLElement>('#panel-message')!;
    const primary = document.querySelector<HTMLButtonElement>('#primary')!;
    const pause = document.querySelector<HTMLButtonElement>('#pause')!;
    const restart = document.querySelector<HTMLButtonElement>('#restart')!;
    const mute = document.querySelector<HTMLButtonElement>('#mute')!;
    const health = document.querySelector<HTMLElement>('#health')!;
    const count = document.querySelector<HTMLElement>('#count')!;
    const progress = document.querySelector<HTMLElement>('#progress')!;
    const status = document.querySelector<HTMLElement>('#status')!;
    const encounter = document.querySelector<HTMLElement>('#encounter')!;
    const sound = new Sound();
    const clock = new FixedClock();
    let world = new World();
    let mode: 'ready' | 'playing' | 'paused' | 'dead' | 'won' = 'ready';
    let lastTime = 0;
    let renderer: Renderer;
    const showPanel = (heading: string, body: string, button: string) => {
        title.textContent = heading; message.textContent = body; primary.textContent = button;
        panel.hidden = false; primary.disabled = false; status.textContent = heading;
    };
    const hud = () => {
        health.textContent = `${world.player.health} / ${tuning.playerHealth}`;
        count.textContent = `${world.defeated} / ${world.level.enemies.length}`;
        progress.style.width = `${Math.min(100, world.player.x / world.level.exit.x * 100)}%`;
        const channeling = world.enemies.find(e => e.kind === 'necromancer' && e.state === 'windup' && Math.abs(e.x - world.player.x) < 720);
        const nearest = channeling || [...world.enemies].sort((a, b) => Math.abs(a.x - world.player.x) - Math.abs(b.x - world.player.x))[0];
        const hint = nearest && (channeling || Math.abs(nearest.x - world.player.x) < 620)
            ? `${enemyNames[nearest.kind]}: ${enemyHints[nearest.kind]}` : 'Keep heading east. Magenta shots are yours; cyan bolts belong to the locals.';
        if (encounter.textContent !== hint) encounter.textContent = hint;
    };
    const resume = () => {
        sound.unlock(); input.clear(); clock.reset(); lastTime = performance.now();
        mode = 'playing'; panel.hidden = true; pause.textContent = 'Pause';
        status.textContent = 'Playing'; canvas.focus();
    };
    const reset = () => { world = new World(); renderer.resetAnimation(); hud(); resume(); };
    const pauseGame = () => {
        if (mode !== 'playing') return;
        mode = 'paused'; input.clear(); clock.reset(); pause.textContent = 'Resume';
        showPanel('Take a breather', 'Your place in the passage is safe. Resume when you are ready.', 'Resume');
    };
    const togglePause = () => { if (mode === 'playing') pauseGame(); else if (mode === 'paused') resume(); };
    const toggleMute = () => {
        sound.muted = !sound.muted;
        mute.textContent = sound.muted ? 'Sound off' : 'Sound on'; mute.setAttribute('aria-pressed', String(sound.muted));
    };
    const input = new Input(canvas, key => {
        if (!renderer) return;
        if (key === 'KeyP' || key === 'Escape') togglePause();
        if (key === 'KeyR') reset();
        if (key === 'KeyM') toggleMute();
        if (key === 'F2') renderer.debug = !renderer.debug;
    });
    canvas.addEventListener('blur', pauseGame);
    window.addEventListener('blur', pauseGame);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
    try {
        const assets = await loadAssets();
        renderer = new Renderer(canvas, assets);
        hud(); renderer.draw(world);
        pause.disabled = restart.disabled = mute.disabled = false;
        showPanel('A little further below', 'Run, jump, and fight your way to the passage. Someone worth finding is still out there.', 'Enter the underworld');
        primary.onclick = () => { if (mode === 'paused' || mode === 'ready') resume(); else reset(); };
        pause.onclick = togglePause;
        restart.onclick = reset;
        mute.onclick = () => { toggleMute(); if (mode === 'playing') canvas.focus(); };
        // Clicking a toolbar action must not trigger focus-loss pause first.
        [pause, restart, mute].forEach(button => button.addEventListener('pointerdown', event => event.preventDefault()));
        const frame = (time: number) => {
            const elapsed = Math.max(0, (time - lastTime) / 1000);
            if (mode === 'playing') {
                clock.advance(elapsed, dt => {
                    if (mode !== 'playing') return;
                    world.update(dt, input.sample());
                    renderer.update(world, dt, world.events);
                    world.events.forEach(event => sound.play(event));
                    if (world.state !== 'playing') {
                        mode = world.state; input.clear();
                        if (mode === 'dead') showPanel('The underworld bites back', 'A rough encounter. Take another run through the lower passage.', 'Try again');
                        else showPanel('The passage is open', `You made it through. ${world.defeated} of ${world.level.enemies.length} restless undead put to rest.`, 'Play again');
                    }
                }, tuning.step, tuning.maxCatchUp);
                hud();
            } else if (mode === 'dead') renderer.update(world, Math.min(elapsed, 0.05));
            lastTime = time;
            renderer.draw(world);
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    } catch (error) {
        title.textContent = 'The passage could not load';
        message.textContent = `${error instanceof Error ? error.message : 'Unexpected loading error'}. Check that the game is served from the project folder, then reload.`;
        primary.textContent = 'Reload'; primary.disabled = false; primary.onclick = () => location.reload();
        status.textContent = 'Loading failed';
    }
}
void boot();
