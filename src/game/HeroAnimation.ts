import { GameEvent, World } from './World';

export type HeroClip = 'idle' | 'run' | 'air' | 'attack' | 'hurt' | 'defeat';
export interface HeroFrame { row: number; column: number; anchorX: number; anchorY: number; }

const rows: Record<HeroClip, number> = {idle: 0, run: 1, air: 2, attack: 3, hurt: 4, defeat: 5};
// The generated atlas has 209px cells. Grounded reactions use measured foot
// anchors; airborne poses use a common body root so tucking the legs adds no lift.
const anchors: Record<HeroClip, number[]> = {
    idle: [191, 191, 191, 191, 191, 191],
    run: [191, 191, 191, 191, 191, 191],
    air: [191, 182, 166, 150, 175, 191],
    attack: [191, 189, 180, 176, 193, 191],
    hurt: [187, 178, 172, 178, 182, 187],
    defeat: [176, 176, 176, 176, 176, 176],
};

export class HeroAnimation {
    private elapsed = 0;
    private attack = -1;
    private hurt = -1;
    private death = -1;
    private landing = -1;
    private airborne = false;

    update(world: World, dt: number, events: GameEvent[] = []) {
        this.elapsed += dt;
        if (events.includes('fire')) this.attack = 0;
        if (events.includes('hurt')) this.hurt = 0;
        if (this.airborne && world.player.grounded) this.landing = 0;
        this.airborne = !world.player.grounded;
        if (this.attack >= 0) { this.attack += dt; if (this.attack >= 0.18) this.attack = -1; }
        if (this.hurt >= 0) { this.hurt += dt; if (this.hurt >= 0.3) this.hurt = -1; }
        if (this.landing >= 0) { this.landing += dt; if (this.landing >= 0.08) this.landing = -1; }
        if (world.state === 'dead') this.death = this.death < 0 ? 0 : this.death + dt;
    }

    private frame(clip: HeroClip, column: number): HeroFrame {
        return {row: rows[clip], column, anchorX: 114, anchorY: anchors[clip][column]};
    }

    sample(world: World): {base: HeroFrame; upper?: HeroFrame} {
        if (this.death >= 0) return {base: this.frame('defeat', Math.min(5, Math.floor(this.death * 10)))};
        if (this.hurt >= 0) return {base: this.frame('hurt', Math.min(5, Math.floor(this.hurt * 20)))};
        let base: HeroFrame;
        const p = world.player;
        if (!p.grounded) {
            const column = p.vy < -610 ? 0 : p.vy < -470 ? 1 : p.vy < -170 ? 2 : p.vy < 130 ? 3 : 4;
            base = this.frame('air', column);
        } else if (this.landing >= 0) base = this.frame('air', 5);
        else base = this.frame(p.motion === 'running' ? 'run' : 'idle', Math.floor(this.elapsed * (p.motion === 'running' ? 14 : 8)) % 6);
        if (this.attack < 0) return {base};
        const attack = this.frame('attack', Math.min(5, Math.floor(this.attack / 0.18 * 6)));
        // Keep moving legs while firing. The atlas upper body is composited at
        // the hips rather than replacing a run or airborne pose with standing.
        return p.motion === 'idle' && p.grounded ? {base: attack} : {base, upper: attack};
    }
}
