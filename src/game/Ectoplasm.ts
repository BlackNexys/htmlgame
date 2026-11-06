/** Shared ammunition; defeat rewards are awarded by Combat, never projectiles. */
export class Ectoplasm {
    readonly capacity = 12;
    private reserve = 6;
    get amount() { return this.reserve; }
    spend(cost: number) {
        if (!Number.isFinite(cost) || cost < 0 || cost > this.reserve) return false;
        this.reserve -= cost; return true;
    }
    recover(amount: number) {
        if (!Number.isFinite(amount) || amount <= 0) return 0;
        const previous = this.reserve;
        this.reserve = Math.min(this.capacity, this.reserve + amount);
        return this.reserve - previous;
    }
}
