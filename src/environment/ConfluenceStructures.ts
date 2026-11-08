/** Rear structural frames. Bright terrain caps remain the collision/readability layer. */
export const supportFrames=[
    {x:1888,y:864,width:800,height:768,tieLeft:1888,tieRight:2720},
    {x:2552,y:1632,width:544,height:768,tieLeft:2464,tieRight:3096},
    {x:1504,y:2400,width:512,height:1248,tieLeft:1504,tieRight:2152},
    {x:1200,y:2592,width:336,height:576,tieLeft:1200,tieRight:1536},
    {x:6496,y:1248,width:416,height:384,tieLeft:6288,tieRight:6912},
    {x:6208,y:2880,width:480,height:480,tieLeft:6208,tieRight:6688},
] as const;
export const supportPiers=[
    ...Array.from({length:5},(_,i)=>({x:1764-i*192,y:816-i*96,width:40,height:i?48+i*96:816})),
    ...Array.from({length:3},(_,i)=>({x:4260+i*192,y:1008+i*96,width:56,height:912-i*192})),
    ...Array.from({length:7},(_,i)=>({x:4644-i*192,y:1776+i*96,width:56,height:624-i*96})),
    ...Array.from({length:4},(_,i)=>({x:5028+i*192,y:2544+i*96,width:64,height:1104-i*96})),
    ...[96,672,1248].map(x=>({x,y:2640,width:48,height:1008})),
    ...[2380,2524].map(x=>({x,y:816,width:24,height:96})),
    {x:1428,y:2544,width:24,height:96},
    ...[1920,2688,3072,3648].flatMap(x=>[x+16,x+320].map(px=>({x:px,y:1190,width:48,height:(x===1920?1632:2400)-1190}))),
    ...[2112,2880,3648,4416].flatMap(x=>[x+16,x+320].map(px=>({x:px,y:2726,width:48,height:922}))),
    {x:5800,y:3600,width:48,height:48},
    {x:5992,y:3504,width:48,height:144},
] as const;

