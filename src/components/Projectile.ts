import { GameElement } from './GameElement';
import type { World } from '../game/World';
import type { CollisionTarget, ProjectileProps } from '../interfaces/Projectile';

export abstract class Projectile extends GameElement {
    vx: number;
    vy: number;
    life: number;
    abstract readonly owner: 'player' | 'enemy';
    abstract readonly color: string;
    abstract readonly glowColor: string;
    abstract readonly coreColor: string;
    protected abstract readonly impactColor: string;

    protected constructor(props: Required<ProjectileProps>) {
        super(props);
        this.spawn(props);
        this.vx = props.vx; this.vy = props.vy; this.life = props.life;
    }

    update(world: World, dt: number) {
        const dx = this.vx * dt, dy = this.vy * dt;
        const impact = world.collisions.firstImpact(this, dx, dy, this.targets(world));
        if (impact) {
            world.effects.burst(this.x + dx * impact.time, this.y + dy * impact.time, this.impactColor, 5);
            impact.target?.hit();
            return false;
        }
        this.x += dx; this.y += dy; this.life -= dt;
        return this.life > 0 && this.x > -this.width && this.x < world.level.width && this.y > -this.height && this.y < world.level.height;
    }

    protected abstract targets(world: World): CollisionTarget[];
}
