import { CutsceneDirector, type SceneResult } from './CutsceneDirector';
import type { DialogueScene } from './DialogueScene';
import { DialogueView } from './ui/DialogueView';
import { ActionDialogueView } from './ui/ActionDialogueView';
import { KineticDialogueView } from './ui/KineticDialogueView';
import type { DialoguePresentation } from './ui/DialoguePresentation';

export interface DialogueSessionOptions {
    container?: HTMLElement;
    hostManaged?: boolean;
    onHold?: (held: boolean) => void;
    returnFocus?: () => void;
    onFocusExit?: (target: EventTarget | null) => void;
}

/** Owns browser timing/focus only. The host owns suspension of gameplay and rewards. */
export class DialogueSession {
    readonly director: CutsceneDirector;
    readonly view: DialoguePresentation;
    private readonly events = new AbortController();
    private frame?: number;
    private last = 0;
    private paused = false;
    private log = false;
    private disposed = false;
    private hostPaused = false;
    private focused = false;
    private notifiedHold = false;
    get isOverlay() { return this.director.scene.presentation === 'overlay'; }
    get holdsGameplay() { return this.isOverlay && (this.paused || this.log || this.focused); }
    constructor(scene: DialogueScene, effect: (id: string) => void, end: (result: SceneResult) => void,
        applied = new Set<string>(), private readonly options: DialogueSessionOptions = {}) {
        this.director = new CutsceneDirector(scene, effect, result => { this.dispose(); end(result); }, applied);
        const speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : scene.presentation === 'kinetic' ? 60 : 36;
        this.director.speed = speed;
        const View = this.isOverlay ? ActionDialogueView : scene.presentation === 'kinetic' ? KineticDialogueView : DialogueView;
        this.view = new View(this.director.scene, {
            advance: () => { if (this.log) this.log = false; else if (this.paused) this.paused = false; else if (this.focused) this.options.returnFocus?.(); else this.director.advance(); this.refresh(); },
            skip: () => this.director.skip(),
            pause: () => { if (this.log) this.log = false; else this.paused = !this.paused; this.refresh(); },
            history: () => { this.log = !this.log; this.refresh(); },
            speed: value => { this.director.speed = value; if (value === 0) this.director.line?.reveal(); this.refresh(); },
            autoplay: () => { this.director.autoAdvance = !this.director.autoAdvance; this.refresh(); },
        }, speed, options.container);
        const listenerOptions = {signal: this.events.signal};
        if (!this.options.hostManaged) {
            window.addEventListener('blur', this.suspend, listenerOptions);
            document.addEventListener('visibilitychange', () => { if (document.hidden) this.suspend(); }, listenerOptions);
        }
        if (this.isOverlay) {
            this.view.root.addEventListener('focusin', () => { this.focused = true; this.refresh(); }, listenerOptions);
            this.view.root.addEventListener('focusout', event => {
                if (!this.view.root.contains(event.relatedTarget as Node | null)) {
                    this.options.onFocusExit?.(event.relatedTarget);
                    this.focused = false; this.refresh();
                }
            }, listenerOptions);
            window.addEventListener('keydown', event => {
                if (this.hostPaused || event.target instanceof HTMLSelectElement || event.ctrlKey || event.metaKey || event.altKey) return;
                if (event.code === 'Escape' && this.focused) { event.preventDefault(); event.stopImmediatePropagation(); this.options.returnFocus?.(); return; }
                if (!['KeyN', 'KeyL'].includes(event.code)) return;
                event.preventDefault();
                if (event.repeat) return;
                if (event.code === 'KeyL') this.log = !this.log;
                else if (this.log) this.log = false;
                else if (this.paused) this.paused = false;
                else this.director.advance();
                this.refresh();
            }, {...listenerOptions, capture: true});
        }
        this.view.open(); this.refresh(); this.frame = requestAnimationFrame(this.tick);
    }
    private readonly suspend = () => { this.paused = true; this.refresh(); };
    setHostPaused(paused: boolean) {
        this.hostPaused = paused;
        if (this.isOverlay) this.view.root.hidden = paused;
        this.refresh();
    }
    private refresh() {
        this.last = 0;
        if (this.disposed) return;
        if (this.holdsGameplay !== this.notifiedHold) { this.notifiedHold = this.holdsGameplay; this.options.onHold?.(this.notifiedHold); }
        this.view.render(this.director, this.paused || this.focused || this.hostPaused, this.log);
    }
    private readonly tick = (time: number) => {
        if (this.disposed) return;
        const dt = this.last ? Math.min(.05, (time - this.last) / 1000) : 0; this.last = time;
        if (!this.paused && !this.log && !this.focused && !this.hostPaused && !document.hidden) this.director.update(dt);
        if (this.disposed) return;
        this.view.render(this.director, this.paused || this.focused || this.hostPaused, this.log);
        this.frame = requestAnimationFrame(this.tick);
    };
    cancel() { this.director.cancel(); }
    dispose() {
        if (this.disposed) return;
        this.disposed = true; this.events.abort();
        if (this.frame !== undefined) cancelAnimationFrame(this.frame);
        this.view?.dispose();
    }
}
