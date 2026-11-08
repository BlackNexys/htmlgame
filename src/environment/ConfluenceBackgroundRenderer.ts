import type { Camera } from '../components/Camera';
import { tuning as T } from '../game/config';

export class ConfluenceBackgroundRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly city:HTMLImageElement){}
    draw(camera:Camera){
        const c=this.ctx,height=T.viewportHeight+192,width=this.city.naturalWidth*height/this.city.naturalHeight;
        const offset=camera.x*.12,index=Math.floor(offset/width),x=-(offset%width),y=-Math.min(height-T.viewportHeight,camera.y*.075);
        c.fillStyle='#0a141d';c.fillRect(0,0,T.viewportWidth,T.viewportHeight);
        let tile=index;
        for(let px=x;px<T.viewportWidth;px+=width,tile++){
            c.save();c.translate(px+(tile%2?width:0),y);if(tile%2)c.scale(-1,1);c.drawImage(this.city,0,0,width,height);c.restore();
        }
        // Keep scenic light below the contrast of the hero, tells and projectiles.
        c.fillStyle='#07131c38';c.fillRect(0,0,T.viewportWidth,T.viewportHeight);
    }
}
