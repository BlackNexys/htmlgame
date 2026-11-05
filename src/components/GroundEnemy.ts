import { Enemy } from './Enemy';
import { clamp, overlaps } from '../game/physics';

export abstract class GroundEnemy extends Enemy {
    protected get tracksPlayer() { return true; }
    protected canBeginAttack() { return true; }
    protected beginAttack() {}
    protected updateAttack() {}
    protected rush() { this.vx = this.facing * this.stats.rush; }

    protected updateWindup() {
        if (this.timer <= 0) {
            this.beginAttack();
            this.changeState('attack', this.stats.attack);
        }
    }

    protected updateIdle() {
        if (this.seesPlayer && this.cooldown <= 0 && this.canBeginAttack()) this.prepareAttack();
        else {
            if (this.seesPlayer && this.tracksPlayer) this.facePlayer();
            else if (this.x <= this.left) this.facing = 1;
            else if (this.x >= this.right) this.facing = -1;
            this.vx = this.facing * this.stats.walk;
        }
    }

    protected updateBehavior(dt: number) {
        this.vx = 0;
        if (this.state === 'windup') this.updateWindup();
        else if (this.state === 'attack') {
            this.updateAttack();
            if (this.timer <= 0) { this.vx = 0; this.changeState('recover', this.stats.recovery); }
        } else if (this.state === 'recover') {
            if (this.timer <= 0) { this.changeState('idle', 0); this.cooldown = this.stats.cooldown; }
        } else this.updateIdle();

        // Walking is ledge-safe; committed attacks retain their direction.
        if (this.state === 'idle' && this.grounded && this.vx !== 0) {
            const foot = {x: this.vx > 0 ? this.x2 + 3 : this.x - 5, y: this.y2, width: 2, height: 8};
            if (!this.gameArea.level.solids.some(wall => overlaps(foot, wall))) { this.vx = 0; this.facing *= -1; }
        }
        this.applyGravity(dt);
        const wantedVX = this.vx;
        this.move(dt, this.gameArea.level.solids);
        if (wantedVX && this.vx === 0 && this.state === 'idle') this.facing *= -1;
        this.x = clamp(this.x, 0, this.gameArea.level.width - this.width);
    }
}
