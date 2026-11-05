import { GameElement } from './GameElement';
import type { Rect } from '../interfaces/Geometry';
import { clamp } from '../game/physics';
import { tuning as T } from '../game/config';

export class Camera extends GameElement {
    constructor() { super({width: T.viewportWidth, height: T.viewportHeight}); }

    follow(subject: Rect, level: {width: number; height: number}) {
        this.x = clamp(subject.x + subject.width / 2 - this.width * .4, 0, Math.max(0, level.width - this.width));
        this.y = clamp(subject.y - this.height * .55, 0, Math.max(0, level.height - this.height));
    }

    canSee(bounds: Rect, margin = 100) {
        return bounds.x >= this.x - margin && bounds.x <= this.x2 + margin;
    }
}
