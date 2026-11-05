import { FixedClock } from './FixedClock';
import { tuning } from './config';
import type { AnimationScheduler } from '../interfaces/Loop';

const browserScheduler: AnimationScheduler = {
    request: callback => requestAnimationFrame(callback),
    cancel: id => cancelAnimationFrame(id),
    now: () => performance.now(),
};

export class GameLoop {
    private readonly clock = new FixedClock();
    private frameId?: number;
    private lastTime = 0;
    private active = false;
    private running = false;

    constructor(private readonly update: (dt: number) => void,
        private readonly draw: (elapsed: number, simulated: boolean) => void,
        private readonly scheduler: AnimationScheduler = browserScheduler) {}

    start() {
        if (this.running) return;
        this.running = true;
        this.frameId = this.scheduler.request(this.frame);
    }

    resume() {
        this.clock.reset();
        this.lastTime = this.scheduler.now();
        this.active = true;
    }

    pause() { this.active = false; this.clock.reset(); }

    stop() {
        this.pause();
        this.running = false;
        if (this.frameId !== undefined) this.scheduler.cancel(this.frameId);
        this.frameId = undefined;
    }

    private readonly frame = (time: number) => {
        if (!this.running) return;
        const elapsed = Math.max(0, (time - this.lastTime) / 1000);
        const simulated = this.active;
        if (simulated) this.clock.advance(elapsed, dt => { if (this.active) this.update(dt); }, tuning.step, tuning.maxCatchUp);
        this.lastTime = time;
        this.draw(elapsed, simulated);
        if (this.running) this.frameId = this.scheduler.request(this.frame);
    };
}
