import type { Map } from '../components/Map';
import type { Camera } from '../components/Camera';
import { WallRenderer } from './WallRenderer';
import { SignRenderer } from './SignRenderer';
import { ExitRenderer } from './ExitRenderer';
import type { ConfluenceTerrainRenderer } from '../environment/ConfluenceTerrainRenderer';
import type { ConfluenceExitRenderer } from '../environment/ConfluenceExitRenderer';

export class MapRenderer {
    private readonly walls: WallRenderer|ConfluenceTerrainRenderer;
    private readonly signs: SignRenderer;
    private readonly exit: ExitRenderer|ConfluenceExitRenderer;
    constructor(ctx: CanvasRenderingContext2D, wallImage: HTMLImageElement,terrain?:ConfluenceTerrainRenderer,exit?:ConfluenceExitRenderer) {
        this.walls = terrain??new WallRenderer(ctx, wallImage);
        this.signs = new SignRenderer(ctx);
        this.exit = exit??new ExitRenderer(ctx);
    }
    draw(map: Map, camera: Camera) {
        for (const decoration of map.decorations) {
            if (!camera.canSee(decoration,0)) continue;
            this.walls.decoration(decoration);
        }
        for (const wall of map.solids) {
            if (!camera.canSee(wall,0)) continue;
            this.walls.draw(wall, map);
        }
        map.signs.forEach(sign => this.signs.draw(sign));
        this.exit.draw(map.exit);
    }
}
