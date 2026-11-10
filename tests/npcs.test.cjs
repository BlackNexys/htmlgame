require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseLevelDocument}=require('../src/levels/LevelValidation.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {applyLevelChanges}=require('../src/levels/LevelChanges.ts');
const {createBlankLevel}=require('../src/editor/createBlankLevel.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {selectionBounds}=require('../src/editor/EditorSelection.ts');
const {World}=require('../src/game/World.ts');
const {RailAttendant}=require('../src/components/RailAttendant.ts');
const {Enemy}=require('../src/components/Enemy.ts');
const definition=(id='attendant',x=432)=>({id,kind:'rail-attendant',x,y:576,scene:'station-exchange'});
const fixture=()=>{const level=createBlankLevel();level.npcs=[definition()];return level;};
const tick=(world,seconds,input={left:false,right:false,jump:false,fire:false})=>{for(let i=0;i<seconds*120;i++)world.update(1/120,input);};

test('old levels normalize empty NPCs; authored anchors create concrete neutral actors with fresh state',()=>{
    const old=createBlankLevel();delete old.npcs;assert.deepEqual(parseLevelDocument(old).npcs,[]);
    const document=fixture(), world=new World(compileLevel(document));
    assert.ok(world.npcs[0] instanceof RailAttendant);assert.ok(!(world.npcs[0] instanceof Enemy));
    assert.equal(world.npcs[0].x,416);assert.equal(world.npcs[0].y2,576);
    world.player.x=284;tick(world,.2);assert.equal(world.npcs[0].facing,-1);assert.equal(world.npcs[0].y2,576);
    world.npcs[0].completeConversation();assert.equal(world.npcs[0].conversations,1);
    assert.equal(new World(compileLevel(document)).npcs[0].conversations,0);
    assert.deepEqual(selectionBounds(document,{collection:'npcs',id:'attendant'}),{x:416,y:512,width:32,height:64});
});

test('NPCs neither block movement nor take shots, contact damage, defeat credit or ectoplasm rewards',()=>{
    const world=new World(compileLevel(fixture()));
    tick(world,1.3,{left:false,right:true,jump:false,fire:false});
    assert.ok(world.player.x>world.npcs[0].x2);assert.equal(world.player.health,5);
    assert.equal(world.defeated,0);assert.equal(world.corpses.length,0);assert.equal(world.ectoplasm.amount,6);
    const level=fixture();level.enemies=[{id:'target',kind:'zombie',x:700,y:576,patrol:{left:700,right:700}}];
    const firing=new World(compileLevel(level));tick(firing,1.5,{left:false,right:false,jump:false,fire:true});
    assert.equal(firing.npcs.length,1);assert.equal(firing.npcs[0].health,undefined);
    assert.equal(firing.defeated,1);assert.equal(firing.corpses.length,1);assert.equal(firing.ectoplasm.amount,7);
});

test('interaction requires range, level feet, ground, living player and clear line of sight; ties are stable',()=>{
    const level=fixture();level.npcs=[definition('b',248),definition('a',248)];
    const world=new World(compileLevel(level));tick(world,.1);
    assert.equal(world.interactions.nearest(world.player,world.npcs).id,'a');
    world.player.x--;assert.equal(world.interactions.nearest(world.player,world.npcs),undefined);world.player.x++;
    world.player.grounded=false;assert.equal(world.interactions.nearest(world.player,world.npcs),undefined);world.player.grounded=true;
    world.player.health=0;assert.equal(world.interactions.nearest(world.player,world.npcs),undefined);world.player.health=5;
    world.npcs.forEach(npc=>npc.y-=40);assert.equal(world.interactions.nearest(world.player,world.npcs),undefined);world.npcs.forEach(npc=>npc.y+=40);
    world.level.collision.register('test-wall','test',{x:192,y:480,width:16,height:96});
    assert.equal(world.interactions.nearest(world.player,world.npcs),undefined);
});

test('NPC validation rejects unknown kinds/scenes, bad bounds, terrain overlap and duplicate IDs',()=>{
    for(const [mutate,message] of [
        [d=>d.npcs[0].kind='zombie',/unknown NPC kind/],
        [d=>d.npcs[0].scene='missing-scene',/unknown dialogue scene/],
        [d=>d.npcs[0].x=0,/actor bounds/],
        [d=>d.npcs[0].y=600,/actor overlaps/],
        [d=>d.npcs[0].id='floor',/unique/],
        [d=>d.npcs=null,/must be an array/],
    ]){const level=fixture();mutate(level);assert.throws(()=>parseLevelDocument(level),message);}
});

test('NPC patches participate in revision checks and workshop undo/redo without mutating earlier documents',()=>{
    const document=createBlankLevel(),session=new EditorSession(document);
    session.apply({levelId:document.id,baseRevision:1,operations:[{op:'upsert',collection:'npcs',value:definition()}]});
    assert.equal(session.document.npcs.length,1);assert.equal(document.npcs.length,0);
    session.undo();assert.equal(session.document.npcs.length,0);session.redo();assert.equal(session.document.npcs[0].scene,'station-exchange');
    assert.throws(()=>applyLevelChanges(session.document,{levelId:document.id,baseRevision:1,operations:[{op:'remove',collection:'npcs',id:'attendant'}]}),/Revision conflict/);
});
