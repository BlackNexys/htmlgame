import type { Camera } from '../components/Camera';
import { ConfluenceAtlas } from './ConfluenceAtlas';
import { ConfluenceSprites } from './ConfluenceSprites';
import { facades,props,landmarks } from './ConfluenceScene';
import type { ConfluenceArchitectureRenderer } from './ConfluenceArchitectureRenderer';

export class ConfluenceSceneryRenderer {
    private readonly panels?:ConfluenceAtlas;
    private readonly landmarks?:ConfluenceAtlas;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,private readonly sprites?:ConfluenceSprites,landmarkImage?:HTMLImageElement,private readonly architecture?:ConfluenceArchitectureRenderer){
        if(image)this.panels=new ConfluenceAtlas(ctx,image,4,4);
        if(landmarkImage)this.landmarks=new ConfluenceAtlas(ctx,landmarkImage,3,2);
    }
    private drawLandmarks(camera:Camera,far:boolean){
        if(!this.landmarks)return;
        for(const item of landmarks){
            const rect={x:item.x,y:item.bottom-item.size,width:item.size,height:item.size};
            if(!!item.far!==far || !camera.canSee(rect,0))continue;
            this.ctx.globalAlpha=item.alpha;this.landmarks.draw(item.index,rect.x,rect.y,rect.width,rect.height);
        }
    }
    draw(camera:Camera){
        const c=this.ctx;c.save();
        this.drawLandmarks(camera,true);
        if(this.panels)for(const area of facades){
            for(let row=0;row<area.rows;row++)for(let column=0;column<area.columns;column++){
                const rect={x:area.x+column*area.size,y:area.bottom-(row+1)*area.size,width:area.size,height:area.size};
                if(!camera.canSee(rect,0))continue;
                c.globalAlpha=1;this.panels.draw(area.row*4+column%4,rect.x,rect.y,rect.width,rect.height);
                c.globalAlpha=1-area.light;c.fillStyle='#08131b';c.fillRect(rect.x,rect.y,rect.width,rect.height);
            }
        }
        this.architecture?.draw(camera);
        this.drawLandmarks(camera,false);
        c.globalAlpha=.95;
        if(this.sprites)for(const prop of props){
            if(camera.canSee({x:prop.x,y:prop.bottom-prop.height,width:prop.width,height:prop.height},0))this.sprites.draw(prop.sprite,prop.x+prop.width/2,prop.bottom,prop.width,prop.height);
        }
        c.restore();
    }
}
