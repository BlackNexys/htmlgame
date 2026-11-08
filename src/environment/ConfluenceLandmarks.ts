export const landmarkNames=['registrySignal','freightGantry','wiredArch','spectralRib','stationClock','inhabitedFrontage'] as const;
export type LandmarkName=typeof landmarkNames[number];
export interface LandmarkPlacement {sprite:LandmarkName;x:number;bottom:number;width:number;height:number;light:number;opacity?:number;far?:boolean;}
/** Tight sprite bounds give footings and wall-mounted brackets explicit attachment points. */
export const landmarks:readonly LandmarkPlacement[]=[
    {sprite:'spectralRib',x:1800,bottom:2100,width:960,height:960,light:1,opacity:.4,far:true},
    {sprite:'spectralRib',x:4000,bottom:3600,width:1056,height:1056,light:1,opacity:.24,far:true},
    // Left mounting rail aligns with the station's masonry corner at x=744.
    {sprite:'stationClock',x:744,bottom:792,width:112,height:144,light:.9},
    {sprite:'registrySignal',x:6048,bottom:1248,width:288,height:336,light:.8},
    {sprite:'freightGantry',x:3264,bottom:2400,width:384,height:384,light:.65},
    // Departure clock is bolted to the left outer corner of its building.
    {sprite:'stationClock',x:6144,bottom:3168,width:96,height:128,light:.85},
];
