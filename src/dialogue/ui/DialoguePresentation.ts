import type { CutsceneDirector } from '../CutsceneDirector';

export interface DialogueActions {
    advance(): void; skip(): void; pause(): void; history(): void; speed(value: number): void;
    autoplay?(): void;
}
export interface DialoguePresentation {
    readonly root: HTMLElement;
    open(): void;
    render(director: CutsceneDirector, paused: boolean, log: boolean): void;
    dispose(): void;
}
