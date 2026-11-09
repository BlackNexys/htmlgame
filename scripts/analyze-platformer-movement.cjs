// Research/authoring measurement, not a reachability guarantee for arbitrary geometry.
require('../tests/register.cjs');
const {World}=require('../src/game/World.ts');
const {tuning:T}=require('../src/game/config.ts');
const idle={left:false,right:false,up:false,down:false,jump:false,jumpHeld:false,jumpReleased:false,sprint:false,fire:false};
const fixture=()=>new World({width:10000,height:2400,solids:[{x:0,y:1200,width:10000,height:1200}],spawn:{x:500,y:1148},enemies:[],exit:{x:9800,y:1092,width:64,height:108}});
const round=n=>Math.round(n*100)/100;
const measurements=[];
for(const [name,right,sprint,releaseAt] of [['held-still',false,false,Infinity],['held-running',true,false,Infinity],['held-sprinting',true,true,Infinity],['tap-running',true,false,.1]]){
    const world=fixture(),motion={...idle,right,sprint};
    for(let i=0;i<120;i++)world.update(T.step,motion);
    const x=world.player.x,feet=world.player.y2;let peak=feet,ticks=0;
    for(;ticks<240;ticks++){
        const time=ticks*T.step;
        world.update(T.step,{...motion,jump:ticks===0,jumpHeld:time<releaseAt,jumpReleased:time>=releaseAt&&time<releaseAt+T.step});
        peak=Math.min(peak,world.player.y2);
        if(ticks>0&&world.player.grounded){ticks++;break;}
    }
    measurements.push({name,height:round(feet-peak),sameHeightTravel:round(world.player.x-x),airTime:round(ticks*T.step)});
}
for(const sprint of [false,true]){
    const world=fixture();for(let i=0;i<120;i++)world.update(T.step,{...idle,right:true,sprint});
    const x=world.player.x;let ticks=0;
    while(world.player.vx!==0&&ticks++<240)world.update(T.step,idle);
    measurements.push({name:sprint?'sprint-release-stop':'run-release-stop',distance:round(world.player.x-x),time:round(ticks*T.step)});
}
console.log(JSON.stringify({step:T.step,tile:T.tile,viewport:[T.viewportWidth,T.viewportHeight],fixture:'Flat floor, no enemies, one-second run-up, 120 Hz. Travel is body displacement, not safe gap width.',measurements},null,2));
