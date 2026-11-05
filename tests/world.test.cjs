require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {World} = require('../src/game/World.ts');
const {moveBody, overlaps} = require('../src/game/physics.ts');
const {FixedClock} = require('../src/game/FixedClock.ts');
const {PlayerProjectile} = require('../src/components/PlayerProjectile.ts');
const {tuning: T} = require('../src/game/config.ts');
const idle = {left: false, right: false, jump: false, fire: false};
const run = (world, seconds, input = idle) => { for(let i = 0; i < Math.round(seconds / T.step); i++) world.update(T.step, input); };
const fixture = (extra = {}) => ({width: 2400, height: 672, solids: [{x: 0, y: 576, width: 2400, height: 48}], spawn: {x: 100, y: 524}, enemies: [], exit: {x: 2200, y: 468, width: 64, height: 108}, ...extra});

test('fixed simulation gives equivalent movement at 30, 60, and 144 render frames per second', () => {
    const positions = [30, 60, 144].map(fps => {
        const world = new World(fixture()); const clock = new FixedClock();
        for(let frame = 0; frame < fps * 2; frame++) clock.advance(1 / fps, dt => world.update(dt, {...idle, right: true}));
        return world.player.x;
    });
    positions.forEach(x => assert.ok(Math.abs(x - positions[0]) < 0.001));
    const clock = new FixedClock(); let calls = 0;
    clock.advance(30, () => calls++); assert.equal(calls, T.maxCatchUp);
    clock.reset(); assert.equal(clock.advance(0, () => {}), 0);
});

test('axis sweeps stop fast bodies at floors, ceilings and walls in both directions', () => {
    const body = {x: 10, y: 0, width: 20, height: 20, vx: 0, vy: 10000, grounded: false};
    moveBody(body, [{x: 0, y: 100, width: 100, height: 2}], 0.1);
    assert.equal(body.y, 80); assert.equal(body.grounded, true);
    body.vy = -10000;
    moveBody(body, [{x: 0, y: 20, width: 100, height: 2}], 0.1); assert.equal(body.y, 22);
    body.vy = 0; body.vx = 10000;
    moveBody(body, [{x: 100, y: 0, width: 2, height: 200}], 0.1); assert.equal(body.x, 80);
    body.vx = -10000;
    moveBody(body, [{x: 40, y: 0, width: 2, height: 200}], 0.1); assert.equal(body.x, 42);
});

test('landing, jump, air jump rejection, and friction work together', () => {
    const world = new World(fixture());
    world.update(T.step, {...idle, jump: true}); const start = world.player.vy;
    world.update(T.step, {...idle, jump: true}); assert.ok(world.player.vy > start);
    run(world, 1); assert.equal(world.player.y, 524); assert.equal(world.player.grounded, true);
    run(world, .2, {...idle, right: true}); assert.ok(world.player.vx > 0);
    run(world, .5); assert.equal(world.player.vx, 0);
});

test('projectiles hit nearest enemies once, clean up, and never hurt their owner', () => {
    const world = new World(fixture({enemies: [{x: 300, y: 528, left: 300, right: 300}]}));
    run(world, 1, {...idle, fire: true});
    assert.equal(world.enemies.length, 0); assert.equal(world.defeated, 1);
    assert.equal(world.player.health, T.playerHealth);
    run(world, 1.5); assert.equal(world.projectiles.length, 0); assert.equal(world.particles.length, 0);
});

test('terrain blocks a projectile before a target even at high travel distance', () => {
    const level = fixture({enemies: [{x: 300, y: 528, left: 300, right: 300}]});
    level.solids.push({x: 240, y: 480, width: 4, height: 96});
    const world = new World(level);
    world.projectiles.push(new PlayerProjectile({x: 150, y: 546, width: 16, height: 9, vx: 100000, life: 1}));
    world.update(T.step, idle);
    assert.equal(world.enemies[0].health, T.enemyHealth); assert.equal(world.projectiles.length, 0);
});

test('left facing attacks work and enemies do not become terrain', () => {
    const world = new World(fixture({spawn: {x: 400, y: 524}, enemies: [{x: 200, y: 528, left: 200, right: 200}]}));
    world.player.facing = -1; run(world, 1, {...idle, fire: true}); assert.equal(world.defeated, 1);
    const contact = new World(fixture({enemies: [{x: 100, y: 528, left: 100, right: 100}]}));
    run(contact, .2, {...idle, right: true}); assert.ok(contact.player.x > 130);
});

test('contact damage has a grace period, death stops simulation, and a fresh world resets everything', () => {
    const level = fixture({enemies: [{x: 100, y: 528, left: 100, right: 100}]});
    const world = new World(level);
    run(world, .5); assert.equal(world.player.health, T.playerHealth - 1);
    // Exercise the damage contract independently of a zombie's new committed
    // lunge, which now carries it past a stationary player.
    world.enemies = [];
    for (let i = 0; i < T.playerHealth; i++) { run(world, 1.05); world.combat.hurtPlayer(); }
    world.update(T.step, idle); assert.equal(world.state, 'dead'); const elapsed = world.elapsed;
    run(world, 1, {...idle, fire: true}); assert.equal(world.elapsed, elapsed);
    const fresh = new World(level);
    assert.equal(fresh.player.health, T.playerHealth); assert.equal(fresh.projectiles.length, 0);
    assert.equal(fresh.particles.length, 0); assert.equal(fresh.corpses.length, 0); assert.equal(fresh.defeated, 0); assert.equal(fresh.state, 'playing');
});

test('camera is bounded and completion is reachable through the real action level', () => {
    const world = new World();
    let jumping = false;
    for (let i = 0; i < 120 * 25 && world.state === 'playing'; i++) {
        const p = world.player;
        const obstacle = world.level.solids.some(r => r.y < 576 && r.y + r.height > p.y && r.x >= p.x + p.width && r.x < p.x + p.width + 65);
        const jump = p.grounded && obstacle && !jumping;
        world.update(T.step, {...idle, right: true, fire: true, jump}); jumping = jump;
        assert.ok(world.camera.x >= 0 && world.camera.x <= world.level.width - T.viewportWidth);
        assert.ok(world.camera.y >= 0 && world.camera.y <= world.level.height - T.viewportHeight);
        assert.ok(!world.level.solids.some(r => overlaps(world.player, r)), 'player overlaps terrain');
    }
    assert.equal(world.state, 'won'); assert.ok(world.defeated > 0);
});
