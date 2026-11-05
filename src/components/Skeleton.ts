import { GroundEnemy } from './GroundEnemy';
import { EnemyProps } from './Enemy';

export class Skeleton extends GroundEnemy {
    readonly displayName = 'Skeleton';
    readonly windupLabel = 'CHARGING';
    readonly hint = 'The emitter locks a firing lane. Jump the cyan bolt.';

    constructor(props: EnemyProps) { super(props, 'skeleton'); }

    protected get tracksPlayer() { return false; }
    protected beginAttack() { this.fireDirection(this.facing, 0); }

    get aimLine() {
        if (this.state !== 'windup') return undefined;
        return {x: this.x + this.width / 2, y: this.y + 26,
            endX: this.x + this.width / 2 + this.facing * 230, endY: this.y + 26};
    }
}
