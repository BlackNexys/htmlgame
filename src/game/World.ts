import { tuning as T, enemyTuning } from './config';
import { Body, Rect, clamp, moveBody, overlaps, impactTime } from './physics';
import { Level, createActionLevel } from '../maps/actionLevel';
import { Enemy, Corpse, spawnEnemy, updateEnemy, changeState, vulnerable, shieldRaised } from './Enemy';
export type { Enemy } from './Enemy';

export interface Controls { left: boolean; right: boolean; jump: boolean; fire: boolean; }
export interface Player extends Body { facing: number; health: number; invulnerable: number; cooldown: number; motion: 'idle' | 'running' | 'airborne'; }
export interface Projectile extends Rect { vx: number; vy?: number; life: number; owner?: 'player' | 'enemy'; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
export type GameEvent = 'fire' | 'hit' | 'hurt' | 'defeat' | 'jump' | 'win' | 'enemyFire' | 'charge' | 'block' | 'revive';

export class World {
    player: Player;
    enemies: Enemy[];
    corpses: Corpse[] = [];
    projectiles: Projectile[] = [];
    particles: Particle[] = [];
    events: GameEvent[] = [];
    state: 'playing' | 'dead' | 'won' = 'playing';
    elapsed = 0;
    defeated = 0;
    camera = {x: 0, y: 0};
    constructor(public level: Level = createActionLevel()) {
        this.player = {...level.spawn, width: 32, height: 52, vx: 0, vy: 0, grounded: true,
            facing: 1, health: T.playerHealth, invulnerable: 0, cooldown: 0, motion: 'idle'};
        this.enemies = level.enemies.map(spawnEnemy);
        this.followCamera();
    }

    private burst(x: number, y: number, color: string, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count;
            this.particles.push({x, y, vx: Math.cos(angle) * 100, vy: Math.sin(angle) * 100 - 40, life: 0.35, color});
        }
    }

    canSee(a: Rect, b: Rect) {
        const origin = {x: a.x + a.width / 2, y: a.y + a.height / 2, width: .1, height: .1};
        return !this.level.solids.some(wall => impactTime(origin, b.x + b.width / 2 - origin.x, b.y + b.height / 2 - origin.y, wall) !== undefined);
    }

    findCorpse(e: Enemy) {
        return this.corpses.filter(c => c.revivable && c.claimedBy === undefined &&
            Math.hypot(c.enemy.x - e.x, c.enemy.y - e.y) <= T.reviveRange && this.canSee(e, c.enemy))
            .sort((a, b) => Math.abs(a.enemy.x - e.x) - Math.abs(b.enemy.x - e.x))[0];
    }

    interruptChannel(e: Enemy) {
        this.corpses.forEach(c => { if (c.claimedBy === e.id) c.claimedBy = undefined; });
        e.targetId = undefined;
        changeState(e, 'recover', .8);
        e.cooldown = enemyTuning.necromancer.cooldown;
    }

    revive(caster: Enemy, corpse: Corpse) {
        if (!corpse.revivable || corpse.enemy.revives >= 1 || caster.reviveBudget <= 0 || corpse.claimedBy !== caster.id) return;
        const restored: Enemy = {...corpse.enemy, health: Math.ceil(corpse.enemy.maxHealth * .6),
            revives: corpse.enemy.revives + 1, grace: .9, vx: 0, vy: 0, flash: .25, blockFlash: 0};
        changeState(restored, 'recover', .9);
        restored.targetId = undefined;
        this.corpses = this.corpses.filter(c => c !== corpse);
        this.enemies.push(restored);
        caster.reviveBudget--; caster.targetId = undefined;
        this.events.push('revive'); this.burst(restored.x + restored.width / 2, restored.y + 20, '#82e6e3', 16);
    }

    enemyShot(e: Enemy, targetX: number, targetY: number) {
        const x = e.facing > 0 ? e.x + e.width : e.x - 12;
        const y = e.y + 22;
        const dx = e.kind === 'skeleton' ? e.facing : targetX - x;
        const dy = e.kind === 'skeleton' ? 0 : targetY - y;
        const length = Math.hypot(dx, dy) || 1;
        this.projectiles.push({x, y, width: 12, height: 8, vx: dx / length * T.enemyProjectileSpeed,
            vy: dy / length * T.enemyProjectileSpeed, life: T.enemyProjectileLifetime, owner: 'enemy'});
        this.events.push('enemyFire');
    }

    hurtPlayer() {
        const p = this.player;
        if (p.invulnerable > 0 || p.health <= 0) return;
        p.health--; p.invulnerable = T.invulnerability; this.events.push('hurt');
        this.burst(p.x + 16, p.y + 25, '#ff7e88');
    }

