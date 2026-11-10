require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {parseLevelDocument,parseLevelJson}=require('../src/levels/LevelValidation.ts');
const {formatDocument}=require('../src/levels/LevelDocument.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {World}=require('../src/game/World.ts');
const {River}=require('../src/world/water/River.ts');
const {Canal}=require('../src/world/water/Canal.ts');
const {CatchBasin}=require('../src/world/water/CatchBasin.ts');
const {Drain}=require('../src/world/water/Drain.ts');
const {Waterfall}=require('../src/world/water/Waterfall.ts');
const document=require('../public/levels/last-platform-rebuild.json');
const world=d=>new World(compileLevel(d));

test('authored networks create concrete water elements without registering physical blockers',()=>{
    const w=world(document),n=w.level.water;
    for(const [id,Type] of [['soul-river',River],['station-canal',Canal],['freight-basin',CatchBasin],['station-drain-west',Drain],['freight-fall',Waterfall]])assert.ok(n.get(id) instanceof Type);
    assert.equal(n.elements.length,11);assert.equal(w.level.solids.length,world({...document,water:[]}).level.solids.length);
    assert.ok(!w.level.solids.some(c=>n.elements.some(e=>e.id===c.owner)));
    const other=world(document);assert.notEqual(n.get('soul-river'),other.level.water.get('soul-river'));
});

test('moving a mounted outlet carries its collector, receiver and both flow endpoints through editor history',()=>{
    const s=new EditorSession(parseLevelDocument(document));
    const network=()=>world(s.document).level.water,before=network();
    const d=s.document,part=d.decorations.find(e=>e.id==='freight-outfall');
    s.apply({levelId:d.id,baseRevision:d.revision,operations:[{op:'upsert',collection:'decorations',value:{...part,x:part.x+40}}]});
    const after=network();
    for(const id of ['freight-collector','freight-basin','freight-fall','basin-overflow'])assert.equal(after.get(id).x-before.get(id).x,40,id);
    assert.equal(after.get('freight-fall').y2,after.get('freight-basin').y);
    s.undo();assert.equal(network().get('freight-fall').x,before.get('freight-fall').x);
    s.redo();assert.equal(network().get('freight-fall').x,after.get('freight-fall').x);
    assert.deepEqual(parseLevelJson(formatDocument(s.document)),s.document);
});

test('editing a receiving surface changes connected fall heights without duplicating coordinates',()=>{
    const d=structuredClone(document),before=world(d).level.water;
    d.water.find(e=>e.id==='station-canal').y+=8;
    const after=world(d).level.water;
    assert.equal(after.get('station-trickle-west').height-before.get('station-trickle-west').height,8);
    assert.equal(after.get('canal-spill').height-before.get('canal-spill').height,-8);
    assert.equal(d.water.find(e=>e.id==='station-trickle-west').height,undefined);
});

test('invalid water graphs are rejected atomically with existing editor state preserved',()=>{
    const cases=[
        [d=>d.water.find(e=>e.id==='freight-fall').from.parent='missing',/Missing water connection/],
        [d=>d.water.find(e=>e.id==='freight-fall').from.socket='missing',/Unknown.*socket/],
        [d=>d.water.find(e=>e.id==='freight-fall').to='freight-collector',/receiving water body/],
        [d=>d.water.find(e=>e.id==='station-canal').y=50,/downward/],
        [d=>d.water.find(e=>e.id==='station-canal').width=200,/misses/],
        [d=>d.water.find(e=>e.id==='freight-basin').mount={parent:'freight-fall',socket:'impact'},/cycle/],
        [d=>d.water.find(e=>e.id==='soul-river').id='arrivals',/unique/],
        [d=>d.water.find(e=>e.id==='soul-river').current=NaN,/integer/],
        [d=>d.water.find(e=>e.id==='soul-river').y=1900,/outside/],
        [d=>d.water.find(e=>e.id==='soul-river').damage=5,/unknown field/],
    ];
    for(const [mutate,message] of cases){
        const s=new EditorSession(parseLevelDocument(document)),before=s.document,bad=structuredClone(before);mutate(bad);
        assert.throws(()=>s.replace(bad,before.revision),message);assert.deepEqual(s.document,before);
    }
});

test('background terrain crossings are explicit and new levels need no hardcoded water layout',()=>{
    const d=structuredClone(require('../public/levels/construction-study.json'));
    assert.ok(world(d).level.water.falls.length>0);
    d.water.find(e=>e.id==='study-fall').behindTerrain=false;
    assert.throws(()=>parseLevelDocument(d),/crosses solid terrain/);
    const custom={...structuredClone(document),id:'new-water-level'};
    assert.equal(world(custom).level.water.falls.length,5);
});

test('deleting a referenced element fails instead of leaving an orphaned flow',()=>{
    const s=new EditorSession(parseLevelDocument(document)),before=s.document;
    assert.throws(()=>s.apply({levelId:before.id,baseRevision:before.revision,operations:[{op:'remove',collection:'water',id:'station-canal'}]}),/Missing water connection/);
    assert.deepEqual(s.document,before);
});
