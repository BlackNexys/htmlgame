import type { Character } from '../components/Character';
import type { CharacterFrame } from '../game/animation/CharacterAnimation';
import { characterAtlas } from '../game/animation/CharacterAtlas';
import { tuning } from '../game/config';

/** Cosmetic only. Coordinates come from the soles of each authored run frame. */
export class BootFlameRenderer {
    private time = 0;
    private strength = 0;
    constructor(private readonly image?: HTMLImageElement) {}
    reset() { this.time = 0; this.strength = 0; }
    update(player: Character, dt: number, dead: boolean) {
        this.time += dt;
        const moving = !dead && player.grounded && !player.crouched && Math.abs(player.vx) > tuning.speed && player.sprintCharge > 0;
        this.strength = moving ? player.sprintCharge : 0;
    }
    draw(c: CanvasRenderingContext2D, frame: CharacterFrame) {
        if (!this.image || this.strength <= 0 || frame.sheet === 'aim' || ![1,6].includes(frame.row)) return;
        const soles = characterAtlas.boots[frame.row]?.[frame.column];
        if (!soles) return;
        const scale = characterAtlas.size / characterAtlas.cell;
        c.save(); c.globalAlpha *= .45 + this.strength * .55;
        soles.forEach((sole, index) => {
            const phase = Math.floor(this.time * 18 + index * 3) % 6;
            const factor = .3 + this.strength * .4;
            const x = (sole.x - frame.anchorX) * scale * (frame.mirror ? -1 : 1);
            const y = (sole.y - frame.anchorY) * scale;
            c.drawImage(this.image!, phase * 32, 0, 32, 24,
                Math.round(x - 30 * factor), Math.round(y - 22 * factor), 32 * factor, 24 * factor);
        });
        c.restore();
    }
}
