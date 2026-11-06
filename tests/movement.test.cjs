require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {FixedClock} = require('../src/game/FixedClock.ts');
const {Camera} = require('../src/components/Camera.ts');
const {overlaps, sweepBody} = require('../src/game/physics.ts');
const {EnemyProjectile} = require('../src/components/EnemyProjectile.ts');
const {compileLevel} = require('../src/levels/LevelCompiler.ts');
const {tuning: T} = require('../src/game/config.ts');
const idle = {left: false, right: false, up: false, down: false, jump: false, jumpHeld: false, jumpReleased: false, sprint: false, fire: false};
const level = (extra = {}) => ({width: 5000, height: 2400, solids: [{x: 0, y: 1200, width: 5000, height: 1200}], spawn: {x: 500, y: 1148}, enemies: [], exit: {x: 4800, y: 1092, width: 64, height: 108}, ...extra});
function run(world, seconds, controls = idle) { for (let i = 0; i < Math.round(seconds / T.step); i++) world.update(T.step, controls); }
function until(world, condition, seconds = 3, controls = idle) { for (let i = 0; i < seconds / T.step && !condition(); i++) world.update(T.step, controls); assert.ok(condition(), 'condition was not reached'); }

test('the authored movement course can be completed through its walls and landings', () => {
    const world = new World(compileLevel(require('../public/levels/movement-course.json')));
    let nextJump = 0, wallJumps = 0;
    for (let step = 0; step < 120 * 30 && world.state === 'playing'; step++) {
        const player = world.player;
        const obstacle = world.level.solids.some(rect => rect.y < player.y2 && rect.y + rect.height > player.y && rect.x >= player.x2 && rect.x < player.x2 + 65);
        const gap = player.x > 1310 && player.x < 1460;
        const wallJump = player.movement.wallSide === 1 && player.vy >= 0;
        const jump = step >= nextJump && ((player.grounded && (obstacle || gap)) || wallJump);
        if (jump) { nextJump = step + 20; if (wallJump && !player.grounded) wallJumps++; }
        world.update(T.step, {...idle, right: true, sprint: true, fire: true, jump, jumpHeld: jump || (!player.grounded && player.vy < 0)});
    }
    assert.equal(world.state, 'won'); assert.ok(world.player.health > 0); assert.ok(wallJumps >= 3);
});

test('sprint has equivalent travel at 30, 60 and 144 rendered frames per second', () => {
    const samples = [30, 60, 144].map(fps => {
        const world = new World(level()), clock = new FixedClock(); let steps = 0;
        for (let frame = 0; frame < fps; frame++) clock.advance(1 / fps, dt => {
            steps++; world.update(dt, {...idle, right: true, sprint: true});
        });
        assert.equal(steps, 120); return {x: world.player.x, camera: world.camera.x};
    });
    for (const sample of samples) { assert.ok(Math.abs(sample.x - samples[0].x) < .0001); assert.ok(Math.abs(sample.camera - samples[0].camera) < .0001); }
    const running = new World(level()), sprinting = new World(level());
    run(running, 1, {...idle, right: true}); run(sprinting, 1, {...idle, right: true, sprint: true});
    assert.equal(sprinting.player.vx, 440); assert.equal(running.player.vx, 330);
    assert.ok(sprinting.player.x > running.player.x + 80);
});

test('tap and held jumps have distinct heights without held-input automatic jumping', () => {
    const apex = heldFor => {
        const world = new World(level()); let top = world.player.y;
        for (let step = 0; step < 120; step++) {
            world.update(T.step, {...idle, jump: step === 0, jumpHeld: step < heldFor, jumpReleased: step === heldFor});
            top = Math.min(top, world.player.y);
        }
        assert.equal(world.player.grounded, true); return 1148 - top;
    };
    const tap = apex(1), held = apex(60);
    assert.ok(tap > 40 && tap < 70); assert.ok(held > 125 && held < 145); assert.ok(held > tap + 60);
    const world = new World(level()); world.update(T.step, {...idle, jump: true, jumpHeld: true});
    run(world, 1.2, {...idle, jumpHeld: true}); assert.equal(world.player.grounded, true);
});

