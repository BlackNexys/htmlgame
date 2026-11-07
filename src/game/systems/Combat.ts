import type { World } from '../World';
import type { Enemy } from '../../components/Enemy';
import { overlaps } from '../movement/physics';

export class Combat {
    defeated = 0;
    constructor(private readonly gameArea: World) {}

    hurtPlayer() {
        const player = this.gameArea.player;
        if (!player.takeHit()) return;
        this.gameArea.events.push('hurt');
        this.gameArea.effects.burst(player.x + 16, player.y + 25, '#ff7e88');
    }

    hitEnemy(enemy: Enemy, shotVX: number, damage = 1) {
        const result = enemy.receiveHit(shotVX, damage);
        if (result === 'ignored') return result;
        if (result === 'blocked') {
            this.gameArea.events.push('block');
            this.gameArea.effects.burst(enemy.x + enemy.width / 2 + enemy.facing * 18, enemy.y + 24, '#90e9ed', 5);
            return result;
        }
        this.gameArea.events.push('hit');
        if (enemy.health <= 0) this.defeatEnemy(enemy);
        return result;
    }

    defeatEnemy(enemy: Enemy) {
        if (!enemy.defeat()) return;
        if (!enemy.counted) {
            this.defeated++; enemy.counted = true;
            if (this.gameArea.ectoplasm.recover(1) > 0) this.gameArea.events.push('ectoplasm');
        }
        this.gameArea.events.push('defeat');
        this.gameArea.effects.burst(enemy.x + enemy.width / 2, enemy.y + 20, '#d7e1ce', 18);
        this.gameArea.graveyard.add(enemy);
    }

    checkContacts() {
        const player = this.gameArea.player;
        if (this.gameArea.enemies.some(enemy => enemy.grace <= 0 && enemy.vulnerable && overlaps(player, enemy))) this.hurtPlayer();
    }
}
