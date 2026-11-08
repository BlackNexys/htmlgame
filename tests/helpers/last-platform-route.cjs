// The full-route pilot uses normal combat and keyboard input. Separate geometry
// checks can select a starting foothold and remove enemies to test connections.
require('../register.cjs');
const {World}=require('../../src/game/World.ts');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const {NarrativeSession}=require('../../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../../src/narrative/SaveStore.ts');
const document=require('../../public/levels/last-platform-demo.json');
const idle={left:false,right:false,jump:false,fire:true};
const shelf=id=>{const r=document.terrain.find(r=>r.id===id);return {x:r.x+r.width/2-16,y:r.y,shaft:true};};
const groups=[
    {name:'service',points:[{x:2500,y:2016},...Array.from({length:3},(_,i)=>shelf(`viaduct-approach-${i}`)),{x:3900,y:1728},shelf('viaduct-east-balcony'),{x:4750,y:1728}]},
    {name:'ledger',points:[...Array.from({length:3},(_,i)=>shelf(`registry-public-stair-${i}`)),{x:6600,y:1344},shelf('registry-east-stair-0'),shelf('registry-east-stair-1'),shelf('registry-gallery-east-landing'),{x:5510,y:1056}],effect:'platform-inspect-ledger'},
    {name:'index',points:[{x:6370,y:1056},shelf('registry-east-stair-1'),shelf('registry-east-stair-0'),shelf('archive-entry-landing'),...Array.from({length:4},(_,i)=>shelf(`archive-descent-${i}`)),{x:8140,y:1824}],effect:'platform-decode-route'},
    {name:'shutter',points:[shelf('departure-stair-0'),shelf('departure-stair-1'),{x:8796,y:2112}],effect:'platform-open-shutter'},
    {name:'exit',points:[{x:9160,y:2112}]},
];
const balconyRoute=[
    {name:'balcony',points:[shelf('frontage-stair-0'),shelf('frontage-stair-1'),shelf('frontage-stair-2'),{x:1510,y:1632},{x:1310,y:1632}],effect:'platform-collect-letter'},
    {name:'freight',points:[{x:1530,y:1632},shelf('roof-step-0'),shelf('roof-step-1'),{x:2200,y:1344},{x:4100,y:1344},shelf('freight-entry-step'),shelf('registry-service-step'),shelf('registry-service-landing'),{x:5510,y:1056}],effect:'platform-inspect-ledger'},
];

function pilotInput(p,solids,enemies,point,timer){
    const direction=Math.abs(point.x-p.x)>8?Math.sign(point.x-p.x):0,edge=direction>0?p.x2:p.x;
    const obstacle=direction && solids.some(r=>r.y<p.y2-1 && r.y+r.height>p.y && (direction>0?r.x>=edge-.01&&r.x<edge+85:r.x+r.width<=edge+.01&&r.x+r.width>edge-85));
    const probe=edge+direction*8;
    const gap=direction && !solids.some(r=>Math.abs(r.y-p.y2)<3 && probe>=r.x && probe<=r.x+r.width);
    const foe=enemies.some(e=>e.health>0 && (e.x-p.x)*direction>0 && Math.abs(e.x-p.x)<130 && Math.abs(e.y+e.height-p.y2)<90);
    const jump=direction && (p.grounded && (obstacle || gap&&(point.shaft||point.y<=p.y2+4) || foe) || p.movement.wallSide===direction && p.vy>=0 && point.y<p.y2) && timer.time-timer.lastJump>.3;
    if(jump){timer.lastJump=timer.time;timer.held=.35;}
    return {...idle,left:direction<0,right:direction>0,jump:!!jump,jumpHeld:timer.held>0};
}

function planRoute(route=groups,{combat=true,spawn,onGroup=()=>{}}={}){
    const world=new World(compileLevel(document));
    if(!combat)world.enemies=[];
    if(spawn){world.player.spawn(spawn);world.update(1/120,{...idle,fire:false});world.camera.follow(world.player,world.level);}
    const session=new NarrativeSession('last-platform-demo',new SaveStore(),true);session.enter();session.attach(world);
    const timer={time:0,lastJump:-100,held:0};let minY=world.camera.y,maxY=world.camera.y,reversals=0,lastDirection=1;
    const result=[];
    const tick=(input,tape)=>{
        tape.push(input);
        for(let i=0;i<6;i++)world.update(1/120,{...input,jump:input.jump&&i===0});
        timer.time+=.05;timer.held-=.05;minY=Math.min(minY,world.camera.y);maxY=Math.max(maxY,world.camera.y);
    };
    for(const group of route){
        const tape=[];
        for(const point of group.points){
            let reached=false;
            for(let i=0;i<500 && world.state==='playing';i++){
                const p=world.player,delta=point.x-p.x;
                if(Math.abs(delta)<20 && Math.abs(p.y2-point.y)<3 && p.grounded){reached=true;break;}
                const direction=Math.abs(delta)>8?Math.sign(delta):0;
                if(direction && direction!==lastDirection){reversals++;lastDirection=direction;}
                tick(pilotInput(p,world.level.solids,world.enemies,point,timer),tape);
            }
            if(!reached && world.state!=='won')throw Error(`Route stopped at ${world.player.x.toFixed(1)},${world.player.y2.toFixed(1)} (HP ${world.player.health}), aiming for ${point.x},${point.y}`);
            for(let i=0;i<6 && world.state==='playing';i++)tick({...idle,jumpHeld:false},tape);
        }
        result.push({name:group.name,tape,x:world.player.x,y:world.player.y2,cameraY:world.camera.y,health:world.player.health,effect:group.effect});
        onGroup(result[result.length-1]);
        if(group.effect){const object=world.interactables.find(o=>o.definition.effectId===group.effect);if(world.interactions.nearest(world.player,[object])!==object)throw Error(`Object out of reach: ${object.id}`);session.complete(session.plan(object),world);}
    }
    return {world,session,groups:result,minY,maxY,reversals};
}
module.exports={planRoute,groups,balconyRoute,shelf,pilotInput};

