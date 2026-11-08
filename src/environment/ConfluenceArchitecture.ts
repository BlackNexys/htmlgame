/** Background architectural modules. The level document alone owns collision. */
export const architectureNames=['stationEntrance','inhabitedBalcony','stationCanopy','retainingPier','bridgeDeck','bridgeArch','freightCage','maintenanceStairs','registryShelves','registryCounter','registryGallery','archiveMachinery'] as const;
export type ArchitectureName=typeof architectureNames[number];
export interface ArchitecturePlacement {
    sprite:ArchitectureName;x:number;bottom:number;width:number;height:number;
    light?:number;stretch?:boolean;flip?:boolean;
}
export const architecture:readonly ArchitecturePlacement[]=[
    {sprite:'stationEntrance',x:0,bottom:2016,width:300,height:360},
    {sprite:'stationCanopy',x:288,bottom:1850,width:480,height:180,stretch:true,light:.7},
    ...[1008,1200,1392].map(x=>({sprite:'inhabitedBalcony' as const,x,bottom:1662,width:192,height:216})),
    {sprite:'stationCanopy',x:2112,bottom:1520,width:864,height:224,stretch:true,light:.75},
    ...[3168,3696].map((x,i)=>({sprite:'bridgeArch' as const,x,bottom:2112,width:i?432:384,height:432,stretch:true,light:.5})),
    ...[3120,3744].map((x,i)=>({sprite:'bridgeDeck' as const,x,bottom:1440,width:i?576:480,height:144,stretch:true})),
    ...[2688,2784,2976].map((x,i)=>({sprite:'retainingPier' as const,x:x+24,bottom:2112,width:72,height:192+i*96,stretch:true,light:.42})),
    {sprite:'bridgeArch',x:4320,bottom:2112,width:192,height:432,stretch:true,light:.45},
    {sprite:'freightCage',x:3840,bottom:1344,width:224,height:256,light:.7},
    ...[4992,5184,5376].map((x,i)=>({sprite:'retainingPier' as const,x:x+24,bottom:2112,width:96,height:480+i*96,stretch:true,light:.3})),
    {sprite:'stationEntrance',x:4800,bottom:1728,width:192,height:288,light:.85},
    ...[5580,5796,6012,6228].map(x=>({sprite:'registryShelves' as const,x,bottom:1344,width:192,height:240,light:.56})),
    {sprite:'registryCounter',x:5720,bottom:1344,width:256,height:154,light:.8},
    ...[5376,5568,5760,5952,6144].map(x=>({sprite:'registryGallery' as const,x,bottom:1104,width:192,height:240,light:.65})),
    {sprite:'registryCounter',x:5940,bottom:1056,width:200,height:124,light:.75},
    {sprite:'inhabitedBalcony',x:7112,bottom:798,width:240,height:288,light:.75},
    ...[5568,5808,6048].map(x=>({sprite:'registryShelves' as const,x,bottom:2112,width:192,height:240,light:.4})),
    ...[7056,7344,7632].map(x=>({sprite:'archiveMachinery' as const,x,bottom:2112,width:224,height:240,light:.5})),
    {sprite:'archiveMachinery',x:7872,bottom:1824,width:152,height:176,light:.65},
    {sprite:'stationEntrance',x:8880,bottom:2112,width:240,height:336,light:.6},
];

