import type { BlButton } from '@blacklight/signal-soul/atoms';
import { MenuNavigation } from './MenuNavigation';
import type { GamePreferencesValue, MenuMotion } from './GamePreferences';
import { TitleScene } from './TitleScene';

export interface MainMenuActions { play: () => void; continue: () => void; mute: () => void; hints: () => void; motion: (value: MenuMotion) => void; }

/** Title navigation and auxiliary dialogs; gameplay state stays in Game. */
export class MainMenu {
    private readonly root = document.querySelector<HTMLElement>('#main-menu')!;
    private readonly scene = new TitleScene(this.root.querySelector<HTMLElement>('.title-art')!);
    private readonly play = document.querySelector<BlButton>('#title-play')!;
    private readonly continue = document.querySelector<BlButton>('#title-continue')!;
    private readonly options = document.querySelector<HTMLDialogElement>('#options-dialog')!;
    private readonly controls = document.querySelector<HTMLDialogElement>('#controls-dialog')!;
    private readonly sound = document.querySelector<HTMLInputElement>('#option-sound')!;
    private readonly hints = document.querySelector<HTMLInputElement>('#option-hints')!;
    private readonly motion = document.querySelector<HTMLSelectElement>('#option-menu-motion')!;
    private readonly enableMotion = document.querySelector<HTMLButtonElement>('#title-enable-motion')!;
    private readonly navigation = new MenuNavigation(this.root);
    private readonly events = new AbortController();

    constructor() {
        for (const button of document.querySelectorAll<HTMLElement>('[data-open-options]')) {
            button.addEventListener('click', () => this.options.showModal(), {signal: this.events.signal});
        }
        for (const button of document.querySelectorAll<HTMLElement>('[data-open-controls]')) {
            button.addEventListener('click', () => this.controls.showModal(), {signal: this.events.signal});
        }
        for (const button of document.querySelectorAll<HTMLElement>('[data-close-dialog]')) {
            button.addEventListener('click', () => (document.getElementById(button.dataset.closeDialog!) as HTMLDialogElement).close(), {signal: this.events.signal});
        }
    }
    bind(actions: MainMenuActions) {
        this.play.onclick = actions.play; this.continue.onclick = actions.continue;
        this.sound.onchange = actions.mute; this.hints.onchange = actions.hints;
        this.motion.onchange = () => actions.motion(this.motion.value as MenuMotion);
        this.enableMotion.onclick = () => {
            actions.motion('animated');
            if (!this.play.disabled) this.play.focus({preventScroll: true});
        };
    }
    ready() {
        this.play.disabled = false;
        document.querySelector<HTMLElement>('#title-status')!.textContent = 'A restless soul. A long way home.';
    }
    show(canContinue: boolean) {
        this.root.hidden = false;
        this.scene.show();
        this.continue.hidden = !canContinue;
        this.play.textContent = canContinue ? 'New game' : 'Play';
        this.play.variant = canContinue ? 'secondary' : 'primary';
        const target = canContinue ? this.continue : this.play;
        void target.updateComplete.then(() => requestAnimationFrame(() => {
            if (!this.events.signal.aborted && !this.root.hidden && !this.options.open && !this.controls.open && !target.disabled) target.focus({preventScroll: true});
        }));
    }
    hide() { this.scene.hide(); this.root.hidden = true; }
    preferences(value: GamePreferencesValue) {
        this.sound.checked = !value.muted; this.hints.checked = value.showHints;
        this.motion.value = value.menuMotion; this.scene.preferences(value.menuMotion);
        document.body.dataset.hints = value.showHints ? 'on' : 'off';
    }
    dispose() {
        this.scene.dispose();
        this.events.abort(); this.navigation.dispose();
        this.play.onclick = this.continue.onclick = null;
        this.sound.onchange = this.hints.onchange = null;
        this.motion.onchange = null;
        this.enableMotion.onclick = null;
        this.options.close(); this.controls.close();
    }
}
