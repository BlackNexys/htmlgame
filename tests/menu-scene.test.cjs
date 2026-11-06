require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {menuScenes,selectMenuScene}=require('../src/ui/MenuScene.ts');

test('menu scene selection avoids adjacent repeats, and explicit scene IDs are deterministic',()=>{
    let previous;const seen=new Set();
    for(const random of [0,.5,.99,0,.99,.5]){
        const scene=selectMenuScene(previous,()=>random);assert.notEqual(scene.id,previous);seen.add(scene.id);previous=scene.id;
    }
    assert.equal(seen.size,4);
    for(const scene of menuScenes)assert.equal(selectMenuScene(scene.id,()=>0,scene.id),scene);
    assert.ok(menuScenes.includes(selectMenuScene('unknown',()=>.5,'invalid')));
});

test('every character pose has its own asset and the absent traveller uses the same clean environment',()=>{
    const absent=menuScenes.find(scene=>scene.id==='absent-traveller');assert.equal(absent.character,undefined);
    const characters=menuScenes.filter(scene=>scene.character);assert.equal(new Set(characters.map(scene=>scene.character.asset.still)).size,3);
    for(const scene of menuScenes){assert.equal(scene.background,absent.background);assert.equal(scene.foreground,absent.foreground);}
    for(const scene of characters){
        assert.ok(scene.character.width>0&&scene.character.width<.3);
        assert.ok(scene.character.position.x>0&&scene.character.position.x<1);
        assert.ok(scene.character.position.y>0&&scene.character.position.y<1);
    }
});
