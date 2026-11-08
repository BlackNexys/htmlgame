/** Architectural material regions, in priority order. No gameplay rules live here. */
export const materialRegions=[
    {x:4992,y:0,width:2544,height:1632,row:2}, // Registry galleries, halls and public stair
    {x:6624,y:1344,width:2784,height:1152,row:3}, // archive and departure foundations
    {x:2592,y:1248,width:2400,height:576,row:1}, // both railway crossings
    {x:1008,y:1296,width:1584,height:384,row:1}, // inhabited roof / balcony
    {x:4512,y:1152,width:480,height:288,row:1}, // freight service entry
    {x:4992,y:2016,width:1632,height:480,row:3}, // lower records
] as const;
export function confluenceMaterial(x:number,y:number){
    return materialRegions.find(r=>x>=r.x && x<r.x+r.width && y>=r.y && y<r.y+r.height)?.row??0;
}

