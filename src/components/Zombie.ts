import { GroundEnemy } from './GroundEnemy';
import type { EnemyProps } from './Enemy';

export class Zombie extends GroundEnemy {
    readonly displayName = 'Zombie';
    readonly windupLabel = 'LUNGE';
    readonly hint = 'Spine lights warn of a lunge. Bait it, then attack during recovery.';

    constructor(props: EnemyProps) { super(props, 'zombie'); }

    protected updateAttack() { this.rush(); }
}
