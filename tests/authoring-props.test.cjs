require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseLevelDocument}=require('../src/levels/LevelValidation.ts');
const {compileLevel}=require('../src/levels/LevelCompiler.ts');
const {EditorSession}=require('../src/editor/EditorSession.ts');
const {World}=require('../src/game/World.ts');
const {worldSnapshot}=require('../src/game/debug/WorldSnapshot.ts');
const {sceneAssetKeys}=require('../src/world/props/SceneAssetKeys.ts');
const {sceneArt}=require('../src/world/props/SceneArtCatalog.ts');
const {selectionBounds}=require('../src/editor/EditorSelection.ts');
const rebuilt=require('../public/levels/last-platform-rebuild.json');
const world=d=>new World(compileLevel(d));

test('a renamed level retains explicit art, mounted furniture and physical/story boundaries',()=>{
    const d=parseLevelDocument({...rebuilt,id:'fresh-station'}),w=world(d),without=world({...d,props:[]});
    assert.equal(d.presentation.environment,'confluence');assert.ok(w.level.props.length>20);
    assert.deepEqual(w.level.solids.map(r=>({x:r.x,y:r.y,width:r.width,height:r.height})),without.level.solids.map(r=>({x:r.x,y:r.y,width:r.width,height:r.height})));
    assert.ok(sceneAssetKeys(d).includes('confluence-bench'));assert.ok(sceneAssetKeys(d).includes('confluence-shutter-open'));
});

test('moving a room carries its furniture, interaction and visible artwork through history and export',()=>{
    const s=new EditorSession(parseLevelDocument(rebuilt)),before=world(s.document),d=s.document,r=d.terrain.find(r=>r.id==='registry');
    s.apply({levelId:d.id,baseRevision:d.revision,operations:[{op:'upsert',collection:'terrain',value:{...r,x:r.x+32,y:r.y+16}}]});
    const after=world(s.document),ledger=id=>id.interactables.find(o=>o.id==='registry-transfer-ledger');
    assert.equal(ledger(after).x-ledger(before).x,32);assert.equal(ledger(after).y-ledger(before).y,16);
    const a=before.level.props.find(p=>p.definition.mount.parent==='registry'),b=after.level.props.find(p=>p.id===a.id);
    assert.equal(b.x-a.x,32);assert.equal(b.y-a.y,16);
    assert.equal(selectionBounds(s.document,{collection:'props',id:a.id}).x,b.x);
    assert.equal(selectionBounds(s.document,{collection:'interactables',id:ledger(after).id}).x,ledger(after).x);
    s.undo();assert.equal(ledger(world(s.document)).x,ledger(before).x);s.redo();assert.equal(ledger(world(s.document)).x,ledger(after).x);
    assert.deepEqual(parseLevelDocument(JSON.parse(JSON.stringify(s.document))),s.document);
});

test('visual-only adjustments preserve reach and solid blockers',()=>{
    const d=parseLevelDocument(rebuilt),before=world(d),gate=d.interactables.find(o=>o.id==='departure-shutter');gate.visual.x-=8;
    const after=world(d),bounds=w=>w.interactables.map(o=>[o.id,o.x,o.y,o.width,o.height,o.definition.reach,o.definition.solid]);
    assert.deepEqual(bounds(after),bounds(before));assert.equal(after.level.solids.length,before.level.solids.length);
});

test('a right-edge mount follows parent resizing without changing its authored offset',()=>{
    const d=parseLevelDocument(rebuilt);d.props.push({id:'edge-lamp',asset:'confluence-lamp',x:-56,y:-176,width:56,height:176,mount:{parent:'registry',socket:'topRight'}});
    const before=world(d).level.props.find(p=>p.id==='edge-lamp');d.terrain.find(r=>r.id==='registry').width+=32;
    const after=world(d).level.props.find(p=>p.id==='edge-lamp');assert.equal(after.x-before.x,32);assert.equal(after.definition.mount.socket,'topRight');assert.equal(d.props.at(-1).x,-56);
});

