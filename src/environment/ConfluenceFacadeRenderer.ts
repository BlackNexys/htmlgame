import type { Camera } from '../components/Camera';
import { ConfluenceShadedAtlas } from './ConfluenceShadedAtlas';
import { facades,type FacadePlacement } from './ConfluenceScene';

/** Shade each atlas in isolation so the tint cannot fill transparent cutouts. */
export class ConfluenceFacadeRenderer {
    private readonly shaded:ConfluenceShadedAtlas;
    constructor(ctx:CanvasRenderingContext2D,image:HTMLImageElement){this.shaded=new ConfluenceShadedAtlas(ctx,image);}
    draw(camera:Camera,areas:readonly FacadePlacement[]=facades){
        for(const area of areas)for(let row=0;row<area.rows;row++)for(let col=0;col<area.columns;col++){
            const r={x:area.x+col*area.size,y:area.bottom-(row+1)*area.size,width:area.size,height:area.size};
            if(camera.canSee(r,0))this.shaded.at(area.light).draw(area.row*4+(area.variant??col%4),r.x,r.y,r.width,r.height);
        }
    }
}
