import type { World } from '../game/World';
import type { Rect } from '../interfaces/Geometry';

export class DebugRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    bounds(world: World) {
        const outline = (bounds: Rect, color: string) => { this.ctx.strokeStyle = color; this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height); };
        world.level.solids.forEach(wall => outline(wall, '#5c9b8b'));
        outline(world.player, '#e9f279'); world.enemies.forEach(enemy => outline(enemy, '#ff7e88'));
        world.projectiles.forEach(shot => outline(shot, '#ffffff'));
    }
    overlay(world: World) {
        const c = this.ctx, player = world.player;
        c.fillStyle = '#081219'; c.fillRect(12, 64, 420, 72);
        c.fillStyle = '#ddf3d8'; c.font = '13px monospace'; c.textAlign = 'left';
        c.fillText(`x ${player.x.toFixed(0)} y ${player.y.toFixed(0)} vx ${player.vx.toFixed(0)} vy ${player.vy.toFixed(0)}`, 22, 85);
        c.fillText(`${player.motion} · aim ${player.aim.x},${player.aim.y} · wall ${player.movement.wallSide}`, 22, 105);
        c.fillText(`shots ${world.projectiles.length} · F2 hide`, 22, 125);
    }
}
