// The full-route pilot uses normal combat and keyboard input. Separate geometry
// checks can select a starting foothold and remove enemies to test connections.
require('../register.cjs');
const {World}=require('../../src/game/World.ts');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const {NarrativeSession}=require('../../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../../src/narrative/SaveStore.ts');
const document=require('../../public/levels/last-platform-demo.json');
const idle={left:false,right:false,jump:false,fire:true};
const {floor:at,object:near}=require('./route-anchors.cjs').routeAnchors(document);
const shelf=id=>({...at(id),shaft:true});
const dropShelf=id=>({...shelf(id),drop:true});
const groups=[
    {name:'service',points:[{...at('arrival-concourse',1480)},shelf('viaduct-west'),shelf('viaduct-hatch-west'),shelf('viaduct-hatch-east'),{...at('viaduct-middle',612)},shelf('viaduct-east')]},
    {name:'ledger',points:[...Array.from({length:3},(_,i)=>shelf(`registry-approach-${i}`)),near('platform-inspect-ledger')],effect:'platform-inspect-ledger'},
    {name:'index',points:[shelf('registry-east-stair-0'),dropShelf('registry-east-stair-1'),dropShelf('registry-east-stair-2'),dropShelf('registry-east-landing'),{...at('registry-hall',1500)},{...at('registry-hall',100)},...Array.from({length:7},(_,i)=>shelf(`registry-public-${i}`)),{...at('freight-hall',2588),drop:true},...Array.from({length:4},(_,i)=>shelf(`archive-descent-${i}`)),near('platform-decode-route')],effect:'platform-decode-route'},
    {name:'shutter',points:[shelf('departure-stair-0'),...Array.from({length:3},(_,i)=>dropShelf(`departure-stair-${i+1}`)),near('platform-open-shutter',74)],effect:'platform-open-shutter'},
    {name:'exit',points:[{...at('departure-foundations',906)}]},
];
const balconyRoute=[
    {name:'balcony',points:[...Array.from({length:5},(_,i)=>shelf(`roof-stair-${i}`)),near('platform-collect-letter',0)],effect:'platform-collect-letter'},
    {name:'freight',points:[{...at('arrival-concourse',900)},...groups[0].points,...groups[1].points],effect:'platform-inspect-ledger'},
];

const {pilotInput}=require('./platformer-pilot.cjs');

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

