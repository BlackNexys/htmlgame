const {test}=require('node:test');
const assert=require('node:assert/strict');
const r=require('./helpers/sluice-exchange-route.cjs');
const won=result=>{assert.equal(result.world.state,'won');assert.ok(result.minHealth>0);};
test('Sluice Exchange completes its folded route with normal combat and two-axis camera travel',()=>{
    const result=r.run();won(result);assert.ok(result.maxY-result.minY>1800);assert.ok(result.reached.some((p,i,all)=>i&&p.x<all[i-1].x-200));
});
test('Sluice rooftop inspection rejoins the main route and completes with normal combat',()=>won(r.run([...r.roof,...r.gallery,...r.middle,...r.lower,...r.finale])));
test('Sluice upper missed-jump recovery rejoins the gallery and exit',()=>won(r.run([...r.upperRecovery,...r.middle,...r.lower,...r.finale])));
test('Sluice lower missed-jump recovery reaches the works and exit',()=>won(r.run([...r.upper,...r.gallery,...r.middle,...r.lowerRecovery])));
test('Sluice crouched culvert can be inspected, exited standing, and followed to completion',()=>{
    const result=r.run([...r.upper,...r.gallery,...r.middle,...r.culvert,...r.lower,...r.finale]);won(result);assert.equal(result.crouched,true);assert.equal(result.world.player.height,52);
});

test('Sluice scene stays within current budgets and all flows end downward in receiving water',()=>{
    const {compileLevel}=require('../src/levels/LevelCompiler.ts'),{World}=require('../src/game/World.ts'),w=new World(compileLevel(r.document));
    assert.ok(r.document.props.length>=850&&r.document.props.length<=1000);assert.equal(new Set(r.document.enemies.map(e=>e.kind)).size,6);
    assert.ok(w.level.water.elements.length>=30);assert.equal(w.level.water.bodies.find(b=>b.kind==='river').y,3040);
    for(const fall of w.level.water.falls){assert.ok(fall.height>0);assert.equal(fall.y2,fall.receiver.y);assert.ok(fall.definition.behindTerrain||!w.level.collision.overlaps(fall));}
    assert.ok(w.level.structures.some(s=>s.id==='culvert-door'));assert.ok(!w.level.solids.some(s=>r.document.props.some(p=>p.id===s.owner)));
});

test('Sluice is a standalone stage and its optional cards never load or write a campaign save',()=>{
    const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
    const session=new NarrativeSession(r.document.id,{load(){throw Error('Unexpected campaign load');},save(){throw Error('Unexpected campaign write');}});
    assert.equal(session.active,false);session.enter();assert.equal(session.allowed,true);
    assert.ok(r.document.interactables.every(o=>!o.effectId&&!o.conditionId));
});

test('Sluice main and roof routes also tolerate deliberate stops between landings',()=>{
    won(r.run(r.main,{settleSeconds:.3}));
    won(r.run([...r.roof,...r.gallery,...r.middle,...r.lower,...r.finale],{settleSeconds:.3}));
});
