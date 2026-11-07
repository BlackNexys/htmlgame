import { Corpse } from '../../components/Corpse';
import type { Enemy } from '../../components/Enemy';
import type { World } from '../World';

export class Graveyard {
    corpses: Corpse[] = [];
    constructor(private readonly gameArea: World) {}

    add(enemy: Enemy) { this.corpses.push(new Corpse(enemy, this.gameArea.level.height)); }
    update(dt: number) { this.corpses.forEach(corpse => corpse.update(dt)); }

    find(enemy: Enemy, range: number) {
        return this.corpses.filter(corpse => corpse.revivable && corpse.claimedBy === undefined &&
            Math.hypot(corpse.enemy.x - enemy.x, corpse.enemy.y - enemy.y) <= range && this.gameArea.collisions.canSee(enemy, corpse.enemy))
            .sort((a, b) => Math.abs(a.enemy.x - enemy.x) - Math.abs(b.enemy.x - enemy.x))[0];
    }

    releaseClaims(claimantId: number) { this.corpses.forEach(corpse => corpse.release(claimantId)); }

    reactivate(corpse: Corpse, claimantId: number) {
        if (!this.corpses.includes(corpse) || !corpse.canReactivate(claimantId)) return false;
        const enemy = corpse.enemy;
        enemy.reactivate();
        this.corpses = this.corpses.filter(entry => entry !== corpse);
        this.gameArea.enemies = this.gameArea.enemies.filter(entry => entry.id !== enemy.id);
        this.gameArea.enemies.push(enemy);
        this.gameArea.events.push('revive');
        this.gameArea.effects.burst(enemy.x + enemy.width / 2, enemy.y + 20, '#82e6e3', 16);
        return true;
    }
}
