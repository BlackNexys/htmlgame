require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {frameAt,validateManifest}=require('../src/menu-pilot/Manifest.ts');
const manifest=require('../public/assets/mainmenu/v2/pilot-v1.json');

test('sprite timing respects variable holds and the loop boundary without duplicating frames',()=>{
 const clip={frames:[{durationMs:100},{durationMs:300}]};
 assert.equal(frameAt(clip,0),0);assert.equal(frameAt(clip,99),0);
 assert.equal(frameAt(clip,100),1);assert.equal(frameAt(clip,399),1);
 assert.equal(frameAt(clip,400),0);assert.equal(frameAt(clip,500),1);assert.equal(frameAt(clip,-1),0);
});

test('the real pilot manifest has bounded frames and rejects corrupted export metadata',()=>{
 assert.doesNotThrow(()=>validateManifest(manifest));
 assert.equal(manifest.assets.body.frames.length,6);assert.equal(manifest.assets.flame.frames.length,8);assert.equal(manifest.assets.cape.frames.length,8);
 const invalid=structuredClone(manifest);invalid.assets.flame.frames[0].rect[2]=9000;
 assert.throws(()=>validateManifest(invalid),/Invalid flame frame/);
 const duration=structuredClone(manifest);duration.assets.cape.frames[0].durationMs=0;
 assert.throws(()=>validateManifest(duration),/Invalid cape frame/);
 const wrongSize=structuredClone(manifest);wrongSize.scene.width=960;
 assert.throws(()=>validateManifest(wrongSize),/dimensions/);
});
