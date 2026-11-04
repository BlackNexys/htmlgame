require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {HeroAnimation} = require('../src/game/HeroAnimation.ts');

test('idle, run and airborne select different rows and airborne poses follow velocity', () => {
    const world = new World(); const animation = new HeroAnimation();
    assert.equal(animation.sample(world).base.row, 0);
    animation.update(world, .2); assert.equal(animation.sample(world).base.column, 1);
    world.player.motion = 'running'; assert.equal(animation.sample(world).base.row, 1);
    world.player.grounded = false; world.player.vy = -660;
    assert.equal(animation.sample(world).base.column, 0);
    world.player.vy = -600;
    assert.equal(animation.sample(world).base.row, 2); assert.equal(animation.sample(world).base.column, 1);
    world.player.vy = 0; assert.equal(animation.sample(world).base.column, 3);
    world.player.vy = 300; assert.equal(animation.sample(world).base.column, 4);
});

test('firing preserves moving legs and damage temporarily overrides attack', () => {
    const world = new World(); const animation = new HeroAnimation();
    world.player.motion = 'running'; animation.update(world, .01, ['fire']);
    assert.equal(animation.sample(world).base.row, 1); assert.equal(animation.sample(world).upper.row, 3);
    animation.update(world, .01, ['hurt']); assert.equal(animation.sample(world).base.row, 4);
    animation.update(world, .35); assert.equal(animation.sample(world).base.row, 1); assert.equal(animation.sample(world).upper, undefined);
});

test('landing briefly selects crouch, defeat completes and holds, and fresh animation resets', () => {
    const world = new World(); const animation = new HeroAnimation();
    world.player.grounded = false; animation.update(world, .01);
    world.player.grounded = true; animation.update(world, .01);
    assert.equal(animation.sample(world).base.column, 5); assert.equal(animation.sample(world).base.row, 2);
    animation.update(world, .1); assert.equal(animation.sample(world).base.row, 0);
    world.state = 'dead'; animation.update(world, .01); assert.equal(animation.sample(world).base.row, 5);
    animation.update(world, 1); assert.equal(animation.sample(world).base.column, 5);
    animation.update(world, 10); assert.equal(animation.sample(world).base.column, 5);
    assert.equal(new HeroAnimation().sample(new World()).base.row, 0);
});
