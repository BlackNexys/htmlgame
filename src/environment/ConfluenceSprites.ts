import type { SpriteFrame } from '../interfaces/Environment';

export class ConfluenceSprites {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly image:HTMLImageElement,private readonly frames:Record<string,SpriteFrame>){}
    draw(name:string,center:number,bottom:number,maxWidth:number,maxHeight:number,stretch=false){
        const frame=this.frames[name],scale=Math.min(maxWidth/frame.width,maxHeight/frame.height);
        const width=stretch?maxWidth:Math.round(frame.width*scale),height=stretch?maxHeight:Math.round(frame.height*scale);
        const x=Math.round(center-width/2),y=Math.round(bottom-height);
        this.ctx.drawImage(this.image,frame.x,frame.y,frame.width,frame.height,x,y,width,height);
        return {x,y,width,height};
    }
}
