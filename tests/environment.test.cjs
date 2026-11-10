require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseEnvironmentFrames}=require('../src/environment/EnvironmentManifest.ts');
const manifest=require('../public/assets/environment/confluence/v4/atlas-v4.json');
const architecture=require('../public/assets/environment/confluence/v6/architecture-v6.json');
const {architectureNames}=require('../src/environment/ConfluenceArchitecture.ts');

test('building shells join station wings while retaining open arcades and distinct districts',()=>{
    const {buildingShells,insideBuilding,buildingTrimNames}=require('../src/environment/ConfluenceBuildings.ts');
    const {facades}=require('../src/environment/ConfluenceScene.ts');
    const trims=require('../public/assets/environment/confluence/v5/trims-v5.json');
    assert.equal(Object.keys(parseEnvironmentFrames(trims,768,768,buildingTrimNames)).length,16);
    assert.equal(insideBuilding('station',767,750),true);
    assert.equal(insideBuilding('station',768,750),true);
    assert.equal(insideBuilding('station',900,1000),false,'arcade must retain its open city view');
    assert.equal(insideBuilding('station',700,1000),true,'masonry pier connects station stories');
    assert.equal(insideBuilding('registry',6600,1500),true);
    assert.equal(insideBuilding('registry',6600,1100),false);
    for(const b of buildingShells){
        assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=7200&&b.y+b.height<=3840);
        assert.ok(b.floors.every(y=>y>b.y&&y<=b.y+b.height));
    }
    assert.ok(facades.reduce((n,b)=>n+b.columns*b.rows,0)<40,'full wall should not repeat a window bay in every cell');
});

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

test('rear support piers terminate on terrain or an attached structural header',()=>{
    const {supportFrames,supportPiers}=require('../src/environment/ConfluenceStructures.ts');
    const level=require('../public/levels/last-platform-demo.json');
    for(const r of level.terrain.filter(r=>r.width<=192&&r.height===48)){
        const framed=supportFrames.some(f=>r.x>=f.x&&r.x+r.width<=f.x+f.width&&r.y>f.y&&r.y<f.y+f.height);
        const bearing=supportPiers.some(p=>p.y===r.y+r.height&&p.x>=r.x&&p.x+p.width<=r.x+r.width);
        assert.ok(framed||bearing,`Unsupported landing ${r.id}`);
    }
    for(const p of supportPiers){
        const bottom=p.y+p.height;
        const floor=level.terrain.some(r=>r.y===bottom&&r.x<p.x+p.width&&r.x+r.width>p.x);
        const header=supportFrames.some(f=>f.y+48===bottom&&p.x>=f.tieLeft&&p.x+p.width<=f.tieRight);
        assert.ok(floor||header,`Unanchored pier at ${p.x},${bottom}`);
    }
    for(const drain of level.water.filter(w=>w.kind==='drain'))assert.ok(level.terrain.some(r=>r.id===drain.mount.parent)&&drain.mount.socket==='bottomLeft','Drain infrastructure must attach to an authored platform');
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
