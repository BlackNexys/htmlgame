import { Enemy, type EnemyProps } from './Enemy';
import { tuning as T } from '../game/config';
import { clamp, overlaps } from '../game/movement/physics';

export class Ghost extends Enemy {
    readonly displayName = 'Ghost';
    readonly windupLabel = 'SOLID';
    readonly hint = 'Shots pass through a phased ghost. Attack when it becomes solid.';

    constructor(props: EnemyProps) {
        super(props, 'ghost');
        this.grounded = false;
        this.changeState('phase', T.ghostPhase);
    }

    get vulnerable() { return this.state !== 'phase'; }
    get revivable() { return false; }

    protected updateBehavior(dt: number) {
        if (this.state === 'phase') {
            if (!this.playerNear) { this.timer = T.ghostPhase; return; }
            const p = this.gameArea.player;
            const side = this.x >= p.x ? 1 : -1;
            const goalX = clamp(p.x + side * 160, this.left, this.right);
            const goalY = clamp(p.y - 14, 80, this.gameArea.level.height - 150);
            this.x += clamp(goalX - this.x, -this.stats.walk * dt, this.stats.walk * dt);
            this.y += clamp(goalY - this.y, -this.stats.walk * dt, this.stats.walk * dt);
            // A phased spirit may cross stone, but must become solid in free space.
            if (this.timer <= 0 && !this.gameArea.level.solids.some(wall => overlaps(this, wall)) && this.gameArea.collisions.canSee(this, p)) this.prepareAttack();
        } else if (this.timer <= 0) {
            if (this.state === 'windup') {
                this.fireAt(this.targetX, this.targetY);
                this.changeState('attack', this.stats.attack);
            } else if (this.state === 'attack') this.changeState('recover', this.stats.recovery);
            else this.changeState('phase', T.ghostPhase);
        }
    }
}
