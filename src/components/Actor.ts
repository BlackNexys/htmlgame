import { GameElement } from './GameElement';
import type { Body } from '../interfaces/Geometry';
import { tuning } from '../game/config';
import type {CollisionQueries} from '../world/collision/CollisionQueries';

export class Actor extends GameElement implements Body {
    vx = 0;
    vy = 0;
    grounded = false;

    protected applyGravity(dt: number) {
        this.vy = Math.min(tuning.maxFall, this.vy + tuning.gravity * dt);
    }

    protected move(dt: number, collision:CollisionQueries) {
        collision.move(this,dt);
    }
}
