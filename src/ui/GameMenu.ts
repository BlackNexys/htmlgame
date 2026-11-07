import type { BlButton } from '@blacklight/signal-soul/atoms';
import type { PlayState } from '../interfaces/Game';
import { MainMenu } from './MainMenu';
import { MenuNavigation } from './MenuNavigation';
import type { GamePreferencesValue, MenuMotion } from './GamePreferences';

export interface MenuActions {
    primary: () => void; pause: () => void; restart: () => void; mute: () => void;
    mainMenu: () => void; continue: () => void; hints: () => void;
    motion: (value: MenuMotion) => void;
}

/** Menu presentation and focus. Native dialogs contain keyboard navigation. */
export class GameMenu {
    private readonly panel = document.querySelector<HTMLDialogElement>('#overlay')!;
    private readonly session = document.querySelector<HTMLElement>('#session-menu')!;
    private readonly hud = document.querySelector<HTMLElement>('#game-hud')!;
    private readonly title = document.querySelector<HTMLElement>('#panel-title')!;
    private readonly message = document.querySelector<HTMLElement>('#panel-message')!;
    private readonly primary = document.querySelector<BlButton>('#primary')!;
    private readonly pause = document.querySelector<BlButton>('#pause')!;
    private readonly restart = document.querySelector<BlButton>('#restart')!;
    private readonly mute = document.querySelector<BlButton>('#mute')!;
    private readonly sessionRestart = document.querySelector<BlButton>('#session-restart')!;
    private readonly returnToMenu = document.querySelector<BlButton>('#return-main-menu')!;
    private readonly status = document.querySelector<HTMLElement>('#status')!;
    private readonly main = new MainMenu();
    private readonly navigation = new MenuNavigation(this.session);
    private readonly events = new AbortController();
    private actions?: MenuActions;
    private canContinue = false;

    constructor() {
        this.panel.hidden = false;
        this.panel.showModal(); this.main.show(false);
        this.panel.addEventListener('cancel', event => {
            event.preventDefault();
            if (this.panel.dataset.screen === 'paused') this.actions?.primary();
            else if (this.panel.dataset.screen === 'title' && this.canContinue) this.actions?.continue();
        }, {signal: this.events.signal});
        this.panel.addEventListener('keydown', event => {
            const screen = this.panel.dataset.screen;
            if (event.repeat || screen === 'title' || screen === 'error') return;
            if (event.code === 'KeyP' && screen === 'paused') { event.preventDefault(); this.actions?.primary(); }
            if (event.code === 'KeyR') { event.preventDefault(); this.actions?.restart(); }
            if (event.code === 'KeyM') { event.preventDefault(); this.actions?.mute(); }
        }, {signal: this.events.signal});
    }
    bind(actions: MenuActions) {
        this.actions = actions;
        this.primary.onclick = actions.primary; this.pause.onclick = actions.pause;
        this.restart.onclick = this.sessionRestart.onclick = actions.restart;
        this.mute.onclick = actions.mute; this.returnToMenu.onclick = actions.mainMenu;
        this.main.bind({play: actions.primary, continue: actions.continue, mute: actions.mute, hints: actions.hints, motion: actions.motion});
        [this.pause, this.restart, this.mute].forEach(button => button.addEventListener('pointerdown', this.keepGameFocus, {signal: this.events.signal}));
    }
    ready() {
        this.pause.disabled = this.restart.disabled = this.mute.disabled = false;
        this.main.ready(); this.mainMenu(false);
    }
    mainMenu(canContinue: boolean) {
        this.canContinue = canContinue; this.hud.hidden = true; this.session.hidden = true;
        this.panel.dataset.screen = 'title'; this.panel.setAttribute('aria-labelledby', 'title-heading');
        this.open(); this.main.show(canContinue); this.status.textContent = 'Main menu';
    }
    playing() {
        this.panel.close(); this.panel.hidden = true; this.main.hide();
        this.hud.hidden = false; this.pause.textContent = 'Pause'; this.status.textContent = 'Playing';
    }
    dialogue() { this.hud.hidden = true; this.status.textContent = 'Dialogue'; }
    paused() { this.pause.textContent = 'Resume'; this.show('paused', 'Take a breather', 'Your place in the passage is safe. Resume when you are ready.', 'Resume'); }
    outcome(state: PlayState, defeated: number, total: number) {
        if (state === 'dead') this.show('dead', 'The underworld bites back', 'A rough encounter. Take another run through the passage.', 'Try again');
        else this.show('won', 'The passage is open', `You made it through. ${defeated} of ${total} restless undead put to rest.`, 'Play again');
    }
    preferences(value: GamePreferencesValue) { this.main.preferences(value); this.sound(value.muted); }
    sound(muted: boolean) {
        this.mute.textContent = muted ? 'Sound off' : 'Sound on'; this.mute.setAttribute('aria-pressed', String(muted));
    }
    error(error: unknown) {
        this.show('error', 'The passage could not load', `${error instanceof Error ? error.message : 'Unexpected loading error'}. Check the level JSON and local assets, then reload.`, 'Reload');
        this.primary.onclick = () => location.reload(); this.status.textContent = 'Loading failed';
    }
    dispose() {
        this.events.abort(); this.main.dispose(); this.navigation.dispose(); this.panel.close();
        [this.primary, this.pause, this.restart, this.mute, this.sessionRestart, this.returnToMenu].forEach(button => button.onclick = null);
    }
    private open() { this.panel.hidden = false; if (!this.panel.open) this.panel.showModal(); }
    private show(screen: 'paused' | 'dead' | 'won' | 'error', title: string, body: string, button: string) {
        this.main.hide(); this.hud.hidden = true; this.session.hidden = false;
        this.title.textContent = title; this.message.textContent = body; this.primary.textContent = button; this.primary.disabled = false;
        this.sessionRestart.hidden = screen !== 'paused'; this.returnToMenu.hidden = screen === 'error';
        document.querySelector<HTMLElement>('#session-options')!.hidden = screen === 'error';
        document.querySelector<HTMLElement>('#session-controls')!.hidden = screen === 'error';
        this.panel.dataset.screen = screen; this.panel.setAttribute('aria-labelledby', 'panel-title');
        this.open(); this.status.textContent = title;
        void this.primary.updateComplete.then(() => { if (!this.session.hidden && this.panel.open) this.primary.focus({preventScroll: true}); });
    }
    private readonly keepGameFocus = (event: PointerEvent) => event.preventDefault();
}
