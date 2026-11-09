require('../register.cjs');
const document=require('../../public/levels/last-platform-rebuild.json');
const {World}=require('../../src/game/World.ts');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const {NarrativeSession}=require('../../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../../src/narrative/SaveStore.ts');
const {pilotInput}=require('./last-platform-route.cjs');
const floor=(id,x)=>{const r=document.terrain.find(r=>r.id===id);return {x:x??r.x+r.width/2-16,y:r.y};};
const main=[floor('concourse',2100),floor('viaduct-west',2800),floor('viaduct-middle',3500),floor('viaduct-east',4380),floor('freight-entry'),floor('catch-rise'),floor('freight-landing'),floor('freight',5700),floor('registry-step'),floor('registry-porch'),floor('registry',6940),floor('archive-descent'),floor('archive-landing'),floor('archive',8380),floor('departure-step'),floor('departure-landing'),floor('departure-entry'),floor('departure',10200)];
const roof=[floor('concourse',2140),...['roof-step-1','roof-step-2','roof-step-3'].map(id=>floor(id)),floor('roof-letter',3090),...['roof-return-1','roof-return-2','roof-return-3'].map(id=>floor(id)),floor('freight-entry')];
const catchRoute=[floor('catch-route',4500),floor('catch-rise'),floor('freight-landing'),floor('freight',5700)];
main[1].drop=true;
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
            const input=pilotInput(p,world.level.solids,world.enemies,point,timer);tape.push(input);
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
module.exports={run,main,roof,catchRoute,floor,document};
