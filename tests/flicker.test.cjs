require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {FlickerProjectile} = require('../src/components/FlickerProjectile.ts');
const {FixedClock} = require('../src/game/FixedClock.ts');
const {flicker} = require('../src/weapons/Flicker.ts');
const {flickerDirection} = require('../src/game/FlickerVisuals.ts');
const {Ectoplasm} = require('../src/game/Ectoplasm.ts');
const {tuning:T} = require('../src/game/config.ts');
const idle={left:false,right:false,jump:false,fire:false};
const level=(extra={})=>({width:4000,height:1200,solids:[{x:0,y:900,width:4000,height:300}],spawn:{x:300,y:848},enemies:[],exit:{x:3800,y:792,width:64,height:108},...extra});
const run=(w,seconds,input=idle)=>{for(let n=0;n<Math.round(seconds/T.step);n++)w.update(T.step,input);};

test('Flicker fires immediately at zero reserve, costs nothing, and preserves exact five-shot cadence at 30/60/144 FPS',()=>{
    for(const fps of [30,60,144]) {
        const w=new World(level()),clock=new FixedClock(),shots=[];
        w.ectoplasm.spend(w.ectoplasm.amount);
        for(let frame=0;frame<fps*2;frame++)clock.advance(1/fps,dt=>{
            w.update(dt,{...idle,fire:true});if(w.events.includes('fire'))shots.push(w.elapsed);
        });
        assert.equal(shots.length,10);assert.equal(shots[0],T.step);
        for(let i=1;i<shots.length;i++)assert.ok(Math.abs(shots[i]-shots[i-1]-.2)<1e-8);
        assert.equal(w.ectoplasm.amount,0);assert.equal(w.player.weapons.selected.definition,flicker);
    }
});

test('release/repress and pause clearing cannot bypass cadence, while fresh runs reset it',()=>{
    const w=new World(level()); w.update(T.step,{...idle,fire:true});
    for(let i=0;i<20;i++){w.player.clearActions();w.update(T.step,{...idle,fire:i%2===0});assert.ok(!w.events.includes('fire'));}
    run(w,.05,{...idle,fire:true});assert.ok(w.projectiles.length>=2);
    const fresh=new World(level());fresh.update(T.step,{...idle,fire:true});assert.ok(fresh.events.includes('fire'));
});

test('flight has a fixed range and lifetime, including an exact final partial step, with no physics flicker',()=>{
    const w=new World(level({solids:[],spawn:{x:200,y:300}}));
    const shot=new FlickerProjectile({x:500,y:300,vx:800});
    assert.equal(shot.manifest(w,24),true);assert.equal(shot.life,.9);assert.equal(shot.age,0);
    for(let n=0;n<8;n++)assert.equal(shot.update(w,.1),true);
    assert.equal(shot.update(w,.15),false);
    assert.ok(Math.abs(shot.x-(500+24+720))<1e-8); assert.ok(Math.abs(shot.y-300)<1e-8);
    assert.ok(Math.abs(shot.age-.9)<1e-8);
});

test('the first target takes one damage with no stagger, piercing, or hit-generated ectoplasm',()=>{
    const w=new World(level({enemies:[{kind:'zombie',x:500,y:852,left:500,right:500},{kind:'zombie',x:600,y:852,left:600,right:600}]}));
    for(const e of w.enemies){e.update=()=>{};e.vx=23;}
    const initial=w.ectoplasm.amount;
    w.projectiles.push(new FlickerProjectile({x:400,y:865,vx:800}));run(w,.3);
    assert.equal(w.enemies[0].health,2);assert.equal(w.enemies[1].health,3);
    assert.equal(w.enemies[0].vx,23);assert.equal(w.projectiles.length,0);assert.equal(w.ectoplasm.amount,initial);
});

test('stone, damage, and armor produce distinct feedback; phased enemies remain unharmed',()=>{
    const stone=new World(level({solids:[{x:340,y:830,width:1,height:70},{x:0,y:900,width:4000,height:300}]}));
    stone.update(T.step,{...idle,fire:true});run(stone,.1);
    assert.ok(stone.effects.flicker.some(e=>e.kind==='terrain'));
    const w=new World(level({enemies:[{kind:'wight',x:500,y:852,left:500,right:500}]}));
    w.enemies[0].update=()=>{};w.enemies[0].facing=-1;
    w.projectiles.push(new FlickerProjectile({x:470,y:865,vx:800}));run(w,.05);
    assert.equal(w.enemies[0].health,5);assert.ok(w.effects.flicker.some(e=>e.kind==='blocked'));
    w.enemies[0].state='windup';w.projectiles.push(new FlickerProjectile({x:470,y:865,vx:800}));run(w,.05);
    assert.equal(w.enemies[0].health,4);assert.ok(w.effects.flicker.some(e=>e.kind==='enemy'));
    const phase=new World(level({enemies:[{kind:'ghost',x:500,y:852,left:500,right:500}]}));
    phase.enemies[0].update=()=>{};phase.projectiles.push(new FlickerProjectile({x:470,y:865,vx:800}));run(phase,.1);
    assert.equal(phase.enemies[0].health,3);assert.equal(phase.projectiles.length,1);
});

test('one-time defeat rewards recover ectoplasm, clamp at capacity, and cannot farm duplicate defeats or revivals',()=>{
    const w=new World(level({enemies:[{kind:'zombie',x:500,y:852,left:500,right:500}]})),enemy=w.enemies[0];
    w.ectoplasm.spend(6);assert.equal(w.ectoplasm.amount,0);
    w.combat.hitEnemy(enemy,800);assert.equal(w.ectoplasm.amount,0);
    w.combat.hitEnemy(enemy,800);w.combat.hitEnemy(enemy,800);
    assert.equal(w.ectoplasm.amount,1);assert.equal(w.defeated,1);assert.ok(w.events.includes('ectoplasm'));
    w.combat.defeatEnemy(enemy);assert.equal(w.ectoplasm.amount,1);assert.equal(w.corpses.length,1);
    const corpse=w.corpses[0];corpse.claimedBy=99;assert.equal(w.graveyard.reactivate(corpse,99),true);
    while(enemy.health>0)w.combat.hitEnemy(enemy,800);
    assert.equal(w.ectoplasm.amount,1);assert.equal(w.defeated,1);
    w.ectoplasm.recover(100);assert.equal(w.ectoplasm.amount,12);
    assert.equal(w.ectoplasm.recover(1),0);assert.equal(w.ectoplasm.spend(13),false);
    assert.equal(w.ectoplasm.spend(-1),false);assert.equal(w.ectoplasm.spend(NaN),false);
    assert.equal(new Ectoplasm().amount,6);
});

test('packed direction rows follow the actual velocity; cosmetic effects expire without affecting combat',()=>{
    const directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    directions.forEach(([x,y],row)=>assert.equal(flickerDirection(x,y),row));
    const w=new World(level());w.update(T.step,{...idle,fire:true});assert.ok(w.effects.flicker.some(e=>e.kind==='ignition'));
    const health=w.player.health;run(w,.3);assert.equal(w.effects.flicker.length,0);assert.equal(w.player.health,health);
});
