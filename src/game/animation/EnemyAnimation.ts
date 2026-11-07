import type { Enemy } from '../../components/Enemy';

export class EnemyAnimation {
    static frame(enemy: Enemy, elapsed: number): {row: number; column: number} {
        if (enemy.state === 'windup') {
            const progress = 1 - Math.max(0, enemy.timer) / enemy.stats.windup;
            return {row: 2, column: progress < .55 ? 0 : 1};
        }
        if (enemy.state === 'attack') return {row: 2, column: 2};
        if (enemy.state === 'recover') return {row: 2, column: 3};
        return {row: Math.abs(enemy.vx) > 1 || enemy.state === 'phase' ? 1 : 0,
            column: Math.floor(elapsed * (Math.abs(enemy.vx) > 1 ? 8 : 6) + enemy.id) % 4};
    }
}
