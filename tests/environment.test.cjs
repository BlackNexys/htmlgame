require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseEnvironmentFrames}=require('../src/environment/EnvironmentManifest.ts');
const manifest=require('../public/assets/environment/confluence/v4/atlas-v4.json');
const architecture=require('../public/assets/environment/confluence/v6/architecture-v6.json');
const {architectureNames}=require('../src/environment/ConfluenceArchitecture.ts');

test('the environment manifest isolates validated sprite bounds and rejects missing or invalid crops',()=>{
    const frames=parseEnvironmentFrames(manifest,768,576);frames.lamp.x=999;
    assert.ok(frames.lamp.width/frames.lamp.height<.4,'lamp crop must exclude neighboring bench fragments');
    assert.notEqual(manifest.frames.lamp.x,999);
    for(const mutate of [d=>delete d.frames.ledger,d=>d.frames.letter.width=0,d=>d.frames.lamp.x=-1,d=>d.frames.shutterClosed.y=570,d=>d.frames.bad={x:0,y:0,width:1,height:1}]){
        const copy=structuredClone(manifest);mutate(copy);assert.throws(()=>parseEnvironmentFrames(copy,768,576),/environment/);
    }
});

test('material lip metadata is bounded, cloned and never offsets interior fill',()=>{
    const {parseTerrainBaselines}=require('../src/environment/TerrainManifest.ts');
    const input=require('../public/assets/environment/confluence/v4/terrain-v4.json');
    const out=parseTerrainBaselines(input);out[0]=0;assert.notEqual(out[0],input.baselines[0]);
    for(const change of [d=>d.baselines.pop(),d=>d.baselines[0]=17,d=>d.baselines[1]=-1,d=>d.baselines[3]=2]){
        const copy=structuredClone(input);change(copy);assert.throws(()=>parseTerrainBaselines(copy),/terrain/);
    }
});

test('architectural modules validate against their own catalog and atlas dimensions',()=>{
    assert.equal(Object.keys(parseEnvironmentFrames(architecture,1024,768,architectureNames)).length,12);
    assert.throws(()=>parseEnvironmentFrames(architecture,1024,768),/environment/);
    const copy=structuredClone(architecture);copy.frames.registryGallery.width=1024;
    assert.throws(()=>parseEnvironmentFrames(copy,1024,768,architectureNames),/environment/);
});

test('landmark crops exclude neighboring art and retain complete mounted fixtures',()=>{
    const {landmarkNames}=require('../src/environment/ConfluenceLandmarks.ts');
    const data=require('../public/assets/environment/confluence/v6/landmarks-v6.json');
    const frames=parseEnvironmentFrames(data,768,512,landmarkNames);
    assert.equal(Object.keys(frames).length,6);
    assert.ok(frames.stationClock.width/frames.stationClock.height<.9,'clock crop excludes the neighboring frontage fragment');
    const copy=structuredClone(data);delete copy.frames.stationClock;
    assert.throws(()=>parseEnvironmentFrames(copy,768,512,landmarkNames),/environment/);
});
