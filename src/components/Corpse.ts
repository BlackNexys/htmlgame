import type { Enemy } from './Enemy';

export class Corpse {
    age = 0;
    readonly revivable: boolean;
    claimedBy?: number;

    constructor(public readonly enemy: Enemy, levelHeight: number) {
        this.revivable = enemy.revivable && enemy.y < levelHeight;
    }

    update(dt: number) { this.age += dt; }
    release(claimantId: number) { if (this.claimedBy === claimantId) this.claimedBy = undefined; }
    canReactivate(claimantId: number) {
        return this.revivable && this.enemy.revives < 1 && this.claimedBy === claimantId;
    }
}
