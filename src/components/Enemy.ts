import { Actor } from './Actor';
import { EnemyProjectile } from './EnemyProjectile';
import type { World } from '../game/World';
import type { EnemyKind, EnemyState, EnemyHit, AimLine } from '../interfaces/Enemy';
import type { EnemySpawn } from '../interfaces/Level';
import { enemyTuning, tuning as T } from '../game/config';

export interface EnemyProps { gameArea: World; spawn: EnemySpawn; id: number; }

export abstract class Enemy extends Actor {
    readonly id: number;
    readonly kind: EnemyKind;
    readonly stats: (typeof enemyTuning)[EnemyKind];
    abstract readonly displayName: string;
    abstract readonly hint: string;
    abstract readonly windupLabel: string;
    health: number;
    maxHealth: number;
    facing = -1;
    left: number;
    right: number;
    flash = 0;
    blockFlash = 0;
    state: EnemyState = 'idle';
    timer = 0;
    cooldown = .3;
    stateAge = 0;
    revives = 0;
    counted = false;
    grace = 0;
    private defeatedThisLife = false;
    protected targetX: number;
    protected targetY: number;
    protected readonly gameArea: World;

    protected constructor({gameArea, spawn, id}: EnemyProps, kind: EnemyKind) {
        super(enemyTuning[kind]);
        const stats = enemyTuning[kind];
        this.gameArea = gameArea;
        this.id = id;
        this.kind = kind;
        this.stats = stats;
        this.spawn({x: spawn.x, y: spawn.y + 48 - stats.height});
        this.health = this.maxHealth = stats.health;
        this.left = spawn.left;
        this.right = spawn.right;
        this.targetX = spawn.x;
        this.targetY = spawn.y;
        this.grounded = true;
    }

    get vulnerable() { return true; }
    get shieldRaised() { return false; }
    get revivable() { return this.revives === 0; }
    get spriteAnchorY() { return .94; }
    get aimLine(): AimLine | undefined { return undefined; }
    get channelTargetId(): number | undefined { return undefined; }
    get isChanneling() { return this.channelTargetId !== undefined; }

    update(dt: number) {
        this.flash = Math.max(0, this.flash - dt);
        this.blockFlash = Math.max(0, this.blockFlash - dt);
        this.grace = Math.max(0, this.grace - dt);
        this.cooldown = Math.max(0, this.cooldown - dt);
        this.timer -= dt;
        this.stateAge += dt;
        this.updateBehavior(dt);
    }

    receiveHit(shotVX: number, damage = 1): EnemyHit {
        if (!this.vulnerable || this.health <= 0) return 'ignored';
        if (this.blocksShot(shotVX)) { this.blockFlash = .16; return 'blocked'; }
        this.health -= damage;
        this.flash = .12;
        this.onDamaged();
        return 'damaged';
    }

    defeat() {
        if (this.defeatedThisLife) return false;
        this.defeatedThisLife = true;
        this.health = 0;
        this.vx = this.vy = 0;
        this.onDefeated();
        return true;
    }

    reactivate() {
        this.defeatedThisLife = false;
        this.health = Math.ceil(this.maxHealth * .6);
        this.revives++;
        this.grace = .9;
        this.vx = this.vy = 0;
        this.flash = .25;
        this.blockFlash = 0;
        this.changeState('recover', .9);
    }

    changeState(state: EnemyState, seconds: number) {
        this.state = state;
        this.timer = seconds;
        this.stateAge = 0;
    }

    protected get playerDeltaX() {
        const p = this.gameArea.player;
        return p.x + p.width / 2 - this.x - this.width / 2;
    }
    protected get playerNear() {
        return Math.abs(this.playerDeltaX) < this.stats.reach && Math.abs(this.gameArea.player.y - this.y) < 180;
    }
    protected get seesPlayer() { return this.playerNear && this.gameArea.collisions.canSee(this, this.gameArea.player); }
    protected facePlayer() { this.facing = Math.sign(this.playerDeltaX) || this.facing; }
    protected prepareAttack() {
        this.facePlayer();
        const p = this.gameArea.player;
        this.targetX = p.x + p.width / 2;
        this.targetY = p.y + p.height / 2;
        this.changeState('windup', this.stats.windup);
    }

    protected fireDirection(dx: number, dy: number) {
        const length = Math.hypot(dx, dy) || 1;
        this.gameArea.projectiles.push(new EnemyProjectile({x: this.facing > 0 ? this.x2 : this.x - 12, y: this.y + 22,
            width: 12, height: 8, vx: dx / length * T.enemyProjectileSpeed,
            vy: dy / length * T.enemyProjectileSpeed, life: T.enemyProjectileLifetime}));
        this.gameArea.events.push('enemyFire');
    }
    protected fireAt(targetX: number, targetY: number) {
        this.fireDirection(targetX - (this.facing > 0 ? this.x2 : this.x - 12), targetY - this.y - 22);
    }
    protected blocksShot(_shotVX: number) { return false; }
    protected onDamaged() {}
    protected onDefeated() {}
    protected abstract updateBehavior(dt: number): void;
}
