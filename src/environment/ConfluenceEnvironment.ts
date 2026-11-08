import type { EnvironmentImages } from '../interfaces/Environment';
import type { Camera } from '../components/Camera';
import { ConfluenceBackgroundRenderer } from './ConfluenceBackgroundRenderer';
import { ConfluenceTerrainRenderer } from './ConfluenceTerrainRenderer';
import { ConfluenceSceneryRenderer } from './ConfluenceSceneryRenderer';
import { ConfluenceObjectsRenderer } from './ConfluenceObjectsRenderer';
import { ConfluenceExitRenderer } from './ConfluenceExitRenderer';
import { ConfluenceSprites } from './ConfluenceSprites';
import { ConfluenceArchitectureRenderer } from './ConfluenceArchitectureRenderer';

/** Composes this world's art passes. Physics and story systems never import it. */
export class ConfluenceEnvironment {
    readonly terrain?:ConfluenceTerrainRenderer;
    readonly objects?:ConfluenceObjectsRenderer;
    readonly exit?:ConfluenceExitRenderer;
    private readonly background?:ConfluenceBackgroundRenderer;
    private readonly scenery:ConfluenceSceneryRenderer;
    constructor(ctx:CanvasRenderingContext2D,images:EnvironmentImages){
        const sprites=images.props && images.frames?new ConfluenceSprites(ctx,images.props,images.frames):undefined;
        if(images.terrain)this.terrain=new ConfluenceTerrainRenderer(ctx,images.terrain);
        if(images.city)this.background=new ConfluenceBackgroundRenderer(ctx,images.city);
        if(sprites){this.objects=new ConfluenceObjectsRenderer(ctx,sprites);this.exit=new ConfluenceExitRenderer(ctx,sprites);}
        const architecture=images.architecture && images.architectureFrames?new ConfluenceArchitectureRenderer(ctx,new ConfluenceSprites(ctx,images.architecture,images.architectureFrames)):undefined;
        this.scenery=new ConfluenceSceneryRenderer(ctx,images.facades,sprites,images.landmarks,architecture);
    }
    drawBackground(camera:Camera){if(!this.background)return false;this.background.draw(camera);return true;}
    drawScenery(camera:Camera){this.scenery.draw(camera);}
}
