require('../register.cjs');
const document=require('../../public/levels/sluice-exchange.json');
const {World}=require('../../src/game/World.ts');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
const {NarrativeSession}=require('../../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../../src/narrative/SaveStore.ts');
const {routeAnchors}=require('./route-anchors.cjs');
const {pilotInput}=require('./platformer-pilot.cjs');
const {floor:anchor,object}=routeAnchors(document);
const floor=(id,offset,options={})=>({...anchor(id,offset),shaft:true,...options});
const drop=(id,offset)=>floor(id,offset,{drop:true});
const inspect=id=>({...object(id),object:id});
const gapFall=(from,to)=>{const a=document.terrain.find(r=>r.id===from),b=document.terrain.find(r=>r.id===to);return {x:a.x+a.width+56,y:b.y,drop:true};};
const upper=[floor('promenade',700),floor('viaduct-west',450),floor('viaduct-middle',400),floor('viaduct-east',440),drop('cargo-apron',800)];
const gallery=[drop('gallery-drop',40),floor('gallery-step',48),floor('gallery-porch',48),inspect('manifold-diagram'),drop('east-walk',500),drop('east-apron',128),drop('east-step',128),drop('east-turn',300)];
const middle=[drop('east-catch',80),drop('middle-east',1000),floor('middle-east',400),floor('middle-mid',680),floor('middle-west',464),floor('middle-turn',448),floor('pump-corner',192),drop('west-turn',200),drop('west-step',144),drop('west-landing',136),drop('pump-room',240)];
const lower=[drop('switchback-catch',128),drop('lower-start',800),floor('lower-bridge-west',400),floor('lower-bridge-mid',400),floor('lower-bridge-east',400),drop('lower-entry',160),drop('lower-drop',64),drop('lower-recovery',160)];
const finale=[floor('lower-recovery-step',136),floor('lower-recovery-join',136),floor('lower-works',1000),drop('exit-step',124),drop('exit-landing',124),drop('departure',448),{x:document.exit.x+4,y:document.terrain.find(r=>r.id==='departure').y}];
const main=[...upper,...gallery,...middle,...lower,...finale];
const roof=[floor('promenade',288),...['roof-step-1','roof-step-2','roof-step-3'].map(id=>floor(id)),inspect('signal-note'),...['roof-return-1','roof-return-2','roof-return-3'].map(id=>drop(id)),drop('viaduct-east',500),upper[4]];
const upperRecovery=[...upper.slice(0,2),gapFall('viaduct-west','upper-catch'),floor('upper-catch',2740),floor('upper-recovery',128),...gallery];
const culvert=[floor('culvert-passage',360,{crouch:true}),inspect('pressure-slate'),floor('culvert-passage',556,{crouch:true}),floor('pump-room',350,{crouch:true}),floor('pump-room',420)];
const lowerRecovery=[...lower.slice(0,2),gapFall('lower-start','lower-catch'),floor('lower-catch',2120),floor('lower-recovery',128),...finale];
function routeInput(p,solids,enemies,point,timer){
    const direction=Math.abs(point.x-p.x)>8?Math.sign(point.x-p.x):0;
    if(p.grounded&&direction&&p.vx*direction<0)return {left:direction<0,right:direction>0,fire:true,down:!!point.crouch,jump:false,jumpHeld:false};
    const threat=p.grounded&&enemies.find(e=>e.health>0&&Math.abs(e.y+e.height-p.y2)<64&&(e.x-p.x)*direction>0&&Math.abs(e.x-p.x)<(e.kind==='ghoul'?250:140)&&['ghoul','wight'].includes(e.kind));
    // Use the existing counters: low fire for ghouls, sustained fire during a
    // wight's open windup/recovery. Do not jump away from every firing window.
    if(threat&&!point.crouch)return {left:false,right:false,down:threat.kind==='ghoul',fire:true,jump:false,jumpHeld:false};
    const input=pilotInput(p,solids,enemies,point,timer);
    const rise=point.y<p.y2-4&&solids.some(r=>r.y<p.y2&&r.y>=p.y2-133&&r.x>=p.x2&&r.x-p.x2<110);
    if(p.grounded&&rise&&!input.jump&&timer.time-timer.lastJump>.3){input.jump=true;input.jumpHeld=true;timer.lastJump=timer.time;timer.held=.35;}
    if(point.crouch)return {...input,down:true,jump:false,jumpHeld:false};
    return input;
}
function run(points=main,{combat=true,onPoint=()=>{},settleSeconds=0}={}){
    const world=new World(compileLevel(document));if(!combat)world.enemies=[];
    const session=new NarrativeSession(document.id,new SaveStore());session.enter();session.attach(world);
    const timer={time:0,lastJump:-100,held:0};let minY=world.camera.y,maxY=world.camera.y,minHealth=5,crouched=false;
    const reached=[];
    for(const point of points){
        let arrived=false;
        for(let step=0;step<800&&world.state==='playing';step++){
            const p=world.player;
            if(Math.abs(p.x-point.x)<20&&Math.abs(p.y2-point.y)<3&&p.grounded){arrived=true;break;}
            const input=routeInput(p,world.level.solids,world.enemies,point,timer);
            for(let j=0;j<6;j++)world.update(1/120,{...input,jump:input.jump&&j===0});
            timer.time+=.05;timer.held-=.05;minY=Math.min(minY,world.camera.y);maxY=Math.max(maxY,world.camera.y);minHealth=Math.min(minHealth,p.health);crouched||=p.height===32;
        }
        if(!arrived&&world.state!=='won')throw Error(`Sluice route stopped ${world.player.x.toFixed(1)},${world.player.y2.toFixed(1)} HP${world.player.health}; target ${point.x},${point.y}`);
        if(point.object){const o=world.interactables.find(o=>o.id===point.object);if(world.interactions.nearest(world.player,[o])!==o)throw Error(`Sluice inspection out of reach: ${point.object}`);session.complete(session.plan(o),world);}
        if(world.state==='playing'&&settleSeconds){
            for(let i=0;i<Math.round(settleSeconds*120);i++){world.update(1/120,{left:false,right:false,jump:false,jumpHeld:false,fire:true});minHealth=Math.min(minHealth,world.player.health);}
            timer.time+=settleSeconds;timer.held=0;
        }
        reached.push({x:world.player.x,y:world.player.y2,cameraY:world.camera.y});onPoint(point,world);
    }
    return {world,session,reached,minY,maxY,minHealth,crouched,seconds:timer.time};
}
module.exports={document,main,upper,gallery,middle,lower,finale,roof,upperRecovery,culvert,lowerRecovery,run,routeInput};
