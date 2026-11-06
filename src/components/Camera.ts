import { GameElement } from './GameElement';
import type { Rect } from '../interfaces/Geometry';
import { clamp } from '../game/physics';
import { tuning as T } from '../game/config';

export class Camera extends GameElement {
    private lookAhead = 0;
    constructor() { super({width: T.viewportWidth, height: T.viewportHeight}); }

    follow(subject: Rect & {vx?: number}, level: {width: number; height: number}, dt?: number) {
        const maxX = Math.max(0, level.width - this.width), maxY = Math.max(0, level.height - this.height);
        if (dt === undefined) {
            this.lookAhead = 0;
            this.x = clamp(subject.x + subject.width / 2 - this.width / 2, 0, maxX);
            this.y = clamp(subject.y + subject.height / 2 - this.height * .6, 0, maxY);
            return;
        }
        const desiredLook = clamp((subject.vx || 0) * T.cameraLookAheadTime, -T.cameraMaxLookAhead, T.cameraMaxLookAhead);
        this.lookAhead += (desiredLook - this.lookAhead) * (1 - Math.exp(-T.cameraLookRate * dt));
        const targetX = clamp(subject.x + subject.width / 2 + this.lookAhead - this.width / 2, 0, maxX);
        const centerY = subject.y + subject.height / 2;
        let targetY = this.y;
        if (centerY < this.y + this.height * .35) targetY = centerY - this.height * .35;
        if (centerY > this.y + this.height * .65) targetY = centerY - this.height * .65;
        this.x = clamp(this.x + (targetX - this.x) * (1 - Math.exp(-T.cameraFollowRate * dt)), 0, maxX);
        this.y = clamp(this.y + (clamp(targetY, 0, maxY) - this.y) * (1 - Math.exp(-T.cameraVerticalRate * dt)), 0, maxY);
    }

    canSee(bounds: Rect, margin = 100) {
        return bounds.x + bounds.width >= this.x - margin && bounds.x <= this.x2 + margin &&
            bounds.y + bounds.height >= this.y - margin && bounds.y <= this.y2 + margin;
    }
}
