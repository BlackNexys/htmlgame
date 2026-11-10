require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {WaterfallRenderer}=require('../src/renderers/water/WaterfallRenderer.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {rebuiltAssemblies}=require('../src/environment/RebuiltConfluenceAssemblies.ts');
const {World}=require('../src/game/World.ts');
const document=require('../public/levels/last-platform-rebuild.json');

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

test('station drains and freight outfall terminate in receiving water without crossing playable floors',()=>{
    const world=new World(compileLevel(document)),network=world.level.water;
    assert.equal(network.drains.length,3);assert.equal(network.falls.length,5);
    assert.equal(network.bodies.find(b=>b.kind==='river').width,document.width);
    for(const fall of network.falls){
        assert.ok(fall.height>0);assert.equal(fall.y2,fall.receiver.y);
        assert.ok(!world.level.collision.overlaps(fall));
    }
});
