import { GameElement } from './GameElement';
import type { ProjectileContext } from '../interfaces/Simulation';
import type { CollisionTarget, ProjectileProps, Impact } from '../interfaces/Projectile';

export abstract class Projectile extends GameElement {
    vx: number;
    vy: number;
    life: number;
    age = 0;
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

    update(world: ProjectileContext, dt: number) {
        const travel = Math.min(dt, this.life);
        if (travel <= 0) return false;
        this.age += travel; this.life -= travel;
        if (!this.advance(world, this.vx * travel, this.vy * travel)) return false;
        return this.life > 1e-9 && this.x > -this.width && this.x < world.level.width && this.y > -this.height && this.y < world.level.height;
    }

    protected advance(world: ProjectileContext, dx: number, dy: number) {
        const impact = world.collisions.firstImpact(this, dx, dy, this.targets(world));
        if (impact) {
            this.x += dx * impact.time; this.y += dy * impact.time;
            this.onImpact(world, impact);
            return false;
        }
        this.x += dx; this.y += dy; return true;
    }

    protected onImpact(world: ProjectileContext, impact: Impact) {
        world.effects.burst(this.x + this.width / 2, this.y + this.height / 2, this.impactColor, 5);
        impact.target?.hit();
    }

    protected abstract targets(world: ProjectileContext): CollisionTarget[];
}
