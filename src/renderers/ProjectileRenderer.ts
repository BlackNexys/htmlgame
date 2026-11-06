import type { Projectile } from '../components/Projectile';

export class ProjectileRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    draw(projectiles: Projectile[]) {
        const c = this.ctx;
        for (const shot of projectiles) {
            c.save(); c.translate(shot.x + shot.width / 2, shot.y + shot.height / 2);
            c.rotate(Math.atan2(shot.vy, shot.vx));
            const length = shot.owner === 'player' ? 16 : Math.max(shot.width, shot.height);
            const thickness = shot.owner === 'player' ? 9 : Math.min(shot.width, shot.height);
            c.shadowColor = shot.glowColor; c.shadowBlur = 14;
            c.fillStyle = shot.color; c.fillRect(-length / 2, -thickness / 2, length, thickness);
            c.fillStyle = shot.coreColor; c.fillRect(-4, -2, 5, 4);
            c.restore();
        }
        c.shadowBlur = 0;
    }
}
