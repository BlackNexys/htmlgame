/** Art anchors follow the revision-5 floors. They never define collision. */
export const propNames=['bench','lamp','cargo','junction','ticketBooth','timetable','ledger','routeIndex','letter','shutterClosed','shutterOpen','railing'] as const;
export type PropName=typeof propNames[number];
export interface PropPlacement {sprite:PropName;x:number;bottom:number;width:number;height:number;}
export interface FacadePlacement {variant?:number;row:number;x:number;bottom:number;columns:number;rows:number;size:number;light:number;}
const bays=(row:number,xs:readonly number[],bottom:number,size=192,light=.5):FacadePlacement[]=>xs.map((x,i)=>({row,variant:i%2?2:0,x,bottom,columns:1,rows:1,size,light}));
export const facades:readonly FacadePlacement[]=[
    // Inset frames decorate one shell; full balconies and gallery arches own their own bays.
    ...bays(0,[128,448],496,144),
    ...bays(0,[856],848,128),...bays(0,[1040,1232,1424],848,144),
    ...bays(0,[96,480,864,1248,1632,2112],1600),
    ...bays(2,[5088,5664,6240,6624],1600),
    ...bays(1,[2688,4320],2368,144,.42),...bays(1,[192,720,1056],2560,144),
    ...bays(3,[6240,6624],3328),
];
export const props:readonly PropPlacement[]=[
    {sprite:'ticketBooth',x:24,bottom:864,width:96,height:144},
    {sprite:'bench',x:320,bottom:864,width:144,height:74},
    {sprite:'lamp',x:168,bottom:864,width:48,height:154},
    {sprite:'timetable',x:512,bottom:864,width:96,height:108},
    {sprite:'lamp',x:1600,bottom:864,width:48,height:154},
    {sprite:'bench',x:240,bottom:288,width:128,height:66},
    ...[1968,2784,3744].map(x=>({sprite:'lamp' as const,x,bottom:864,width:48,height:154})),
    ...[1920,2688,3072,3648].map(x=>({sprite:'railing' as const,x,bottom:864,width:192,height:56})),
    {sprite:'junction',x:2640,bottom:1310,width:64,height:80},
    {sprite:'timetable',x:5040,bottom:1248,width:80,height:100},
    {sprite:'lamp',x:5630,bottom:1248,width:48,height:154},
    {sprite:'bench',x:5810,bottom:1248,width:128,height:66},
    {sprite:'lamp',x:6280,bottom:1248,width:48,height:154},
    {sprite:'junction',x:6868,bottom:1530,width:64,height:80},
    {sprite:'bench',x:5080,bottom:1632,width:144,height:74},
    {sprite:'lamp',x:6400,bottom:1632,width:48,height:154},
    {sprite:'lamp',x:2352,bottom:1632,width:48,height:154},
    ...[2304,3072,3936,4512].map(x=>({sprite:'cargo' as const,x,bottom:2400,width:112,height:96})),
    ...[2496,3552,4656].map(x=>({sprite:'lamp' as const,x,bottom:2400,width:48,height:154})),
    {sprite:'junction',x:1480,bottom:3100,width:64,height:80},
    {sprite:'lamp',x:5760,bottom:2880,width:48,height:154},
    {sprite:'lamp',x:6260,bottom:2880,width:48,height:154},
    {sprite:'lamp',x:6650,bottom:3360,width:48,height:154},
    {sprite:'bench',x:6960,bottom:3360,width:128,height:66},
    {sprite:'junction',x:4424,bottom:3600,width:64,height:80},
    {sprite:'lamp',x:5570,bottom:3648,width:48,height:154},
    {sprite:'cargo',x:480,bottom:2592,width:128,height:112},
    {sprite:'junction',x:1120,bottom:2480,width:64,height:80},
    {sprite:'bench',x:432,bottom:3168,width:128,height:66},
    {sprite:'bench',x:1040,bottom:3168,width:128,height:66},
    {sprite:'lamp',x:160,bottom:3168,width:48,height:154},
    {sprite:'lamp',x:1250,bottom:3168,width:48,height:154},
];
export const objectArt:Readonly<Record<string,{sprite:PropName;width:number;height:number;bottom:number}>>={
    'optional-lost-letter':{sprite:'letter',width:28,height:22,bottom:288},
    'registry-transfer-ledger':{sprite:'ledger',width:66,height:92,bottom:1248},
    'archive-route-index':{sprite:'routeIndex',width:68,height:108,bottom:2880},
    'departure-shutter':{sprite:'shutterClosed',width:54,height:432,bottom:3360},
};

