import type { World } from './World';
import { enemyTuning, tuning as T } from './config';
import { Body, clamp, moveBody, overlaps } from './physics';
import type { EnemySpawn } from '../maps/actionLevel';

export type EnemyKind = keyof typeof enemyTuning;
export type EnemyState = 'idle' | 'windup' | 'attack' | 'recover' | 'phase';
export interface Enemy extends Body {
    id: number; kind: EnemyKind; health: number; maxHealth: number; facing: number;
    left: number; right: number; flash: number; blockFlash: number;
    state: EnemyState; timer: number; cooldown: number; stateAge: number;
    targetX: number; targetY: number; targetId?: number;
    reviveBudget: number; revives: number; counted: boolean; grace: number;
}
export interface Corpse { enemy: Enemy; age: number; revivable: boolean; claimedBy?: number; }

export function spawnEnemy(spawn: EnemySpawn, id: number): Enemy {
    const kind = spawn.kind || 'zombie', stats = enemyTuning[kind];
    // Spawn y is the old 48px actor top. Use its foot baseline for every type.
    return {...spawn, kind, id, y: spawn.y + 48 - stats.height,
        width: stats.width, height: stats.height, vx: 0, vy: 0, grounded: kind !== 'ghost',
        health: stats.health, maxHealth: stats.health, facing: -1, flash: 0, blockFlash: 0,
        state: kind === 'ghost' ? 'phase' : 'idle', timer: kind === 'ghost' ? T.ghostPhase : 0,
        cooldown: .3, stateAge: 0, targetX: spawn.x, targetY: spawn.y,
        reviveBudget: T.reviveBudget, revives: 0, counted: false, grace: 0};
}

export function changeState(e: Enemy, state: EnemyState, seconds: number) {
    e.state = state; e.timer = seconds; e.stateAge = 0;
}
export const vulnerable = (e: Enemy) => e.kind !== 'ghost' || e.state !== 'phase';
export const shieldRaised = (e: Enemy) => e.kind === 'wight' && (e.state === 'idle' || e.state === 'attack');

export function updateEnemy(e: Enemy, world: World, dt: number) {
    const stats = enemyTuning[e.kind], p = world.player;
    e.flash = Math.max(0, e.flash - dt); e.blockFlash = Math.max(0, e.blockFlash - dt);
    e.grace = Math.max(0, e.grace - dt); e.cooldown = Math.max(0, e.cooldown - dt);
    e.timer -= dt; e.stateAge += dt;
    const dx = p.x + p.width / 2 - e.x - e.width / 2;
    const near = Math.abs(dx) < stats.reach && Math.abs(p.y - e.y) < 180;
    const visible = near && world.canSee(e, p);

    if (e.kind === 'ghost') {
        if (e.state === 'phase') {
            if (!near) { e.timer = T.ghostPhase; return; }
            const side = e.x >= p.x ? 1 : -1;
            const goalX = clamp(p.x + side * 160, e.left, e.right);
            const goalY = clamp(p.y - 14, 80, world.level.height - 150);
            const candidate = {...e, x: e.x + clamp(goalX - e.x, -stats.walk * dt, stats.walk * dt),
                y: e.y + clamp(goalY - e.y, -stats.walk * dt, stats.walk * dt)};
            // Phasing may cross stone, but materialization must be in free space.
            e.x = candidate.x; e.y = candidate.y;
            if (e.timer <= 0 && !world.level.solids.some(wall => overlaps(e, wall)) && world.canSee(e, p)) {
                e.facing = Math.sign(dx) || e.facing;
                e.targetX = p.x + p.width / 2; e.targetY = p.y + p.height / 2;
                changeState(e, 'windup', stats.windup);
            }
            return;
        }
        if (e.timer <= 0) {
            if (e.state === 'windup') {
                world.enemyShot(e, e.targetX, e.targetY); changeState(e, 'attack', stats.attack);
            } else if (e.state === 'attack') changeState(e, 'recover', stats.recovery);
            else changeState(e, 'phase', T.ghostPhase);
        }
        return;
    }

    e.vx = 0;
    if (e.state === 'windup') {
        if (e.kind === 'necromancer') {
            const corpse = world.corpses.find(c => c.enemy.id === e.targetId && c.revivable && c.claimedBy === e.id);
            if (!corpse || !world.canSee(e, corpse.enemy)) world.interruptChannel(e);
            else if (e.timer <= 0) { world.revive(e, corpse); changeState(e, 'attack', stats.attack); }
        } else if (e.timer <= 0) {
            if (e.kind === 'skeleton') world.enemyShot(e, e.x + e.width / 2 + e.facing * 100, e.y + 24);
            if (e.kind === 'ghoul') { e.vy = -350; e.grounded = false; }
            changeState(e, 'attack', stats.attack);
        }
    } else if (e.state === 'attack') {
        e.vx = e.facing * stats.rush;
        if (e.timer <= 0) { e.vx = 0; changeState(e, 'recover', stats.recovery); }
    } else if (e.state === 'recover') {
        if (e.timer <= 0) { changeState(e, 'idle', 0); e.cooldown = stats.cooldown; }
    } else {
        if (e.kind === 'necromancer') {
            e.facing = Math.sign(dx) || e.facing;
            const corpse = e.reviveBudget > 0 && visible && e.cooldown <= 0 ? world.findCorpse(e) : undefined;
            if (corpse) {
                corpse.claimedBy = e.id; e.targetId = corpse.enemy.id;
                changeState(e, 'windup', stats.windup);
            } else if (Math.abs(dx) < 190 && visible) e.vx = -e.facing * stats.walk;
        } else if (visible && e.cooldown <= 0 && (e.kind !== 'ghoul' || e.grounded)) {
            e.facing = Math.sign(dx) || e.facing;
            e.targetX = p.x + p.width / 2; e.targetY = p.y + p.height / 2;
            changeState(e, 'windup', stats.windup);
        } else {
            if (visible && (e.kind === 'zombie' || e.kind === 'ghoul' || e.kind === 'wight')) e.facing = Math.sign(dx) || e.facing;
            else if (e.x <= e.left) e.facing = 1;
            else if (e.x >= e.right) e.facing = -1;
            e.vx = e.facing * stats.walk;
        }
    }

    // Walkers turn at ledges. A committed leap or lunge keeps its direction.
    if (e.state === 'idle' && e.grounded && e.vx !== 0) {
        const foot = {x: e.vx > 0 ? e.x + e.width + 3 : e.x - 5, y: e.y + e.height, width: 2, height: 8};
        if (!world.level.solids.some(wall => overlaps(foot, wall))) { e.vx = 0; e.facing *= -1; }
    }
    e.vy = Math.min(T.maxFall, e.vy + T.gravity * dt);
    const wantedVX = e.vx;
    moveBody(e, world.level.solids, dt);
    if (wantedVX && e.vx === 0 && e.state === 'idle') e.facing *= -1;
    e.x = clamp(e.x, 0, world.level.width - e.width);
}
