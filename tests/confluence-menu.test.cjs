require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {validateConfluenceArt,trainPhase}=require('../src/ui/title/ConfluenceArt.ts');
const {artFrame}=require('../src/ui/title/TitleArt.ts');
const art=JSON.parse(fs.readFileSync('public/assets/mainmenu/confluence-v1/scene-v2.json','utf8'));

test('Confluence title metadata validates complete registered clips, masked effects and the art budget',()=>{
 validateConfluenceArt(art);assert.equal(art.layers.filter(l=>l.kind==='clip'&&l.clip==='cole').length,1);
 assert.equal(art.clips.cole.frames.length,8);assert.equal(artFrame(art.clips.cole,174),0);assert.equal(artFrame(art.clips.cole,175),1);assert.equal(artFrame(art.clips.cole,1400),0);
 assert.ok(art.clips.cole.frames.every(f=>f.emitter&&f.intensity>=0&&f.intensity<=1));
 assert.ok(Object.values(art.images).reduce((sum,im)=>sum+im.width*im.height*4,0)<64*1048576);
 for(const mutate of [a=>a.clips.cole.frames[0].rect[2]=100000,a=>a.clips.cat.frames[0].durationMs=0,a=>a.layers[0].image='missing',a=>a.layers[1].mask[0].x=-1,a=>a.layers[1].mask=[{x:1,y:1},{x:2,y:2},{x:3,y:3}],a=>a.clips.cole.frames[0].emitter.x=9999,a=>a.clips.cole.frames[0].intensity=2,a=>a.layers[1].gapMs=[100,1],a=>a.layers[1].kind='unknown',a=>a.layers[1].id=a.layers[0].id,a=>a.images.cole.optional=true,a=>a.images.plate.width=999999]){
  const bad=structuredClone(art);mutate(bad);assert.throws(()=>validateConfluenceArt(bad));
 }
});

test('the sparse train is deterministic at boundaries, uses quiet gaps and does not depend on render rate',()=>{
 const track=art.layers.find(l=>l.kind==='train');
 assert.equal(trainPhase(track,track.firstMs-1),undefined);assert.equal(trainPhase(track,track.firstMs),0);
 assert.equal(trainPhase(track,track.firstMs+track.durationMs/2),.5);assert.equal(trainPhase(track,track.firstMs+track.durationMs),undefined);
 for(const fps of [30,60,144]){let elapsed=0;for(let i=0;i<fps*24;i++)elapsed+=1000/fps;assert.ok(Math.abs(trainPhase(track,elapsed)-trainPhase(track,24000))<1e-9);}
 const seeds=[1,400,100000],next=seeds.map(seed=>{for(let t=track.firstMs+track.durationMs;t<100000;t+=100)if(trainPhase(track,t,seed)!==undefined)return t;});assert.ok(new Set(next).size>1);
});
