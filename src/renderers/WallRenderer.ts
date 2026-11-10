import type {Rect} from '../interfaces/Geometry';
import type {Map} from '../components/Map';

/** Native material repetition is independent of the physical rectangle dimensions. */
export class WallRenderer {
    private readonly pattern:CanvasPattern|null;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement){this.pattern=ctx.createPattern(image,'repeat');}
    decoration(wall:Rect,map:Map,_view?:Rect){this.ctx.save();this.ctx.globalAlpha=.55;this.draw(wall,map);this.ctx.restore();}
    draw(wall:Rect,map:Map,_view?:Rect){
        const c=this.ctx;c.save();c.fillStyle=this.pattern??'#263a42';c.fillRect(wall.x,wall.y,wall.width,wall.height);
        c.fillStyle='rgba(4,16,22,.45)';c.fillRect(wall.x,wall.y,wall.width,wall.height);
        if(!map.surfaces.some(s=>s.owner!==(wall as {owner?:string}).owner&&s.y+s.height===wall.y&&s.x<=wall.x&&s.x+s.width>=wall.x+wall.width)){
            c.fillStyle='#718779';c.fillRect(wall.x,wall.y,wall.width,Math.min(3,wall.height));
        }c.restore();
    }
}
