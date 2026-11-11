require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {ParticleSystem}=require('../src/game/systems/ParticleSystem.ts');
const {World}=require('../src/game/World.ts');

test('ignition sparks follow the firing direction; contacts have distinct density and color',()=>{
 const right=new ParticleSystem(),up=new ParticleSystem();
 right.consume([{kind:'ignition',x:20,y:30,angle:0}]);up.consume([{kind:'ignition',x:20,y:30,angle:-Math.PI/2}]);
 assert.equal(right.flickerSparks.length,7);
 right.flickerSparks.forEach((spark,i)=>{assert.ok(spark.vx>0);assert.ok(Math.abs(up.flickerSparks[i].vx-spark.vy)<1e-8);assert.ok(Math.abs(up.flickerSparks[i].vy+spark.vx)<1e-8);});
 const counts={},colors={};for(const kind of ['enemy','terrain','blocked']){
  const p=new ParticleSystem();p.consume([{kind,x:0,y:0,angle:0}]);counts[kind]=p.flickerSparks.length;colors[kind]=p.flickerSparks[0].color;
 }
 assert.ok(counts.enemy>counts.terrain);assert.notEqual(colors.enemy,colors.blocked);assert.notEqual(colors.terrain,colors.enemy);
});

test('flight motes are spaced by distance across frame rates, shed behind shots and expire',()=>{
 for(const fps of [30,60,144]){
  const p=new ParticleSystem(),shot={owner:'player',x:0,y:50,width:16,height:9,vx:800,vy:0,age:0};
  for(let i=0;i<fps;i++){shot.x+=800/fps;shot.age+=1/fps;p.trail([shot],1/fps);}
  assert.ok(Math.abs(p.flickerSparks.length-80)<=1);
  assert.ok(p.flickerSparks.every(s=>s.x<=shot.x+8&&s.vx<0));
  p.update(.4);assert.equal(p.flickerSparks.length,0);
 }
});

test('sustained effects have a fixed particle budget and cannot change combat results',()=>{
 const p=new ParticleSystem();for(let i=0;i<1000;i++)p.consume([{kind:'enemy',x:0,y:0,angle:0}]);
 assert.ok(p.flickerSparks.length<=192);p.update(.5);assert.equal(p.flickerSparks.length,0);assert.equal(p.flicker.length,0);
 const level={width:4000,height:1200,solids:[{x:0,y:900,width:4000,height:300}],spawn:{x:300,y:848},enemies:[{kind:'zombie',x:500,y:852,left:500,right:500}],exit:{x:3800,y:792,width:64,height:108}};
 const worlds=[new World(level),new World(level)];worlds[1].effects.consume=()=>{};worlds[1].effects.trail=()=>{};
 for(const w of worlds){w.enemies[0].update=()=>{};for(let i=0;i<120;i++)w.update(1/120,{left:false,right:false,jump:false,fire:true});}
 const summary=w=>({defeated:w.defeated,ecto:w.ectoplasm.amount,health:w.player.health,shots:w.projectiles.map(s=>[s.x,s.y,s.vx,s.vy,s.age])});
 assert.deepEqual(summary(worlds[0]),summary(worlds[1]));
});
