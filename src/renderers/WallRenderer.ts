import type { Wall } from '../components/Wall';
import type { Map } from '../components/Map';
import { tuning } from '../game/config';

export class WallRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly image: HTMLImageElement) {}
    draw(wall: Wall, map: Map) {
        const c = this.ctx;
        c.drawImage(this.image, wall.x, wall.y, wall.width, wall.height);
        c.fillStyle = 'rgba(4,16,22,.45)'; c.fillRect(wall.x, wall.y, wall.width, wall.height);
        if (!map.solids.some(other => other.x === wall.x && other.y === wall.y - tuning.tile)) {
            c.fillStyle = '#718779'; c.fillRect(wall.x, wall.y, wall.width, 3);
            c.fillStyle = '#314f4c'; c.fillRect(wall.x, wall.y + 3, wall.width, 4);
        }
    }
}
