require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {defineLevel,defineAssembly}=require('../src/levels/source/index.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {createEmptyLevel}=require('../src/levels/createEmptyLevel.ts');
const {World}=require('../src/game/World.ts');
const {parseLevelLayout}=require('../src/levels/source/LayoutValidation.ts');
const {formatLevelLayout}=require('../src/levels/source/SourceExport.ts');

function fixture(extra=false,sibling=false){
    const room=defineAssembly({name:'Pump gallery',parameters:{width:{type:'number',default:600,min:400,max:800,step:8},lit:{type:'boolean',default:true},theme:{type:'choice',default:'station',options:['station','steel']}}},(s,p)=>{
        s.add('terrain',{id:'deck',kind:'platform',x:0,y:0,width:p.width,height:24,material:p.theme==='station'?0:1});
        s.add('props',{id:'bench',asset:'confluence-bench',x:20,y:-64,width:128,height:64,light:p.lit?100:30,mount:{parent:'deck',socket:'topLeft'}});
        s.add('water',{id:'drain',kind:'drain',x:64,y:24,width:80,height:32,mount:{parent:'deck',socket:'bottomLeft'}},
            {id:'basin',kind:'basin',x:40,y:300,width:160,height:48},
            {id:'fall',kind:'waterfall',x:0,y:0,width:20,from:{parent:'drain',socket:'mouth'},to:'basin'});
        s.add('enemies',{id:'guard',kind:'zombie',x:p.width-100,y:0,patrol:{left:p.width-140,right:p.width-60}});
        if(extra)s.add('signs',{id:'new-sign',x:100,y:-80,title:'NEW SOURCE',text:'Kept after visual edits.'});
    });
    return defineLevel({id:'layout-proof',name:'Layout proof',width:3000,height:1600,spawn:{x:100,y:500},exit:{x:2800,y:392,width:64,height:108}},s=>{
        s.add('terrain',{id:'start',x:0,y:500,width:300,height:24},{id:'finish',x:2600,y:500,width:400,height:24});
        s.place('gallery',{x:500,y:500},room);
        if(sibling)s.place('other',{x:1700,y:500},room);
    });
}
function session(source=fixture()){const e=new EditorSession(createEmptyLevel());e.loadSource(source);return e;}
const edit=(e,operations)=>e.apply({levelId:e.document.id,baseRevision:e.document.revision,operations});

test('one layout moves and parameterizes the same assembly in source, preview and runtime',()=>{
    const e=session();e.configureInstance('gallery',{x:800,y:700,parameters:{width:720,theme:'steel',lit:false}},1);
    const d=e.document,w=new World(e.source.compile(e.layout));
    assert.equal(d.terrain.find(o=>o.id==='gallery--deck').width,720);
    assert.equal(d.terrain.find(o=>o.id==='gallery--deck').material,1);
    assert.equal(w.level.props[0].x,820);assert.equal(w.level.props[0].y,636);
    assert.equal(w.level.water.get('gallery--fall').y2,1000);
    assert.deepEqual(d.enemies[0].patrol,{left:1380,right:1460});
    assert.equal(e.layout.operations.length,0,'moving a room must not rewrite its children');
    assert.deepEqual(e.source.withLayout(e.layout).document(),d);
});

test('visual child edits are local property deltas and follow later instance movement',()=>{
    const e=session(),bench=e.document.props[0];
    edit(e,[{op:'upsert',collection:'props',value:{...bench,x:bench.x+24}}]);
    const child=e.layout.instances.gallery.children[0];assert.deepEqual(child.set,{x:44});assert.equal(child.id,'bench');
    e.configureInstance('gallery',{x:900,parameters:{width:720}},e.document.revision);
    const w=new World(e.source.compile(e.layout));assert.equal(w.level.props[0].x,944);
    assert.equal(e.document.terrain.find(o=>o.id==='gallery--deck').width,720);
    assert.equal(e.document.enemies[0].x,1520,'unmodified factory-generated positions stay live');
    const updated=fixture(true).withLayout(e.layout).document();assert.ok(updated.signs.some(o=>o.id==='gallery--new-sign'));
    assert.equal(updated.props[0].x,44,'stored mount offset stays local');
});

test('undo, redo and reset retain source identity, local overrides and increasing revisions',()=>{
    const e=session(),source=e.source;e.configureInstance('gallery',{x:800},1);
    const prop=e.document.props[0];edit(e,[{op:'upsert',collection:'props',value:{...prop,opacity:60}}]);
    e.undo();assert.equal(e.document.props[0].opacity,undefined);assert.equal(e.instances[0].x,800);
    e.redo();assert.equal(e.document.props[0].opacity,60);assert.equal(e.source,source);
    const revision=e.document.revision;e.resetOverride('gallery','bench',revision);assert.equal(e.document.props[0].opacity,undefined);
    e.resetOverride('gallery',undefined,e.document.revision);assert.equal(e.instances[0].x,500);assert.ok(e.document.revision>revision);
});

test('invalid parameters, stale patches, geometry and dangling child removals are atomic',()=>{
    const e=session(),before=e.document,layout=e.layout;
    for(const value of [{parameters:{width:601}},{parameters:{width:1200}},{parameters:{unknown:1}},{parameters:{theme:'copper'}},{x:2800}]){
        assert.throws(()=>e.configureInstance('gallery',value,before.revision));assert.deepEqual(e.document,before);assert.deepEqual(e.layout,layout);
    }
    assert.throws(()=>e.configureInstance('gallery',{x:600},0),/Revision conflict/);
    assert.throws(()=>edit(e,[{op:'remove',collection:'terrain',id:'gallery--deck'}]),/Missing|missing/);
    assert.deepEqual(e.document,before);assert.equal(e.canUndo,false);
});

test('root additions, repeated edits and environment clearing persist without flattening instances',()=>{
    const e=session();
    edit(e,[{op:'upsert',collection:'signs',value:{id:'root-sign',x:100,y:400,title:'ROOT',text:'Root-owned'}}]);
    edit(e,[{op:'set',field:'name',value:'Renamed'},{op:'set',field:'presentation',value:undefined}]);
    edit(e,[{op:'set',field:'name',value:'Final name'}]);
    const layout=parseLevelLayout(JSON.parse(JSON.stringify(e.layout)));
    assert.equal(e.source.document(layout).name,'Final name');assert.equal(layout.operations.filter(o=>o.field==='name').length,1);
    assert.equal(e.source.document(layout).signs[0].id,'root-sign');
    edit(e,[{op:'remove',collection:'signs',id:'root-sign'}]);assert.equal(e.layout.operations.some(o=>o.collection==='signs'),false);
    assert.equal(e.source.document(e.layout).signs.length,0);
});

test('compiled JSON edits preserve source ownership rather than detaching the editor',()=>{
    const e=session(),d=e.document;d.props[0].opacity=50;
    e.replace(d,d.revision);assert.ok(e.source);assert.deepEqual(e.layout.instances.gallery.children[0].set,{opacity:50});
    const leaked=e.layout;leaked.instances.gallery.x=9999;assert.equal(e.instances[0].x,500);
});

test('layout validation rejects unknown instances, revisions, child identity changes and silent root overrides',()=>{
    const source=fixture(),mutations=[l=>l.source='another-source',l=>l.sourceRevision=2,l=>l.instances.missing={},
        l=>l.instances.gallery={children:[{collection:'props',id:'bench',set:{id:'renamed'}}]},
        l=>l.instances.gallery={children:[{collection:'props',id:'missing',set:{x:10}}]},
        l=>l.operations.push({op:'remove',collection:'props',id:'gallery--bench'})];
    for(const change of mutations){const l=source.emptyLayout();change(l);assert.throws(()=>source.withLayout(l));}
    assert.match(formatLevelLayout(source.layout),/satisfies LevelLayout/);
});

test('editing one instance leaves another use of the same factory inherited',()=>{
    const e=session(fixture(false,true)),prop=e.document.props.find(o=>o.id==='gallery--bench');
    edit(e,[{op:'upsert',collection:'props',value:{...prop,opacity:50}}]);
    e.configureInstance('gallery',{parameters:{width:720}},e.document.revision);
    assert.equal(e.document.props.find(o=>o.id==='other--bench').opacity,undefined);
    assert.equal(e.document.terrain.find(o=>o.id==='other--deck').width,600);
    assert.equal(e.layout.instances.other,undefined);
});

test('unreadable source drafts stay preserved instead of silently restoring a flat snapshot',()=>{
    const {EditorFiles}=require('../src/editor/EditorFiles.ts');
    let raw='{"version":99}',writes=0;const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
    Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:{getItem:()=>raw,setItem:()=>writes++,removeItem:()=>writes++}});
    try{
        assert.throws(()=>new EditorFiles().restoreSourceDraft(),/version/);assert.equal(writes,0);
        raw='{broken';assert.throws(()=>new EditorFiles().restoreSourceDraft());assert.equal(writes,0);
    }finally{if(previous===undefined)delete globalThis.localStorage;else Object.defineProperty(globalThis,'localStorage',previous);}
});
