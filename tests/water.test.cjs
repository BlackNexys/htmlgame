require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ConfluenceWaterRenderer}=require('../src/environment/ConfluenceWaterRenderer.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {rebuiltAssemblies}=require('../src/environment/RebuiltConfluenceAssemblies.ts');
const {rebuiltWaterways}=require('../src/environment/RebuiltConfluenceWaterways.ts');
const document=require('../public/levels/last-platform-rebuild.json');

test('waterfall material travels downward and does not advance at frozen simulation time',()=>{
    let draws=[];
    const ctx=new Proxy({drawImage(...args){draws.push(args);}}, {get:(o,k)=>k in o?o[k]:()=>{}});
    const renderer=new ConfluenceWaterRenderer(ctx,{naturalWidth:512,naturalHeight:256},{waterfalls:[{x:0,y:100,width:64,height:600}],river:{x:0,y:1000,width:0,height:0}});
    const camera={x:0,y:0,width:960,height:800,canSee:r=>r.y<800};
    const capture=t=>{draws=[];renderer.draw(camera,t);return draws;};
    const a=capture(0),b=capture(.25);
    const firstBelowSource=calls=>Math.min(...calls.map(args=>args[6]).filter(y=>y>=100));
    assert.equal(firstBelowSource(b)-firstBelowSource(a),10);
    assert.deepEqual(capture(.25),b);
    assert.deepEqual(capture(256/42),a,'the two-tile material cycle wraps without changing its phase');
});

test('station drains and freight outfall terminate in receiving water without crossing playable floors',()=>{
    const solids=compileLevel(document).solids;
    const w=rebuiltWaterways(rebuiltAssemblies(solids,document.height),document.width,document.height);
    assert.equal(w.drains.length,2);assert.equal(w.waterfalls.length,5);
    assert.equal(w.river.width,document.width);
    const levels=[w.canal.y,w.river.y,w.basin.y];
    for(const f of w.waterfalls){
        assert.ok(f.height>64);assert.ok(levels.includes(f.y+f.height-64));
        assert.ok(!solids.some(s=>s.x<f.x+f.width&&s.x+s.width>f.x&&s.y<f.y+f.height-64&&s.y+s.height>f.y));
    }
});
