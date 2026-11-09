import { Actor } from './Actor';
import type { CharacterContext } from '../interfaces/Simulation';
import type { Controls } from '../interfaces/Game';
import { tuning as T } from '../game/config';
import { PlayerMovement, type PlayerMotion } from '../game/movement/PlayerMovement';
import { resolveAim, type AimDirection } from '../game/movement/PlayerAim';
import { WeaponController } from '../weapons/WeaponController';

export class Character extends Actor {
    facing = 1;
    health = T.playerHealth;
    invulnerable = 0;
    readonly weapons = new WeaponController();
    motion: PlayerMotion = 'idle';
    aim: AimDirection = {x: 1, y: 0};
    firing = false;
    get crouched() { return this.movement.crouched; }
    get sprintCharge() { return this.movement.sprintCharge; }
    readonly movement: PlayerMovement;
    private gameArea: CharacterContext;

    constructor({gameArea}: {gameArea: CharacterContext}) {
        super({width: 32, height: T.standingHeight});
        this.gameArea = gameArea;
        this.spawn(gameArea.level.spawn);
        this.movement = new PlayerMovement(this, gameArea.level.solids, gameArea.level.width);
    }

    update(dt: number, input: Controls) {
        this.invulnerable = Math.max(0, this.invulnerable - dt);
        this.movement.update(dt, input); this.motion = this.movement.motion;
        this.aim = resolveAim(input, this.grounded, this.facing);
        this.firing = input.fire;
        if (this.movement.jumpedThisStep) this.gameArea.events.push('jump');
        this.weapons.update(dt, input.fire, this.gameArea, this);
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
        this.firing = false;
    }

}
