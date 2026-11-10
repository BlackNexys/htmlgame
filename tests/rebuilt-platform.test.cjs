const {test}=require('node:test');
const assert=require('node:assert/strict');
const {run,main,roof,catchRoute,document}=require('./helpers/rebuilt-platform-route.cjs');
test('rebuilt main route reaches all evidence and releases the departure shutter with ordinary combat',()=>{
    const {world,session}=run(main,{combat:true});
    assert.ok(world.player.health>0);assert.equal(world.level.exit.enabled,true);
    assert.ok(session.journal.facts.includes('platform-knows-destination'));
    for(let i=0;i<240;i++)world.update(1/120,{right:true,left:false,jump:false,fire:true});
    assert.equal(world.state,'won');
});
test('roof loop collects its Keepsake and rejoins ahead with vertical camera travel',()=>{
    const {session,minY,maxY,world}=run(roof,{combat:true});
    assert.ok(world.player.health>0);
    assert.ok(session.journal.keepsakes.includes('platform-letter'));assert.ok(maxY-minY>300);
});
test('a missed viaduct jump falls onto a route that reconnects forward',()=>{
    const {world}=run(catchRoute,{combat:true,spawn:{x:2956,y:1080}});
    assert.ok(world.player.x>5900);assert.equal(world.player.health,5);
});
test('rebuild always isolates progress and uses only existing campaign stage IDs',()=>{
    const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
    let writes=0;const store={load(){throw Error('Preview must not load the campaign');},save(){writes++;}};
    const session=new NarrativeSession(document.id,store);session.enter();
    assert.equal(session.preview,true);assert.equal(writes,0);
    assert.ok(!session.state.snapshot().unlockedStages.includes(document.id));
});

test('every construction support lands on the first floor under its own footprint',()=>{
    const {compileLevel}=require('../src/levels/LevelCompiler.ts');
    const {rebuiltAssemblies}=require('../src/environment/RebuiltConfluenceAssemblies.ts');
    const {World}=require('../src/game/World.ts');
    const map=new World(compileLevel(document)).level,solids=map.solids;
    for(const a of rebuiltAssemblies(map))for(const s of a.supports){
        assert.ok(s.bottom>a.y);
        const underneath=solids.filter(r=>r.y>a.y&&r.x<s.x+24&&r.x+r.width>s.x);
        assert.equal(s.bottom,Math.min(document.height,...underneath.map(r=>r.y)));
    }
});

test('bridge dressing follows its structure and material when moved into the station district',()=>{
    require('./register.cjs');
    const {World}=require('../src/game/World.ts');
    const {compileLevel}=require('../src/levels/LevelCompiler.ts');
    const {rebuiltAssemblies}=require('../src/environment/RebuiltConfluenceAssemblies.ts');
    const d=structuredClone(document),bridge=d.terrain.find(s=>s.id==='viaduct-west');bridge.x=100;
    const map=new World(compileLevel(d)).level,a=rebuiltAssemblies(map).find(s=>s.owner===bridge.id);
    assert.equal(a.bridge,true);assert.equal(a.family,1);assert.equal(a.height,24);
    assert.ok(a.supports.every(s=>s.bottom===1248),'its piers now land on the station floor');
});
