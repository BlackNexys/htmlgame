require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {NarrativeState}=require('../src/narrative/NarrativeState.ts');
const {SaveStore,parseCampaign}=require('../src/narrative/SaveStore.ts');
const {EffectApplier}=require('../src/narrative/EffectApplier.ts');
const {NarrativeSession}=require('../src/narrative/NarrativeSession.ts');
const {Interactable}=require('../src/components/Interactable.ts');
const {campaignStage}=require('../src/narrative/CampaignStages.ts');
const letter=()=>new Interactable({id:'letter',kind:'collect',x:200,y:500,width:32,height:32,label:'Letter',reach:80,sceneId:'letter-card',effectId:'collect-letter'});
test('physical evidence rejects a mismatched source and a failed batch commits nothing',()=>{
    const state=new NarrativeState(),effects=new EffectApplier(state),object=letter(),before=state.snapshot();
    assert.throws(()=>effects.apply(['collect-letter'],{source:'npc'}),/not eligible/);
    assert.throws(()=>effects.apply(['inspect-transfer-record'],{source:'inspect',object}),/physical source/);
    assert.throws(()=>effects.apply(['collect-letter','missing-effect'],{source:'collect',object}),/not eligible/);
    assert.deepEqual(state.snapshot(),before);assert.equal(object.collected,false);
});
test('Keepsakes save atomically and survive a fresh state without duplicate awards',()=>{
    const state=new NarrativeState(),effects=new EffectApplier(state),object=letter();let raw=null;
    const disk={getItem:()=>raw,setItem:(_key,value)=>{raw=value;}},store=new SaveStore(disk);
    store.save(effects.apply(['collect-letter'],{source:'collect',object}));
    effects.apply(['collect-letter'],{source:'collect',object});assert.deepEqual(state.snapshot().keepsakes,['lost-letter']);
    const restored=new NarrativeState(new SaveStore(disk).load());assert.equal(restored.owns('lost-letter'),true);
    const leak=restored.snapshot();leak.keepsakes=[];assert.equal(restored.owns('lost-letter'),true);
});
test('invalid or future saves are preserved, and failed writes retain in-memory discoveries',()=>{
    let writes=0;const store=new SaveStore({getItem:()=>'{"version":99}',setItem:()=>writes++});
    const state=store.load();assert.equal(store.save(state),false);assert.equal(writes,0);
    assert.throws(()=>parseCampaign({...state,facts:['missing']}),/Unknown campaign/);
    const failing=new SaveStore({getItem:()=>null,setItem:()=>{throw Error('full');}}),s=new NarrativeState();
    new EffectApplier(s).apply(['collect-letter'],{source:'collect',object:letter()});assert.equal(failing.save(s.snapshot()),false);assert.equal(s.owns('lost-letter'),true);assert.match(failing.warning,/could not be saved/);
});
test('standalone source layouts and retired chapters cannot read or write campaign saves',()=>{
    const store=new SaveStore({getItem(){throw Error('unexpected read');},setItem(){throw Error('unexpected write');}});
    for(const id of ['untitled-level','custom-source','last-platform-demo','narrative-study']){
        const session=new NarrativeSession(id,store);session.enter();session.completeStage();assert.equal(session.active,false);assert.equal(campaignStage(id),undefined);
    }
});
