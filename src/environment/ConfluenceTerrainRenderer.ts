import type {Rect} from '../interfaces/Geometry';
import type {Map} from '../components/Map';
import type {SurfaceDefinition} from '../world/surfaces/SurfaceDefinition';
import {ConfluenceAtlas} from './ConfluenceAtlas';
import {ConfluenceImageLighting} from './ConfluenceImageLighting';

/** Texture cells repeat inside arbitrary visual surfaces; they never become physics tiles. */
export class ConfluenceTerrainRenderer {
    private readonly atlas:ConfluenceAtlas;
    private readonly rearAtlas:ConfluenceAtlas;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement,private readonly baselines:readonly number[]=[]){this.atlas=new ConfluenceAtlas(ctx,image,4,4);this.rearAtlas=new ConfluenceAtlas(ctx,new ConfluenceImageLighting(image).at(.4),4,4);}
    draw(wall:Rect & Partial<SurfaceDefinition>,map:Map,view?:Rect){
        const c=this.ctx,material=wall.material??0;
        const layer=wall.layer??'terrain';
        const occupied=(x:number,y:number)=>map.surfaces.some(s=>s.layer===layer&&s.appearance==='terrain'&&x>=s.x&&x<s.x+s.width&&y>=s.y&&y<s.y+s.height);
        c.save();c.beginPath();c.rect(wall.x,wall.y-24,wall.width,wall.height+24);c.clip();
        const startX=wall.x+Math.max(0,Math.floor(((view?.x??wall.x)-wall.x)/48))*48;
        const startY=wall.y+Math.max(0,Math.floor(((view?.y??wall.y)-wall.y-24)/48))*48;
        const endX=Math.min(wall.x+wall.width,view?view.x+view.width+48:Infinity),endY=Math.min(wall.y+wall.height,view?view.y+view.height+48:Infinity);
        for(let y=startY;y<endY;y+=48)for(let x=startX;x<endX;x+=48){
            const top=y===wall.y&&!occupied(x+Math.min(24,wall.width/2),y-1);
            const left=x===wall.x&&!occupied(x-1,y+1),right=x+48>=wall.x+wall.width&&!occupied(wall.x+wall.width,y+1);
            const index=material*4+(top?(left?0:right?2:1):3);
            const drawX=right&&wall.width>=48?wall.x+wall.width-48:x;
            (layer==='rear'?this.rearAtlas:this.atlas).surface(index,drawX,y,48,48,top?this.baselines[index]??0:0);
        }
        c.fillStyle='#070d13';c.fillRect(wall.x,wall.y+wall.height-2,wall.width,2);c.restore();
    }
    decoration(wall:Rect,map:Map,view?:Rect){this.draw(wall,map,view);}
}
