require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {artFrame,validateTitleArt}=require('../src/ui/title/TitleArt.ts');
const {characterAtlas}=require('../src/game/animation/CharacterAtlas.ts');
const art=JSON.parse(readFileSync('public/assets/mainmenu/v3/production/scene-v1.json','utf8'));

test('production title clips use exact holds and wrap without advancing through a held pose',()=>{
    const cat=art.clips.cat;assert.equal(artFrame(cat,0),0);assert.equal(artFrame(cat,2599),0);assert.equal(artFrame(cat,2600),1);
    const duration=cat.frames.reduce((sum,f)=>sum+f.durationMs,0);assert.equal(artFrame(cat,duration),0);assert.equal(artFrame(cat,-100),0);
    for(const pose of ['standing','sitting','leaning']){
        assert.equal(art.clips[pose].frames.length,6);
        assert.equal(art.clips[pose].image,pose==='standing'?'../../../'+characterAtlas.image:`../../../hero/canon-v1/${pose}-v1.png`);
        assert.equal(art.clips[pose].scale,1.35);
        assert.equal(art.clips[pose].mirror,true);
    }
    assert.equal(art.clips.headFire,undefined);assert.equal(art.clips.cape,undefined);
    assert.deepEqual(art.clips.standing.frames.map(f=>f.anchor),characterAtlas.anchors.idle.x.map((x,i)=>({x,y:characterAtlas.anchors.idle.y[i]})));
    assert.ok(art.clips.standing.frames.every(f=>f.durationMs===125&&f.rect[2]===characterAtlas.cell));
});

test('production title metadata rejects bad frame rectangles, timing and missing pose attachments',()=>{
    validateTitleArt(art);
    for(const mutate of [a=>a.clips.standing.frames[0].rect[2]=99999,a=>a.clips.cat.frames[0].durationMs=0,a=>delete a.heroes.standing.light,a=>a.width=640,a=>a.clips.standing.scale=-1]){
        const bad=structuredClone(art);mutate(bad);assert.throws(()=>validateTitleArt(bad));
    }
    for(const pose of Object.values(art.heroes)){
        assert.ok(pose.ground.y>=700);assert.ok(pose.light.y<art.clips[pose.body].anchor.y);
    }
});
