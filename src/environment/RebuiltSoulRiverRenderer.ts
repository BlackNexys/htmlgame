import type {Camera} from '../components/Camera';
import type {Rect} from '../interfaces/Geometry';
import {ConfluenceAtlas} from './ConfluenceAtlas';
import {ConfluenceWaterRenderer} from './ConfluenceWaterRenderer';
import type {RebuiltWaterways} from './RebuiltConfluenceWaterways';

/** Slow surface currents, local impact foam and downward falls use simulation time only. */
export class RebuiltSoulRiverRenderer {
    private readonly atlas?:ConfluenceAtlas;
    private readonly falls:ConfluenceWaterRenderer;
    private readonly overflow:ConfluenceWaterRenderer;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,private readonly w:RebuiltWaterways){
        if(image)this.atlas=new ConfluenceAtlas(ctx,image,2,1);
        const hiddenRiver={x:0,y:-1000,width:0,height:0};
        this.falls=new ConfluenceWaterRenderer(ctx,image,{waterfalls:w.waterfalls.slice(0,-1),river:hiddenRiver});
        this.overflow=new ConfluenceWaterRenderer(ctx,image,{waterfalls:w.waterfalls.slice(-1),river:hiddenRiver});
    }
    draw(camera:Camera,time:number){
        this.surface(this.w.river,camera,time,false);
        this.surface(this.w.canal,camera,time,true);
        this.surface({x:this.w.basin.x+32,y:this.w.basin.y,width:this.w.basin.width-64,height:80},camera,time,true);
        this.falls.draw(camera,time);
        for(const fall of this.w.waterfalls.slice(0,-1))this.impact(fall.x+fall.width/2,fall.y+fall.height-64,fall.width,camera,time);
    }
    drawOverflow(camera:Camera,time:number){
        this.overflow.draw(camera,time);
        const fall=this.w.waterfalls[this.w.waterfalls.length-1];
        this.impact(fall.x+fall.width/2,fall.y+fall.height-64,fall.width,camera,time);
    }
    private surface(r:Rect,camera:Camera,time:number,quiet:boolean){
        if(!camera.canSee(r,0))return;
        const c=this.ctx,left=Math.max(r.x,camera.x),right=Math.min(r.x+r.width,camera.x+camera.width);
        c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
        const gradient=c.createLinearGradient(0,r.y,0,r.y+r.height);gradient.addColorStop(0,'#0b3039e8');gradient.addColorStop(.2,'#08232ff5');gradient.addColorStop(1,'#04131e');
        c.fillStyle=gradient;c.fillRect(left,r.y,right-left,r.height);
        // Submerged texture stays quiet; long ribbons carry the visible horizontal movement.
        c.globalAlpha=quiet?.09:.13;
        const phase=Math.floor(time*9)%512;
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
            const y=r.y+8+row*row*(quiet?2:6),speed=quiet?8:12+row*2;
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
    private impact(x:number,y:number,width:number,camera:Camera,time:number){
        if(!camera.canSee({x:x-100,y:y-48,width:200,height:80},0))return;
        const c=this.ctx;c.save();
        for(let i=0;i<3;i++){
            const age=(time*.7+i/3)%1;c.globalAlpha=(1-age)*.5;c.strokeStyle='#93e8e5';c.lineWidth=1;
            c.beginPath();c.ellipse(x,y+3,width/2+age*52,3+age*9,0,0,Math.PI*2);c.stroke();
        }
        for(let i=0;i<12;i++){
            const t=(time*1.1+i*.137)%1,v=(i%2?1:-1)*(8+i*2);
            c.globalAlpha=(1-t)*.65;c.fillStyle=i%3?'#65c8d5':'#d2ffff';
            c.fillRect(Math.round(x+v*t),Math.round(y-4-48*t*(1-t)),2,3);
        }
        c.restore();
    }
}
