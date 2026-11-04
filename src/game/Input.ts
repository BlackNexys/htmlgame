import { Controls } from './World';

export class Input {
    private held = new Set<string>();
    private jump = false;
    private keys = new Set(['KeyA', 'KeyD', 'KeyW', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyJ', 'KeyX', 'KeyP', 'Escape', 'KeyR', 'KeyM', 'F2']);
    constructor(canvas: HTMLCanvasElement, action: (key: string) => void) {
        canvas.addEventListener('keydown', event => {
            if (!this.keys.has(event.code)) return;
            event.preventDefault();
            if (!this.held.has(event.code) && !event.repeat) {
                if (['KeyW', 'ArrowUp', 'Space'].includes(event.code)) this.jump = true;
                if (['KeyP', 'Escape', 'KeyR', 'KeyM', 'F2'].includes(event.code)) action(event.code);
            }
            this.held.add(event.code);
        });
        canvas.addEventListener('keyup', event => {
            if (this.keys.has(event.code)) event.preventDefault();
            this.held.delete(event.code);
        });
        canvas.addEventListener('blur', () => this.clear());
        window.addEventListener('blur', () => this.clear());
    }
    clear() { this.held.clear(); this.jump = false; }
    sample(): Controls {
        const controls = {
            left: this.held.has('KeyA') || this.held.has('ArrowLeft'),
            right: this.held.has('KeyD') || this.held.has('ArrowRight'),
            fire: this.held.has('KeyJ') || this.held.has('KeyX'), jump: this.jump,
        };
        this.jump = false; return controls;
    }
}
