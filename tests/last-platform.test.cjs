require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {World}=require('../src/game/World.ts');
const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../src/narrative/SaveStore.ts');
const {freshCampaign}=require('../src/narrative/NarrativeCatalog.ts');
const {parseDialogueScene}=require('../src/dialogue/DialogueScene.ts');
const {lastPlatformScenes}=require('../src/dialogue/lastPlatformScenes.ts');
const document=require('../public/levels/last-platform-demo.json');
const {planRoute,shelf,balconyRoute}=require('./helpers/last-platform-route.cjs');
const idle={left:false,right:false,jump:false,fire:false};
function fixture(raw=null,preview=true){
    const disk={raw,getItem(){return this.raw;},setItem(k,v){this.raw=v;}};
    const session=new NarrativeSession('last-platform-demo',new SaveStore(disk),preview);
    const world=new World(compileLevel(document));session.enter();session.attach(world);
    return {world,session,disk};
}
function complete(f,effect){const object=f.world.interactables.find(o=>o.definition.effectId===effect);f.session.complete(f.session.plan(object),f.world);return object;}

test('an existing v1 study save loads unchanged discoveries without solving the new demo',()=>{
    const old={...freshCampaign(),facts:['found-transfer-record','learned-next-destination'],keepsakes:['lost-letter'],unlockedStages:['narrative-study','departure-study'],completedStages:['narrative-study']};
    const f=fixture(JSON.stringify(old),false),save=f.session.state.snapshot();
    assert.equal(f.session.allowed,true);assert.equal(f.world.level.exit.enabled,false);
    assert.equal(f.session.plan(f.world.npcs[0]).scene.id,'platform-introduction');
    assert.ok(save.facts.includes('found-transfer-record'));assert.ok(save.completedStages.includes('narrative-study'));
    assert.ok(save.unlockedStages.includes('last-platform-demo'));
    assert.equal(f.session.journal.keepsakes.length,0);assert.equal(f.world.interactables[0].active,true);
    assert.equal(JSON.parse(f.disk.raw).facts.includes('platform-arrival'),true);
});

test('demo evidence, dialogue, Keepsake and stage completion are separate from study fixtures',()=>{
    const f=fixture(null,false);assert.equal(f.session.active,true);
    assert.deepEqual(f.session.plan(f.world.interactables.find(o=>o.definition.kind==='operate')).effects,[]);
    complete(f,'platform-inspect-ledger');assert.equal(f.session.plan(f.world.npcs[0]).scene.id,'platform-record-reaction');
    f.session.complete(f.session.plan(f.world.npcs[0]),f.world);
    assert.equal(f.session.plan(f.world.npcs[0]).scene.id,'platform-farewell');
    assert.equal(f.session.state.has('found-transfer-record'),false);
    assert.equal(f.world.level.exit.enabled,false,'knowing the route does not operate the shutter');
    f.world.player.x=document.exit.x;f.world.player.y=document.exit.y+document.exit.height-52;f.world.update(1/120,idle);assert.equal(f.world.state,'playing','jumping around the shutter cannot complete the demo');
    complete(f,'platform-open-shutter');assert.equal(f.world.level.exit.enabled,true);
    f.world.update(1/120,idle);assert.equal(f.world.state,'won');f.session.completeStage();
    assert.deepEqual(f.session.state.snapshot().completedStages,['last-platform-demo']);
    assert.equal(f.session.nextDestination.id,'outbound-line');assert.equal(f.session.nextDestination.url,undefined);
    assert.equal(new NarrativeSession('last-platform-demo',new SaveStore(f.disk)).state.has('platform-knows-destination'),true);
});

