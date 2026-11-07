import type { InputSnapshot, PlayerAction } from '../interfaces/Game';

const bindings: Record<PlayerAction, readonly string[]> = {
    left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'],
    jump: ['Space'], sprint: ['ShiftLeft', 'ShiftRight'], fire: ['KeyJ', 'KeyX'],
};
const commands = new Set(['KeyP', 'Escape', 'KeyR', 'KeyM', 'KeyF', 'KeyK', 'F2']);
const actions = Object.keys(bindings) as PlayerAction[];

export class Input {
    private held = new Set<string>();
    private pressed = new Set<PlayerAction>();
    private released = new Set<PlayerAction>();
    private readonly keys = new Set([...Object.values(bindings).flat(), ...commands]);

    constructor(private readonly canvas: HTMLCanvasElement, private readonly action: (key: string) => void,
        private readonly blurTarget: EventTarget = window) {
        canvas.addEventListener('keydown', this.keyDown);
        canvas.addEventListener('keyup', this.keyUp);
        canvas.addEventListener('blur', this.clear);
        this.blurTarget.addEventListener('blur', this.clear);
    }

    readonly clear = () => { this.held.clear(); this.pressed.clear(); this.released.clear(); };

    sample(): InputSnapshot {
        const held = actions.filter(action => this.isHeld(action));
        const controls: InputSnapshot = {
            left: this.isHeld('left'), right: this.isHeld('right'), up: this.isHeld('up'), down: this.isHeld('down'),
            fire: this.isHeld('fire'), sprint: this.isHeld('sprint'), jumpHeld: this.isHeld('jump'),
            jump: this.pressed.has('jump'), jumpReleased: this.released.has('jump'),
            held, pressed: [...this.pressed], released: [...this.released],
        };
        this.pressed.clear(); this.released.clear();
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
        if (event.repeat && !this.held.has(event.code)) return;
        if (!this.held.has(event.code) && !event.repeat) {
            for (const action of actions) if (bindings[action].includes(event.code) && !this.isHeld(action)) this.pressed.add(action);
            if (commands.has(event.code)) {
                // Register before invoking a command: pause/restart may clear input.
                this.held.add(event.code); this.action(event.code); return;
            }
        }
        this.held.add(event.code);
    };

    private readonly keyUp = (event: KeyboardEvent) => {
        if (this.keys.has(event.code)) event.preventDefault();
        const before = actions.filter(action => this.isHeld(action));
        this.held.delete(event.code);
        for (const action of before) if (!this.isHeld(action)) this.released.add(action);
    };
    private isHeld(action: PlayerAction) { return bindings[action].some(code => this.held.has(code)); }
}
