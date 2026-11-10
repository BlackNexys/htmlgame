import type {Map} from '../../components/Map';
import type {SurfaceDefinition} from './SurfaceDefinition';
import {WallRenderer} from '../../renderers/WallRenderer';
import type {ConfluenceTerrainRenderer} from '../../environment/ConfluenceTerrainRenderer';
import type {EnvironmentImages} from '../../interfaces/Environment';
import {ConfluenceSprites} from '../../environment/ConfluenceSprites';
import {RailingRenderer} from './RailingRenderer';

/** Paints visual parts. Collision shapes and their registration never drive drawing. */
export class SurfaceRenderer {
    private readonly walls:WallRenderer|ConfluenceTerrainRenderer;
    private readonly drainage?:ConfluenceSprites;
    private readonly railing:RailingRenderer;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement,terrain?:ConfluenceTerrainRenderer,environment?:EnvironmentImages){
        this.walls=terrain??new WallRenderer(ctx,image);
        this.railing=new RailingRenderer(ctx,environment);
        if(environment?.drainage&&environment.drainageFrames)this.drainage=new ConfluenceSprites(ctx,environment.drainage,environment.drainageFrames);
    }
    draw(surface:SurfaceDefinition,map:Map,view?:import('../../interfaces/Geometry').Rect){
        if(surface.appearance==='railing')this.railing.draw(surface);
        else if(surface.appearance==='outfall'){
            if(this.drainage)this.drainage.draw('sluice',surface.x+surface.width/2,surface.y+surface.height,surface.width,surface.height,true,.8);
            else {const c=this.ctx;c.save();c.fillStyle='#0a1720';c.fillRect(surface.x,surface.y,surface.width,surface.height);c.strokeStyle='#385866';c.strokeRect(surface.x+2,surface.y+2,surface.width-4,surface.height-4);c.restore();}
        }else if(surface.layer==='rear')this.walls.decoration(surface,map,view);else this.walls.draw(surface,map,view);
    }
}
