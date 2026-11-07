import type { Enemy } from '../components/Enemy';
import type { Corpse } from '../components/Corpse';
import type { GameAssets } from '../interfaces/Assets';
import { EnemyAnimation } from '../game/animation/EnemyAnimation';

export class EnemyRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly assets: GameAssets) {}

    draw(enemy: Enemy, elapsed: number, corpses: Corpse[]) {
        const c = this.ctx, e = enemy;
        const frame = EnemyAnimation.frame(e, elapsed);
        c.save();
        if (!e.vulnerable) c.globalAlpha = .35;
        if (e.flash > 0) c.filter = 'brightness(2)';
        this.sprite(e, frame.row, frame.column); c.restore();
        const telegraph = e.state === 'windup';
        c.textAlign = 'center'; c.font = '9px monospace';
        c.fillStyle = telegraph ? '#ffd39b' : '#a1beb4';
        const label = e.blockFlash > 0 ? 'BLOCKED' : !e.vulnerable ? 'PHASED' : telegraph ? e.windupLabel : e.displayName;
        c.fillText(label, e.x + e.width / 2, e.y - 23);
        c.fillStyle = '#27383b'; c.fillRect(e.x - 3, e.y - 16, e.width + 6, 3);
        c.fillStyle = e.vulnerable ? '#9bd4ce' : '#41666a';
        c.fillRect(e.x - 3, e.y - 16, (e.width + 6) * e.health / e.maxHealth, 3);
        if (telegraph) {
            c.fillStyle = '#dfac6b'; c.fillRect(e.x - 3, e.y - 10, (e.width + 6) * (1 - Math.max(0, e.timer) / e.stats.windup), 3);
            const aim = e.aimLine;
            if (aim) {
                c.save(); c.setLineDash([4, 8]); c.strokeStyle = '#6c8e91'; c.globalAlpha = .5;
                c.beginPath(); c.moveTo(aim.x, aim.y); c.lineTo(aim.endX, aim.endY); c.stroke(); c.restore();
            }
        }
        if (e.shieldRaised) {
            c.fillStyle = e.blockFlash > 0 ? '#d3ffff' : '#5dabb4';
            c.fillRect(e.x + (e.facing > 0 ? e.width + 2 : -4), e.y + 8, e.blockFlash > 0 ? 4 : 2, e.height - 12);
        }
        if (e.isChanneling) {
            const target = corpses.find(corpse => corpse.enemy.id === e.channelTargetId);
            if (target) {
                c.save(); c.strokeStyle = '#84e1e5'; c.setLineDash([5, 5]); c.lineDashOffset = -elapsed * 40;
                c.beginPath(); c.moveTo(e.x + e.width / 2, e.y + 22); c.lineTo(target.enemy.x + target.enemy.width / 2, target.enemy.y + target.enemy.height - 10); c.stroke(); c.restore();
            }
        }
    }

    sprite(enemy: Enemy, row: number, column: number) {
        const image = this.assets.enemies[enemy.kind], size = enemy.stats.size;
        const x = Math.round(column * image.width / 4), y = Math.round(row * image.height / 4);
        const width = Math.round((column + 1) * image.width / 4) - x, height = Math.round((row + 1) * image.height / 4) - y;
        this.ctx.save(); this.ctx.translate(Math.round(enemy.x + enemy.width / 2), Math.round(enemy.y2));
        this.ctx.scale(enemy.facing, 1);
        this.ctx.drawImage(image, x, y, width, height, -size / 2, -size * enemy.spriteAnchorY, size, size);
        this.ctx.restore();
    }
}
