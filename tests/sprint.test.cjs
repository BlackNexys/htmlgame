require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {World}=require('../src/game/World.ts');
const {FixedClock}=require('../src/game/FixedClock.ts');
const {tuning:T}=require('../src/game/config.ts');
const idle={left:false,right:false,up:false,down:false,jump:false,jumpHeld:false,jumpReleased:false,sprint:false,fire:false};
const sprint={...idle,right:true,sprint:true};
const fixture=(extra={})=>new World({width:10000,height:2400,solids:[{x:0,y:1200,width:10000,height:1200}],spawn:{x:500,y:1148},enemies:[],exit:{x:9800,y:1092,width:64,height:108},...extra});
const run=(world,seconds,input=sprint)=>{for(let i=0;i<Math.round(seconds/T.step);i++)world.update(T.step,input);};

test('sprint earns a modest higher cap over a visible buildup and leaves normal running responsive',()=>{
 const w=fixture();run(w,.15);const early=w.player.vx;run(w,.15);const middle=w.player.vx;run(w,.35);
 assert.ok(early>T.speed&&early<T.sprintSpeed-50);assert.ok(middle>early&&middle<T.sprintSpeed-30);
 assert.equal(w.player.vx,480);assert.equal(w.player.sprintCharge,1);
 const normal=fixture();run(normal,.2,{...idle,right:true});assert.equal(normal.player.vx,T.speed);assert.equal(normal.player.sprintCharge,0);
});

test('stopping, reversing, crouching, blocked travel and pause clear sprint buildup',()=>{
 for(const input of [idle,{...sprint,left:true,right:false},{...sprint,down:true}]){
  const w=fixture();run(w,.8);w.update(T.step,input);assert.equal(w.player.sprintCharge,0);
 }
 const paused=fixture();run(paused,.8);const vx=paused.player.vx;paused.player.clearActions();assert.equal(paused.player.sprintCharge,0);assert.equal(paused.player.vx,vx);
 const wall=fixture({solids:[{x:0,y:1200,width:10000,height:1200},{x:600,y:700,width:48,height:500}]});
 run(wall,1);assert.equal(wall.player.x2,600);assert.equal(wall.player.vx,0);assert.equal(wall.player.sprintCharge,0);
 const fresh=fixture();assert.equal(fresh.player.sprintCharge,0);
});

test('earned sprint momentum carries through jumps while airborne input cannot charge a fresh boost',()=>{
 const w=fixture();run(w,.8);w.update(T.step,{...sprint,jump:true,jumpHeld:true});
 assert.equal(w.player.vx,T.sprintSpeed);assert.equal(w.player.sprintCharge,1);assert.equal(w.player.grounded,false);
 run(w,.2,{...sprint,jumpHeld:true});assert.equal(w.player.vx,T.sprintSpeed);
 const falling=fixture({spawn:{x:500,y:700}});run(falling,.2);assert.equal(falling.player.sprintCharge,0);assert.ok(falling.player.vx<=T.speed);
});

test('sprint buildup, top speed and travel are equivalent at 30/60/144 presentation FPS',()=>{
 const values=[30,60,144].map(fps=>{const w=fixture(),clock=new FixedClock();for(let f=0;f<fps;f++)clock.advance(1/fps,dt=>w.update(dt,sprint));return [w.player.x,w.player.vx,w.player.sprintCharge];});
 for(const value of values)for(let i=0;i<3;i++)assert.ok(Math.abs(value[i]-values[0][i])<1e-8);
});
