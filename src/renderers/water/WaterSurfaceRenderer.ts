import type {Camera} from '../../components/Camera';
import {ConfluenceAtlas} from '../../environment/ConfluenceAtlas';
import type {WaterBody} from '../../world/water/WaterBody';

/** Native texture detail and slow currents on a level-owned receiving water surface. */
export class WaterSurfaceRenderer {
    private readonly atlas?:ConfluenceAtlas;
    constructor(private readonly ctx:CanvasRenderingContext2D,image?:HTMLImageElement){if(image)this.atlas=new ConfluenceAtlas(ctx,image,2,1);}
    draw(body:WaterBody,camera:Camera,time:number){
        const r=body.surfaceBounds,quiet=body.kind!=='river';
        if(!camera.canSee(r,0))return;
        const c=this.ctx,left=Math.max(r.x,camera.x),right=Math.min(r.x+r.width,camera.x+camera.width);
        c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
        const gradient=c.createLinearGradient(0,r.y,0,r.y+r.height);gradient.addColorStop(0,'#0b3039e8');gradient.addColorStop(.2,'#08232ff5');gradient.addColorStop(1,'#04131e');
        c.fillStyle=gradient;c.fillRect(left,r.y,right-left,r.height);
        // Submerged texture stays quiet; long ribbons carry the visible horizontal movement.
        c.globalAlpha=quiet?.09:.13;
        const phase=Math.floor(time*body.current*.75)%512;
        for(let x=Math.floor((left-phase)/512)*512+phase;x<right;x+=512)this.atlas?.draw(1,x,r.y,512,r.height);
        c.globalAlpha=1;
        // Broken, subdued reflections sit beneath the currents rather than lighting the whole river.
        for(let x=Math.floor(left/576)*576+48;x<right;x+=576)for(let row=0;row<12;row++){
            const jitter=Math.round(Math.sin(time*.8+row*1.7+x)*4);
            c.globalAlpha=.16*(1-row/12);c.fillStyle=Math.floor(x/576)%3===0?'#be4388':'#e3ac65';
            c.fillRect(x+jitter-row/2,r.y+5+row*6,4+row,2);
        }
        c.globalAlpha=1;
        for(let row=0;row<7;row++){
            const y=r.y+8+row*row*(quiet?2:6),speed=body.current*(quiet?1:1+row/6);
            if(y>=r.y+r.height)continue;
            const spacing=224+row*31,shift=time*speed%spacing;
            for(let x=Math.floor((left-shift)/spacing)*spacing+shift;x<right;x+=spacing){
                c.strokeStyle=row%3===0?'#327d89':'#195663';c.lineWidth=row===0?2:1;c.beginPath();
                c.moveTo(Math.round(x),y);c.bezierCurveTo(x+24,y-3,x+64,y+4,x+104+row*9,y);c.stroke();
            }
        }
        c.globalAlpha=.35;c.fillStyle='#6cbdc1';c.fillRect(left,r.y,Math.max(0,right-left),1);
        c.restore();
    }
}
