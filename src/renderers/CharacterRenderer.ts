import type { Character } from '../components/Character';
import type { GameEvent } from '../interfaces/Game';
import { CharacterAnimation, type CharacterFrame } from '../game/CharacterAnimation';

export class CharacterRenderer {
    private animation = new CharacterAnimation();
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly image: HTMLImageElement) {}
    reset() { this.animation = new CharacterAnimation(); }
    update(character: Character, dt: number, events: GameEvent[], dead: boolean) { this.animation.update(character, dt, events, dead); }

    draw(player: Character, elapsed: number) {
        const c = this.ctx;
        if (player.grounded) { c.fillStyle = 'rgba(5,15,20,.5)'; c.fillRect(player.x - 8, player.y2 - 1, 48, 6); }
        c.save(); c.translate(Math.round(player.x + player.width / 2), Math.round(player.y2)); c.scale(player.facing, 1);
        if (player.invulnerable > 0 && Math.floor(elapsed * 16) % 2) c.globalAlpha = .35;
        const pose = this.animation.sample(player);
        if (pose.upper) {
            const hip = -17;
            c.save(); c.beginPath(); c.rect(-80, hip, 160, 100); c.clip(); this.frame(pose.base); c.restore();
            c.save(); c.beginPath(); c.rect(-80, -100, 160, 100 + hip); c.clip(); this.frame(pose.upper); c.restore();
        } else this.frame(pose.base);
        c.restore();
    }

    private frame(frame: CharacterFrame) {
        const cell = 209, size = 80;
        this.ctx.drawImage(this.image, frame.column * cell, frame.row * cell, cell, cell,
            -frame.anchorX / cell * size, -frame.anchorY / cell * size, size, size);
    }
}
