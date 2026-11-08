require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseEnvironmentFrames}=require('../src/environment/EnvironmentManifest.ts');
const manifest=require('../public/assets/environment/confluence/v1/atlas-v1.json');
const architecture=require('../public/assets/environment/confluence/v2/atlas-v2.json');
const {architectureNames}=require('../src/environment/ConfluenceArchitecture.ts');

test('the environment manifest isolates validated sprite bounds and rejects missing or invalid crops',()=>{
    const frames=parseEnvironmentFrames(manifest,768,576);frames.lamp.x=999;
    assert.notEqual(manifest.frames.lamp.x,999);
    for(const mutate of [d=>delete d.frames.ledger,d=>d.frames.letter.width=0,d=>d.frames.lamp.x=-1,d=>d.frames.shutterClosed.y=570,d=>d.frames.bad={x:0,y:0,width:1,height:1}]){
        const copy=structuredClone(manifest);mutate(copy);assert.throws(()=>parseEnvironmentFrames(copy,768,576),/environment/);
    }
});

test('architectural modules validate against their own catalog and atlas dimensions',()=>{
    assert.equal(Object.keys(parseEnvironmentFrames(architecture,1024,768,architectureNames)).length,12);
    assert.throws(()=>parseEnvironmentFrames(architecture,1024,768),/environment/);
    const copy=structuredClone(architecture);copy.frames.registryGallery.width=1024;
    assert.throws(()=>parseEnvironmentFrames(copy,1024,768,architectureNames),/environment/);
});
