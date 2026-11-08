/** Art placement only: changing this data never changes platforms or interaction reach. */
export const propNames=['bench','lamp','cargo','junction','ticketBooth','timetable','ledger','routeIndex','letter','shutterClosed','shutterOpen','railing'] as const;
export type PropName=typeof propNames[number];
export interface PropPlacement { sprite:PropName; x:number; bottom:number; width:number; height:number; }
export interface FacadePlacement { row:number; x:number; bottom:number; columns:number; rows:number; size:number; light:number; }
export const landmarks:readonly {index:number;x:number;bottom:number;size:number;alpha:number;far?:boolean}[]=[
    {index:3,x:2880,bottom:2270,size:768,alpha:.4,far:true},
    {index:3,x:4080,bottom:2180,size:576,alpha:.22,far:true},
    {index:4,x:670,bottom:1870,size:144,alpha:1},
    {index:5,x:1610,bottom:1980,size:240,alpha:.7},
    {index:1,x:3240,bottom:1344,size:288,alpha:.7},
    {index:0,x:5664,bottom:1020,size:288,alpha:.85},
    {index:5,x:6050,bottom:1310,size:192,alpha:.4},
    {index:4,x:9000,bottom:1900,size:120,alpha:.85},
];
export const facades:readonly FacadePlacement[]=[
    {row:0,x:0,bottom:2016,columns:4,rows:2,size:192,light:.38},
    {row:0,x:1008,bottom:2016,columns:6,rows:2,size:192,light:.35},
    {row:0,x:2112,bottom:1632,columns:4,rows:1,size:192,light:.35},
    {row:2,x:5376,bottom:1344,columns:7,rows:2,size:192,light:.4},
    {row:2,x:5376,bottom:1056,columns:6,rows:2,size:192,light:.46},
    {row:3,x:5376,bottom:2112,columns:6,rows:1,size:192,light:.35},
    {row:3,x:6912,bottom:2112,columns:7,rows:2,size:192,light:.32},
    {row:3,x:7872,bottom:1824,columns:2,rows:1,size:192,light:.4},
    {row:1,x:8832,bottom:2112,columns:3,rows:2,size:192,light:.38},
];
export const props:readonly PropPlacement[]=[
    {sprite:'ticketBooth',x:24,bottom:2016,width:100,height:148},
    {sprite:'bench',x:320,bottom:2016,width:144,height:74},
    {sprite:'lamp',x:168,bottom:2016,width:54,height:166},
    {sprite:'lamp',x:768,bottom:2016,width:54,height:166},
    {sprite:'timetable',x:512,bottom:2016,width:92,height:120},
    {sprite:'bench',x:1050,bottom:1632,width:128,height:66},
    {sprite:'lamp',x:1480,bottom:1632,width:54,height:150},
    {sprite:'cargo',x:2300,bottom:2016,width:110,height:96},
    {sprite:'lamp',x:2460,bottom:2016,width:54,height:166},
    {sprite:'cargo',x:2208,bottom:1344,width:110,height:96},
    {sprite:'cargo',x:2680,bottom:1344,width:128,height:112},
    {sprite:'junction',x:3930,bottom:2090,width:64,height:76},
    {sprite:'lamp',x:3980,bottom:1728,width:54,height:166},
    {sprite:'railing',x:3168,bottom:1728,width:384,height:64},
    {sprite:'railing',x:3696,bottom:1728,width:432,height:64},
    {sprite:'railing',x:4512,bottom:1728,width:160,height:64},
    {sprite:'timetable',x:4700,bottom:1728,width:90,height:124},
    {sprite:'lamp',x:4910,bottom:1728,width:54,height:166},
    {sprite:'lamp',x:4512,bottom:1248,width:54,height:150},
    {sprite:'lamp',x:5400,bottom:1056,width:54,height:166},
    {sprite:'bench',x:6130,bottom:1056,width:144,height:74},
    {sprite:'lamp',x:6550,bottom:1344,width:54,height:150},
    {sprite:'bench',x:7252,bottom:768,width:144,height:74},
    {sprite:'lamp',x:7452,bottom:768,width:54,height:150},
    {sprite:'cargo',x:6760,bottom:2112,width:128,height:112},
    {sprite:'junction',x:7270,bottom:2016,width:64,height:76},
    {sprite:'lamp',x:7800,bottom:1728,width:54,height:150},
    {sprite:'lamp',x:8210,bottom:1824,width:54,height:166},
    {sprite:'bench',x:8910,bottom:2112,width:144,height:74},
    {sprite:'lamp',x:9300,bottom:2112,width:54,height:166},
];
export const objectArt:Readonly<Record<string,{sprite:PropName;width:number;height:number;bottom:number}>>={
    'optional-lost-letter':{sprite:'letter',width:28,height:22,bottom:1632},
    'registry-transfer-ledger':{sprite:'ledger',width:66,height:92,bottom:1056},
    'archive-route-index':{sprite:'routeIndex',width:68,height:108,bottom:1824},
    'departure-shutter':{sprite:'shutterClosed',width:54,height:432,bottom:2112},
};

