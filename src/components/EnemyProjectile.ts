import { Projectile } from './Projectile';
import type { World } from '../game/World';
import type { ProjectileProps } from '../interfaces/Projectile';
import { tuning as T } from '../game/config';

export class EnemyProjectile extends Projectile {
    readonly owner = 'enemy';
    readonly color = '#72e1ed';
    readonly glowColor = '#44c9ef';
    readonly coreColor = '#e2ffff';
    protected readonly impactColor = '#82dfe5';

    constructor(props: ProjectileProps) {
        super({width: 12, height: 8, vy: 0, life: T.enemyProjectileLifetime, ...props});
    }

    protected targets(world: World) {
        return [{bounds: world.player, hit: () => world.combat.hurtPlayer()}];
    }
}
