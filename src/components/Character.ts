import { Actor } from './Actor';
import type { World } from '../game/World';
import type { Controls } from '../interfaces/Game';
import { PlayerProjectile } from './PlayerProjectile';
import { tuning as T } from '../game/config';
import { clamp } from '../game/physics';

export class Character extends Actor {
    facing = 1;
    health = T.playerHealth;
    invulnerable = 0;
    cooldown = 0;
    motion: 'idle' | 'running' | 'airborne' = 'idle';
    private gameArea: World;

    constructor({gameArea}: {gameArea: World}) {
        super({width: 32, height: 52});
        this.gameArea = gameArea;
        this.spawn(gameArea.level.spawn);
        this.grounded = true;
    }

    update(dt: number, input: Controls) {
        this.invulnerable = Math.max(0, this.invulnerable - dt);
        this.cooldown = Math.max(0, this.cooldown - dt);
        const direction = Number(input.right) - Number(input.left);
        if (direction) {
            this.facing = direction;
            this.vx = clamp(this.vx + direction * T.acceleration * dt, -T.speed, T.speed);
        } else this.vx = Math.sign(this.vx) * Math.max(0, Math.abs(this.vx) - T.friction * dt);
        if (input.jump && this.grounded) {
            this.vy = -T.jump;
            this.grounded = false;
            this.gameArea.events.push('jump');
        }
        this.applyGravity(dt);
        this.move(dt, this.gameArea.level.solids);
        this.x = clamp(this.x, 0, this.gameArea.level.width - this.width);
        this.motion = !this.grounded ? 'airborne' : Math.abs(this.vx) > 10 ? 'running' : 'idle';
        if (input.fire && this.cooldown <= 0) this.fire();
    }

    takeHit() {
        if (this.invulnerable > 0 || this.health <= 0) return false;
        this.health--;
        this.invulnerable = T.invulnerability;
        return true;
    }

    private fire() {
        this.gameArea.projectiles.push(new PlayerProjectile({x: this.facing > 0 ? this.x2 : this.x - 16,
            y: this.y + 22, vx: this.facing * T.projectileSpeed}));
        this.cooldown = T.attackInterval;
        this.gameArea.events.push('fire');
    }
}
