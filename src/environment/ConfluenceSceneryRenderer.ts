import type { Camera } from '../components/Camera';
import { ConfluenceSprites } from './ConfluenceSprites';
import { props } from './ConfluenceScene';
import { ConfluenceFacadeRenderer } from './ConfluenceFacadeRenderer';
import type { ConfluenceArchitectureRenderer } from './ConfluenceArchitectureRenderer';

export class ConfluenceSceneryRenderer {
    private readonly panels?:ConfluenceFacadeRenderer;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,private readonly sprites?:ConfluenceSprites,private readonly architecture?:ConfluenceArchitectureRenderer){
        if(image)this.panels=new ConfluenceFacadeRenderer(ctx,image);
    }
    draw(camera:Camera){
        const c=this.ctx;c.save();
        c.globalAlpha=1;this.panels?.draw(camera);
        this.architecture?.draw(camera);
        c.globalAlpha=1;
        if(this.sprites)for(const prop of props){
            if(camera.canSee({x:prop.x,y:prop.bottom-prop.height,width:prop.width,height:prop.height},0))this.sprites.draw(prop.sprite,prop.x+prop.width/2,prop.bottom,prop.width,prop.height);
        }
        c.restore();
    }
}
