require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseLevelDocument}=require('../src/levels/LevelValidation.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {World}=require('../src/game/World.ts');
const {CollisionWorld}=require('../src/world/collision/CollisionWorld.ts');
const {resolveStructures}=require('../src/world/scene/AttachmentResolver.ts');
const {Bridge}=require('../src/world/structures/Bridge.ts');
const {Doorway}=require('../src/world/structures/Doorway.ts');
const {Outfall}=require('../src/world/structures/Outfall.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {selectionBounds}=require('../src/editor/EditorSelection.ts');
const proof=require('../public/levels/construction-study.json');
const fresh=()=>structuredClone(proof);
const idle={left:false,right:false,jump:false,fire:false};
const tick=(world,n,input=idle)=>{for(let i=0;i<n;i++)world.update(1/120,input);};

test('v2 constructs concrete structures at arbitrary positions and retains actual deck thickness',()=>{
    const document=parseLevelDocument(proof),world=new World(compileLevel(document));
    const bridge=world.level.structures.find(s=>s.id==='bridge'),door=world.level.structures.find(s=>s.id==='open-doorway');
    assert.ok(bridge instanceof Bridge);assert.ok(door instanceof Doorway);
    assert.equal(bridge.socket('underside').y,721,'mounts follow the actual deck rather than the open envelope');
    const deck=world.level.solids.find(s=>s.owner==='bridge');assert.deepEqual({x:deck.x,y:deck.y,width:deck.width,height:deck.height},{x:811,y:707,width:317,height:14});
    assert.equal(world.level.solids.filter(s=>s.owner==='open-doorway').length,1);
    assert.equal(door.surfaces().length,3);
    assert.ok(!world.level.solids.some(s=>s.owner==='mounted-outfall'||s.owner==='foreground-rail'||s.owner==='background-wall'));
    assert.equal(document.width,2737);assert.equal(document.height,1301);
});

test('thin arbitrary platforms support fast landings and block underside jumps through shared physics',()=>{
    const w=new World(compileLevel(proof));w.enemies=[];
    w.player.spawn({x:500,y:680});w.player.vy=850;tick(w,40);
    assert.equal(w.player.y2,805);assert.equal(w.player.grounded,true);
    w.player.spawn({x:500,y:849});w.player.vy=0;tick(w,1);tick(w,1,{...idle,jump:true,jumpHeld:true});tick(w,12,{...idle,jumpHeld:true});
    assert.ok(w.player.y>=819,'the real 14-pixel underside blocks the player');
});

test('a doorway opens for actors and projectiles while its overhead lintel remains solid',()=>{
    const w=new World(compileLevel(proof));w.enemies=[];w.player.spawn({x:1680,y:849});tick(w,100,{...idle,right:true});
    assert.ok(w.player.x>1914);assert.equal(w.player.health,5);
    assert.equal(w.level.collision.cast({x:1780,y:770,width:2,height:2},80,0),undefined);
    assert.equal(w.level.collision.cast({x:1700,y:770,width:2,height:2},250,0),undefined);
    assert.notEqual(w.level.collision.cast({x:1700,y:725,width:2,height:2},80,0),undefined);
    assert.equal(w.level.collision.overlaps({x:1780,y:770,width:32,height:52}),false);
});

test('mounts follow parent movement and resize through undo, redo and recompilation',()=>{
    const session=new EditorSession(parseLevelDocument(proof));
    const get=()=>new World(compileLevel(session.document)).level.structures.find(s=>s.id==='mounted-outfall');
    const before=get();assert.ok(before instanceof Outfall);
    const edit=()=>{const d=session.document,b=d.terrain.find(s=>s.id==='bridge');session.apply({levelId:d.id,baseRevision:d.revision,operations:[{op:'upsert',collection:'terrain',value:{...b,x:b.x+40,width:b.width+60}}]});};
    edit();const after=get();assert.equal(after.x-before.x,100);assert.equal(after.y,before.y);
    const selection=selectionBounds(session.document,{collection:'decorations',id:'mounted-outfall'});assert.equal(selection.x,after.x);
    session.undo();assert.equal(get().x,before.x);session.redo();assert.equal(get().x,after.x);
    assert.equal(session.document.decorations.find(s=>s.id==='mounted-outfall').x,-48,'the stored local offset remains local');
});

test('invalid mounts, unsupported structures and stale patches leave the editor untouched',()=>{
    for(const mutate of [d=>d.decorations[1].mount.parent='missing',d=>d.decorations[1].mount.socket='missing',d=>d.decorations[1].mount.parent='mounted-outfall',d=>d.terrain[1].kind='slope',d=>d.terrain[2].thickness=0,d=>d.terrain[4].thickness=100]){
        const session=new EditorSession(parseLevelDocument(proof)),bad=fresh();mutate(bad);
        assert.throws(()=>session.replace(bad,session.document.revision));assert.deepEqual(session.document,parseLevelDocument(proof));
    }
});

test('collider handles update every query and remove precisely one blocker without stale state',()=>{
    const c=new CollisionWorld(),handle=c.register('gate/blocker','gate',{x:100,y:0,width:7,height:100});
    assert.notEqual(c.cast({x:0,y:10,width:1,height:1},200,0),undefined);
    c.update(handle,{x:300,y:0,width:7,height:100,id:'foreign',owner:'other'});assert.equal(c.cast({x:0,y:10,width:1,height:1},200,0),undefined);
    assert.equal(handle.id,'gate/blocker');assert.equal(handle.owner,'gate');
    c.remove(handle);c.remove(handle);assert.equal(c.solids.length,0);
    assert.throws(()=>c.update(handle,{x:0,y:0,width:7,height:100}),/not registered/);
    assert.throws(()=>c.register('bad','test',{x:NaN,y:0,width:1,height:1}),/finite/);
});

test('legacy v1 imports normalize to v2 while preserving geometry and accepting later free edits',()=>{
    const old=require('./fixtures/legacy-lower-passage.json'),d=parseLevelDocument(old);
    assert.equal(d.schemaVersion,2);assert.equal(d.gridSize,48);assert.equal(d.tileSize,undefined);
    const level=compileLevel(d);assert.equal(level.solids.length,old.terrain.length);
    d.terrain[0].width-=1;assert.doesNotThrow(()=>compileLevel(d));
    const invalid=structuredClone(old);invalid.terrain[0].width-=1;assert.throws(()=>parseLevelDocument(invalid),/48-pixel/);
});
