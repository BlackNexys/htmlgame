import type { Body, Rect } from '../interfaces/Geometry';
import type { Controls } from '../interfaces/Game';
import { bodyContacts, clamp, overlaps, sweepBody, type BodyContacts } from './physics';
import { tuning as T } from './config';

export type PlayerMotion = 'idle' | 'running' | 'sprinting' | 'crouching' | 'airborne' | 'wall-slide' | 'wall-jump';
interface PlayerBody extends Body { facing: number; }
const approach = (value: number, target: number, amount: number) => value + clamp(target - value, -amount, amount);
const epsilon = 1e-9;

/** Fixed-step movement only. Weapons, damage and presentation have separate owners. */
export class PlayerMovement {
    motion: PlayerMotion = 'idle';
    wallSide = 0;
    jumpedThisStep = false;
    get crouched() { return this.body.height === T.crouchHeight; }
    private jumpBuffer = 0;
    private coyote = 0;
    private wallLock = 0;
    private wallPush = 0;
    private contacts: BodyContacts;

    constructor(private readonly body: PlayerBody, private readonly solids: Rect[], private readonly levelWidth: number) {
        this.contacts = bodyContacts(body, solids);
        body.grounded = this.contacts.ground;
        this.coyote = body.grounded ? T.coyoteTime : 0;
    }
    update(dt: number, input: Controls) {
        this.jumpedThisStep = false;
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
        this.wallLock = Math.max(0, this.wallLock - dt);
        this.refreshContacts();
        if (this.body.grounded) this.coyote = T.coyoteTime;
        else this.coyote = Math.max(0, this.coyote - dt);
        if (input.jump) this.jumpBuffer = T.jumpBuffer;
        const direction = Number(input.right) - Number(input.left);
        this.updateStance(input);
        const speed = this.crouched ? T.crouchSpeed : input.sprint ? T.sprintSpeed : T.speed;

        this.tryJump();
        if (this.wallLock > 0) this.body.vx = this.wallPush * T.wallJumpX;
        else {
            if (direction) this.body.facing = direction;
            const acceleration = direction ? (input.sprint ? T.sprintAcceleration : T.acceleration) : T.friction;
            this.body.vx = approach(this.body.vx, direction * speed, acceleration * (this.body.grounded ? 1 : T.airAccelerationScale) * dt);
        }
        const held = input.jumpHeld ?? input.jump;
        if ((!held || input.jumpReleased) && this.body.vy < -T.jumpCutSpeed) this.body.vy = -T.jumpCutSpeed;
        this.body.vy = Math.min(T.maxFall, this.body.vy + T.gravity * dt);
        if (!this.body.grounded && this.wallSide && direction === this.wallSide && this.body.vy > 0) {
            this.body.vy = Math.min(this.body.vy, T.wallSlideSpeed);
        }
        sweepBody(this.body, this.solids, dt);
        this.clampToLevel(); this.refreshContacts();
        this.updateStance(input);
        if (this.wallSide && direction === this.wallSide && this.body.vy > 0) this.body.vy = Math.min(this.body.vy, T.wallSlideSpeed);
        this.tryJump();
        this.motion = !this.body.grounded
            ? this.wallLock > 0 ? 'wall-jump' : this.wallSide && direction === this.wallSide && this.body.vy > 0 ? 'wall-slide' : 'airborne'
            : this.crouched ? 'crouching' : Math.abs(this.body.vx) > T.speed + 1 ? 'sprinting' : Math.abs(this.body.vx) > 10 ? 'running' : 'idle';
    }

    /** Pause/cutscene entry cancels buffered actions while preserving ordinary flight. */
    clearActions() {
        this.jumpBuffer = this.coyote = this.wallLock = 0;
        this.jumpedThisStep = false;
        this.motion = this.body.grounded ? this.crouched ? 'crouching' : 'idle' : 'airborne';
    }
    private updateStance(input: Controls) {
        const crouch = this.body.grounded && input.down && !input.up && this.jumpBuffer <= epsilon;
        const height = crouch ? T.crouchHeight : T.standingHeight;
        if (this.body.height === height) return;
        const candidate = {...this.body, height, y: this.body.y + this.body.height - height};
        // Keep feet fixed, and never expand into a low ceiling on release/jump.
        if (height > this.body.height && this.solids.some(solid => overlaps(candidate, solid))) return;
        this.body.y = candidate.y; this.body.height = height;
        if (this.crouched) this.body.vx = clamp(this.body.vx, -T.crouchSpeed, T.crouchSpeed);
        this.refreshContacts();
    }
    private refreshContacts() {
        this.contacts = bodyContacts(this.body, this.solids);
        this.body.grounded = this.contacts.ground && this.body.vy >= 0;
        this.wallSide = this.contacts.left ? -1 : this.contacts.right ? 1 : 0;
    }
    private tryJump() {
        if (this.jumpBuffer <= epsilon) return;
        if (this.crouched) return;
        if (this.body.grounded || this.coyote > epsilon) {
            this.body.vy = -T.jump;
        } else if (this.wallSide) {
            this.wallPush = -this.wallSide; this.wallLock = T.wallJumpLock;
            this.body.facing = this.wallPush; this.body.vx = this.wallPush * T.wallJumpX;
            this.body.vy = -T.wallJumpY;
        } else return;
        this.body.grounded = false; this.jumpBuffer = this.coyote = 0; this.jumpedThisStep = true;
    }
    private clampToLevel() {
        const x = clamp(this.body.x, 0, Math.max(0, this.levelWidth - this.body.width));
        if (x === this.body.x) return false;
        this.body.x = x; this.body.vx = 0; return true;
    }
}
