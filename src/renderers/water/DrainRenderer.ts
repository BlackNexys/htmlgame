import type {Camera} from '../../components/Camera';
import type {EnvironmentImages} from '../../interfaces/Environment';
import type {Drain} from '../../world/water/Drain';
import {ConfluenceSprites} from '../../environment/ConfluenceSprites';
import {outletArtwork} from '../../world/water/WaterHardwareGeometry';

/** Drainage hardware reads placed Drain instances; it contains no level-specific coordinates. */
export class DrainRenderer {
    private readonly sprites?:ConfluenceSprites;
    constructor(private readonly ctx:CanvasRenderingContext2D,images?:EnvironmentImages){
        if(images?.drainage&&images.drainageFrames)this.sprites=new ConfluenceSprites(ctx,images.drainage,images.drainageFrames);
    }
    draw(drain:Drain,camera:Camera){
        if(!camera.canSee(drain,24))return;
        const c=this.ctx,mouth=drain.socket('mouth');c.save();
        if(drain.profile==='collector'){
            this.sprites?.draw('pipeShaft',drain.x+8,mouth.y,24,drain.height,true,.7);
            c.save();c.translate(drain.x,mouth.y);c.rotate(-Math.PI/2);
            this.sprites?.draw('pipeShaft',0,drain.width,24,drain.width,true,.7);c.restore();
            c.fillStyle='#253c48';c.fillRect(drain.x-16,drain.y-3,48,8);
            for(let x=drain.x-12;x<drain.x+28;x+=6){c.fillStyle='#050d13';c.fillRect(x,drain.y-3,3,6);}
        }else{
            c.fillStyle='#09141e';c.fillRect(drain.x,drain.y+6,drain.width,10);
            c.fillStyle='#355363';c.fillRect(drain.x,drain.y+6,drain.width,2);
            for(let x=drain.x+12;x<drain.x2;x+=48){c.fillStyle='#142735';c.fillRect(x,drain.y+8,4,8);}
            const end=mouth.y-42;
            for(let y=drain.y+8;y<end;y+=160){const h=Math.min(168,end-y+8);this.sprites?.draw('pipeShaft',mouth.x-18,y+h,24,h,true,.7);}
            const r=outletArtwork(mouth);
            this.sprites?.draw('outlet',r.x+r.width/2,r.y+r.height,r.width,r.height,true,.8);
        }
        c.restore();
    }
}
