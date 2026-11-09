import type {Rect} from '../interfaces/Geometry';
import type {ConfluenceAssembly} from './RebuiltConfluenceAssemblies';

export interface StationDrain {x:number;gutter:Rect;mouthY:number;}
export interface RebuiltWaterways {
    river:Rect;canal:Rect;basin:Rect;drains:StationDrain[];sluice:Rect;waterfalls:Rect[];
}

/** Authored drainage connections. Sources belong to buildings, not arbitrary bridge spans. */
export function rebuiltWaterways(assemblies:readonly ConfluenceAssembly[],width:number,height:number):RebuiltWaterways{
    const river={x:0,y:height-336,width,height:336};
    const canal={x:0,y:1008,width:2208,height:112};
    const drains=assemblies.filter(a=>a.x<2208&&a.width>=600).map(a=>({
        x:a.x+a.width-96,gutter:{x:a.x,y:a.y-288,width:a.width,height:12},mouthY:a.y+112,
    }));
    const freight=assemblies.find(a=>a.x<=5376&&a.x+a.width>5376&&a.y===960);
    const sluice={x:5376,y:(freight?.y??960)+48,width:288,height:192};
    const basin={x:5328,y:1440,width:384,height:112};
    const waterfalls=[
        ...drains.map(d=>({x:d.x-6,y:d.mouthY,width:12,height:canal.y-d.mouthY+64})),
        {x:canal.width-48,y:canal.y,width:32,height:river.y-canal.y+64},
        {x:sluice.x+96,y:sluice.y+112,width:96,height:basin.y-sluice.y-112+64},
        {x:basin.x+basin.width-96,y:basin.y+56,width:24,height:river.y-basin.y-56+64},
    ];
    return {river,canal,drains,sluice,basin,waterfalls};
}
