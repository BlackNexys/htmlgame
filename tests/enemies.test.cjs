require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {vulnerable, shieldRaised} = require('../src/game/Enemy.ts');
const {enemyFrame} = require('../src/game/EnemyVisual.ts');
const {tuning: T} = require('../src/game/config.ts');
const {impactTime} = require('../src/game/physics.ts');
const idle = {left:false,right:false,jump:false,fire:false};
const spawn = (kind,x=320) => ({kind,x,y:528,left:x-120,right:x+120});
function worldFor(enemies,playerX=100,solids=[{x:0,y:576,width:2400,height:48}]) {
    const world=new World({width:2400,height:672,solids,spawn:{x:playerX,y:524},enemies,exit:{x:2200,y:468,width:64,height:108}});
    world.player.health=100; return world;
}
function run(world,seconds,input=idle){for(let i=0;i<Math.round(seconds/T.step);i++)world.update(T.step,input);}
function until(world,predicate,seconds=6){for(let i=0;i<seconds/T.step;i++){if(predicate())return;world.update(T.step,idle);}assert.ok(predicate(),'condition did not become true');}
function kill(world,e){while(e.health>0)world.hitEnemy(e,e.facing*800);}

test('zombie gives a tell, commits its lunge direction, then stops to recover',()=>{
    const w=worldFor([spawn('zombie')],200),e=w.enemies[0];e.cooldown=0;
    until(w,()=>e.state==='windup');const facing=e.facing,x=e.x;
    assert.equal(enemyFrame(e,w.elapsed).column,0);
    w.player.x=e.x+110;until(w,()=>e.state==='attack');
    assert.equal(e.facing,facing);run(w,.1);assert.ok(e.x<x);
    until(w,()=>e.state==='recover');const stopped=e.x;run(w,.2);
    assert.equal(e.x,stopped);assert.equal(e.vx,0);
});

test('skeleton locks a horizontal firing lane instead of tracking behind itself',()=>{
    const w=worldFor([spawn('skeleton')]),e=w.enemies[0];e.cooldown=0;
    until(w,()=>e.state==='windup');assert.equal(e.facing,-1);
    w.player.x=600;until(w,()=>w.projectiles.some(p=>p.owner==='enemy'));
    const shot=w.projectiles.find(p=>p.owner==='enemy');assert.ok(shot.vx<0);assert.equal(shot.vy,0);
    assert.equal(e.state,'attack');assert.equal(enemyFrame(e,w.elapsed).column,2);
});

test('a wall prevents an enemy starting a ranged attack through it',()=>{
    const w=worldFor([spawn('skeleton')],100,[{x:0,y:576,width:2400,height:48},{x:230,y:380,width:48,height:196}]);
    let fired=false;for(let i=0;i<360;i++){w.update(T.step,idle);fired ||= w.events.includes('enemyFire');}
    assert.equal(fired,false);
});

test('ghoul crouches before a fast committed leap and has a stationary recovery',()=>{
    const w=worldFor([spawn('ghoul')]),e=w.enemies[0];e.cooldown=0;
    until(w,()=>e.state==='windup');assert.equal(e.vx,0);
    until(w,()=>e.state==='attack');assert.ok(e.vy<0);assert.equal(e.grounded,false);
    const direction=e.facing;w.player.x=700;run(w,.05);
    assert.equal(e.facing,direction);assert.ok(Math.abs(e.vx)>T.speed);
    until(w,()=>e.state==='recover');assert.equal(e.vx,0);
});

test('ghost phases harmlessly, becomes vulnerable for its attack and recovery, then phases again',()=>{
    const w=worldFor([spawn('ghost')]),e=w.enemies[0];
    assert.equal(vulnerable(e),false);w.hitEnemy(e,800);assert.equal(e.health,e.maxHealth);
    until(w,()=>e.state==='windup');assert.equal(vulnerable(e),true);
    w.hitEnemy(e,800);assert.equal(e.health,e.maxHealth-1);
    until(w,()=>e.state==='recover');assert.equal(vulnerable(e),true);
    until(w,()=>e.state==='phase');const health=e.health;w.hitEnemy(e,800);assert.equal(e.health,health);
});

test('phased ghost lets a player projectile pass through without consuming it',()=>{
    const w=worldFor([spawn('ghost')]),e=w.enemies[0];
    w.projectiles.push({x:e.x-25,y:e.y+20,width:16,height:9,vx:10000,life:1});
    w.update(T.step,idle);assert.equal(e.health,e.maxHealth);assert.equal(w.projectiles.length,1);
});