    hitEnemy(e: Enemy, shotVX: number) {
        if (!vulnerable(e) || e.health <= 0) return;
        if (shieldRaised(e) && shotVX * e.facing < 0) {
            e.blockFlash = .16; this.events.push('block');
            this.burst(e.x + e.width / 2 + e.facing * 18, e.y + 24, '#90e9ed', 5);
            return;
        }
        e.health--; e.flash = .12; this.events.push('hit');
        if (e.kind === 'necromancer' && e.state === 'windup') this.interruptChannel(e);
        if (e.health <= 0) this.defeatEnemy(e);
    }

    private defeatEnemy(e: Enemy) {
        e.health = 0;
        if (e.kind === 'necromancer') this.interruptChannel(e);
        if (!e.counted) { this.defeated++; e.counted = true; }
        this.events.push('defeat'); this.burst(e.x + e.width / 2, e.y + 20, '#d7e1ce', 18);
        this.corpses.push({enemy: {...e, vx: 0, vy: 0}, age: 0,
            revivable: e.kind !== 'ghost' && e.kind !== 'necromancer' && e.revives === 0 && e.y < this.level.height});
    }

    private followCamera() {
        this.camera.x = clamp(this.player.x + this.player.width / 2 - T.viewportWidth * .4, 0, Math.max(0, this.level.width - T.viewportWidth));
        this.camera.y = clamp(this.player.y - T.viewportHeight * .55, 0, Math.max(0, this.level.height - T.viewportHeight));
    }

    update(dt: number, input: Controls) {
        this.events = [];
        if (this.state !== 'playing') return;
        this.elapsed += dt;
        const p = this.player;
        p.invulnerable = Math.max(0, p.invulnerable - dt); p.cooldown = Math.max(0, p.cooldown - dt);
        const direction = Number(input.right) - Number(input.left);
        if (direction) { p.facing = direction; p.vx = clamp(p.vx + direction * T.acceleration * dt, -T.speed, T.speed); }
        else p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - T.friction * dt);
        if (input.jump && p.grounded) { p.vy = -T.jump; p.grounded = false; this.events.push('jump'); }
        p.vy = Math.min(T.maxFall, p.vy + T.gravity * dt);
        moveBody(p, this.level.solids, dt);
        p.x = clamp(p.x, 0, this.level.width - p.width);
        p.motion = !p.grounded ? 'airborne' : Math.abs(p.vx) > 10 ? 'running' : 'idle';
        if (input.fire && p.cooldown <= 0) {
            this.projectiles.push({x: p.facing > 0 ? p.x + p.width : p.x - 16, y: p.y + 22,
                width: 16, height: 9, vx: p.facing * T.projectileSpeed, life: T.projectileLifetime, owner: 'player'});
            p.cooldown = T.attackInterval; this.events.push('fire');
        }

        this.corpses.forEach(c => c.age += dt);
        for (const e of [...this.enemies]) {
            if (e.health <= 0) continue;
            const previous = e.state;
            updateEnemy(e, this, dt);
            if (e.state === 'windup' && previous !== 'windup') this.events.push('charge');
            if (e.y > this.level.height + 100) this.defeatEnemy(e);
        }

        this.projectiles = this.projectiles.filter(shot => {
            const dx = shot.vx * dt, dy = (shot.vy || 0) * dt;
            const hits: {time: number; enemy?: Enemy; player?: boolean}[] = [];
            for (const wall of this.level.solids) {
                const time = impactTime(shot, dx, dy, wall); if (time !== undefined) hits.push({time});
            }
            if (shot.owner === 'enemy') {
                const time = impactTime(shot, dx, dy, p); if (time !== undefined) hits.push({time, player: true});
            } else for (const e of this.enemies) {
                if (e.health <= 0 || !vulnerable(e)) continue;
                const time = impactTime(shot, dx, dy, e); if (time !== undefined) hits.push({time, enemy: e});
            }
            hits.sort((a, b) => a.time - b.time);
            if (hits.length) {
                const hit = hits[0];
                this.burst(shot.x + dx * hit.time, shot.y + dy * hit.time, shot.owner === 'enemy' ? '#82dfe5' : '#f4bf80', 5);
                if (hit.enemy) this.hitEnemy(hit.enemy, shot.vx);
                if (hit.player) this.hurtPlayer();
                return false;
            }
            shot.x += dx; shot.y += dy; shot.life -= dt;
            return shot.life > 0 && shot.x > -shot.width && shot.x < this.level.width && shot.y > -shot.height && shot.y < this.level.height;
        });
        this.enemies = this.enemies.filter(e => e.health > 0);
        if (this.enemies.some(e => e.grace <= 0 && vulnerable(e) && overlaps(p, e))) this.hurtPlayer();
        if (p.health <= 0 || p.y > this.level.height + 100) this.state = 'dead';
        if (this.state === 'playing' && overlaps(p, this.level.exit)) { this.state = 'won'; this.events.push('win'); }
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * dt; particle.y += particle.vy * dt;
            particle.vy += 200 * dt; particle.life -= dt; return particle.life > 0;
        });
        this.followCamera();
    }
}
