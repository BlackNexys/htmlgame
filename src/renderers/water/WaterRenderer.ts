import type {Camera} from '../../components/Camera';
import type {EnvironmentImages} from '../../interfaces/Environment';
import type {WaterNetwork} from '../../world/water/WaterNetwork';
import {CatchBasin} from '../../world/water/CatchBasin';
import {Canal} from '../../world/water/Canal';
import {ConfluenceSprites} from '../../environment/ConfluenceSprites';
import {WaterSurfaceRenderer} from './WaterSurfaceRenderer';
import {WaterfallRenderer} from './WaterfallRenderer';
import {WaterImpactRenderer} from './WaterImpactRenderer';
import {DrainRenderer} from './DrainRenderer';

/** Compose dry sources, surfaces, impacts and rim overflows from any level's authored network. */
export class WaterRenderer {
    private readonly surfaces:WaterSurfaceRenderer;
    private readonly falls:WaterfallRenderer;
    private readonly impacts:WaterImpactRenderer;
    private readonly drains:DrainRenderer;
    private readonly sprites?:ConfluenceSprites;
    constructor(private readonly ctx:CanvasRenderingContext2D,images?:EnvironmentImages){
        this.surfaces=new WaterSurfaceRenderer(ctx,images?.water);this.falls=new WaterfallRenderer(ctx,images?.water);
        this.impacts=new WaterImpactRenderer(ctx);this.drains=new DrainRenderer(ctx,images);
        if(images?.drainage&&images.drainageFrames)this.sprites=new ConfluenceSprites(ctx,images.drainage,images.drainageFrames);
    }
    draw(network:WaterNetwork,camera:Camera,time:number){
        for(const drain of network.drains)this.drains.draw(drain,camera);
        for(const body of network.bodies)this.surfaces.draw(body,camera,time);
        const drawFall=(overRim:boolean)=>{
            for(const fall of network.falls)if(fall.overRim===overRim){
                this.falls.draw(fall,camera,time);this.impacts.draw(fall.impact.x,fall.impact.y,fall.width,camera,time);
            }
        };
        drawFall(false);
        for(const body of network.bodies){
            if(!camera.canSee(body,80))continue;
            if(body instanceof CatchBasin)this.sprites?.draw('basin',body.x+body.width/2,body.y2,body.width,body.height*166/112,true,.75);
            if(body instanceof Canal){
                const c=this.ctx;c.save();c.fillStyle='#132632';c.fillRect(body.x,body.y2-10,body.width,10);
                for(let x=body.x;x<body.x2;x+=48){c.fillStyle='#294352';c.fillRect(x,body.y2-10,Math.min(46,body.x2-x),2);}c.restore();
            }
        }
        drawFall(true);
    }
}
