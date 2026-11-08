import type { Camera } from '../components/Camera';
import { architecture } from './ConfluenceArchitecture';
import { ConfluenceSprites } from './ConfluenceSprites';

export class ConfluenceArchitectureRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly sprites:ConfluenceSprites){}
    draw(camera:Camera){
        const c=this.ctx;c.save();
        for(const item of architecture){
            const rect={x:item.x,y:item.bottom-item.height,width:item.width,height:item.height};
            if(!camera.canSee(rect,0))continue;
            // Background structures stay quieter than the actors and the walk caps drawn afterward.
            c.globalAlpha=item.light??.9;
            if(item.flip){c.save();c.translate(item.x*2+item.width,0);c.scale(-1,1);}
            this.sprites.draw(item.sprite,item.x+item.width/2,item.bottom,item.width,item.height,item.stretch);
            if(item.flip)c.restore();
        }
        c.restore();
    }
}

