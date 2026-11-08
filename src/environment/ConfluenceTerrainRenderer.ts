import type { Wall } from '../components/Wall';
import type { Map } from '../components/Map';
import { ConfluenceAtlas } from './ConfluenceAtlas';
import { confluenceMaterial } from './ConfluenceMaterials';

export class ConfluenceTerrainRenderer {
    private readonly atlas:ConfluenceAtlas;
    private readonly occupancy=new WeakMap<Map,Set<string>>();
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement){this.atlas=new ConfluenceAtlas(ctx,image,4,4);}
    private key(x:number,y:number){return `${x},${y}`;}
    private cells(map:Map){
        let cells=this.occupancy.get(map);
        if(!cells){cells=new Set(map.solids.filter(w=>w.width===48 && w.height===48).map(w=>this.key(w.x,w.y)));this.occupancy.set(map,cells);}
        return cells;
    }
    private material(x:number,y:number){
        return confluenceMaterial(x,y);
    }
    draw(wall:Wall,map:Map){
        // Solid interactive objects paint their own sprite over the same collision bounds.
        if(wall.width!==48 || wall.height!==48)return;
        const cells=this.cells(map),top=!cells.has(this.key(wall.x,wall.y-48));
        const left=!cells.has(this.key(wall.x-48,wall.y)),right=!cells.has(this.key(wall.x+48,wall.y));
        const column=top?(left?0:right?2:1):3;
        this.atlas.draw(this.material(wall.x,wall.y)*4+column,wall.x,wall.y,wall.width,wall.height);
        if(!cells.has(this.key(wall.x,wall.y+48))){this.ctx.fillStyle='#070d13';this.ctx.fillRect(wall.x,wall.y+46,48,2);}
    }
    decoration(wall:Wall){
        this.ctx.save();this.ctx.globalAlpha=.32;
        for(let x=wall.x;x<wall.x2;x+=48)for(let y=wall.y;y<wall.y2;y+=48)this.atlas.draw(this.material(x,y)*4+1,x,y,48,48);
        this.ctx.restore();
    }
}
