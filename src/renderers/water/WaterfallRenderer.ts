import type {Camera} from '../../components/Camera';
import type {Rect} from '../../interfaces/Geometry';
import {ConfluenceAtlas} from '../../environment/ConfluenceAtlas';

/** Falling material moves down. Impact height is supplied by the resolved network. */
export class WaterfallRenderer {
    private readonly atlas?:ConfluenceAtlas;
    constructor(private readonly ctx:CanvasRenderingContext2D,image?:HTMLImageElement){if(image)this.atlas=new ConfluenceAtlas(ctx,image,2,1);}

    private cascade(fall:Rect,clip:Rect,camera:Camera,time:number,alpha:number){
        if(!camera.canSee(clip,0))return;
        const c=this.ctx,phase=Math.floor(time*42)%256,start=fall.y+phase;
        const top=Math.max(clip.y,camera.y),bottom=Math.min(clip.y+clip.height,camera.y+camera.height);
        c.save();c.globalAlpha=alpha;c.beginPath();c.rect(clip.x,clip.y,clip.width,clip.height);c.clip();
        if(this.atlas){
            for(let y=start+Math.floor((top-start)/128)*128;y<bottom;y+=128){
                c.save();if(Math.floor((y-start)/128)%2){c.translate(0,y*2+128);c.scale(1,-1);}
                this.atlas.draw(0,fall.x,y,fall.width,128);c.restore();
            }
        }else{
            c.fillStyle='#1f7180';c.fillRect(fall.x,top,fall.width,bottom-top);
            c.fillStyle='#64c5d1';for(let y=start+Math.floor((top-start)/48)*48;y<bottom;y+=48)c.fillRect(fall.x+fall.width/2,y,1,14);
        }
        c.restore();
    }

    draw(fall:Rect,camera:Camera,time:number){
        if(!camera.canSee(fall,64))return;
        const edge=Math.min(4,fall.width/4);
        this.cascade(fall,{x:fall.x+edge,y:fall.y,width:fall.width-edge*2,height:fall.height},camera,time,.78);
        for(const x of [fall.x,fall.x+fall.width-edge])this.cascade(fall,{x,y:fall.y,width:edge,height:fall.height},camera,time,.3);
        for(let i=0;i<4;i++)this.cascade(fall,{x:fall.x,y:fall.y+fall.height+i*16,width:fall.width,height:16},camera,time,.65-i*.16);
    }
}
