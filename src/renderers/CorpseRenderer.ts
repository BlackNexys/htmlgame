import type { Corpse } from '../components/Corpse';
import { EnemyRenderer } from './EnemyRenderer';

export class CorpseRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly enemies: EnemyRenderer) {}
    draw(corpse: Corpse) {
        const c = this.ctx, enemy = corpse.enemy;
        c.save(); c.globalAlpha = corpse.revivable ? .7 : .32;
        this.enemies.sprite(enemy, 3, Math.min(3, Math.floor(corpse.age * 7)));
        c.restore();
        if (corpse.revivable) {
            c.fillStyle = corpse.claimedBy !== undefined ? '#b9ffff' : '#478b93';
            c.fillRect(enemy.x + enemy.width / 2 - 2, enemy.y2 - 6, 4, 4);
        } else if (enemy.revives > 0) {
            c.fillStyle = '#8d786e'; c.fillRect(enemy.x + enemy.width / 2 - 4, enemy.y2 - 4, 8, 2);
        }
    }
}
