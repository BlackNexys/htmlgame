require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const {defineLevel,defineAssembly,SceneBuilder}=require('../src/levels/source/index.ts');
const {formatLevelSource}=require('../src/levels/source/SourceExport.ts');
const {createEmptyLevel}=require('../src/levels/createEmptyLevel.ts');
const {World}=require('../src/game/World.ts');
const {CollisionWorld}=require('../src/world/collision/CollisionWorld.ts');
const metadata={id:'composition-proof',name:'Composition proof',width:1920,height:1200,spawn:{x:100,y:400},exit:{x:1750,y:292,width:64,height:108}};
const kit=()=>defineAssembly(s=>{
    s.add('terrain',{id:'deck',kind:'bridge',x:0,y:0,width:600,height:180,thickness:14});
    s.add('props',{id:'bench',asset:'confluence-bench',x:20,y:-64,width:128,height:64,mount:{parent:'deck',socket:'topLeft'}});
    s.add('water',{id:'drain',kind:'drain',x:64,y:20,width:80,height:32,mount:{parent:'deck',socket:'bottomLeft'}});
    s.add('water',{id:'receiver',kind:'basin',x:40,y:300,width:160,height:48});
    s.add('water',{id:'fall',kind:'waterfall',x:0,y:0,width:20,from:{parent:'drain',socket:'mouth'},to:'receiver'});
    s.add('enemies',{id:'guard',kind:'zombie',x:400,y:0,patrol:{left:360,right:460}});
});
const source=(offset=400)=>defineLevel(metadata,s=>{
    s.place('west',{x:0,y:offset},kit());s.place('east',{x:1200,y:offset},kit());
});

test('assemblies compile local geometry, actor patrols, mounted art and water into stable independent instances',()=>{
    const a=source().document(),w=new World(source().compile());
    assert.equal(a.terrain[1].id,'east--deck');assert.equal(a.terrain[1].x,1200);
    assert.deepEqual(a.enemies[1].patrol,{left:1560,right:1660});
    const east=w.level.structures.find(s=>s.id==='east--deck');
    assert.equal(east.socket('underside').y,414);
    assert.equal(w.level.solids.find(s=>s.owner===east.id).height,14);
    const bench=w.level.props.find(p=>p.id==='east--bench');assert.equal(bench.x,1220);assert.equal(bench.y,336);
    const fall=w.level.water.get('east--fall');assert.equal(fall.y2,700);assert.ok(fall.height>0);assert.ok(fall.x>1200);
    assert.equal(w.level.solids.length,2,'props and water remain nonphysical');
});

test('moving an assembly carries all attachments once and receiver references recompute the fall',()=>{
    const a=new World(source().compile()),b=new World(source(480).compile());
    for(const id of ['west--drain','west--receiver','west--fall'])assert.equal(b.level.water.get(id).y-a.level.water.get(id).y,80,id);
    assert.equal(b.level.water.get('west--fall').height,a.level.water.get('west--fall').height);
    assert.equal(b.level.props[0].y-a.level.props[0].y,80);
});

test('nested assembly placement preserves child identities and exposes checked references for external connections',()=>{
    const parent=defineAssembly(s=>s.place('inner',{x:20,y:30},defineAssembly(t=>t.add('decorations',{id:'trim',x:0,y:0,width:30,height:12}))));
    const s=new SceneBuilder(),ref=s.place('outer',{x:100,y:200},parent);
    assert.equal(ref.child('inner--trim'),'outer--inner--trim');
    assert.deepEqual(s.snapshot().decorations[0],{id:'outer--inner--trim',x:120,y:230,width:30,height:12});
    assert.throws(()=>ref.child('missing'),/no child/);
    assert.throws(()=>s.place('outer',{x:0,y:0},parent),/Duplicate assembly instance/);
});

test('assembly snapshots, inputs and repeated builds cannot share mutable placements',()=>{
    const d=source().document();d.terrain[0].width=1;
    assert.equal(source().document().terrain[0].width,600);
    const assembly=kit(),snapshot=assembly.snapshot();snapshot.props[0].x=900;
    assert.equal(assembly.snapshot().props[0].x,20);
    const s=new SceneBuilder(),part={id:'wall',x:0,y:0,width:30,height:30};s.add('terrain',part);part.width=900;
    assert.equal(s.snapshot().terrain[0].width,30);
});

test('code authoring still rejects overlapping collision, missing mounts, upward falls and invalid spawn',()=>{
    assert.throws(()=>defineLevel(metadata,s=>{s.place('west',{x:0,y:400},kit());s.place('east',{x:10,y:400},kit());}).compile(),/overlaps/);
    const broken=defineAssembly(s=>s.add('props',{id:'prop',asset:'confluence-bench',x:0,y:0,mount:{parent:'missing',socket:'topLeft'}}));
    assert.throws(()=>new SceneBuilder().place('room',{x:0,y:0},broken),/missing local child/);
    assert.throws(()=>defineLevel({...metadata,spawn:{x:100,y:410}},s=>s.place('room',{x:0,y:400},kit())).compile(),/spawn.*overlaps/);
    assert.throws(()=>defineLevel(metadata,s=>{
        s.add('water',{id:'source',kind:'basin',x:0,y:700,width:100,height:20},{id:'target',kind:'basin',x:0,y:600,width:100,height:20},
        {id:'fall',kind:'waterfall',x:0,y:0,width:20,from:{parent:'source',socket:'overflow'},to:'target',overRim:true});
    }).compile(),/water|down|socket/);
});

test('a compiled doorway keeps its passage and projectiles open while its lintel remains physical',()=>{
    const d=createEmptyLevel();d.terrain.push({id:'door',kind:'doorway',x:800,y:400,width:128,height:176,thickness:16});
    const {compileLevel}=require('../src/levels/LevelCompiler.ts'),w=new World(compileLevel(d));
    assert.equal(w.level.solids.filter(s=>s.owner==='door').length,1);
    assert.equal(w.level.collision.cast({x:760,y:480,width:2,height:2},220,0),undefined);
    assert.notEqual(w.level.collision.cast({x:760,y:405,width:2,height:2},220,0),undefined);
});

test('collider handles update and remove the same physical blocker without stale state',()=>{
    const c=new CollisionWorld(),h=c.register('gate/blocker','gate',{x:100,y:0,width:7,height:100});
    assert.ok(c.cast({x:0,y:10,width:1,height:1},200,0));c.update(h,{x:300,y:0,width:7,height:100});
    assert.equal(c.cast({x:0,y:10,width:1,height:1},200,0),undefined);c.remove(h);assert.equal(c.solids.length,0);
});

test('TypeScript snapshot export compiles through the CLI and preserves the complete scene',()=>{
    // Put the source in the documented directory so its relative import is exercised.
    const target=path.resolve('src/content/levels/export-proof.level.ts'),output=path.join(os.tmpdir(),`underworld-export-${process.pid}.json`);
    assert.equal(fs.existsSync(target),false);
    try{
        fs.writeFileSync(target,formatLevelSource(source().document()),{flag:'wx'});
        const result=spawnSync(process.execPath,['scripts/levels.cjs','build',target,output],{encoding:'utf8'});
        assert.equal(result.status,0,result.stderr);
        assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),source().document());
        const again=spawnSync(process.execPath,['scripts/levels.cjs','build',target,output],{encoding:'utf8'});
        assert.equal(again.status,1,'existing export files are protected');
    }finally{fs.rmSync(target,{force:true});fs.rmSync(output,{force:true});}
});

