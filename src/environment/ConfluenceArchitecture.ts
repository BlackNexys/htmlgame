/** Static background modules; electronic equipment here adds no gameplay mechanics. */
export const architectureNames=['stationEntrance','inhabitedBalcony','stationCanopy','retainingPier','bridgeDeck','bridgeArch','freightCage','maintenanceStairs','registryShelves','registryCounter','registryGallery','archiveMachinery'] as const;
export type ArchitectureName=typeof architectureNames[number];
export interface ArchitecturePlacement {sprite:ArchitectureName;x:number;bottom:number;width:number;height:number;light?:number;stretch?:boolean;flip?:boolean;}
export const architecture:readonly ArchitecturePlacement[]=[
    {sprite:'stationEntrance',x:0,bottom:864,width:288,height:336},
    // This sprite includes columns and plinths: keep its proportions and seat it on the floor.
    {sprite:'stationCanopy',x:288,bottom:864,width:480,height:337,light:.8},
    ...[0,384].map(x=>({sprite:'stationCanopy' as const,x,bottom:288,width:384,height:270,light:.7})),
    ...[1920,2688,3072,3648].map(x=>({sprite:'bridgeArch' as const,x,bottom:1200,width:384,height:384,stretch:true,light:.55})),
    ...[1920,2688,3072,3648].map(x=>({sprite:'bridgeDeck' as const,x,bottom:960,width:384,height:144,stretch:true,light:.75})),
    ...[2352,2496].map(x=>({sprite:'bridgeDeck' as const,x,bottom:864,width:96,height:144,stretch:true,light:.7})),
    ...[4800,5184,5568].map(x=>({sprite:'registryGallery' as const,x,bottom:1248,width:384,height:336,light:.66})),
    ...[4848,5376,5952].map(x=>({sprite:'registryShelves' as const,x,bottom:1632,width:192,height:288,light:.5})),
    {sprite:'registryCounter',x:5640,bottom:1632,width:240,height:128,light:.85},
    ...[0,768,1536].map(x=>({sprite:'stationCanopy' as const,x,bottom:1632,width:768,height:336,light:.6})),
    {sprite:'freightCage',x:2208,bottom:2400,width:240,height:336,light:.7},
    {sprite:'freightCage',x:3840,bottom:2400,width:240,height:336,light:.65},
    ...[2112,2496,2880,3264,3648,4032,4416].map(x=>({sprite:'bridgeDeck' as const,x,bottom:2496,width:384,height:144,stretch:true,light:.7})),
    ...[2112,2880,3648,4416].map(x=>({sprite:'bridgeArch' as const,x,bottom:2736,width:384,height:384,stretch:true,light:.4})),
    {sprite:'registryShelves',x:5760,bottom:2880,width:192,height:240,light:.5},
    {sprite:'archiveMachinery',x:6000,bottom:2880,width:144,height:176,light:.7},
    {sprite:'archiveMachinery',x:4800,bottom:3648,width:192,height:224,light:.5},
    ...[0,576].map(x=>({sprite:'stationCanopy' as const,x,bottom:2592,width:576,height:252,light:.65})),
    ...[96,480,864].map(x=>({sprite:'inhabitedBalcony' as const,x,bottom:3222,width:240,height:288,light:.7})),
    {sprite:'stationEntrance',x:6912,bottom:3360,width:240,height:336,light:.75},
];

