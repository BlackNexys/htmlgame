import type { Projectile } from '../components/Projectile';
import { FlickerRenderer } from './FlickerRenderer';
import type { FlickerEffect, FlickerSpark } from '../interfaces/Weapon';

export class ProjectileRenderer {
    private readonly flicker: FlickerRenderer;
    constructor(private readonly ctx: CanvasRenderingContext2D, image?: HTMLImageElement) { this.flicker = new FlickerRenderer(ctx, image); }
    draw(projectiles: Projectile[], effects: readonly FlickerEffect[] = [], sparks: readonly FlickerSpark[] = []) {
        const c = this.ctx;
        this.flicker.sparks(sparks);
        for (const shot of projectiles) {
            if (shot.owner === 'player') { this.flicker.flight(shot); continue; }
            c.save(); c.translate(shot.x + shot.width / 2, shot.y + shot.height / 2);
            c.rotate(Math.atan2(shot.vy, shot.vx));
            const length = Math.max(shot.width, shot.height), thickness = Math.min(shot.width, shot.height);
            c.shadowColor = shot.glowColor; c.shadowBlur = 14;
            c.fillStyle = shot.color; c.fillRect(-length / 2, -thickness / 2, length, thickness);
            c.fillStyle = shot.coreColor; c.fillRect(-4, -2, 5, 4);
            c.restore();
        }
        c.shadowBlur = 0;
        this.flicker.effects(effects);
    }
}
