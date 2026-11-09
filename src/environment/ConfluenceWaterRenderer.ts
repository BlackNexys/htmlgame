import type { Camera } from '../components/Camera';
import type { Rect } from '../interfaces/Geometry';
import { ConfluenceAtlas } from './ConfluenceAtlas';
import { waterfalls,river } from './ConfluenceWaterways';

/** Scrolling water materials only; no collision, damage or resource behavior. */
export class ConfluenceWaterRenderer {
    private readonly atlas?:ConfluenceAtlas;
    constructor(private readonly ctx:CanvasRenderingContext2D,image?:HTMLImageElement,private readonly waterways:{waterfalls:readonly Rect[];river:Rect}={waterfalls,river}){if(image)this.atlas=new ConfluenceAtlas(ctx,image,2,1);}
    private cascade(fall:Rect,clip:Rect,camera:Camera,time:number,alpha:number){
        if(!this.atlas||!camera.canSee(clip,0))return;
        const c=this.ctx,phase=Math.floor(time*42)%256,start=fall.y+phase;
        const top=Math.max(clip.y,camera.y),bottom=Math.min(clip.y+clip.height,camera.y+camera.height);
        c.save();c.globalAlpha=alpha;c.beginPath();c.rect(clip.x,clip.y,clip.width,clip.height);c.clip();
        for(let y=start+Math.floor((top-start)/128)*128;y<bottom;y+=128){
            c.save();if(Math.floor((y-start)/128)%2){c.translate(0,y*2+128);c.scale(1,-1);}
            this.atlas.draw(0,fall.x,y,fall.width,128);c.restore();
        }
        c.restore();
    }
    draw(camera:Camera,time:number){
        if(!this.atlas)return;
        const {waterfalls,river}=this.waterways;
        for(const fall of waterfalls){
            if(!camera.canSee(fall,0))continue;
            const height=fall.height-64;
            this.cascade(fall,{x:fall.x+4,y:fall.y,width:fall.width-8,height},camera,time,.78);
            for(const x of [fall.x,fall.x+fall.width-4])this.cascade(fall,{x,y:fall.y,width:4,height},camera,time,.3);
            for(let i=0;i<4;i++)this.cascade(fall,{x:fall.x,y:fall.y+height+i*16,width:fall.width,height:16},camera,time,.65-i*.16);
        }
        if(!camera.canSee(river,0))return;
        const c=this.ctx,phase=Math.floor(time*18)%512,start=river.x-phase;
        const left=Math.max(camera.x,river.x),right=Math.min(camera.x+camera.width,river.x+river.width);
        c.save();c.globalAlpha=.84;c.beginPath();c.rect(river.x,river.y,river.width,river.height);c.clip();
        for(let x=start+Math.floor((left-start)/256)*256;x<right;x+=256){
            c.save();if(Math.floor((x-start)/256)%2){c.translate(x*2+256,0);c.scale(-1,1);}
            this.atlas.draw(1,x,river.y,256,Math.max(128,river.height));c.restore();
        }
        c.restore();
    }
}

