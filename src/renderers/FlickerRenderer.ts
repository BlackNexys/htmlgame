import type { Projectile } from '../components/Projectile';
import type { FlickerEffect } from '../interfaces/Weapon';
import { flickerVisuals as V, flickerDirection } from '../game/FlickerVisuals';

/** Cosmetic only: flame animation never alters velocity, collision, or cadence. */
export class FlickerRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly image?: HTMLImageElement) {}
    flight(shot: Projectile) {
        const c = this.ctx, x = shot.x + shot.width / 2, y = shot.y + shot.height / 2;
        const column = Math.floor(shot.age / V.flightFrameTime) % 6;
        const row = flickerDirection(shot.vx, shot.vy);
        c.save(); c.translate(Math.round(x), Math.round(y));
        c.shadowColor = '#FF4EAE'; c.shadowBlur = 3;
        if (this.image) this.frame(row, column);
        else {
            c.rotate(row * Math.PI / 4);
            this.fallback(column);
        }
        // Two dim embers trail the core, with no simulation particles per shot.
        c.shadowBlur = 0;
        if (this.image) c.rotate(row * Math.PI / 4);
        c.fillStyle = '#B51B78'; c.globalAlpha = .55;
        c.fillRect(-14 - column % 2, -3, 2, 1); c.fillStyle = '#52204D';
        c.fillRect(-19, 2, 1, 1);
        c.restore();
    }
    effects(effects: readonly FlickerEffect[]) {
        for (const effect of effects) {
            const c = this.ctx, clip = V.effects[effect.kind];
            c.save(); c.translate(Math.round(effect.x), Math.round(effect.y));
            c.rotate(effect.angle); c.globalAlpha = 1 - effect.age / clip.duration;
            if (this.image) this.frame(clip.row, Math.min(5, Math.floor(effect.age / clip.frameTime)));
            else {
                c.fillStyle = effect.kind === 'blocked' ? '#b4edf0' : effect.kind === 'terrain' ? '#B51B78' : '#FFABDC';
                const radius = effect.kind === 'terrain' ? 2 : 4;
                c.fillRect(-radius, -1, radius * 2, 2); c.fillRect(-1, -radius, 2, radius * 2);
            }
            c.restore();
        }
    }
    private frame(row: number, column: number) {
        this.ctx.drawImage(this.image!, column * V.cell, row * V.cell, V.cell, V.cell, -16, -16, 32, 32);
    }
    private fallback(frame: number) {
        const c = this.ctx;
        c.fillStyle = '#B51B78'; c.beginPath();
        c.moveTo(5, 0); c.lineTo(-1,-4); c.lineTo(-10-frame%3,-3); c.lineTo(-6,0);
        c.lineTo(-12+frame%2,3); c.lineTo(-2,4); c.closePath(); c.fill();
        c.fillStyle = '#FF4EAE'; c.fillRect(-6,-2,9,4);
        c.fillStyle = '#FFABDC'; c.fillRect(-2,-2,5,3);
        c.fillStyle = '#FFF0F8'; c.fillRect(0,-1,3,2);
    }
}
