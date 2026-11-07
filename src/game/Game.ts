import { AssetLoader } from './AssetLoader';
import { GameScreen } from '../renderers/GameScreen';
import { World } from './World';
import { Input } from './Input';
import { GameLoop } from './GameLoop';
import { Sound } from './audio/Sound';
import { MenuMusic } from './audio/MenuMusic';
import { Hud } from '../ui/Hud';
import { GameMenu } from '../ui/GameMenu';
import type { GameMode } from '../interfaces/Game';
import type { Level } from '../interfaces/Level';
import { LevelLoader } from '../levels/LevelLoader';
import { GamePreferences } from '../ui/GamePreferences';
import { DialogueSession } from '../dialogue/DialogueSession';
import type { DialogueScene } from '../dialogue/DialogueScene';
import { sceneFor } from '../dialogue/SceneCatalog';
import { NarrativeSession } from '../narrative/NarrativeSession';
import { SaveStore } from '../narrative/SaveStore';
import { InspectionView } from '../narrative/ui/InspectionView';
import { JourneyPanel } from '../narrative/ui/JourneyPanel';
import { NarrativeHud } from '../narrative/ui/NarrativeHud';
import { Interactable } from '../components/Interactable';

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
    private dialogue?: DialogueSession;
    private introPlayed = false;
    private readonly sceneEffects = new Set<string>();
    private narrative?:NarrativeSession;
    private inspection?:InspectionView;
    private readonly journey=new JourneyPanel();
    private readonly narrativeHud=new NarrativeHud(()=>this.openJourney());

    constructor(private readonly canvas: HTMLCanvasElement,
        private readonly loadLevel: (signal: AbortSignal) => Promise<Level> = signal => new LevelLoader().load('lower-passage', signal),
        private readonly intro?: DialogueScene, private readonly preview=false) {
        this.input = new Input(canvas, key => this.handleKey(key));
        this.loop = new GameLoop(dt => this.update(dt), (elapsed, simulated) => this.draw(elapsed, simulated));
        canvas.addEventListener('blur', this.canvasBlur);
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
            this.narrative=new NarrativeSession(level.id??'',SaveStore.browser(),this.preview);
            if(!this.narrative.allowed)throw Error('This railway destination has not been unlocked. Return to the narrative study first');
            this.world = new World(level);
            this.narrative.attach(this.world);
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
        this.inspection?.dispose();this.journey.dispose();this.narrativeHud.dispose();
        this.dialogue?.dispose(); this.dialogue = undefined;
        this.loop.stop(); this.input.dispose(); this.menu.dispose(); this.sound.dispose(); this.music.dispose();
        this.canvas.removeEventListener('blur', this.canvasBlur);
        window.removeEventListener('blur', this.pause);
        document.removeEventListener('visibilitychange', this.visibilityChanged);
    }

    private resume() {
        this.narrative?.enter();this.narrativeHud.update(this.narrative);
        this.hasSession = true;
        this.music.update(false, this.sound.muted);
        this.sound.unlock(); this.input.clear(); this.world.player.clearActions(); this.loop.resume();
        this.mode = 'playing'; this.menu.playing(); this.canvas.focus({preventScroll: true});
        this.dialogue?.setHostPaused(false);
        if (this.dialogue?.holdsGameplay) this.loop.pause();
        if (this.intro && !this.introPlayed) this.beginDialogue(this.intro);
    }

    private beginDialogue(scene: DialogueScene, onCompleted?: () => void, effects?: (id:string)=>void) {
        this.introPlayed = true;
        const blocking = scene.presentation !== 'overlay';
        if (blocking) { this.mode = 'dialogue'; this.input.clear(); this.world.player.clearActions(); this.loop.pause(); this.menu.dialogue(); }
        this.dialogue = new DialogueSession(scene, id => {
            if(effects){effects(id);return;}
            // This prototype effect has no campaign reward. The host owns real effects.
            this.canvas.dataset.dialogueDemo = 'heard';
        }, result => {
            if (result !== 'cancelled') onCompleted?.();
            const held = this.dialogue?.holdsGameplay;
            this.dialogue = undefined;
            if (this.disposed) return;
            if (!blocking) {
                if (held && this.mode === 'playing') { this.input.clear(); this.world.player.clearActions(); this.loop.resume(); this.canvas.focus({preventScroll: true}); }
                return;
            }
            this.input.clear(); this.world.player.clearActions();
            if (result === 'cancelled') { this.mode = 'paused'; this.menu.paused(); }
            else this.resume();
        }, this.sceneEffects, {
            container: this.canvas.parentElement!, hostManaged: !blocking,
            returnFocus: () => this.canvas.focus({preventScroll: true}),
            onFocusExit: target => { if (target !== this.canvas) this.pause(); },
            onHold: held => {
                if (this.mode !== 'playing') return;
                this.input.clear(); this.world.player.clearActions();
                if (held) this.loop.pause(); else this.loop.resume();
            },
        });
    }

    private restart() {
        this.inspection?.dispose();this.inspection=undefined;
        if (this.dialogue) { const scene = this.dialogue; this.dialogue = undefined; scene.cancel(); }
        this.introPlayed = false; this.sceneEffects.clear(); delete this.canvas.dataset.dialogueDemo;
        this.world = new World(this.loadedLevel);this.narrative?.attach(this.world); this.screen!.resetAnimation(); this.hud.update(this.world); this.resume();
    }

    private readonly pause = () => {
        if (this.mode !== 'playing') return;
        this.mode = 'paused'; this.dialogue?.setHostPaused(true); this.input.clear(); this.world.player.clearActions(); this.loop.pause(); this.menu.paused();
    };
    private readonly canvasBlur = (event: FocusEvent) => {
        if (this.dialogue?.isOverlay && this.dialogue.view.root.contains(event.relatedTarget as Node | null)) return;
        this.pause();
    };

    private togglePause() { if (this.mode === 'playing') this.pause(); else if (this.mode === 'paused') this.resume(); }
    private primary() {
        if (!this.screen || this.mode === 'loading' || this.mode === 'error') return;
        if (this.mode === 'paused' || this.mode === 'ready') this.resume(); else this.restart();
    }
    private mainMenu() {
        this.input.clear(); this.world.player.clearActions(); this.loop.pause(); this.mode = 'menu';
        this.dialogue?.setHostPaused(true);
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
        if (this.mode === 'dialogue') return;
        if (!this.screen || this.mode === 'loading' || this.mode === 'ready' || this.mode === 'menu' || this.mode === 'error') return;
        if (key === 'KeyF') this.talk();
        if (key === 'KeyK') this.openJourney();
        if (key === 'KeyP' || key === 'Escape') this.togglePause();
        if (key === 'KeyR') this.restart();
        if (key === 'KeyM') this.toggleMute();
        if (key === 'F2') this.screen.debug = !this.screen.debug;
    }

    private talk() {
        if (this.mode !== 'playing' || this.dialogue) return;
        const target = this.world.interactions.nearest(this.world.player, this.world.interactionTargets);
        if(!target || !this.narrative)return;
        const plan=this.narrative.plan(target);
        const complete=()=>{this.narrative!.complete(plan,this.world);if(!(target instanceof Interactable) && plan.scene)target.completeConversation();this.narrativeHud.update(this.narrative);};
        if(plan.scene){
            this.world.player.facing=Math.sign(target.x-this.world.player.x)||this.world.player.facing;
            this.beginDialogue(plan.scene,complete,plan.effects.length?()=>{}:undefined);
        }else if(plan.card){
            this.mode='dialogue';this.input.clear();this.world.player.clearActions();this.loop.pause();this.menu.dialogue();
            this.inspection=new InspectionView(plan.card,completed=>{this.inspection=undefined;if(this.disposed)return;if(completed)complete();this.resume();});
        }
    }
    private openJourney(){
        if(this.mode!=='playing' || this.dialogue || !this.narrative?.active)return;
        this.mode='dialogue';this.input.clear();this.world.player.clearActions();this.loop.pause();this.menu.dialogue();
        this.journey.open(this.narrative,reset=>{
            if(this.disposed)return;
            if(reset){this.narrative!.reset();if(this.loadedLevel.id==='departure-study'){location.href=`./?level=narrative-study${this.preview?'&preview=1':''}`;return;}this.restart();}
            else this.resume();
        });
    }

    private update(dt: number) {
        this.world.update(dt, this.input.sample());
        this.screen!.update(this.world, dt, this.world.events);
        this.world.events.forEach(event => this.sound.play(event));
        if (this.world.state !== 'playing') {
            if(this.world.state==='won' && this.mode==='playing'){this.narrative?.completeStage();this.narrativeHud.update(this.narrative);}
            this.mode = this.world.state; this.input.clear(); this.loop.pause();
            this.dialogue?.cancel();
            this.menu.outcome(this.world.state, this.world.defeated, this.world.level.enemies.length);
        }
    }

    private draw(elapsed: number, simulated: boolean) {
        // The full-screen title owns presentation while it covers the game.
        if (this.mode === 'loading' || this.mode === 'ready' || this.mode === 'menu' || this.mode === 'error') return;
        if (simulated){const target=this.world.interactions.nearest(this.world.player,this.world.interactionTargets);this.hud.update(this.world,this.narrative?.prompt(target));this.narrativeHud.update(this.narrative);}
        else if (this.mode === 'dead') this.screen!.update(this.world, Math.min(elapsed, .05));
        this.screen!.draw(this.world);
    }
}
