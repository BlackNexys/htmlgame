require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {resolveAim} = require('../src/game/movement/PlayerAim.ts');
const {overlaps} = require('../src/game/movement/physics.ts');
const {EnemyProjectile} = require('../src/components/EnemyProjectile.ts');
const {CharacterAnimation} = require('../src/game/animation/CharacterAnimation.ts');
const {tuning: T} = require('../src/game/config.ts');
const {flicker} = require('../src/weapons/Flicker.ts');
const idle = {left:false, right:false, up:false, down:false, jump:false, jumpHeld:false, fire:false};
const floor = {x:0, y:600, width:3000, height:100};
const level = (extra={}) => ({width:3000, height:1000, solids:[floor], spawn:{x:300,y:548}, enemies:[], exit:{x:2800,y:492,width:64,height:108}, ...extra});
const step = (world, input={}) => world.update(T.step, {...idle,...input});
const run = (world, seconds, input={}) => {for(let n=0;n<Math.round(seconds/T.step);n++)step(world,input);};

test('crouching preserves feet, lowers shots and limits creep even with sprint held', () => {
    const standing = new World(level()); step(standing,{fire:true});
    const world = new World(level()); step(world,{down:true, fire:true});
    assert.equal(world.player.height,T.crouchHeight); assert.equal(world.player.y2,600);
    assert.equal(world.player.motion,'crouching'); assert.equal(world.player.grounded,true);
    assert.ok(world.projectiles[0].y-standing.projectiles[0].y>=12);
    assert.equal(world.projectiles[0].vy,0);
    run(world,.5,{down:true,right:true,sprint:true}); assert.equal(world.player.vx,T.crouchSpeed);
    step(world); assert.equal(world.player.height,T.standingHeight); assert.equal(world.player.y2,600);
    step(world,{down:true}); step(world,{down:true,jump:true,jumpHeld:true});
    assert.equal(world.player.crouched,false); assert.ok(world.player.vy < -600);
});

test('a low passage keeps the hero crouched on release and blocks jumping until clear', () => {
    const roof = {x:400,y:500,width:200,height:66}; // 34px clearance
    const world = new World(level({solids:[floor,roof]}));
    run(world,1.2,{right:true,down:true}); assert.ok(world.player.x>400 && world.player.x<600);
    step(world); assert.equal(world.player.crouched,true); assert.equal(overlaps(world.player,roof),false);
    step(world,{jump:true,jumpHeld:true}); assert.equal(world.player.vy,0);
    run(world,.3); assert.equal(world.player.movement.jumpedThisStep,false);
    run(world,1.7,{right:true}); assert.ok(world.player.x>600);
    assert.equal(world.player.crouched,false); assert.equal(world.player.y2,600);
    step(world,{jump:true,jumpHeld:true}); assert.ok(world.player.vy<0);
});

test('walking off a ledge expands the body and turns held Down into downward aim', () => {
    const world = new World(level({solids:[{...floor,width:400}],spawn:{x:360,y:548}}));
    run(world,.5,{down:true,right:true});
    assert.equal(world.player.grounded,false); assert.equal(world.player.crouched,false);
    assert.deepEqual(world.player.aim,{x:1,y:1});
});

test('eight aim directions normalize speed, preserve vertical facing, and cancel opposing keys', () => {
    for(const x of [-1,0,1])for(const y of [-1,0,1]){
        if(!x&&!y)continue;
        const world=new World(level({spawn:{x:300,y:300}})); world.player.facing=-1;
        step(world,{left:x<0,right:x>0,up:y<0,down:y>0,fire:true});
        const shot=world.projectiles[0]; assert.ok(shot);
        assert.equal(Math.sign(shot.vx),x); assert.equal(Math.sign(shot.vy),y);
        assert.ok(Math.abs(Math.hypot(shot.vx,shot.vy)-flicker.projectile.speed)<1e-8);
        if(!x)assert.equal(world.player.facing,-1);
    }
    assert.deepEqual(resolveAim({...idle,left:true,right:true},false,-1),{x:-1,y:0});
    assert.deepEqual(resolveAim({...idle,up:true,down:true},false,1),{x:1,y:0});
    const world=new World(level()); step(world,{up:true,down:true});
    assert.equal(world.player.crouched,false); assert.deepEqual(world.player.aim,{x:1,y:0});
});

test('upward bolts hit elevated enemies and thin ceilings block the muzzle path', () => {
    const world=new World(level({enemies:[{x:301,y:400,left:301,right:301,kind:'zombie'}]}));
    world.enemies[0].update=()=>{};
    run(world,.8,{up:true,fire:true}); assert.equal(world.defeated,1);
    for(const facing of [-1,1]){
        const wall={x:facing===1?333:298,y:540,width:1,height:60};
        const blocked=new World(level({solids:[floor,wall]})); blocked.player.facing=facing;
        step(blocked,{fire:true}); assert.equal(blocked.projectiles.length,0);
    }
    const ceiling={x:290,y:540,width:60,height:1};
    const blocked=new World(level({solids:[floor,ceiling]}));
    step(blocked,{up:true,fire:true}); assert.equal(blocked.projectiles.length,0);
});

test('lowering the collision body avoids high bolts but low bolts still hurt', () => {
    for(const crouch of [false,true]){
        const world=new World(level()); if(crouch)step(world,{down:true});
        world.projectiles.push(new EnemyProjectile({x:280,y:550,vx:800}));
        run(world,.08,crouch?{down:true}:{});
        assert.equal(world.player.health,T.playerHealth-(crouch?0:1));
    }
    const world=new World(level()); step(world,{down:true});
    world.projectiles.push(new EnemyProjectile({x:280,y:578,vx:800}));
    run(world,.08,{down:true}); assert.equal(world.player.health,T.playerHealth-1);
});

test('crouch and aimed attacks use dedicated poses; clearing actions removes held aim', () => {
    const world=new World(level()), animation=new CharacterAnimation();
    step(world,{down:true}); let pose=animation.sample(world.player);
    assert.equal(pose.base.sheet,'aim'); assert.equal(pose.base.row,0);
    step(world,{down:true,fire:true}); animation.update(world.player,T.step,world.events);
    assert.equal(animation.sample(world.player).base.row,1);
    assert.equal(animation.sample(world.player).upper,undefined);
    step(world,{up:true,right:true}); pose=animation.sample(world.player);
    assert.equal(pose.upper.column,2); assert.equal(pose.upper.sheet,'aim');
    world.player.clearActions(); assert.deepEqual(world.player.aim,{x:world.player.facing,y:0});
    const fresh=new World(level()); assert.equal(fresh.player.crouched,false);
    assert.deepEqual(fresh.player.aim,{x:1,y:0});
});
