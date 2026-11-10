require('../register.cjs');
const source=require('../../src/content/levels/lantern-quay.level.ts').default;
const {World}=require('../../src/game/World.ts');
const {pilotInput:movement}=require('./platformer-pilot.cjs');
const {routeAnchors}=require('./route-anchors.cjs');
const {worldSnapshot}=require('../../src/game/debug/WorldSnapshot.ts');
const document=source.document(),anchor=routeAnchors(document);
const arrival=[anchor.floor('arrival--floor',700),...Array.from({length:3},(_,i)=>anchor.floor(`ascent-${i+1}--floor`,48)),anchor.floor('lookout--floor',160)];
const main=[...arrival,anchor.floor('crossing--deck-west',128),anchor.floor('crossing--deck-east',128)];
const recovery=[...arrival,{x:1984,y:1312,drop:true},anchor.floor('crossing--catch',160),...Array.from({length:4},(_,i)=>anchor.floor(`crossing--return-${i+1}`,48))];
const yard=[anchor.floor('encounter--quay--floor',176),anchor.floor('encounter--quay--floor',528)];
const quiet=[anchor.object('courtyard--saved-seat',24),anchor.floor('courtyard--quay--floor',416)];
const exit=[anchor.floor('departure--floor',128),{x:4650,y:1024}];
function pilotInput(p,solids,enemies,point,timer){
    const direction=Math.sign(point.x-p.x),muzzle=p.y2-26;
    const target=enemies.find(e=>e.health>0&&(e.x-p.x)*direction>0&&Math.abs(e.x-p.x)<460&&Math.abs(e.y+e.height-p.y2)<8);
    const blocked=target&&solids.some(r=>r.y<=muzzle&&r.y+r.height>muzzle&&r.x<Math.max(target.x,p.x)&&r.x+r.width>Math.min(target.x,p.x+p.width));
    if(p.grounded&&target&&!blocked)return {left:p.facing!==direction&&direction<0,right:p.facing!==direction&&direction>0,fire:true,jump:false,jumpHeld:false};
    return movement(p,solids,enemies,point,timer);
}
function navigate(world,points){
    const timer={time:world.elapsed,lastJump:-100,held:0};
    let minHealth=world.player.health,minY=world.camera.y,maxY=minY;
    for(const point of points){let reached=false;
        for(let i=0;i<120*18;i++){
            if(world.state==='won'){reached=true;break;}
            const s=worldSnapshot(world,'playing',false),p=s.player;
            if(Math.abs(p.x-point.x)<20&&Math.abs(p.y2-point.y)<3&&p.grounded){reached=true;break;}
            if(world.state!=='playing')throw Error(`Defeated near ${p.x},${p.y2}; target ${point.x},${point.y}`);
            world.update(1/120,pilotInput(p,s.collision,s.enemies,point,timer));timer.time+=1/120;timer.held-=1/120;
            minHealth=Math.min(minHealth,world.player.health);minY=Math.min(minY,world.camera.y);maxY=Math.max(maxY,world.camera.y);
        }
        if(!reached)throw Error(`Stopped at ${world.player.x},${world.player.y2}; target ${point.x},${point.y}`);
        for(let i=0;i<24&&world.state==='playing';i++)world.update(1/120,{left:false,right:false,jump:false,fire:false});
    }
    return {world,minHealth,cameraTravel:maxY-minY};
}
function run(useRecovery=false){const world=new World(source.compile());return navigate(world,[...(useRecovery?recovery:main),...yard,...quiet,...exit]);}
module.exports={source,document,arrival,main,recovery,yard,quiet,exit,pilotInput,navigate,run};