test('railings have one visual envelope and a transparent fallback independent of terrain cells',()=>{
    const {Railing}=require('../src/world/structures/Railing.ts');const {RailingRenderer}=require('../src/world/surfaces/RailingRenderer.ts');
    const railing=new Railing({id:'rail',x:20,y:40,width:317,height:48});assert.equal(railing.colliderParts().length,0);assert.equal(railing.surfaces()[0].appearance,'railing');assert.equal(railing.surfaces().length,1);
    const fills=[],ctx=new Proxy({fillRect(...r){fills.push(r);}},{get:(o,k)=>k in o?o[k]:()=>{}});new RailingRenderer(ctx).draw(railing);
    assert.ok(fills.length>5);assert.ok(!fills.some(r=>r[2]===317&&r[3]===48),'fallback leaves the openings clear');
});

test('bad assets, inherited socket names, parent types, duplicate IDs and invalid visuals are atomic',()=>{
    for(const change of [d=>d.props[0].asset='missing-asset',d=>d.props[0].mount.parent='soul-river',d=>d.props[0].mount.socket='toString',d=>d.props[0].id='arrivals',d=>d.props[0].x=-9999,d=>d.props[0].unexpected=true,d=>d.props[0].light=101,d=>d.interactables[0].visual.asset='constructor',d=>d.interactables[0].visual.y=-9000,d=>d.presentation.scenery='unknown']){
        const s=new EditorSession(parseLevelDocument(rebuilt)),before=s.document,bad=structuredClone(before);change(bad);
        assert.throws(()=>s.replace(bad,before.revision));assert.deepEqual(s.document,before);
    }
});

test('observations are detached snapshots rather than entity, collision or narrative handles',()=>{
    const w=world(rebuilt),s=worldSnapshot(w,'playing'),x=w.player.x;
    s.player.x=-1000;s.collision[0].x=-1000;s.interactions[0].collected=true;s.enemies.length=0;
    const next=worldSnapshot(w,'playing');assert.equal(next.player.x,x);assert.ok(next.collision[0].x>=0);assert.equal(next.interactions[0].collected,false);assert.ok(next.enemies.length>0);
    assert.equal(next.level.revision,rebuilt.revision);assert.equal(next.collision.find(r=>r.owner==='viaduct-west').height,24);
});

test('catalog rectangles stay inside their registered packs',()=>{
    const sizes={props:[768,576],canopy:[480,198],facades:[768,768],architecture:[1024,768],landmarks:[768,512],buildingWalls:[384,384],buildingTrims:[768,768],terrain:[192,192]};
    for(const [key,a] of Object.entries(sceneArt))for(const f of [a.frame,...(a.variants??[])]){const [w,h]=sizes[a.pack];assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=w&&f.y+f.height<=h,key);}
});

test('mirrored tiled props cover the visible end and respect inherited preview opacity',()=>{
    const {PropRenderer}=require('../src/world/props/PropRenderer.ts'),draws=[];
    const ctx={globalAlpha:.5,save(){},restore(){},translate(){},scale(){},beginPath(){},rect(){},clip(){},drawImage(...args){draws.push({args,alpha:this.globalAlpha});}};
    const r={x:1000,y:0,width:960,height:192},view={x:1800,y:0,width:160,height:192};
    new PropRenderer(ctx,{buildingWalls:{naturalWidth:384,naturalHeight:384}}).draw('confluence-wall-0',r,{flip:true,opacity:50},view);
    assert.ok(draws.some(({args:a})=>{const mirroredX=2*r.x+r.width-a[5]-a[7];return mirroredX<view.x+view.width&&mirroredX+a[7]>view.x;}));
    assert.ok(draws.every(d=>d.alpha===.25));
});

test('legacy import converts comparison art once into explicit presentation data',()=>{
    const current=require('../public/levels/last-platform-demo.json'),d=structuredClone(current),compiled=compileLevel(d);
    d.schemaVersion=1;d.tileSize=48;delete d.gridSize;delete d.water;delete d.props;delete d.presentation;
    for(const r of [...d.terrain,...d.decorations])for(const key of ['kind','material','mount','thickness','layer','depth'])delete r[key];
    d.interactables=compiled.interactables.map(o=>{const r={...o};delete r.mount;delete r.visual;return r;});
    const upgraded=parseLevelDocument(d);assert.equal(upgraded.schemaVersion,2);assert.equal(upgraded.presentation.scenery,'authored');assert.ok(upgraded.props.length>700);assert.ok(upgraded.interactables.every(o=>o.visual));
    assert.deepEqual(parseLevelDocument(upgraded),upgraded);
});
