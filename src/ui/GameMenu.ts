import type { PlayState } from '../interfaces/Game';

export interface MenuActions { primary: () => void; pause: () => void; restart: () => void; mute: () => void; }

export class GameMenu {
    private readonly panel = document.querySelector<HTMLElement>('#overlay')!;
    private readonly title = document.querySelector<HTMLElement>('#panel-title')!;
    private readonly message = document.querySelector<HTMLElement>('#panel-message')!;
    private readonly primary = document.querySelector<HTMLButtonElement>('#primary')!;
    private readonly pause = document.querySelector<HTMLButtonElement>('#pause')!;
    private readonly restart = document.querySelector<HTMLButtonElement>('#restart')!;
    private readonly mute = document.querySelector<HTMLButtonElement>('#mute')!;
    private readonly status = document.querySelector<HTMLElement>('#status')!;

    bind(actions: MenuActions) {
        this.primary.onclick = actions.primary;
        this.pause.onclick = actions.pause;
        this.restart.onclick = actions.restart;
        this.mute.onclick = actions.mute;
        [this.pause, this.restart, this.mute].forEach(button => button.addEventListener('pointerdown', this.keepGameFocus));
    }

    ready() {
        this.pause.disabled = this.restart.disabled = this.mute.disabled = false;
        this.show('A little further below', 'Run, jump, and fight your way to the passage. Someone worth finding is still out there.', 'Enter the underworld');
    }

    playing() { this.panel.hidden = true; this.pause.textContent = 'Pause'; this.status.textContent = 'Playing'; }
    paused() {
        this.pause.textContent = 'Resume';
        this.show('Take a breather', 'Your place in the passage is safe. Resume when you are ready.', 'Resume');
    }

    outcome(state: PlayState, defeated: number, total: number) {
        if (state === 'dead') this.show('The underworld bites back', 'A rough encounter. Take another run through the lower passage.', 'Try again');
        else this.show('The passage is open', `You made it through. ${defeated} of ${total} restless undead put to rest.`, 'Play again');
    }

    sound(muted: boolean) {
        this.mute.textContent = muted ? 'Sound off' : 'Sound on';
        this.mute.setAttribute('aria-pressed', String(muted));
    }

    error(error: unknown) {
        this.show('The passage could not load', `${error instanceof Error ? error.message : 'Unexpected loading error'}. Check that the game is served from the project folder, then reload.`, 'Reload');
        this.primary.onclick = () => location.reload();
        this.status.textContent = 'Loading failed';
    }

    dispose() {
        [this.primary, this.pause, this.restart, this.mute].forEach(button => button.onclick = null);
        [this.pause, this.restart, this.mute].forEach(button => button.removeEventListener('pointerdown', this.keepGameFocus));
    }

    private show(title: string, body: string, button: string) {
        this.title.textContent = title; this.message.textContent = body; this.primary.textContent = button;
        this.panel.hidden = false; this.primary.disabled = false; this.status.textContent = title;
    }
    private readonly keepGameFocus = (event: PointerEvent) => event.preventDefault();
}
