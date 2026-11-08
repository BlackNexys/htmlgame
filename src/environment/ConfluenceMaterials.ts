/** Art regions only. Collision belongs to the authored level. */
export const materialRegions=[
    {x:4704,y:768,width:2208,height:1056,row:2},
    {x:4608,y:2400,width:2592,height:1440,row:3},
    {x:2112,y:2304,width:2688,height:144,row:1},
    {x:1728,y:768,width:2496,height:288,row:1},
    {x:1440,y:2400,width:672,height:1248,row:1},
] as const;
export function confluenceMaterial(x:number,y:number){
    return materialRegions.find(r=>x>=r.x && x<r.x+r.width && y>=r.y && y<r.y+r.height)?.row??0;
}

