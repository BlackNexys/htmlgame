import type { SpriteFrame } from '../interfaces/Environment';

/** Production sheets use fixed cells with transparent padding retained by the packer. */
export class ConfluenceAtlas {
    constructor(private readonly ctx:CanvasRenderingContext2D,readonly image:HTMLImageElement|HTMLCanvasElement,private readonly columns:number,private readonly rows:number){}
    frame(index:number):SpriteFrame {
        const width=('naturalWidth' in this.image?this.image.naturalWidth:this.image.width)/this.columns;
        const height=('naturalHeight' in this.image?this.image.naturalHeight:this.image.height)/this.rows;
        return {x:index%this.columns*width,y:Math.floor(index/this.columns)*height,width,height};
    }
    draw(index:number,x:number,y:number,width:number,height:number){
        const f=this.frame(index);this.ctx.drawImage(this.image,f.x,f.y,f.width,f.height,Math.round(x),Math.round(y),width,height);
    }
    surface(index:number,x:number,y:number,width:number,height:number,baseline:number){
        if(!baseline){this.draw(index,x,y,width,height);return;}
        const f=this.frame(index),overhang=baseline/f.height*height;
        // Decorative growth remains above the collider; the actual lip starts at its top.
        this.ctx.drawImage(this.image,f.x,f.y,f.width,baseline,Math.round(x),Math.round(y-overhang),width,overhang);
        this.ctx.drawImage(this.image,f.x,f.y+baseline,f.width,f.height-baseline,Math.round(x),Math.round(y),width,height);
    }
}
