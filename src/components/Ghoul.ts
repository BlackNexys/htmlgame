import { GroundEnemy } from './GroundEnemy';
import { EnemyProps } from './Enemy';

export class Ghoul extends GroundEnemy {
    readonly displayName = 'Ghoul';
    readonly windupLabel = 'LEAP';
    readonly hint = 'The crouch warns of a leap. It cannot turn once launched.';

    constructor(props: EnemyProps) { super(props, 'ghoul'); }

    get spriteAnchorY() { return .87; }
    protected canBeginAttack() { return this.grounded; }
    protected beginAttack() { this.vy = -350; this.grounded = false; }
    protected updateAttack() { this.rush(); }
}
