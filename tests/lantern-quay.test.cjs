require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const route=require('./helpers/lantern-quay-route.cjs');
const {World}=require('../src/game/World.ts');
const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
const {SaveStore}=require('../src/narrative/SaveStore.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {createEmptyLevel}=require('../src/levels/createEmptyLevel.ts');

test('the upper crossing and encounter complete with normal health, combat and vertical camera travel',()=>{
    const result=route.run();assert.equal(result.world.state,'won');assert.equal(result.world.defeated,2);
    assert.ok(result.minHealth>0);assert.ok(result.cameraTravel>300);
});
test('an actual missed jump lands on the low walk and rejoins the same exit',()=>{
    const result=route.run(true);assert.equal(result.world.state,'won');assert.ok(result.minHealth>0);assert.ok(result.cameraTravel>400);
});
test('source assemblies, water endpoints and an effect-free quiet scene stay editable and standalone',()=>{
    const d=route.source.document(),w=new World(route.source.compile());
    const story=new NarrativeSession(d.id,new SaveStore({getItem(){throw Error('unexpected campaign read');},setItem(){throw Error('unexpected campaign write');}}));
    story.enter();story.attach(w);assert.equal(story.active,false);assert.equal(w.level.exit.enabled,true);
    for(const fall of w.level.water.falls){assert.ok(fall.height>0);assert.equal(fall.y2,fall.receiver.y);assert.equal(w.level.collision.overlaps(fall),false,'flows must have a clear physical channel');}
    assert.equal(d.interactables[0].effectId,undefined);
    const session=new EditorSession(createEmptyLevel());session.loadSource(route.source);
    session.configureInstance('courtyard',{parameters:{building:400}},d.revision);
    assert.equal(session.document.props.find(p=>p.id==='courtyard--quay--rear-wall').height,400);
    assert.equal(session.layout.operations.length,0);session.undo();assert.equal(session.instances.find(i=>i.id==='courtyard').parameters.building,384);
});

test('moving a place carries its inhabitants, interactions and encounter actors with its geometry',()=>{
    const session=new EditorSession(createEmptyLevel());session.loadSource(route.source);
    const before=session.document;
    session.configureInstance('courtyard',{y:912},before.revision);
    const after=session.document;
    assert.equal(after.npcs[0].y-before.npcs[0].y,-16);
    assert.equal(after.interactables[0].mount.parent,'courtyard--quay--floor');
    const original=new World(route.source.compile()),moved=new World(route.source.compile(session.layout));
    assert.equal(moved.interactables[0].y-original.interactables[0].y,-16);
    session.configureInstance('encounter',{parameters:{width:784}},after.revision);
    assert.equal(session.document.enemies.find(e=>e.kind==='skeleton').x-before.enemies.find(e=>e.kind==='skeleton').x,-16);
});
