require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {CharacterAnimation} = require('../src/game/CharacterAnimation.ts');
const advance = (animation, world, dt, events = []) => animation.update(world.player, dt, events, world.state === 'dead');

test('idle, run and airborne select different rows and airborne poses follow velocity', () => {
    const world = new World(); const animation = new CharacterAnimation();
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
    const world = new World(); const animation = new CharacterAnimation();
    world.player.motion = 'running'; advance(animation, world, .01, ['fire']);
    assert.equal(animation.sample(world.player).base.row, 1); assert.equal(animation.sample(world.player).upper.row, 3);
    advance(animation, world, .01, ['hurt']); assert.equal(animation.sample(world.player).base.row, 4);
    advance(animation, world, .35); assert.equal(animation.sample(world.player).base.row, 1); assert.equal(animation.sample(world.player).upper, undefined);
});

test('landing briefly selects crouch, defeat completes and holds, and fresh animation resets', () => {
    const world = new World(); const animation = new CharacterAnimation();
    world.player.grounded = false; advance(animation, world, .01);
    world.player.grounded = true; advance(animation, world, .01);
    assert.equal(animation.sample(world.player).base.column, 5); assert.equal(animation.sample(world.player).base.row, 2);
    advance(animation, world, .1); assert.equal(animation.sample(world.player).base.row, 0);
    world.state = 'dead'; advance(animation, world, .01); assert.equal(animation.sample(world.player).base.row, 5);
    advance(animation, world, 1); assert.equal(animation.sample(world.player).base.column, 5);
    advance(animation, world, 10); assert.equal(animation.sample(world.player).base.column, 5);
    assert.equal(new CharacterAnimation().sample(new World().player).base.row, 0);
});
