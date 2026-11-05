import { GroundEnemy } from './GroundEnemy';
import type { EnemyProps } from './Enemy';

export class Wight extends GroundEnemy {
    readonly displayName = 'Wight';
    readonly windupLabel = 'SHIELD OPEN';
    readonly hint = 'The raised shield blocks front shots. Attack from behind or while it opens to bash.';

    constructor(props: EnemyProps) { super(props, 'wight'); }

    get shieldRaised() { return this.state === 'idle' || this.state === 'attack'; }
    protected blocksShot(shotVX: number) { return this.shieldRaised && shotVX * this.facing < 0; }
    protected updateAttack() { this.rush(); }
}
