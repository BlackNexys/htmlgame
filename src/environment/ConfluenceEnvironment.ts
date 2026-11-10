import type {EnvironmentImages} from '../interfaces/Environment';
import type {Camera} from '../components/Camera';
import type {Map as GameMap} from '../components/Map';
import {ConfluenceBackgroundRenderer} from './ConfluenceBackgroundRenderer';
import {ConfluenceTerrainRenderer} from './ConfluenceTerrainRenderer';
import {ConfluenceExitRenderer} from './ConfluenceExitRenderer';
import {ConfluenceSprites} from './ConfluenceSprites';
import {RebuiltConfluenceScenery} from './RebuiltConfluenceScenery';

/** Shared environment composition. Individual placements belong to the level document. */
export class ConfluenceEnvironment {
    readonly terrain?:ConfluenceTerrainRenderer;
    readonly exit?:ConfluenceExitRenderer;
    private readonly background?:ConfluenceBackgroundRenderer;
    private readonly assemblies?:RebuiltConfluenceScenery;
    constructor(ctx:CanvasRenderingContext2D,images:EnvironmentImages){
        if(images.terrain)this.terrain=new ConfluenceTerrainRenderer(ctx,images.terrain,images.terrainBaselines);
        if(images.city)this.background=new ConfluenceBackgroundRenderer(ctx,images.city);
        if(images.props&&images.frames)this.exit=new ConfluenceExitRenderer(ctx,new ConfluenceSprites(ctx,images.props,images.frames));
        if(images.layout==='rebuild')this.assemblies=new RebuiltConfluenceScenery(ctx,images);
    }
    drawBackground(camera:Camera){if(!this.background)return false;this.background.draw(camera);return true;}
    drawScenery(camera:Camera,time:number,map:GameMap){this.assemblies?.draw(camera,time,map);}
}
