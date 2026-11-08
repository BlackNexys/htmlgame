import type { SpriteFrame } from '../interfaces/Environment';

/** Production sheets use fixed cells with transparent padding retained by the packer. */
export class ConfluenceAtlas {
    constructor(private readonly ctx:CanvasRenderingContext2D,readonly image:HTMLImageElement,private readonly columns:number,private readonly rows:number){}
    frame(index:number):SpriteFrame {
        const width=this.image.naturalWidth/this.columns,height=this.image.naturalHeight/this.rows;
        return {x:index%this.columns*width,y:Math.floor(index/this.columns)*height,width,height};
    }
    draw(index:number,x:number,y:number,width:number,height:number){
        const f=this.frame(index);this.ctx.drawImage(this.image,f.x,f.y,f.width,f.height,Math.round(x),Math.round(y),width,height);
    }
}
