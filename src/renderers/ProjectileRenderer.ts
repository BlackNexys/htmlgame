import type { Projectile } from '../components/Projectile';

export class ProjectileRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    draw(projectiles: Projectile[]) {
        const c = this.ctx;
        for (const shot of projectiles) {
            c.shadowColor = shot.glowColor; c.shadowBlur = 14;
            c.fillStyle = shot.color; c.fillRect(shot.x, shot.y, shot.width, shot.height);
            c.fillStyle = shot.coreColor; c.fillRect(shot.x + 4, shot.y + 2, 5, 4);
        }
        c.shadowBlur = 0;
    }
}
