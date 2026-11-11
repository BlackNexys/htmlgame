import type {Rect} from '../interfaces/Geometry';
import {exposedTops} from '../world/surfaces/ExposedSurfaces';
import type {Map as GameMap} from '../components/Map';
import {Bridge} from '../world/structures/Bridge';

export interface ConfluenceAssembly extends Rect {
    owner:string;
    family:number;
    bridge:boolean;
    supportBottom:number;
    supports:readonly {x:number;bottom:number}[];
}

/** Extract continuous exposed floors from collision, so scenery cannot drift off its foundations. */
export function rebuiltAssemblies(map:Pick<GameMap,'surfaces'|'structures'|'height'>):ConfluenceAssembly[]{
    const surfaces=map.surfaces.filter(s=>s.layer==='terrain'),tops=exposedTops(surfaces);
    const runs=surfaces.flatMap(surface=>tops.filter(t=>t.y===surface.y&&t.x<surface.x+surface.width&&t.x+t.width>surface.x).map(top=>({
        ...surface,x:Math.max(surface.x,top.x),width:Math.min(surface.x+surface.width,top.x+top.width)-Math.max(surface.x,top.x),
    })));
    return runs.map(run=>{
        const structure=map.structures.find(s=>s.id===run.owner);
        const supports=(run.width>=432?[run.x+24,run.x+run.width-48]:[run.x+run.width/2-12]).map(x=>({
            x,bottom:Math.min(map.height,...surfaces.filter(other=>other.y>run.y && other.x<x+24 && other.x+other.width>x).map(other=>other.y)),
        }));
        return {
        ...run,family:run.material??0,bridge:structure instanceof Bridge,
        supports,supportBottom:Math.min(...supports.map(s=>s.bottom)),
    };});
}
