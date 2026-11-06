import { Actor } from './Actor';
import type { World } from '../game/World';
import type { Controls } from '../interfaces/Game';
import { PlayerProjectile } from './PlayerProjectile';
import { tuning as T } from '../game/config';
import { PlayerMovement, type PlayerMotion } from '../game/PlayerMovement';
import { resolveAim, type AimDirection } from '../game/PlayerAim';

export class Character extends Actor {
    facing = 1;
    health = T.playerHealth;
    invulnerable = 0;
    cooldown = 0;
    motion: PlayerMotion = 'idle';
    aim: AimDirection = {x: 1, y: 0};
    get crouched() { return this.movement.crouched; }
    readonly movement: PlayerMovement;
    private gameArea: World;

    constructor({gameArea}: {gameArea: World}) {
        super({width: 32, height: T.standingHeight});
        this.gameArea = gameArea;
        this.spawn(gameArea.level.spawn);
        this.movement = new PlayerMovement(this, gameArea.level.solids, gameArea.level.width);
    }

    update(dt: number, input: Controls) {
        this.invulnerable = Math.max(0, this.invulnerable - dt);
        this.cooldown = Math.max(0, this.cooldown - dt);
        this.movement.update(dt, input); this.motion = this.movement.motion;
        this.aim = resolveAim(input, this.grounded, this.facing);
        if (this.movement.jumpedThisStep) this.gameArea.events.push('jump');
        if (input.fire && this.cooldown <= 0) this.fire();
    }

    takeHit() {
        if (this.invulnerable > 0 || this.health <= 0) return false;
        this.health--;
        this.invulnerable = T.invulnerability;
        if (this.health <= 0) { this.clearActions(); this.vx = this.vy = 0; }
        return true;
    }

    clearActions() {
        this.movement.clearActions(); this.motion = this.movement.motion;
        this.aim = {x: this.facing, y: 0};
    }

    private fire() {
        const length = Math.hypot(this.aim.x, this.aim.y);
        const dx = this.aim.x / length, dy = this.aim.y / length;
        const width = this.aim.x ? 16 : 9, height = this.aim.y ? this.aim.x ? 13 : 16 : 9;
        const shot = new PlayerProjectile({x: this.x + this.width / 2 - width / 2,
            y: this.y + T.playerShotOffsetY + 4.5 - height / 2,
            width, height, vx: dx * T.projectileSpeed, vy: dy * T.projectileSpeed});
        // Sweep from the shoulder to the palm so a muzzle beside stone cannot
        // spawn a bolt on the far side of a thin wall or ceiling.
        if (shot.update(this.gameArea, 24 / T.projectileSpeed)) this.gameArea.projectiles.push(shot);
        this.cooldown = T.attackInterval;
        this.gameArea.events.push('fire');
    }
}
