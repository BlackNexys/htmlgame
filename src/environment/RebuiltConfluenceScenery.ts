import type {Camera} from '../components/Camera';
import type {Map as GameMap} from '../components/Map';
import type {EnvironmentImages} from '../interfaces/Environment';
import {ConfluenceShadedAtlas} from './ConfluenceShadedAtlas';
import {ConfluenceSprites} from './ConfluenceSprites';
import {rebuiltAssemblies,type ConfluenceAssembly} from './RebuiltConfluenceAssemblies';
import {RebuiltSoulRiverRenderer} from './RebuiltSoulRiverRenderer';
import {ConfluenceDrainageRenderer} from './ConfluenceDrainageRenderer';
import {rebuiltWaterways,type RebuiltWaterways} from './RebuiltConfluenceWaterways';
import {buildingFamilies} from './ConfluenceBuildings';

/** Construction attached to exposed collision runs. No independent floating facade list. */
export class RebuiltConfluenceScenery {
    private readonly walls?:ConfluenceShadedAtlas;
    private readonly insets?:ConfluenceShadedAtlas;
    private readonly props?:ConfluenceSprites;
    private readonly canopy?:ConfluenceSprites;
    private readonly trims?:ConfluenceSprites;
    private readonly water=new WeakMap<GameMap,{renderer:RebuiltSoulRiverRenderer;layout:RebuiltWaterways}>();
    private readonly drainage:ConfluenceDrainageRenderer;
    private readonly cache=new WeakMap<GameMap,ConfluenceAssembly[]>();
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly images:EnvironmentImages){
        this.drainage=new ConfluenceDrainageRenderer(ctx,images);
        if(images.buildingWalls)this.walls=new ConfluenceShadedAtlas(ctx,images.buildingWalls);
        if(images.facades)this.insets=new ConfluenceShadedAtlas(ctx,images.facades);
        if(images.props&&images.frames)this.props=new ConfluenceSprites(ctx,images.props,images.frames);
        if(images.buildingTrims&&images.buildingFrames)this.trims=new ConfluenceSprites(ctx,images.buildingTrims,images.buildingFrames);
        if(images.canopy)this.canopy=new ConfluenceSprites(ctx,images.canopy,{canopy:{x:0,y:0,width:480,height:198}});
    }
    draw(camera:Camera,time:number,map:GameMap){
        let assemblies=this.cache.get(map);
        if(!assemblies){assemblies=rebuiltAssemblies(map.solids,map.height);this.cache.set(map,assemblies);}
        const c=this.ctx;c.save();
        for(const a of assemblies){
            if(a.x>camera.x+camera.width || a.x+a.width<camera.x)continue;
            if(!a.bridge && a.width>=432){
                const top=a.y-288,bottom=a.supportBottom;
                c.save();c.beginPath();c.rect(a.x,top,a.width,bottom-top);c.clip();
                for(let y=top;y<Math.min(bottom,camera.y+camera.height);y+=96)
                    for(let x=a.x;x<a.x+a.width;x+=96)
                        if(y+96>=camera.y)this.walls?.at(.42).draw(a.family*4+((x/48+y/48)&3),x,y,96,96);
                // Insets have no projecting balconies or competing floor silhouettes.
                for(let x=a.x+96;x+96<a.x+a.width;x+=192)this.insets?.at(.5).draw(a.family*4,x,a.y-224,96,144);
                for(let x=a.x;x<a.x+a.width;x+=96){
                    const width=Math.min(96,a.x+a.width-x);
                    this.trims?.draw(buildingFamilies[a.family]+'-roof',x+width/2,top+16,width,16,true,.55);
                    this.trims?.draw(buildingFamilies[a.family]+'-band',x+width/2,a.y+60,width,12,true,.45);
                }
                c.restore();
            }
            // The same construction rule supports bridges and narrow elevated landings.
            for(const {x,bottom} of a.supports){
                c.fillStyle='#0b1923';c.fillRect(x,a.y+48,24,bottom-a.y-48);
                for(let y=a.y+48;y<bottom;y+=48)this.walls?.at(.34).draw(a.family*4+3,x,y,24,Math.min(48,bottom-y));
                this.trims?.draw(buildingFamilies[a.family]+'-band',x+12,a.y+58,40,10,true,.5);
                this.trims?.draw(buildingFamilies[a.family]+'-band',x+12,bottom,32,10,true,.4);
            }
            if(a.width>=432){
                this.props?.draw('lamp',a.x+48,a.y,36,132);
                if(a.x===0){this.canopy?.draw('canopy',a.x+480,a.y,480,198);this.props?.draw('bench',a.x+400,a.y,112,60);}
            }
        }
        // Draw in front of deep foundations: otherwise the full-height wall shells hide the river.
        let water=this.water.get(map);
        if(!water){const layout=rebuiltWaterways(assemblies,map.width,map.height);water={layout,renderer:new RebuiltSoulRiverRenderer(c,this.images.water,layout)};this.water.set(map,water);}
        this.drainage.behind(camera,water.layout);
        water.renderer.draw(camera,time);
        this.drainage.inFront(camera,water.layout);
        water.renderer.drawOverflow(camera,time);
        c.restore();
    }
}
