export class FixedClock {
    private accumulated = 0;
    reset() { this.accumulated = 0; }
    advance(elapsed: number, update: (dt: number) => void, step = 1 / 120, maxSteps = 8) {
        this.accumulated = Math.min(this.accumulated + Math.max(0, elapsed), step * maxSteps);
        let count = 0;
        while (this.accumulated + 1e-10 >= step && count < maxSteps) {
            update(step); this.accumulated -= step; count++;
        }
        return count;
    }
}