test('coyote time permits a late jump but expires, and a jump cannot reuse it in midair', () => {
    const setup = delay => {
        const world = new World(level({solids: [{x: 0, y: 1200, width: 600, height: 1200}], spawn: {x: 568, y: 1148}}));
        until(world, () => !world.player.grounded, 1, {...idle, right: true});
        run(world, delay, {...idle, right: true}); world.update(T.step, {...idle, right: true, jump: true, jumpHeld: true});
        return world;
    };
    const late = setup(.05); assert.ok(late.player.vy < -600);
    const vy = late.player.vy; late.update(T.step, {...idle, jump: true, jumpHeld: true}); assert.ok(late.player.vy > vy);
    const expired = setup(.15); assert.ok(expired.player.vy > 0);
});

test('a buffered jump fires on landing and an expired buffer does not', () => {
    const falling = y => new World(level({spawn: {x: 500, y}}));
    const buffered = falling(1130); buffered.player.vy = 300;
    buffered.update(T.step, {...idle, jump: true, jumpHeld: true});
    until(buffered, () => buffered.player.vy < 0, .2, {...idle, jumpHeld: true});
    assert.equal(buffered.player.grounded, false);
    const expired = falling(900); expired.update(T.step, {...idle, jump: true});
    until(expired, () => expired.player.grounded, 2);
    assert.equal(expired.player.vy, 0);
});

test('wall slides require directional pressure and wall jumps commit away before steering returns', () => {
    const solids = [{x: 800, y: 0, width: 48, height: 2400}];
    const world = new World(level({solids, spawn: {x: 768, y: 700}}));
    world.player.vy = 500; world.update(T.step, {...idle, right: true});
    assert.equal(world.player.motion, 'wall-slide'); assert.ok(world.player.vy <= T.wallSlideSpeed);
    world.update(T.step, {...idle, jump: true, jumpHeld: true, right: true});
    assert.equal(world.player.motion, 'wall-jump'); assert.equal(world.player.facing, -1);
    assert.ok(world.player.vx < 0 && world.player.vy < -600);
    run(world, .08, {...idle, right: true, jumpHeld: true}); assert.equal(world.player.vx, -T.wallJumpX);
    run(world, .2, {...idle, right: true, jumpHeld: true}); assert.ok(world.player.vx > 0);
    const falling = new World(level({solids, spawn: {x: 768, y: 700}})); falling.player.vy = 500;
    falling.update(T.step, idle); assert.ok(falling.player.vy > T.wallSlideSpeed);
});

test('swept movement stops against thin walls, ceilings, floors and diagonal corners without embedding', () => {
    const cases = [
        {wall: {x: 560, y: 400, width: 1, height: 400}, vx: 1000, vy: 0},
        {wall: {x: 450, y: 450, width: 200, height: 1}, vx: 0, vy: -1000},
        {wall: {x: 450, y: 620, width: 200, height: 1}, vx: 0, vy: 1000},
        {wall: {x: 560, y: 410, width: 2, height: 100}, vx: 1000, vy: -1000},
    ];
    for (const {wall, vx, vy} of cases) {
        const body = {x: 500, y: 500, width: 32, height: 52, vx, vy, grounded: false};
        const collision = sweepBody(body, [wall], .15);
        assert.equal(overlaps(body, wall), false); assert.ok(collision.blockedX || collision.blockedY);
    }
    const body = {x: 0, y: 0, width: 10, height: 10, vx: 1000, vy: 1000, grounded: false};
    const corner = {x: 50, y: 50, width: 1, height: 1};
    const collision = sweepBody(body, [corner], .2);
    assert.ok(collision.blockedX && collision.blockedY); assert.equal(overlaps(body, corner), false); assert.equal(body.x, 40);
});

