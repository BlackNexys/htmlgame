import type { SpriteFrame } from '../interfaces/Environment';
import {ConfluenceImageLighting} from './ConfluenceImageLighting';

export class ConfluenceSprites {
    private readonly lighting:ConfluenceImageLighting;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement,private readonly frames:Record<string,SpriteFrame>){this.lighting=new ConfluenceImageLighting(image);}
    draw(name:string,center:number,bottom:number,maxWidth:number,maxHeight:number,stretch=false,light=1){
        const frame=this.frames[name],scale=Math.min(maxWidth/frame.width,maxHeight/frame.height);
        const width=stretch?maxWidth:Math.round(frame.width*scale),height=stretch?maxHeight:Math.round(frame.height*scale);
        const x=Math.round(center-width/2),y=Math.round(bottom-height);
        this.ctx.drawImage(this.lighting.at(light),frame.x,frame.y,frame.width,frame.height,x,y,width,height);
        return {x,y,width,height};
    }
}
