require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {WaterfallRenderer}=require('../src/renderers/water/WaterfallRenderer.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {rebuiltAssemblies}=require('../src/environment/RebuiltConfluenceAssemblies.ts');
const {World}=require('../src/game/World.ts');
const {CatchBasin}=require('../src/world/water/CatchBasin.ts');
const {outletArtwork,waterHardware}=require('../src/world/water/WaterHardwareGeometry.ts');

test('drainage landmarks stay attached to artwork at different basin sizes and positions',()=>{
    const frames=require('../public/assets/environment/confluence/v7/drainage-v7.json').frames;
    for(const name of ['outlet','basin']){
        assert.equal(waterHardware[name].width,frames[name].width);
        assert.equal(waterHardware[name].height,frames[name].height);
    }
    const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} should equal ${b}`);
    for(const [x,y,width,height] of [[120,192,192,40],[341,290,368,100],[0,80,128,64]]){
        const basin=new CatchBasin({id:'basin',kind:'basin',x,y,width,height});
        const r=basin.hardware.artwork, art=waterHardware.basin;
        near(r.y+art.waterline/art.height*r.height,basin.surfaceBounds.y);
        near(r.y+r.height,basin.y2);
        near(r.x+art.spill.x/art.width*r.width,basin.socket('spill').x);
        near(r.y+art.spill.y/art.height*r.height,basin.socket('spill').y);
        const mouth={x:x+100,y:y-80},outlet=outletArtwork(mouth),a=waterHardware.outlet;
        near(outlet.x+a.mouth.x/a.width*outlet.width,mouth.x);
        near(outlet.y+a.mouth.y/a.height*outlet.height,mouth.y);
    }
});

test('waterfall material travels downward and does not advance at frozen simulation time',()=>{
    let draws=[];
    const ctx=new Proxy({drawImage(...args){draws.push(args);}}, {get:(o,k)=>k in o?o[k]:()=>{}});
    const renderer=new WaterfallRenderer(ctx,{naturalWidth:512,naturalHeight:256});
    const fall={x:0,y:100,width:64,height:600};
    const camera={x:0,y:0,width:960,height:800,canSee:r=>r.y<800};
    const capture=t=>{draws=[];renderer.draw(fall,camera,t);return draws;};
    const a=capture(0),b=capture(.25);
    const firstBelowSource=calls=>Math.min(...calls.map(args=>args[6]).filter(y=>y>=100));
    assert.equal(firstBelowSource(b)-firstBelowSource(a),10);
    assert.deepEqual(capture(.25),b);
    assert.deepEqual(capture(256/42),a,'the two-tile material cycle wraps without changing its phase');
});
