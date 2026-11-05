import type { Map } from '../components/Map';
import type { Camera } from '../components/Camera';
import { WallRenderer } from './WallRenderer';
import { SignRenderer } from './SignRenderer';
import { ExitRenderer } from './ExitRenderer';

export class MapRenderer {
    private readonly walls: WallRenderer;
    private readonly signs: SignRenderer;
    private readonly exit: ExitRenderer;
    constructor(ctx: CanvasRenderingContext2D, wallImage: HTMLImageElement) {
        this.walls = new WallRenderer(ctx, wallImage);
        this.signs = new SignRenderer(ctx);
        this.exit = new ExitRenderer(ctx);
    }
    draw(map: Map, camera: Camera) {
        for (const decoration of map.decorations) {
            if (decoration.x2 < camera.x || decoration.x > camera.x2) continue;
            this.walls.decoration(decoration);
        }
        for (const wall of map.solids) {
            if (wall.x2 < camera.x || wall.x > camera.x2) continue;
            this.walls.draw(wall, map);
        }
        map.signs.forEach(sign => this.signs.draw(sign));
        this.exit.draw(map.exit);
    }
}
