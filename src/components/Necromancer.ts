import { GroundEnemy } from './GroundEnemy';
import { EnemyProps } from './Enemy';
import { tuning as T } from '../game/config';

export class Necromancer extends GroundEnemy {
    readonly displayName = 'Necromancer';
    readonly windupLabel = 'REACTIVATING';
    readonly hint = 'Follow the cyan link. Hit the technician to interrupt reactivation.';
    reviveBudget = T.reviveBudget;
    targetId?: number;

    constructor(props: EnemyProps) { super(props, 'necromancer'); }

    get revivable() { return false; }
    get channelTargetId() { return this.state === 'windup' ? this.targetId : undefined; }

    protected updateIdle() {
        this.facePlayer();
        const corpse = this.reviveBudget > 0 && this.seesPlayer && this.cooldown <= 0
            ? this.gameArea.graveyard.find(this, T.reviveRange) : undefined;
        if (corpse) {
            corpse.claimedBy = this.id;
            this.targetId = corpse.enemy.id;
            this.changeState('windup', this.stats.windup);
        } else if (Math.abs(this.playerDeltaX) < 190 && this.seesPlayer) this.vx = -this.facing * this.stats.walk;
    }

    protected updateWindup() {
        const corpse = this.gameArea.corpses.find(c => c.enemy.id === this.targetId && c.revivable && c.claimedBy === this.id);
        if (!corpse || !this.gameArea.collisions.canSee(this, corpse.enemy)) this.interruptChannel();
        else if (this.timer <= 0) {
            if (this.reviveBudget > 0 && this.gameArea.graveyard.reactivate(corpse, this.id)) this.reviveBudget--;
            this.targetId = undefined;
            this.changeState('attack', this.stats.attack);
        }
    }

    private interruptChannel() {
        this.gameArea.graveyard.releaseClaims(this.id);
        this.targetId = undefined;
        this.changeState('recover', .8);
        this.cooldown = this.stats.cooldown;
    }

    protected onDamaged() { if (this.state === 'windup') this.interruptChannel(); }
    protected onDefeated() { this.interruptChannel(); }
}
