import { AssetLoader } from './AssetLoader';
import { GameScreen } from '../components/GameScreen';
import { World } from './World';
import { Input } from './Input';
import { GameLoop } from './GameLoop';
import { Sound } from './Sound';
import { MenuMusic } from './MenuMusic';
import { Hud } from '../ui/Hud';
import { GameMenu } from '../ui/GameMenu';
import type { GameMode } from '../interfaces/Game';
import type { Level } from '../interfaces/Level';
import { LevelLoader } from '../levels/LevelLoader';
import { GamePreferences } from '../ui/GamePreferences';

export class Game {
    private world!: World;
    private loadedLevel!: Level;
    private readonly loading = new AbortController();
    private readonly hud = new Hud();
    private readonly menu = new GameMenu();
    private readonly sound = new Sound();
    private readonly music = new MenuMusic(document.querySelector<HTMLAudioElement>('#menu-music')!);
    private readonly preferences = new GamePreferences();
    private hasSession = false;
    private readonly input: Input;
    private readonly loop: GameLoop;
    private screen?: GameScreen;
    private mode: GameMode = 'loading';
    private disposed = false;
    private starting = false;

    constructor(private readonly canvas: HTMLCanvasElement,
        private readonly loadLevel: (signal: AbortSignal) => Promise<Level> = signal => new LevelLoader().load('lower-passage', signal)) {
        this.input = new Input(canvas, key => this.handleKey(key));
        this.loop = new GameLoop(dt => this.update(dt), (elapsed, simulated) => this.draw(elapsed, simulated));
        canvas.addEventListener('blur', this.pause);
        window.addEventListener('blur', this.pause);
        document.addEventListener('visibilitychange', this.visibilityChanged);
        this.sound.muted = this.preferences.value.muted;
        this.menu.preferences(this.preferences.value);
        this.menu.bind({primary: () => this.primary(), pause: () => this.togglePause(),
            restart: () => this.restart(), mute: () => this.toggleMute(),
            mainMenu: () => this.mainMenu(), continue: () => this.continue(), hints: () => this.toggleHints(),
            motion: menuMotion => this.menu.preferences(this.preferences.update({menuMotion}))});
    }

    async start() {
        if (this.mode !== 'loading' || this.starting || this.disposed) return;
        this.starting = true;
        try {
            const [assets, level] = await Promise.all([new AssetLoader().load(), this.loadLevel(this.loading.signal)]);
            if (this.disposed) return;
            this.loadedLevel = level;
            this.world = new World(level);
            this.screen = new GameScreen(this.canvas, assets);
            this.hud.update(this.world);
            this.screen.draw(this.world);
            this.mode = 'ready';
            this.music.update(true, this.sound.muted);
            this.menu.ready();
            this.loop.start();
        } catch (error) {
            if (!this.disposed) { this.mode = 'error'; this.menu.error(error); }
        }
    }

    dispose() {
        this.disposed = true;
        this.loading.abort();
        this.loop.stop(); this.input.dispose(); this.menu.dispose(); this.sound.dispose(); this.music.dispose();
        this.canvas.removeEventListener('blur', this.pause);
        window.removeEventListener('blur', this.pause);
        document.removeEventListener('visibilitychange', this.visibilityChanged);
    }

    private resume() {
        this.hasSession = true;
        this.music.update(false, this.sound.muted);
        this.sound.unlock(); this.input.clear(); this.world.player.clearActions(); this.loop.resume();
        this.mode = 'playing'; this.menu.playing(); this.canvas.focus({preventScroll: true});
    }

    private restart() {
        this.world = new World(this.loadedLevel); this.screen!.resetAnimation(); this.hud.update(this.world); this.resume();
    }

    private readonly pause = () => {
        if (this.mode !== 'playing') return;
        this.mode = 'paused'; this.input.clear(); this.world.player.clearActions(); this.loop.pause(); this.menu.paused();
    };

    private togglePause() { if (this.mode === 'playing') this.pause(); else if (this.mode === 'paused') this.resume(); }
    private primary() {
        if (!this.screen || this.mode === 'loading' || this.mode === 'error') return;
        if (this.mode === 'paused' || this.mode === 'ready') this.resume(); else this.restart();
    }
    private mainMenu() {
        this.input.clear(); this.world.player.clearActions(); this.loop.pause(); this.mode = 'menu';
        this.music.update(true, this.sound.muted);
        this.menu.mainMenu(this.hasSession && this.world.state === 'playing');
    }
    private continue() { if (this.mode === 'menu' && this.hasSession && this.world.state === 'playing') this.resume(); }
    private toggleHints() {
        this.menu.preferences(this.preferences.update({showHints: !this.preferences.value.showHints}));
    }
    private toggleMute() {
        this.sound.muted = !this.sound.muted;
        this.music.update(this.mode === 'ready' || this.mode === 'menu', this.sound.muted);
        this.menu.preferences(this.preferences.update({muted: this.sound.muted}));
        if (this.mode === 'playing') this.canvas.focus({preventScroll: true});
    }
    private readonly visibilityChanged = () => { if (document.hidden) this.pause(); };

    private handleKey(key: string) {
        if (!this.screen || this.mode === 'loading' || this.mode === 'ready' || this.mode === 'menu' || this.mode === 'error') return;
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
