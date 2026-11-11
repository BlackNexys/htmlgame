import type {Rect} from '../../interfaces/Geometry';
import type {EnvironmentImages} from '../../interfaces/Environment';
import {PropRenderer} from '../props/PropRenderer';
export class RailingRenderer {
    private readonly art:PropRenderer;
    constructor(private readonly c:CanvasRenderingContext2D,private readonly images?:EnvironmentImages){this.art=new PropRenderer(c,images);}
    draw(r:Rect){
        const c=this.c;c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
        if(this.images?.props)for(let x=r.x;x<r.x+r.width;x+=192)this.art.draw('confluence-railing',{x,y:r.y,width:192,height:r.height});
        else{c.fillStyle='#48616c';for(const y of [r.y,r.y+r.height/2])c.fillRect(r.x,y,r.width,3);for(let x=r.x;x<r.x+r.width;x+=64)c.fillRect(x,r.y,4,r.height);}
        c.fillStyle='#526a74';c.fillRect(r.x,r.y,3,r.height);c.fillRect(r.x+r.width-3,r.y,3,r.height);c.restore();
    }
}
