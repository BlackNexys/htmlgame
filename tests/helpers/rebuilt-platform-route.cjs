require('../register.cjs');
const document=require('../../public/levels/last-platform-rebuild.json');
const {World}=require('../../src/game/World.ts');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const {NarrativeSession}=require('../../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../../src/narrative/SaveStore.ts');
const {pilotInput}=require('./last-platform-route.cjs');
const {floor,object:objectPoint}=require('./route-anchors.cjs').routeAnchors(document);
const approach=id=>objectPoint(id,id==='departure-shutter'?78:10);
// Named beats keep interaction stops independent of waypoint list indices.
const beats=[
 {name:'crossing',points:[floor('concourse',496),floor('viaduct-west',356),floor('viaduct-middle',236),floor('viaduct-east',332),floor('freight-entry',362),{...floor('catch-rise'),drop:true},floor('freight-landing'),floor('freight',708),floor('registry-step'),floor('registry-porch'),floor('registry-approach'),approach('registry-transfer-ledger')],object:'registry-transfer-ledger'},
 {name:'archive',points:[{...floor('archive-descent'),drop:true},{...floor('archive-landing'),drop:true},approach('archive-route-index')],object:'archive-route-index'},
 {name:'departure',points:[{...floor('departure-step'),drop:true},{...floor('departure-landing'),drop:true},{...floor('departure-entry'),drop:true},approach('departure-shutter')],object:'departure-shutter'},
];
const main=beats.flatMap(beat=>beat.points);
const roof=[floor('concourse',496),...['roof-step-1','roof-step-2','roof-step-3'].map(id=>floor(id)),floor('roof-letter',276),...['roof-return-1','roof-return-2','roof-return-3'].map(id=>({...floor(id),drop:true})),floor('viaduct-east',452)];
const catchRoute=[floor('catch-route',2360),floor('catch-rise'),floor('freight-landing'),floor('freight',708)];
function routeInput(p,solids,enemies,point,timer){
 const input=pilotInput(p,solids,enemies,point,timer);
 const rise=point.y<p.y2-4&&solids.some(r=>r.y<p.y2&&r.y>=p.y2-133&&r.x>=p.x2&&r.x-p.x2<110);
 if(p.grounded&&rise&&!input.jump&&timer.time-timer.lastJump>.3){input.jump=true;input.jumpHeld=true;timer.lastJump=timer.time;timer.held=.35;}
 return input;
}
function run(points,{combat=false,spawn}={}){
    const world=new World(compileLevel(document));if(!combat)world.enemies=[];
    if(spawn)world.player.spawn(spawn);
    const session=new NarrativeSession(document.id,new SaveStore());session.enter();session.attach(world);
    const timer={time:0,lastJump:-100,held:0};const tape=[];let minY=Infinity,maxY=-Infinity;
    for(const point of points){
        let reached=false;
        for(let i=0;i<700&&world.state==='playing';i++){
            const p=world.player;
            if(Math.abs(p.x-point.x)<20&&Math.abs(p.y2-point.y)<3&&p.grounded){reached=true;break;}
            const input=routeInput(p,world.level.solids,world.enemies,point,timer);tape.push(input);
            for(let j=0;j<6;j++)world.update(1/120,{...input,jump:input.jump&&j===0});
            timer.time+=.05;timer.held-=.05;minY=Math.min(minY,world.camera.y);maxY=Math.max(maxY,world.camera.y);
        }
        if(!reached)throw Error(`Stopped ${world.player.x.toFixed(0)},${world.player.y2.toFixed(0)} HP${world.player.health}, target ${point.x},${point.y}`);
        for(const object of world.interactables){
            if(object.collected||object.operated)continue;
            if(world.interactions.nearest(world.player,[object])===object)session.complete(session.plan(object),world);
        }
    }
    return {world,session,tape,minY,maxY};
}
module.exports={run,main,beats,roof,catchRoute,floor,document,routeInput};
