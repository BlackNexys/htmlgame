import type {Camera} from '../components/Camera';
import type {EnvironmentImages} from '../interfaces/Environment';
import type {RebuiltWaterways} from './RebuiltConfluenceWaterways';
import {ConfluenceSprites} from './ConfluenceSprites';

/** Dry infrastructure, separate from animated water and gameplay collision. */
export class ConfluenceDrainageRenderer {
    private readonly sprites?:ConfluenceSprites;
    constructor(private readonly ctx:CanvasRenderingContext2D,images:EnvironmentImages){
        if(images.drainage&&images.drainageFrames)this.sprites=new ConfluenceSprites(ctx,images.drainage,images.drainageFrames);
    }
    behind(camera:Camera,w:RebuiltWaterways){
        const c=this.ctx;c.save();
        for(const d of w.drains){
            if(d.gutter.x>camera.x+camera.width||d.gutter.x+d.gutter.width<camera.x)continue;
            c.fillStyle='#09141e';c.fillRect(d.gutter.x,d.gutter.y+6,d.gutter.width,10);
            c.fillStyle='#355363';c.fillRect(d.gutter.x,d.gutter.y+6,d.gutter.width,2);
            for(let x=d.gutter.x+12;x<d.gutter.x+d.gutter.width;x+=48){c.fillStyle='#142735';c.fillRect(x,d.gutter.y+8,4,8);}
            // The elbow's inlet lies left of its downward-facing mouth.
            const pipeX=d.x-18,end=d.mouthY-42;
            for(let y=d.gutter.y+8;y<end;y+=160){
                const h=Math.min(168,end-y+8);this.sprites?.draw('pipeShaft',pipeX,y+h,24,h,true,.7);
            }
            this.sprites?.draw('outlet',d.x-8,d.mouthY,56,64,true,.8);
        }
        if(camera.canSee(w.sluice,100)){
            // A collector beneath the freight floor feeds the control gate.
            this.sprites?.draw('pipeShaft',w.sluice.x-232,w.sluice.y+64,24,112,true,.7);
            c.fillStyle='#253c48';c.fillRect(w.sluice.x-256,w.sluice.y-51,48,8);
            for(let x=w.sluice.x-252;x<w.sluice.x-212;x+=6){c.fillStyle='#050d13';c.fillRect(x,w.sluice.y-51,3,6);}
            c.save();c.translate(w.sluice.x-240,w.sluice.y+54);c.rotate(-Math.PI/2);
            this.sprites?.draw('pipeShaft',0,256,24,256,true,.7);c.restore();
            c.fillStyle='#030d14';c.fillRect(w.sluice.x+80,w.sluice.y+100,128,92);
            this.sprites?.draw('sluice',w.sluice.x+w.sluice.width/2,w.sluice.y+w.sluice.height,w.sluice.width,w.sluice.height,true,.8);
        }
        c.restore();
    }
    inFront(camera:Camera,w:RebuiltWaterways){
        if(camera.canSee(w.basin,100))this.sprites?.draw('basin',w.basin.x+w.basin.width/2,w.basin.y+w.basin.height,w.basin.width,166,true,.75);
        const c=this.ctx;c.save();
        if(camera.canSee(w.canal,0)){
            c.fillStyle='#132632';c.fillRect(w.canal.x,w.canal.y+w.canal.height-10,w.canal.width,10);
            for(let x=0;x<w.canal.width;x+=48){c.fillStyle='#294352';c.fillRect(x,w.canal.y+w.canal.height-10,46,2);}
            // The open end drains through a lip, not through the retaining wall.
            c.fillStyle='#10242e';c.fillRect(w.canal.width-52,w.canal.y-4,40,5);
            c.fillStyle='#527a83';c.fillRect(w.canal.width-52,w.canal.y-4,40,1);
        }
        c.restore();
    }
}