test('sprinting and jumping grant no immunity to enemy bodies or projectiles', () => {
    const world = new World(level({enemies: [{x: 580, y: 1152, left: 580, right: 580, kind: 'zombie'}]}));
    world.enemies[0].update = () => {};
    run(world, .3, {...idle, right: true, sprint: true}); assert.equal(world.player.health, T.playerHealth - 1);
    const shot = new World(level());
    shot.update(T.step, {...idle, right: true, jump: true, jumpHeld: true});
    shot.projectiles.push(new EnemyProjectile({x: shot.player.x + 12, y: shot.player.y + 10, vx: 0}));
    shot.update(T.step, idle); assert.equal(shot.player.health, T.playerHealth - 1);
});

test('pause clears queued jumps, preserves ordinary flight, and fresh worlds reset', () => {
    const world = new World(level({spawn: {x: 500, y: 700}}));
    world.update(T.step, {...idle, right: true, jump: true});
    const velocity = {x: world.player.vx, y: world.player.vy};
    world.player.clearActions();
    assert.equal(world.player.vx, velocity.x); assert.equal(world.player.vy, velocity.y);
    world.update(T.step, idle); assert.ok(world.player.vy > velocity.y); assert.equal(world.player.movement.jumpedThisStep, false);
    const buffered = new World(level({spawn: {x: 500, y: 1120}})); buffered.player.vy = 300;
    buffered.update(T.step, {...idle, jump: true}); buffered.player.clearActions();
    until(buffered, () => buffered.player.grounded); assert.equal(buffered.player.vy, 0);
    const fresh = new World(level()); assert.equal(fresh.player.vx, 0); assert.equal(fresh.player.vy, 0); assert.equal(fresh.player.motion, 'idle');
});

test('shooting during sprint and jump preserves motion and the existing shot cadence', () => {
    const world = new World(level());
    run(world, .4, {...idle, right: true, sprint: true, fire: true}); assert.equal(world.player.vx, T.sprintSpeed);
    world.update(T.step, {...idle, right: true, sprint: true, jump: true, jumpHeld: true, fire: true});
    assert.equal(world.player.vx, T.sprintSpeed); assert.ok(world.player.vy < -600);
    run(world, .1, {...idle, right: true, sprint: true, jumpHeld: true, fire: true});
    assert.equal(world.player.vx, T.sprintSpeed); assert.ok(world.player.vy < 0);
    assert.ok(world.projectiles.length >= 2);
});

test('camera look-ahead eases through reversals, follows vertical travel and clamps to level bounds', () => {
    const camera = new Camera(), bounds = {width: 5000, height: 2400};
    const subject = {x: 1800, y: 1500, width: 32, height: 52, vx: 440}; camera.follow(subject, bounds);
    const initial = camera.x;
    for (let i = 0; i < 120; i++) camera.follow(subject, bounds, T.step);
    assert.ok(camera.x > initial + 80);
    const before = camera.x; subject.vx = -440; camera.follow(subject, bounds, T.step);
    assert.ok(Math.abs(camera.x - before) < 10);
    subject.y = 100;
    for (let i = 0; i < 240; i++) camera.follow(subject, bounds, T.step);
    assert.ok(camera.y < 10);
    subject.x = 10000; subject.y = 10000; camera.follow(subject, bounds);
    assert.equal(camera.x, bounds.width - camera.width); assert.equal(camera.y, bounds.height - camera.height);
});

test('the movement course is valid, has a recovery floor, and keeps the regression level separate', () => {
    const course = require('../public/levels/movement-course.json');
    const compiled = compileLevel(course);
    assert.equal(compiled.height, 1152); assert.equal(compiled.enemies.length, 2);
    assert.ok(course.terrain.some(block => block.id === 'gap-recovery'));
    assert.equal(require('../public/levels/lower-passage.json').revision, 1);
});
