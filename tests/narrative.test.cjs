require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {NarrativeState}=require('../src/narrative/NarrativeState.ts');
const {freshCampaign}=require('../src/narrative/NarrativeCatalog.ts');
const {SaveStore,parseCampaign}=require('../src/narrative/SaveStore.ts');
const {EffectApplier}=require('../src/narrative/EffectApplier.ts');
const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {parseLevelDocument}=require('../src/levels/LevelValidation.ts');
const {World}=require('../src/game/World.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const document=require('../public/levels/narrative-study.json');
const key='underworld-campaign:v1';
function storage(raw=null){return {raw,writes:0,getItem(){return this.raw;},setItem(k,v){assert.equal(k,key);this.raw=v;this.writes++;}};}
function fixture(preview=false,id='narrative-study',disk=storage()){
    const world=new World(compileLevel(document));
    const session=new NarrativeSession(id,new SaveStore(disk),preview);session.enter();session.attach(world);
    return {world,session,disk};
}
const object=(world,kind)=>world.interactables.find(o=>o.definition.kind===kind);
function inspectRecord(f){const record=f.world.interactables.find(o=>o.definition.effectId==='inspect-transfer-record');f.session.complete(f.session.plan(record),f.world);}
function decodeRoute(f){const terminal=f.world.interactables.find(o=>o.definition.effectId==='decode-route');f.session.complete(f.session.plan(terminal),f.world);}

test('physical evidence cannot be awarded by dialogue, a mismatched object or a partial effect batch',()=>{
    const f=fixture(),before=f.session.state.snapshot(),state=new NarrativeState(before),effects=new EffectApplier(state);
    const letter=object(f.world,'collect');
    assert.throws(()=>effects.apply(['inspect-transfer-record'],{source:'npc'}),/not eligible/);
    assert.throws(()=>effects.apply(['inspect-transfer-record'],{source:'inspect',object:letter}),/physical source/);
    assert.throws(()=>effects.apply(['collect-letter','missing-effect'],{source:'collect',object:letter}),/not eligible/);
    assert.equal(letter.collected,false);assert.deepEqual(state.snapshot(),before);
    assert.throws(()=>parseCampaign({...before,facts:['girlfriend-was-abducted']}),/Unknown/);
});

test('independent exploration changes attendant scenes without requiring an introductory conversation',()=>{
    const f=fixture(),attendant=f.world.npcs[0];
    assert.equal(f.session.plan(attendant).scene.id,'attendant-introduction');
    inspectRecord(f);
    assert.equal(f.session.plan(attendant).scene.id,'attendant-record');
    assert.equal(f.session.state.has('met-rail-attendant'),false);
    f.session.complete(f.session.plan(attendant),f.world);
    assert.equal(f.session.plan(attendant).scene.id,'attendant-farewell');
    assert.equal(f.session.state.has('learned-next-destination'),true);
    assert.equal(f.session.state.has('learned-about-registry'),false);
    assert.equal(attendant.conversations,0,'conversation counts are actor-local, not narrative facts');
});

test('introduction gives a short repeat; unrelated conversations never create physical evidence',()=>{
    const f=fixture(),npc=f.world.npcs[0];
    f.session.complete(f.session.plan(npc),f.world);
    assert.equal(f.session.plan(npc).scene.id,'attendant-directions');
    assert.equal(f.session.state.has('found-transfer-record'),false);
    const writes=f.disk.writes;f.session.complete(f.session.plan(npc),f.world);
    assert.equal(f.disk.writes,writes);
});

test('record plus route index supplies an independent lead; a missing record locks it',()=>{
    const f=fixture(),terminal=f.world.interactables.find(o=>o.definition.effectId==='decode-route');
    assert.deepEqual(f.session.plan(terminal).effects,[]);
    inspectRecord(f);decodeRoute(f);
    assert.equal(f.session.state.has('learned-next-destination'),true);
    assert.equal(f.session.state.has('met-rail-attendant'),false);
    assert.match(f.session.lead,/gate/i);
    assert.equal(f.world.level.exit.enabled,true);
});

test('Keepsakes are optional and idempotent; discoveries survive restart while gate operations reset',()=>{
    const f=fixture(),lead=f.session.lead,letter=object(f.world,'collect');
    const plan=f.session.plan(letter);f.session.complete(plan,f.world);f.session.complete(plan,f.world);
    assert.deepEqual(f.session.state.snapshot().keepsakes,['lost-letter']);assert.equal(f.session.lead,lead);
    inspectRecord(f);decodeRoute(f);
    const gate=object(f.world,'operate'),solids=f.world.level.solids;
    f.session.complete(f.session.plan(gate),f.world);
    assert.equal(gate.operated,true);assert.strictEqual(f.world.level.solids,solids);assert.equal(solids.includes(gate.blocker),false);
    const restarted=new World(compileLevel(document));f.session.attach(restarted);
    assert.equal(object(restarted,'collect').active,false);
    assert.equal(object(restarted,'operate').active,true);
    assert.equal(restarted.level.solids.includes(object(restarted,'operate').blocker),true);
    const reloaded=fixture(false,'narrative-study',f.disk);
    assert.equal(reloaded.session.state.has('found-transfer-record'),true);
    assert.equal(object(reloaded.world,'collect').active,false);
    assert.equal(reloaded.world.defeated,0);
});

test('locked exits do not complete; stage completion separately unlocks the next destination',()=>{
    const f=fixture();f.world.player.x=f.world.level.exit.x;
    f.world.update(1/120,{left:false,right:false,jump:false,fire:false});
    assert.equal(f.world.state,'playing');assert.throws(()=>f.session.completeStage(),/not eligible/);
    inspectRecord(f);decodeRoute(f);
    assert.deepEqual(f.session.state.snapshot().completedStages,[]);
    f.world.update(1/120,{left:false,right:false,jump:false,fire:false});assert.equal(f.world.state,'won');
    f.session.completeStage();f.session.completeStage();
    assert.deepEqual(f.session.state.snapshot().completedStages,['narrative-study']);
    assert.deepEqual(f.session.state.snapshot().unlockedStages,['narrative-study','last-platform-demo','departure-study']);
    assert.equal(new NarrativeSession('departure-study',new SaveStore(f.disk)).allowed,true);
    assert.equal(new NarrativeSession('departure-study',new SaveStore(storage())).allowed,false);
});

test('save validation roundtrips cloned state, rejects malformed collections and protects future saves',()=>{
    const disk=storage(),store=new SaveStore(disk),data=freshCampaign();store.save(data);
    const restored=store.load();restored.facts.push('found-transfer-record');assert.deepEqual(store.load(),data);
    for(const raw of ['{bad',JSON.stringify({...data,version:2}),JSON.stringify({...data,facts:['unknown']}),JSON.stringify({...data,facts:['found-transfer-record','found-transfer-record']})]){
        const broken=storage(raw),safe=new SaveStore(broken);safe.load();
        assert.match(safe.warning,/preserved/);assert.equal(safe.save(data),false);assert.equal(broken.raw,raw);
        safe.reset();assert.deepEqual(JSON.parse(broken.raw),data);
    }
    const state=new NarrativeState(data);const snapshot=state.snapshot();snapshot.facts.push('found-transfer-record');assert.equal(state.has('found-transfer-record'),false);
});

test('failed storage writes retain in-memory progress and report persistence failure',()=>{
    const disk=storage();disk.setItem=()=>{throw Error('Quota exceeded');};
    const f=fixture(false,'narrative-study',disk);inspectRecord(f);
    assert.equal(f.session.state.has('found-transfer-record'),true);assert.match(f.session.store.warning,/could not be saved/);
    const restarted=new World(compileLevel(document));f.session.attach(restarted);assert.equal(f.session.state.has('found-transfer-record'),true);
    assert.match(new NarrativeSession('narrative-study',new SaveStore()).store.warning,/unavailable/);
    disk.setItem=function(k,v){this.raw=v;};inspectRecord(f);
    assert.equal(f.session.store.warning,'');assert.equal(JSON.parse(disk.raw).facts.includes('found-transfer-record'),true,'an idempotent interaction can retry a failed save');
});

test('workshop previews and existing unrelated levels never read or overwrite the campaign',()=>{
    const disk={getItem(){throw Error('should not read');},setItem(){throw Error('should not write');}};
    for(const [preview,id] of [[true,'narrative-study'],[false,'npc-study']]){
        const f=fixture(preview,id,disk);inspectRecord(f);
        assert.equal(f.session.state.has('found-transfer-record'),true);assert.equal(f.session.store.warning,'');
    }
    const preview=new NarrativeSession('departure-study',new SaveStore(disk),true);assert.equal(preview.allowed,true);preview.completeStage();
});

test('object reach uses its rectangle, permits airborne inspection, ignores its own gate but respects other walls',()=>{
    const f=fixture(),record=f.world.interactables.find(o=>o.definition.effectId==='inspect-transfer-record');
    const player=f.world.player;player.x=record.x-60;player.y=record.y;player.grounded=false;
    assert.equal(f.world.interactions.nearest(player,[record]),record);
    player.x-=200;assert.equal(f.world.interactions.nearest(player,[record]),undefined);
    const gate=object(f.world,'operate');player.x=gate.x-60;player.y=524;
    assert.equal(f.world.interactions.nearest(player,[gate]),gate);
    f.world.level.solids.push({x:gate.x-20,y:480,width:8,height:96});
    assert.equal(f.world.interactions.nearest(player,[gate]),undefined);
});

test('object authoring validates references and source binding and participates in editor history',()=>{
    const old=structuredClone(document);delete old.interactables;assert.deepEqual(parseLevelDocument(old).interactables,[]);
    for(const mutate of [d=>d.interactables[0].effectId='unknown',d=>d.interactables[0].kind='collect',d=>d.interactables[0].conditionId='unknown',d=>d.interactables[0].sceneId='letter-card']){
        const bad=structuredClone(document);bad.interactables=[bad.interactables.find(o=>o.kind==='inspect')];mutate(bad);assert.throws(()=>parseLevelDocument(bad),/interactables/);
    }
    const session=new EditorSession(parseLevelDocument(document)),before=session.document;
    session.apply({levelId:before.id,baseRevision:before.revision,operations:[{op:'remove',collection:'interactables',id:before.interactables[0].id}]});
    assert.equal(session.document.interactables.length,before.interactables.length-1);session.undo();assert.deepEqual(session.document.interactables,before.interactables);session.redo();
});
