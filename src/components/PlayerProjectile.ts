import { Projectile } from './Projectile';
import type { World } from '../game/World';
import type { ProjectileProps } from '../interfaces/Projectile';
import { tuning as T } from '../game/config';

export class PlayerProjectile extends Projectile {
    readonly owner = 'player';
    readonly color = '#ff5eae';
    readonly glowColor = '#ff328e';
    readonly coreColor = '#ffd7ed';
    protected readonly impactColor = '#f4bf80';

    constructor(props: ProjectileProps) {
        super({width: 16, height: 9, vy: 0, life: T.projectileLifetime, ...props});
    }

    protected targets(world: World) {
        return world.enemies.filter(enemy => enemy.health > 0 && enemy.vulnerable)
            .map(enemy => ({bounds: enemy, hit: () => world.combat.hitEnemy(enemy, this.vx)}));
    }
}
