import type { Camera } from '../components/Camera';
import type { Map as GameMap } from '../components/Map';
import type { Rect } from '../interfaces/Geometry';
import { ConfluenceAtlas } from './ConfluenceAtlas';
import {ConfluenceImageLighting} from './ConfluenceImageLighting';
import { supportFrames,supportPiers } from './ConfluenceStructures';
import { waterfalls } from './ConfluenceWaterways';

/** Rear girders attach the existing colliders to buildings without creating new walls. */
export class ConfluenceStructuresRenderer {
    private readonly atlas:ConfluenceAtlas;
    private readonly surfaces=new WeakMap<GameMap,Rect[]>();
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement){this.atlas=new ConfluenceAtlas(ctx,new ConfluenceImageLighting(image).at(.78),4,4);}
    private runs(map:GameMap){
        let runs=this.surfaces.get(map);if(runs)return runs;
        const tiles=map.solids.filter(w=>w.width===48&&w.height===48),occupied=new Set(tiles.map(w=>`${w.x},${w.y}`));
        runs=[];
        for(const tile of tiles.filter(w=>!occupied.has(`${w.x},${w.y-48}`)).sort((a,b)=>a.y-b.y||a.x-b.x)){
            const last=runs.at(-1);
            if(last&&last.y===tile.y&&last.x+last.width===tile.x)last.width+=48;
            else runs.push({x:tile.x,y:tile.y,width:48,height:48});
        }
        this.surfaces.set(map,runs);return runs;
    }
    private beam(r:Rect){
        const c=this.ctx;c.save();c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
        for(let y=r.y;y<r.y+r.height;y+=48)for(let x=r.x;x<r.x+r.width;x+=48)this.atlas.draw(7,x,y,48,48);
        c.restore();c.strokeStyle='#536f7b';c.lineWidth=1;c.strokeRect(r.x+.5,r.y+.5,r.width-1,r.height-1);
        c.fillStyle='#88a6af';
        if(r.width>r.height)for(let x=r.x+6;x<r.x+r.width-4;x+=48)c.fillRect(x,r.y+4,2,2);
        else for(let y=r.y+8;y<r.y+r.height-4;y+=48)c.fillRect(r.x+4,y,2,2);
    }
    private brace(x1:number,y1:number,x2:number,y2:number){
        const c=this.ctx,n=Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/6);c.fillStyle='#1b3442';
        for(let i=0;i<=n;i++)c.fillRect(Math.round(x1+(x2-x1)*i/n)-3,Math.round(y1+(y2-y1)*i/n)-3,7,7);
        c.fillStyle='#4b6573';for(let i=0;i<=n;i++)c.fillRect(Math.round(x1+(x2-x1)*i/n)-1,Math.round(y1+(y2-y1)*i/n)-2,2,2);
    }
    draw(camera:Camera,map:GameMap){
        const c=this.ctx;c.save();c.globalAlpha=1;
        for(const pier of supportPiers)if(camera.canSee(pier,0))this.beam(pier);
        const runs=this.runs(map);
        for(const frame of supportFrames){
            if(!camera.canSee(frame,48))continue;
            for(const x of [frame.x,frame.x+frame.width-24])this.beam({x,y:frame.y+48,width:24,height:frame.height});
            this.beam({x:frame.tieLeft,y:frame.y+48,width:frame.tieRight-frame.tieLeft,height:16});
            this.beam({x:frame.x,y:frame.y+frame.height+32,width:frame.width,height:16});
            for(const run of runs){
                if(run.y<=frame.y||run.y>=frame.y+frame.height||run.x<frame.x||run.x+run.width>frame.x+frame.width||run.width>192)continue;
                const left=run.x+run.width/2<frame.x+frame.width/2;
                const anchor=left?frame.x+24:frame.x+frame.width-24;
                const end=left?run.x+run.width:run.x;
                this.beam({x:Math.min(anchor,run.x),y:run.y+48,width:Math.max(anchor,run.x+run.width)-Math.min(anchor,run.x),height:12});
                this.brace(anchor,Math.min(run.y+104,frame.y+frame.height),end,run.y+60);
            }
        }
        // Every cascade begins at a mounted drain, rather than appearing in midair.
        for(const fall of waterfalls){
            const center=fall.x+fall.width/2,r={x:Math.min(center,fall.sourceX)-10,y:fall.sourceY,width:Math.abs(center-fall.sourceX)+20,height:fall.y-fall.sourceY};
            if(!camera.canSee(r,0))continue;
            this.beam({x:fall.sourceX-8,y:fall.sourceY,width:16,height:fall.y-fall.sourceY-16});
            this.beam({x:Math.min(center,fall.sourceX)-8,y:fall.y-24,width:Math.abs(center-fall.sourceX)+16,height:16});
            this.beam({x:fall.x-4,y:fall.y-12,width:fall.width+8,height:12});
        }
        c.restore();
    }
}
