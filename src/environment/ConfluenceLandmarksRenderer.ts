import type {Camera} from '../components/Camera';
import {ConfluenceSprites} from './ConfluenceSprites';
import {landmarks} from './ConfluenceLandmarks';

export class ConfluenceLandmarksRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly sprites:ConfluenceSprites){}
    draw(camera:Camera,far:boolean){
        const c=this.ctx;c.save();
        for(const item of landmarks){
            if(!!item.far!==far||!camera.canSee({x:item.x,y:item.bottom-item.height,width:item.width,height:item.height},0))continue;
            c.globalAlpha=item.opacity??1;
            this.sprites.draw(item.sprite,item.x+item.width/2,item.bottom,item.width,item.height,false,item.light);
        }
        c.restore();
    }
}
