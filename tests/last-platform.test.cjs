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
    f.world.player.x=document.exit.x;f.world.player.y=2060;f.world.update(1/120,idle);assert.equal(f.world.state,'playing','jumping around the shutter cannot complete the demo');
    complete(f,'platform-open-shutter');assert.equal(f.world.level.exit.enabled,true);
    f.world.update(1/120,idle);assert.equal(f.world.state,'won');f.session.completeStage();
    assert.deepEqual(f.session.state.snapshot().completedStages,['last-platform-demo']);
    assert.equal(f.session.nextDestination.id,'outbound-line');assert.equal(f.session.nextDestination.url,undefined);
    assert.equal(new NarrativeSession('last-platform-demo',new SaveStore(f.disk)).state.has('platform-knows-destination'),true);
});

test('the raised letter cannot be collected from the floor and does not gate the lead',()=>{
    const f=fixture(),letter=f.world.interactables[0],lead=f.session.lead;
    f.world.player.x=letter.x;assert.equal(f.world.interactions.nearest(f.world.player,[letter]),undefined);
    f.world.player.y=1580;assert.equal(f.world.interactions.nearest(f.world.player,[letter]),letter);
    complete(f,'platform-collect-letter');assert.equal(f.session.lead,lead);
    assert.deepEqual(f.session.state.snapshot().keepsakes,['platform-letter']);
    const restart=new World(compileLevel(document));f.session.attach(restart);assert.equal(restart.interactables[0].active,false);
    for(const scene of Object.values(lastPlatformScenes))assert.equal(parseDialogueScene(scene).id,scene.id);
});

test('the demo traverses stacked districts in both directions with normal health and camera follow',()=>{
    const r=planRoute(),w=r.world;
    assert.equal(w.state,'won');assert.ok(w.player.health>0);
    assert.ok(r.maxY-r.minY>800);assert.ok(w.camera.y>1600);
    assert.ok(r.reversals>15,'the route reverses through the public stair, gallery and archive connections');
    assert.equal(r.session.state.has('platform-met-attendant'),false);
    assert.deepEqual(r.session.state.snapshot().keepsakes,[]);
});

test('the departure and archive stairs return to the Registry and its skyline overlook',()=>{
    const r=planRoute([
        {name:'east-stairs',points:[shelf('departure-stair-1'),shelf('departure-stair-0'),{x:8170,y:1824}]},
        {name:'archive-return',points:[...Array.from({length:4},(_,i)=>shelf(`archive-descent-${3-i}`)),shelf('archive-entry-landing'),shelf('registry-east-stair-0'),shelf('registry-east-stair-1'),shelf('registry-gallery-east-landing')]},
        {name:'overlook',points:[shelf('overlook-step-0'),shelf('overlook-step-1'),{x:7182,y:768}]},
    ],{combat:false,spawn:{x:8790,y:2060}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,768);
    assert.ok(r.maxY-r.minY>1100);
});

test('inhabited balconies and freight form a second entrance to the Registry gallery',()=>{
    const r=planRoute(balconyRoute);
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,1056);
    assert.ok(r.world.player.health>0);
    assert.deepEqual(r.session.state.snapshot().keepsakes,['platform-letter']);
});

test('the lower records passage returns beneath the Registry and viaduct to arrivals',()=>{
    const r=planRoute([{name:'lower-return',points:[{x:4800,y:2112},{x:2800,y:2112},{x:2300,y:2016},{x:600,y:2016}]}],{combat:false,spawn:{x:8400,y:2060}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,2016);assert.ok(r.world.player.x<640);
});

test('the canal towpath below missed bridge jumps has a reversible climb to the east square',()=>{
    const r=planRoute([{name:'river-recovery',points:[shelf('river-recovery-0'),shelf('river-recovery-1'),shelf('river-recovery-2'),shelf('viaduct-east-balcony'),{x:4750,y:1728}]}],{combat:false,spawn:{x:3600,y:2060}});
    assert.equal(r.world.state,'playing');assert.equal(r.world.player.y2,1728);
});
