require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CollisionWorld}=require('../src/world/collision/CollisionWorld.ts');
const {PlayerMovement}=require('../src/game/movement/PlayerMovement.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {World}=require('../src/game/World.ts');
const source=require('../src/content/levels/lantern-quay.level.ts').default;
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {createEmptyLevel}=require('../src/levels/createEmptyLevel.ts');
const idle={left:false,right:false,down:false,up:false,jump:false,fire:false};
const actor=(x=120,y=48)=>({x,y,width:32,height:52,vx:0,vy:0,grounded:false,facing:1});
const setup=()=>{const c=new CollisionWorld();c.register('upper','upper',{x:100,y:100,width:200,height:8},'one-way');c.register('lower','lower',{x:100,y:200,width:200,height:8},'one-way');c.register('floor','floor',{x:0,y:300,width:600,height:40});return c;};

test('one-way surfaces catch fast downward crossings but have no ceiling or side faces',()=>{
    for(const method of ['sweep','move']){
        const c=setup(),b=actor(120,0);b.vy=2000;c[method](b,.1);
        assert.equal(b.y,48);assert.equal(b.grounded,true);
        b.y=120;b.vy=-1000;c[method](b,.1);assert.equal(b.y,20);
        b.x=40;b.y=80;b.vx=1000;b.vy=0;c[method](b,.1);assert.equal(b.x,140);
        const contacts=c.contacts(b);assert.equal(contacts.left,false);assert.equal(contacts.right,false);assert.equal(contacts.ceiling,false);
    }
    const c=setup(),b=actor(0,0);b.vx=2000;b.vy=1000;c.sweep(b,.1);
    assert.equal(b.y,48,'diagonal landing tests horizontal overlap at the crossing');
});

test('fresh Down drops only this actor and one floor, without a buffered jump',()=>{
    const c=setup(),b=actor(),other=actor(),m=new PlayerMovement(b,c,600);
    m.update(1/120,{...idle,down:true,jump:true});
    assert.ok(b.y>48);assert.ok(b.vy>0);assert.equal(m.jumpedThisStep,false);
    assert.equal(c.contacts(other).ground,true,'another actor keeps its support');
    for(let i=0;i<100;i++)m.update(1/120,{...idle,down:true});
    assert.equal(b.y+b.height,200,'holding Down stops on the next platform');
    m.update(1/120,idle);m.update(1/120,{...idle,down:true});
    for(let i=0;i<100;i++)m.update(1/120,{...idle,down:true});
    assert.equal(b.y+b.height,300);assert.equal(m.crouched,true,'ordinary solid ground still crouches');
    b.y=48;b.height=52;b.vy=0;assert.equal(c.contacts(b).ground,true,'cleared platforms become landable again');
});

test('holding Down before landing does not automatically drop through',()=>{
    const c=setup(),b=actor(120,0),m=new PlayerMovement(b,c,600);
    for(let i=0;i<100;i++)m.update(1/120,{...idle,down:true});
    assert.equal(b.y+b.height,100);
});

test('one-way footing supports enemies without blocking stance, projectiles or sight',()=>{
    const c=setup();assert.equal(c.hasSupport({x:120,y:100,width:2,height:8}),true);
    assert.equal(c.hasSupport({x:120,y:110,width:2,height:8}),false);
    assert.equal(c.overlaps({x:120,y:95,width:32,height:52}),false);
    assert.equal(c.cast({x:120,y:50,width:2,height:2},0,180),undefined);
    assert.notEqual(c.cast({x:120,y:250,width:2,height:2},0,100),undefined);
});

test('the source-backed shelter roof compiles into a one-way collider',()=>{
    const document=source.document(),level=compileLevel(document),world=new World(level);
    const roof=world.level.solids.find(r=>r.owner==='courtyard--shelter-roof');
    assert.equal(roof.collision,'one-way');
    assert.equal(world.level.structures.find(s=>s.id===roof.owner).surfaces().length,0,'separate canopy art needs no extra terrain strip');
    assert.equal(roof.y,document.terrain.find(r=>r.id==='courtyard--quay--floor').y-190);
    const invalid=structuredClone(document);invalid.terrain.find(r=>r.id==='courtyard--shelter-roof').kind='wall';
    assert.throws(()=>compileLevel(invalid),/one-way collision requires/);
    const session=new EditorSession(createEmptyLevel());session.loadSource(source);
    session.configureInstance('courtyard',{y:912},session.document.revision);
    const moved=new World(source.compile(session.layout));
    assert.equal(moved.level.solids.find(r=>r.owner===roof.owner).y,roof.y-16);
    assert.equal(moved.level.solids.find(r=>r.owner===roof.owner).collision,'one-way');
    session.undo();assert.equal(new World(source.compile(session.layout)).level.solids.find(r=>r.owner===roof.owner).y,roof.y);
});
