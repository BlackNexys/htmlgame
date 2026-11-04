import { Enemy } from './Enemy';
import { enemyTuning } from './config';

export function enemyFrame(enemy: Enemy, elapsed: number): {row: number; column: number} {
    if (enemy.state === 'windup') {
        const progress = 1 - Math.max(0, enemy.timer) / enemyTuning[enemy.kind].windup;
        return {row: 2, column: progress < .55 ? 0 : 1};
    }
    if (enemy.state === 'attack') return {row: 2, column: 2};
    if (enemy.state === 'recover') return {row: 2, column: 3};
    return {row: Math.abs(enemy.vx) > 1 || enemy.state === 'phase' ? 1 : 0,
        column: Math.floor(elapsed * (Math.abs(enemy.vx) > 1 ? 8 : 6) + enemy.id) % 4};
}

export const enemyNames = {zombie: 'Zombie', skeleton: 'Skeleton', ghoul: 'Ghoul', ghost: 'Ghost', wight: 'Wight', necromancer: 'Necromancer'};
export const enemyHints = {
    zombie: 'Spine lights warn of a lunge. Bait it, then attack during recovery.',
    skeleton: 'The emitter locks a firing lane. Jump the cyan bolt.',
    ghoul: 'The crouch warns of a leap. It cannot turn once launched.',
    ghost: 'Shots pass through a phased ghost. Attack when it becomes solid.',
    wight: 'The raised shield blocks front shots. Attack from behind or while it opens to bash.',
    necromancer: 'Follow the cyan link. Hit the technician to interrupt reactivation.',
};
