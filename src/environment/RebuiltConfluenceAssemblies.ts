import type {Rect} from '../interfaces/Geometry';

export interface ConfluenceAssembly extends Rect {
    family:number;
    bridge:boolean;
    supportBottom:number;
    supports:readonly {x:number;bottom:number}[];
}

/** Extract continuous exposed floors from collision, so scenery cannot drift off its foundations. */
export function rebuiltAssemblies(solids:readonly Rect[],height:number):ConfluenceAssembly[]{
    const tiles=solids.filter(r=>r.width===48 && r.height===48);
    const occupied=new Set(tiles.map(r=>`${r.x},${r.y}`));
    const tops=tiles.filter(r=>!occupied.has(`${r.x},${r.y-48}`)).sort((a,b)=>a.y-b.y||a.x-b.x);
    const runs:Rect[]=[];
    for(const tile of tops){
        const last=runs[runs.length-1];
        if(last && last.y===tile.y && last.x+last.width===tile.x)last.width+=48;
        else runs.push({...tile});
    }
    return runs.map(run=>{
        const supports=(run.width>=432?[run.x+24,run.x+run.width-48]:[run.x+run.width/2-12]).map(x=>({
            x,bottom:Math.min(height,...runs.filter(other=>other.y>run.y && other.x<=x && other.x+other.width>=x+24).map(other=>other.y)),
        }));
        return {
        ...run,family:run.x>=7248?3:run.x>=5808?2:run.x>=2208?1:0,
        bridge:run.x>=2208 && run.x<4464 && run.y>=672 && run.y<1152,
        supports,supportBottom:Math.min(...supports.map(s=>s.bottom)),
    };});
}
