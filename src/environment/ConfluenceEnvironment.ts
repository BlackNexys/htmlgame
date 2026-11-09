import {ConfluenceBuildingRenderer} from './ConfluenceBuildingRenderer';
import {ConfluenceLandmarksRenderer} from './ConfluenceLandmarksRenderer';
import type { EnvironmentImages } from '../interfaces/Environment';
import type { Camera } from '../components/Camera';
import { ConfluenceBackgroundRenderer } from './ConfluenceBackgroundRenderer';
import { ConfluenceTerrainRenderer } from './ConfluenceTerrainRenderer';
import { ConfluenceSceneryRenderer } from './ConfluenceSceneryRenderer';
import { ConfluenceObjectsRenderer } from './ConfluenceObjectsRenderer';
import { ConfluenceExitRenderer } from './ConfluenceExitRenderer';
import { ConfluenceSprites } from './ConfluenceSprites';
import { ConfluenceArchitectureRenderer } from './ConfluenceArchitectureRenderer';
import { ConfluenceWaterRenderer } from './ConfluenceWaterRenderer';
import { ConfluenceStructuresRenderer } from './ConfluenceStructuresRenderer';
import type { Map as GameMap } from '../components/Map';
import {RebuiltConfluenceScenery} from './RebuiltConfluenceScenery';

/** Composes this world's art passes. Physics and story systems never import it. */
export class ConfluenceEnvironment {
    readonly terrain?:ConfluenceTerrainRenderer;
    readonly objects?:ConfluenceObjectsRenderer;
    readonly exit?:ConfluenceExitRenderer;
    private readonly background?:ConfluenceBackgroundRenderer;
    private readonly scenery:ConfluenceSceneryRenderer;
    private readonly buildings?:ConfluenceBuildingRenderer;
    private readonly landmarks?:ConfluenceLandmarksRenderer;
    private readonly water:ConfluenceWaterRenderer;
    private readonly structures?:ConfluenceStructuresRenderer;
    private readonly rebuild?:RebuiltConfluenceScenery;
    constructor(ctx:CanvasRenderingContext2D,images:EnvironmentImages){
        if(images.layout==='rebuild')this.rebuild=new RebuiltConfluenceScenery(ctx,images);
        if(images.buildingWalls)this.buildings=new ConfluenceBuildingRenderer(ctx,images.buildingWalls,images.buildingTrims,images.buildingFrames);
        this.water=new ConfluenceWaterRenderer(ctx,images.water);
        const sprites=images.props && images.frames?new ConfluenceSprites(ctx,images.props,images.frames):undefined;
        if(images.terrain){this.terrain=new ConfluenceTerrainRenderer(ctx,images.terrain,images.terrainBaselines);this.structures=new ConfluenceStructuresRenderer(ctx,images.terrain);}
        if(images.city)this.background=new ConfluenceBackgroundRenderer(ctx,images.city);
        if(sprites){this.objects=new ConfluenceObjectsRenderer(ctx,sprites,!!this.rebuild);this.exit=new ConfluenceExitRenderer(ctx,sprites);}
        if(images.landmarks&&images.landmarkFrames)this.landmarks=new ConfluenceLandmarksRenderer(ctx,new ConfluenceSprites(ctx,images.landmarks,images.landmarkFrames));
        const canopy=images.canopy?new ConfluenceSprites(ctx,images.canopy,{stationCanopy:{x:0,y:0,width:images.canopy.naturalWidth,height:images.canopy.naturalHeight}}):undefined;
        const architecture=images.architecture && images.architectureFrames?new ConfluenceArchitectureRenderer(ctx,new ConfluenceSprites(ctx,images.architecture,images.architectureFrames),canopy):undefined;
        this.scenery=new ConfluenceSceneryRenderer(ctx,images.facades,sprites,architecture);
    }
    drawBackground(camera:Camera){if(!this.background)return false;this.background.draw(camera);return true;}
    drawScenery(camera:Camera,time:number,map:GameMap){
        if(this.rebuild){this.rebuild.draw(camera,time,map);return;}
        this.landmarks?.draw(camera,true);this.water.draw(camera,time);this.buildings?.draw(camera);this.structures?.draw(camera,map);this.scenery.draw(camera);this.landmarks?.draw(camera,false);
    }
}
