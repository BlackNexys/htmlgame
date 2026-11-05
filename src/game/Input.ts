import type { Controls } from '../interfaces/Game';

export class Input {
    private held = new Set<string>();
    private jump = false;
    private readonly keys = new Set(['KeyA', 'KeyD', 'KeyW', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyJ', 'KeyX', 'KeyP', 'Escape', 'KeyR', 'KeyM', 'F2']);

    constructor(private readonly canvas: HTMLCanvasElement, private readonly action: (key: string) => void,
        private readonly blurTarget: EventTarget = window) {
        canvas.addEventListener('keydown', this.keyDown);
        canvas.addEventListener('keyup', this.keyUp);
        canvas.addEventListener('blur', this.clear);
        this.blurTarget.addEventListener('blur', this.clear);
    }

    readonly clear = () => { this.held.clear(); this.jump = false; };

    sample(): Controls {
        const controls = {left: this.held.has('KeyA') || this.held.has('ArrowLeft'),
            right: this.held.has('KeyD') || this.held.has('ArrowRight'),
            fire: this.held.has('KeyJ') || this.held.has('KeyX'), jump: this.jump};
        this.jump = false;
        return controls;
    }

    dispose() {
        this.clear();
        this.canvas.removeEventListener('keydown', this.keyDown);
        this.canvas.removeEventListener('keyup', this.keyUp);
        this.canvas.removeEventListener('blur', this.clear);
        this.blurTarget.removeEventListener('blur', this.clear);
    }

    private readonly keyDown = (event: KeyboardEvent) => {
        if (!this.keys.has(event.code)) return;
        event.preventDefault();
        if (!this.held.has(event.code) && !event.repeat) {
            if (['KeyW', 'ArrowUp', 'Space'].includes(event.code)) this.jump = true;
            if (['KeyP', 'Escape', 'KeyR', 'KeyM', 'F2'].includes(event.code)) this.action(event.code);
        }
        this.held.add(event.code);
    };

    private readonly keyUp = (event: KeyboardEvent) => {
        if (this.keys.has(event.code)) event.preventDefault();
        this.held.delete(event.code);
    };
}