test('the raised letter cannot be collected from the floor and does not gate the lead',()=>{
    const f=fixture(),letter=f.world.interactables[0],lead=f.session.lead;
    f.world.player.x=letter.x;assert.equal(f.world.interactions.nearest(f.world.player,[letter]),undefined);
    f.world.player.y=236;assert.equal(f.world.interactions.nearest(f.world.player,[letter]),letter);
    complete(f,'platform-collect-letter');assert.equal(f.session.lead,lead);
    assert.deepEqual(f.session.state.snapshot().keepsakes,['platform-letter']);
    const restart=new World(compileLevel(document));f.session.attach(restart);assert.equal(restart.interactables[0].active,false);
    for(const scene of Object.values(lastPlatformScenes))assert.equal(parseDialogueScene(scene).id,scene.id);
});

test('the demo traverses stacked districts in both directions with normal health and camera follow',()=>{
    const r=planRoute(),w=r.world;
    assert.equal(w.state,'won');assert.ok(w.player.health>0);
    assert.ok(r.maxY-r.minY>2200);assert.ok(w.camera.y>2800);
    assert.ok(r.reversals>15,'the route reverses through the public stair, gallery and archive connections');
    assert.equal(r.session.state.has('platform-met-attendant'),false);
    assert.deepEqual(r.session.state.snapshot().keepsakes,[]);
});


test('departure and archive stairs climb back to the freight exchange',()=>{
    const r=planRoute([
        {name:'departure-return',points:[...Array.from({length:4},(_,i)=>shelf('departure-stair-'+(3-i))),{x:6190,y:2880}]},
        {name:'archive-return',points:[...Array.from({length:4},(_,i)=>shelf('archive-descent-'+(3-i))),{x:4700,y:2400}]},
    ],{combat:false,spawn:{x:6790,y:3308}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,2400);
    assert.ok(r.maxY-r.minY>700);
});

test('the roof Keepsake reconnects to the upper viaduct with normal combat',()=>{
    const r=planRoute(balconyRoute);
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,1248);
    assert.ok(r.world.player.health>0);assert.deepEqual(r.session.state.snapshot().keepsakes,['platform-letter']);
});

test('the canal service spine returns through freight and the lower station to arrivals',()=>{
    const r=planRoute([
        {name:'canal-return',points:[...Array.from({length:12},(_,i)=>shelf('canal-return-'+i)),{x:2200,y:2400}]},
        {name:'lower-station',points:[...Array.from({length:7},(_,i)=>shelf('station-service-'+(6-i))),{x:2400,y:1632}]},
        {name:'upper-return',points:[...Array.from({length:7},(_,i)=>shelf('station-return-'+i)),{x:2800,y:864},shelf('viaduct-hatch-east'),shelf('viaduct-hatch-west'),{x:2200,y:864},{x:600,y:864}]},
    ],{combat:false,spawn:{x:1300,y:3596}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,864);assert.ok(r.world.player.x<640);
    assert.ok(r.maxY-r.minY>2400);
});

test('missed archive jumps can recover through the canal east stair and departure return',()=>{
    const r=planRoute([
        {name:'canal-east',points:[shelf('canal-east-stair-0'),shelf('canal-east-stair-1'),{x:6780,y:3360}]},
        {name:'archive-index',points:[...Array.from({length:4},(_,i)=>shelf('departure-stair-'+(3-i))),{x:6190,y:2880}]},
    ],{combat:false,spawn:{x:5500,y:3596}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,2880);
});

test('the western inhabited balcony and service room loop back into the canal spine',()=>{
    const r=planRoute([
        {name:'balcony',points:[...Array.from({length:5},(_,i)=>shelf('canal-return-'+i)),shelf('west-room-stair-4'),{x:900,y:3168,drop:true}]},
        {name:'service-room',points:[...Array.from({length:5},(_,i)=>shelf('west-room-stair-'+(4-i))),{x:1200,y:2592}]},
        {name:'freight-return',points:[shelf('west-service-landing'),shelf('canal-return-10'),shelf('canal-return-11'),{x:2200,y:2400}]},
    ],{combat:false,spawn:{x:1300,y:3596}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,2400);
});
