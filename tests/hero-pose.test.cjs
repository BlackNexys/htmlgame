require('./register.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');
const {World}=require('../src/game/World.ts');
const {heroMuzzle,heroAimPose}=require('../src/game/animation/HeroPose.ts');
const {CharacterAnimation}=require('../src/game/animation/CharacterAnimation.ts');
const {Flicker}=require('../src/weapons/Flicker.ts');
const level={width:4000,height:1000,solids:[],spawn:{x:300,y:300},enemies:[],exit:{x:3800,y:792,width:64,height:108}};

test('all stance/direction/facing combinations ignite at the rendered palm and launch along aim',()=>{
 for(const stance of ['idle','running','sprinting','crouching','airborne'])for(const facing of [-1,1])for(const [x,y] of [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]]){
  const w=new World(level),p=w.player,a=new CharacterAnimation();p.motion=stance;p.facing=facing;p.grounded=stance!=='airborne';p.height=stance==='crouching'?32:52;p.aim={x,y};p.firing=true;
  new Flicker().fire(w,p);a.update(p,1/120,w.events);
  const palm=heroMuzzle(p),pose=heroAimPose(p),upper=a.sample(p).upper,shot=w.projectiles[0];
  assert.ok(shot);assert.equal(upper.row,pose.row);assert.equal(upper.column,pose.column);
  assert.equal(upper.offsetY,pose.offsetY);assert.equal(upper.offsetX,0);
  assert.ok(Math.abs(shot.x+shot.width/2-palm.x)<1e-8);assert.ok(Math.abs(shot.y+shot.height/2-palm.y)<1e-8);
  assert.deepEqual(w.weaponEvents[0],{kind:'ignition',...palm,angle:Math.atan2(y,x)});
  assert.equal(Math.sign(shot.vx),x);assert.equal(Math.sign(shot.vy),y);
 }
});

test('the body-to-palm sweep cannot ignite beyond a thin wall in either facing',()=>{
 for(const facing of [-1,1]){
  const wall={x:facing===1?334:298,y:280,width:1,height:100};
  const w=new World({...level,solids:[wall]}),p=w.player;p.aim={x:facing,y:0};p.facing=facing;
  new Flicker().fire(w,p);assert.equal(w.projectiles.length,0);
  assert.ok(!w.weaponEvents.some(e=>e.kind==='ignition'));assert.ok(w.weaponEvents.some(e=>e.kind==='terrain'));
 }
});
