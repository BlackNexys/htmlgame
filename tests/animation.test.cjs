require('./register.cjs');
const {createActionLevel} = require('./helpers/engine-fixture.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {CharacterAnimation} = require('../src/game/animation/CharacterAnimation.ts');
const advance = (animation, world, dt, events = []) => animation.update(world.player, dt, events, world.state === 'dead');

test('idle, run and airborne select different rows and airborne poses follow velocity', () => {
    const world = new World(createActionLevel()); const animation = new CharacterAnimation();
    assert.equal(animation.sample(world.player).base.row, 0);
    advance(animation, world, .2); assert.equal(animation.sample(world.player).base.column, 1);
    world.player.motion = 'running'; assert.equal(animation.sample(world.player).base.row, 1);
    world.player.grounded = false; world.player.vy = -660;
    assert.equal(animation.sample(world.player).base.column, 0);
    world.player.vy = -600;
    assert.equal(animation.sample(world.player).base.row, 2); assert.equal(animation.sample(world.player).base.column, 1);
    world.player.vy = 0; assert.equal(animation.sample(world.player).base.column, 3);
    world.player.vy = 300; assert.equal(animation.sample(world.player).base.column, 4);
});

test('firing preserves moving legs and damage temporarily overrides attack', () => {
    const world = new World(createActionLevel()); const animation = new CharacterAnimation();
    world.player.motion = 'running'; advance(animation, world, .01, ['fire']);
    assert.equal(animation.sample(world.player).base.row, 1); assert.equal(animation.sample(world.player).upper.row, 7);
    advance(animation, world, .01, ['hurt']); assert.equal(animation.sample(world.player).base.row, 4);
    advance(animation, world, .35); assert.equal(animation.sample(world.player).base.row, 1); assert.equal(animation.sample(world.player).upper, undefined);
});

test('stride follows travelled distance, holds at rest and preserves phase through sprint transitions', () => {
    const world = new World(createActionLevel()), a = new CharacterAnimation(), p = world.player;
    p.grounded = true; p.motion = 'running'; a.update(p,.01);
    a.update(p,5); assert.equal(a.sample(p).base.column,0);
    p.x += 54; a.update(p,.01); assert.equal(a.sample(p).base.column,3);
    p.motion = 'sprinting'; assert.equal(a.sample(p).base.column,3);
    p.x += 18; a.update(p,.01); assert.equal(a.sample(p).base.column,4);
    p.motion = 'running'; assert.equal(a.sample(p).base.column,4);
    p.x -= 18; a.update(p,.01); assert.equal(a.sample(p).base.column,5);
});

test('held fire is fully aimed immediately and never drops the torso between shots', () => {
    const world = new World(createActionLevel()), a = new CharacterAnimation(), p = world.player;
    p.firing = true; p.motion = 'sprinting';
    for(let n=0;n<120;n++){
        a.update(p,1/120,n%24===0?['fire']:[]);
        const pose=a.sample(p);assert.equal(pose.upper.row,8);assert.equal(pose.upper.column,0);
        if(n%24===0)assert.equal(pose.upper.offsetX,0);
    }
    p.firing=false;a.update(p,.3);assert.equal(a.sample(p).upper,undefined);
});

test('taking damage does not disconnect a shot from its held firing pose', () => {
    const world=new World(createActionLevel()),a=new CharacterAnimation(),p=world.player;
    p.firing=true;p.aim={x:1,y:-1};a.update(p,.01,['fire','hurt']);
    const pose=a.sample(p);assert.equal(pose.base.row,4);assert.equal(pose.upper.column,2);assert.equal(pose.upper.offsetX,0);
});

test('landing briefly selects crouch, defeat completes and holds, and fresh animation resets', () => {
    const world = new World(createActionLevel()); const animation = new CharacterAnimation();
    world.player.grounded = false; advance(animation, world, .01);
    world.player.grounded = true; advance(animation, world, .01);
    assert.equal(animation.sample(world.player).base.column, 5); assert.equal(animation.sample(world.player).base.row, 2);
    advance(animation, world, .1); assert.equal(animation.sample(world.player).base.row, 0);
    world.state = 'dead'; advance(animation, world, .01); assert.equal(animation.sample(world.player).base.row, 5);
    advance(animation, world, 1); assert.equal(animation.sample(world.player).base.column, 5);
    advance(animation, world, 10); assert.equal(animation.sample(world.player).base.column, 5);
    assert.equal(new CharacterAnimation().sample(new World(createActionLevel()).player).base.row, 0);
});
