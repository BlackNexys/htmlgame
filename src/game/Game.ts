import { AssetLoader } from './AssetLoader';
import { GameScreen } from '../components/GameScreen';
import { World } from './World';
import { Input } from './Input';
import { GameLoop } from './GameLoop';
import { Sound } from './Sound';
import { Hud } from '../ui/Hud';
import { GameMenu } from '../ui/GameMenu';
import type { GameMode } from '../interfaces/Game';

export class Game {
    private world = new World();
    private readonly hud = new Hud();
    private readonly menu = new GameMenu();
    private readonly sound = new Sound();
    private readonly input: Input;
    private readonly loop: GameLoop;
    private screen?: GameScreen;
    private mode: GameMode = 'loading';
    private disposed = false;
    private starting = false;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.input = new Input(canvas, key => this.handleKey(key));
        this.loop = new GameLoop(dt => this.update(dt), (elapsed, simulated) => this.draw(elapsed, simulated));
        canvas.addEventListener('blur', this.pause);
        window.addEventListener('blur', this.pause);
        document.addEventListener('visibilitychange', this.visibilityChanged);
    }

    async start() {
        if (this.mode !== 'loading' || this.starting || this.disposed) return;
        this.starting = true;
        try {
            const assets = await new AssetLoader().load();
            if (this.disposed) return;
            this.screen = new GameScreen(this.canvas, assets);
            this.hud.update(this.world);
            this.screen.draw(this.world);
            this.menu.bind({primary: () => this.primary(), pause: () => this.togglePause(),
                restart: () => this.restart(), mute: () => this.toggleMute()});
            this.mode = 'ready';
            this.menu.ready();
            this.loop.start();
        } catch (error) {
            if (!this.disposed) { this.mode = 'error'; this.menu.error(error); }
        }
    }

    dispose() {
        this.disposed = true;
        this.loop.stop(); this.input.dispose(); this.menu.dispose(); this.sound.dispose();
        this.canvas.removeEventListener('blur', this.pause);
        window.removeEventListener('blur', this.pause);
        document.removeEventListener('visibilitychange', this.visibilityChanged);
    }

    private resume() {
        this.sound.unlock(); this.input.clear(); this.loop.resume();
        this.mode = 'playing'; this.menu.playing(); this.canvas.focus();
    }

    private restart() {
        this.world = new World(); this.screen!.resetAnimation(); this.hud.update(this.world); this.resume();
    }

    private readonly pause = () => {
        if (this.mode !== 'playing') return;
        this.mode = 'paused'; this.input.clear(); this.loop.pause(); this.menu.paused();
    };

    private togglePause() { if (this.mode === 'playing') this.pause(); else if (this.mode === 'paused') this.resume(); }
    private primary() { if (this.mode === 'paused' || this.mode === 'ready') this.resume(); else this.restart(); }
    private toggleMute() {
        this.sound.muted = !this.sound.muted;
        this.menu.sound(this.sound.muted);
        if (this.mode === 'playing') this.canvas.focus();
    }
    private readonly visibilityChanged = () => { if (document.hidden) this.pause(); };

    private handleKey(key: string) {
        if (!this.screen) return;
        if (key === 'KeyP' || key === 'Escape') this.togglePause();
        if (key === 'KeyR') this.restart();
        if (key === 'KeyM') this.toggleMute();
        if (key === 'F2') this.screen.debug = !this.screen.debug;
    }

    private update(dt: number) {
        this.world.update(dt, this.input.sample());
        this.screen!.update(this.world, dt, this.world.events);
        this.world.events.forEach(event => this.sound.play(event));
        if (this.world.state !== 'playing') {
            this.mode = this.world.state; this.input.clear(); this.loop.pause();
            this.menu.outcome(this.world.state, this.world.defeated, this.world.level.enemies.length);
        }
    }

    private draw(elapsed: number, simulated: boolean) {
        if (simulated) this.hud.update(this.world);
        else if (this.mode === 'dead') this.screen!.update(this.world, Math.min(elapsed, .05));
        this.screen!.draw(this.world);
    }
}
