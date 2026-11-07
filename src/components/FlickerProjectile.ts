import { Projectile } from './Projectile';
import type { ProjectileContext } from '../interfaces/Simulation';
import type { ProjectileProps, Impact } from '../interfaces/Projectile';
import { flicker } from '../weapons/Flicker';

export class FlickerProjectile extends Projectile {
    readonly owner = 'player';
    readonly color = '#FF4EAE';
    readonly glowColor = '#B51B78';
    readonly coreColor = '#FFF0F8';
    protected readonly impactColor = '#FFABDC';

    constructor(props: ProjectileProps) {
        const p = flicker.projectile;
        super({width: p.width, height: p.height, vy: 0, life: p.lifetime, ...props});
    }
    manifest(world: ProjectileContext, reach: number) {
        const speed = Math.hypot(this.vx, this.vy);
        return this.advance(world, this.vx / speed * reach, this.vy / speed * reach);
    }
    protected targets(world: ProjectileContext) {
        return world.enemies.filter(enemy => enemy.health > 0 && enemy.vulnerable)
            .map(enemy => ({bounds: enemy, hit: () => world.combat.hitEnemy(enemy, this.vx, flicker.projectile.damage)}));
    }
    protected onImpact(world: ProjectileContext, impact: Impact) {
        const result = impact.target?.hit();
        const kind = !impact.target ? 'terrain' : result === 'blocked' ? 'blocked' : 'enemy';
        world.weaponEvents.push({kind, x: this.x + this.width / 2, y: this.y + this.height / 2, angle: Math.atan2(this.vy, this.vx)});
        if (!impact.target) world.events.push('terrainHit');
    }
}
