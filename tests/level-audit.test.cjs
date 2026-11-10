require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseLevelDocument}=require('../src/levels/LevelValidation.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {World}=require('../src/game/World.ts');
const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../src/narrative/SaveStore.ts');
const {pilotInput,planRoute}=require('./helpers/last-platform-route.cjs');
const rebuilt=require('./helpers/rebuilt-platform-route.cjs');
const folder=path.join(__dirname,'../public/levels');
const documents=fs.readdirSync(folder).filter(f=>f.endsWith('.json')&&f!=='level.schema.json')
    .map(f=>JSON.parse(fs.readFileSync(path.join(folder,f),'utf8')));
const routed=['construction-study','departure-study','dialogue-course','last-platform-demo','last-platform-rebuild','lower-passage','movement-course','narrative-study','npc-study','sluice-exchange'];
test('every shipped map has a completion route in this audit',()=>{
    assert.deepEqual(documents.map(d=>d.id).sort(),routed.toSorted());
});
const idle={left:false,right:false,jump:false,fire:false};
function create(id){
    const w=new World(compileLevel(documents.find(d=>d.id===id)));
    const session=new NarrativeSession(id,new SaveStore(),true);session.enter();session.attach(w);
    return {w,session};
}
function walk(w,points,onArrival=()=>{}){
    const timer={time:0,lastJump:-100,held:0};
    for(const point of points){
        let reached=false;
        for(let i=0;i<600&&w.state==='playing';i++){
            const p=w.player;
            if(Math.abs(p.x-point.x)<20&&Math.abs(p.y2-point.y)<3&&p.grounded){reached=true;break;}
            const input=pilotInput(p,w.level.solids,w.enemies,point,timer);
            // Jump before an overhead ledge, whose underside is above standing height.
            const rise=point.y<p.y2-4&&w.level.solids.some(r=>r.y<p.y2&&r.y>=p.y2-133&&r.x>=p.x2&&r.x-p.x2<110);
            if(p.grounded&&rise&&!input.jump&&timer.time-timer.lastJump>.3){input.jump=true;input.jumpHeld=true;timer.lastJump=timer.time;timer.held=.35;}
            for(let j=0;j<6;j++)w.update(1/120,{...input,jump:input.jump&&j===0});
            timer.time+=.05;timer.held-=.05;
        }
        assert.ok(reached||w.state==='won',`stopped at ${w.player.x},${w.player.y2}, HP ${w.player.health}; target ${point.x},${point.y}`);
        onArrival(point);
    }
}
function won(w){assert.equal(w.state,'won');assert.ok(w.player.health>0);}

for(const raw of documents)test(`${raw.id}: current format, supported entry and portable workshop document`,()=>{
    assert.equal(raw.schemaVersion,2);
    for(const r of [...raw.terrain,...raw.decorations])assert.ok(r.kind,`${r.id} needs an explicit structure type`);
    const d=parseLevelDocument(raw),editor=new EditorSession(d);
    assert.deepEqual(parseLevelDocument(JSON.parse(JSON.stringify(editor.document))),d);
    const {w}=create(d.id);
    for(const actor of [...w.enemies,...w.npcs]){
        if(actor.kind==='ghost')continue;
        assert.ok(w.level.solids.some(r=>Math.abs(r.y-actor.y2)<1&&r.x<actor.x2&&r.x+r.width>actor.x),`${actor.constructor.name} starts without a supporting floor at ${actor.x},${actor.y2}`);
    }
    for(let i=0;i<60;i++)w.update(1/120,idle);
    assert.equal(w.state,'playing');assert.equal(w.player.health,5);
    assert.ok(w.player.grounded,'spawn must settle on solid ground');
    assert.ok(Math.abs(w.player.y2-d.spawn.y)<1,'spawn ground must match its authored feet');
    assert.ok(!w.level.collision.overlaps(w.player));
});

for(const id of ['departure-study','npc-study'])test(`${id}: complete with ordinary movement and combat`,()=>{
    const {w}=create(id);walk(w,[{x:w.level.exit.x+16,y:576}]);won(w);
});

test('lower-passage: ground route and combat reaches the exit',()=>{
    const {w}=create('lower-passage');let jumping=false;
    for(let i=0;i<120*25&&w.state==='playing';i++){
        const p=w.player,obstacle=w.level.solids.some(r=>r.y<576&&r.y+r.height>p.y&&r.x>=p.x2&&r.x<p.x2+65);
        const jump=p.grounded&&obstacle&&!jumping;
        w.update(1/120,{...idle,right:true,fire:true,jump,jumpHeld:jump||!p.grounded&&p.vy<0});jumping=jump;
    }won(w);
});

test('dialogue-course: both optional overlooks connect to the exit',()=>{
    const {w}=create('dialogue-course');
    walk(w,[{x:850,y:576},{x:1120,y:480},{x:1750,y:624,drop:true},{x:1980,y:576},{x:2290,y:480},{x:3000,y:624,drop:true},{x:3280,y:624}]);won(w);
});

test('construction-study: upper approach, thin bridge and open doorway connect to the exit',()=>{
    const {w}=create('construction-study');
    walk(w,[{x:530,y:805},{x:1000,y:707},{x:1302,y:721},{x:1850,y:901,drop:true},{x:2350,y:901},{x:2610,y:901}]);won(w);
});

test('narrative-study: floor-level Keepsake, evidence and gate are physically accessible',()=>{
    const {w,session}=create('narrative-study');
    walk(w,[{x:670,y:576,id:'lost-letter'},{x:1090,y:576,id:'transfer-ledger'},{x:1430,y:576,id:'route-index'},{x:1920,y:576,id:'departure-gate'},{x:2180,y:576}],point=>{
        if(!point.id)return;
        const object=w.interactables.find(o=>o.id===point.id);
        assert.equal(w.interactions.nearest(w.player,[object]),object);
        session.complete(session.plan(object),w);
    });won(w);assert.equal(w.interactables.find(o=>o.id==='lost-letter').collected,true);
});

test('movement-course: sprint, gap and vertical wall-jump route reaches the exit',()=>{
    const {w}=create('movement-course');let nextJump=0,wallJumps=0;
    for(let step=0;step<120*30&&w.state==='playing';step++){
        const p=w.player,obstacle=w.level.solids.some(r=>r.y<p.y2&&r.y+r.height>p.y&&r.x>=p.x2&&r.x<p.x2+65);
        const wall=p.movement.wallSide===1&&p.vy>=0;
        const jump=step>=nextJump&&((p.grounded&&(obstacle||p.x>1310&&p.x<1460))||wall);
        if(jump){nextJump=step+20;if(wall&&!p.grounded)wallJumps++;}
        w.update(1/120,{...idle,right:true,sprint:true,fire:true,jump,jumpHeld:jump||!p.grounded&&p.vy<0});
    }won(w);assert.ok(wallJumps>=3);
});

test('last-platform-demo: full vertical district, evidence, shutter and exit',()=>won(planRoute().world));
test('last-platform-rebuild: full forward route, evidence, shutter and exit',()=>{
    const {world}=rebuilt.run(rebuilt.main,{combat:true});
    for(let i=0;i<240&&world.state==='playing';i++)world.update(1/120,{...idle,right:true,fire:true});
    won(world);
});

test('sluice-exchange: folded main route reaches the exit with normal combat',()=>won(require('./helpers/sluice-exchange-route.cjs').run().world));
