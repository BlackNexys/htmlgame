import { GameElement } from './GameElement';
import { moveBody } from '../game/movement/physics';
import type { Body, Rect } from '../interfaces/Geometry';
import { tuning } from '../game/config';

export class Actor extends GameElement implements Body {
    vx = 0;
    vy = 0;
    grounded = false;

    protected applyGravity(dt: number) {
        this.vy = Math.min(tuning.maxFall, this.vy + tuning.gravity * dt);
    }

    protected move(dt: number, solids: Rect[]) {
        moveBody(this, solids, dt);
    }
}
