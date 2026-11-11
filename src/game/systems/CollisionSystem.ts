import type { Map } from '../../components/Map';
import type { Rect } from '../../interfaces/Geometry';
import type { CollisionTarget, Impact } from '../../interfaces/Projectile';
import { impactTime } from '../movement/physics';

export class CollisionSystem {
    constructor(private readonly level: Map) {}

    canSee(a: Rect, b: Rect, ignore?:Rect) {
        const origin = {x: a.x + a.width / 2, y: a.y + a.height / 2, width: .1, height: .1};
        return this.level.collision.cast(origin,b.x+b.width/2-origin.x,b.y+b.height/2-origin.y,ignore)===undefined;
    }

    firstImpact(moving: Rect, dx: number, dy: number, targets: CollisionTarget[]): Impact | undefined {
        const terrain=this.level.collision.cast(moving,dx,dy);
        let closest:Impact|undefined=terrain===undefined?undefined:{time:terrain};
        // Solids win equal-time impacts, preserving wall occlusion.
        for (const target of targets) {
            const time = impactTime(moving, dx, dy, target.bounds);
            if (time !== undefined && (!closest || time < closest.time)) closest = {time, target};
        }
        return closest;
    }
}