test('wight blocks front shots but exposes its back, windup and recovery',()=>{
    const w=worldFor([spawn('wight')],220),e=w.enemies[0];
    assert.equal(shieldRaised(e),true);w.hitEnemy(e,800);assert.equal(e.health,e.maxHealth);assert.ok(w.events.includes('block'));
    w.hitEnemy(e,-800);assert.equal(e.health,e.maxHealth-1);
    e.cooldown=0;until(w,()=>e.state==='windup');assert.equal(shieldRaised(e),false);
    w.hitEnemy(e,800);assert.equal(e.health,e.maxHealth-2);
    until(w,()=>e.state==='recover');assert.equal(shieldRaised(e),false);
});

test('enemy bolts damage only the player and terrain blocks aimed diagonal travel',()=>{
    const w=worldFor([spawn('skeleton',400)]);const e=w.enemies[0];
    w.projectiles.push({x:170,y:546,width:12,height:8,vx:-600,vy:0,life:1,owner:'enemy'});
    run(w,.1);assert.equal(w.player.health,99);assert.equal(e.health,e.maxHealth);
    const blocked=worldFor([],100,[{x:0,y:576,width:2400,height:48},{x:150,y:350,width:4,height:226}]);
    blocked.projectiles.push({x:220,y:400,width:12,height:8,vx:-20000,vy:20000,life:1,owner:'enemy'});
    blocked.update(T.step,idle);assert.equal(blocked.projectiles.length,0);assert.equal(blocked.player.health,100);
    assert.notEqual(impactTime({x:200,y:400,width:12,height:8},-180,140,{x:150,y:350,width:4,height:226}),undefined);
});

test('damaging a channeling necromancer interrupts its link without consuming a revive',()=>{
    const w=worldFor([spawn('zombie',300),spawn('necromancer',500)]),[body,caster]=w.enemies;
    kill(w,body);until(w,()=>caster.state==='windup');
    assert.equal(w.corpses[0].claimedBy,caster.id);assert.equal(caster.targetId,body.id);
    w.hitEnemy(caster,800);assert.equal(caster.state,'recover');assert.equal(caster.targetId,undefined);
    assert.equal(w.corpses[0].claimedBy,undefined);run(w,1.7);
    assert.equal(caster.reviveBudget,T.reviveBudget);assert.equal(w.enemies.some(e=>e.id===body.id),false);
});

test('reactivation is limited per corpse, does not duplicate defeat credit, and grants a wake-up grace period',()=>{
    const w=worldFor([spawn('zombie',300),spawn('necromancer',500)]),[body,caster]=w.enemies;
    kill(w,body);assert.equal(w.defeated,1);
    until(w,()=>w.enemies.some(e=>e.id===body.id&&e.revives===1));
    const revived=w.enemies.find(e=>e.id===body.id);assert.equal(caster.reviveBudget,1);
    assert.equal(revived.state,'recover');assert.ok(revived.grace>0);assert.equal(w.corpses.length,0);
    kill(w,revived);assert.equal(w.defeated,1);assert.equal(w.corpses[0].revivable,false);
    run(w,6);assert.equal(w.enemies.some(e=>e.id===body.id),false);assert.equal(caster.reviveBudget,1);
});

test('necromancer has a finite budget and two casters cannot claim one body',()=>{
    const w=worldFor([spawn('zombie',260),spawn('skeleton',300),spawn('ghoul',350),spawn('necromancer',500)]);
    const caster=w.enemies[3];w.enemies.slice(0,3).forEach(e=>kill(w,e));
    until(w,()=>caster.reviveBudget===0,12);assert.equal(w.corpses.filter(c=>c.revivable).length,1);
    run(w,5);assert.equal(caster.reviveBudget,0);assert.equal(caster.state==='windup',false);
    const shared=worldFor([spawn('zombie',300),spawn('necromancer',450),spawn('necromancer',550)]);
    kill(shared,shared.enemies[0]);run(shared,.5);
    assert.equal(shared.enemies.filter(e=>e.kind==='necromancer'&&e.state==='windup').length,1);
    const claimant=shared.enemies.find(e=>e.id===shared.corpses[0].claimedBy);kill(shared,claimant);
    assert.equal(shared.corpses.find(c=>c.enemy.kind==='zombie').claimedBy,undefined);
});

test('walkers turn at unsupported edges and a fresh world clears corpses, shots and revive state',()=>{
    const w=worldFor([spawn('zombie',215)],1500,[{x:200,y:576,width:80,height:48}]);
    const e=w.enemies[0];e.facing=1;run(w,2);assert.equal(e.y+e.height,576);assert.ok(e.x>=200&&e.x+e.width<=280);
    const fresh=new World();assert.equal(new Set(fresh.enemies.map(e=>e.kind)).size,6);
    assert.equal(fresh.corpses.length,0);assert.equal(fresh.projectiles.length,0);
    assert.equal(fresh.enemies.find(e=>e.kind==='necromancer').reviveBudget,T.reviveBudget);
});
