import type { Map } from '../components/Map';
import type { Camera } from '../components/Camera';
import {SurfaceRenderer} from '../world/surfaces/SurfaceRenderer';
import type {EnvironmentImages} from '../interfaces/Environment';
import { SignRenderer } from './SignRenderer';
import { ExitRenderer } from './ExitRenderer';
import type { ConfluenceTerrainRenderer } from '../environment/ConfluenceTerrainRenderer';
import type { ConfluenceExitRenderer } from '../environment/ConfluenceExitRenderer';

export class MapRenderer {
    private readonly surfaces:SurfaceRenderer;
    private readonly signs: SignRenderer;
    private readonly exit: ExitRenderer|ConfluenceExitRenderer;
    constructor(ctx: CanvasRenderingContext2D, wallImage: HTMLImageElement,terrain?:ConfluenceTerrainRenderer,exit?:ConfluenceExitRenderer,environment?:EnvironmentImages) {
        this.surfaces=new SurfaceRenderer(ctx,wallImage,terrain,environment);
        this.signs = new SignRenderer(ctx);
        this.exit = exit??new ExitRenderer(ctx);
    }
    draw(map: Map, camera: Camera) {
        for(const layer of ['rear','terrain'] as const)for(const surface of map.surfaces){if(surface.layer===layer&&camera.canSee(surface,24))this.surfaces.draw(surface,map,camera);}
        map.signs.forEach(sign => this.signs.draw(sign));
        this.exit.draw(map.exit);
    }
    drawForeground(map:Map,camera:Camera){for(const surface of map.surfaces)if(surface.layer==='foreground'&&camera.canSee(surface,24))this.surfaces.draw(surface,map,camera);}
}
