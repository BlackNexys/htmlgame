import type { GameEvent } from '../../interfaces/Game';
import type { Character } from '../../components/Character';
import { characterAtlas } from './CharacterAtlas';
import { characterAimAtlas } from './CharacterAimAtlas';
import { heroAimPose } from './HeroPose';

export type CharacterClip = 'idle' | 'run' | 'air' | 'attack' | 'hurt' | 'defeat' | 'sprint';
export interface CharacterFrame { row: number; column: number; anchorX: number; anchorY: number; mirror: boolean; sheet?: 'aim'; offsetY?: number; offsetX?: number; }

const rows: Record<CharacterClip, number> = {idle: 0, run: 1, air: 2, attack: 3, hurt: 4, defeat: 5, sprint: 6};

export class CharacterAnimation {
    private elapsed = 0;
    private stride = 0;
    private attack = -1;
    private hurt = -1;
    private death = -1;
    private landing = -1;
    private airborne = false;
    private lastX?: number;

    update(character: Character, dt: number, events: GameEvent[] = [], dead = false) {
        this.elapsed += dt;
        // One eight-pose cycle per 144 world pixels. Standing time never advances feet.
        if (this.lastX !== undefined && character.grounded && !character.crouched) {
            const distance = Math.abs(character.x - this.lastX);
            if (distance < 100) this.stride = (this.stride + distance / 144 * 8) % 8;
        }
        this.lastX = character.x;
        if (events.includes('hurt')) this.hurt = 0;
        if (this.airborne && character.grounded) this.landing = 0;
        this.airborne = !character.grounded;
        if (this.attack >= 0) { this.attack += dt; if (this.attack >= 0.24) this.attack = -1; }
        if (events.includes('fire')) this.attack = 0;
        if (this.hurt >= 0) { this.hurt += dt; if (this.hurt >= 0.3) this.hurt = -1; }
        if (this.landing >= 0) { this.landing += dt; if (this.landing >= 0.08) this.landing = -1; }
        if (dead) this.death = this.death < 0 ? 0 : this.death + dt;
    }

    private frame(clip: CharacterClip, column: number): CharacterFrame {
        const anchors = characterAtlas.anchors[clip];
        return {row: rows[clip], column, anchorX: anchors.x[column], anchorY: anchors.y[column], mirror: anchors.mirror};
    }
    private aimFrame(row: number, column: number, character: Character): CharacterFrame {
        const anchors = characterAimAtlas.rows[row];
        return {row, column, anchorX: anchors.x[column], anchorY: anchors.y[column], sheet: 'aim',
            mirror: character.aim.x !== 0 && character.aim.x !== character.facing};
    }

    sample(character: Character): {base: CharacterFrame; upper?: CharacterFrame} {
        if (this.death >= 0) return {base: this.frame('defeat', Math.min(5, Math.floor(this.death * 10)))};
        let base: CharacterFrame;
        const p = character;
        if (this.hurt >= 0 && !p.crouched) base = this.frame('hurt', Math.min(5, Math.floor(this.hurt * 20)));
        else if (p.crouched) base = this.aimFrame(0, 0, p);
        else if (p.motion === 'wall-slide') base = this.frame('air', 4);
        else if (p.motion === 'wall-jump') base = this.frame('air', 1);
        else if (!p.grounded) {
            const column = p.vy < -610 ? 0 : p.vy < -470 ? 1 : p.vy < -170 ? 2 : p.vy < 130 ? 3 : 4;
            base = this.frame('air', column);
        } else if (this.landing >= 0) base = this.frame('air', 5);
        else {
            const running = p.motion === 'running' || p.motion === 'sprinting';
            base = this.frame(p.motion === 'sprinting' ? 'sprint' : running ? 'run' : 'idle', running ? Math.floor(this.stride) : Math.floor(this.elapsed * 8) % 6);
        }
        if (!p.firing && !p.aim.y && this.attack < 0) return {base};
        const held = heroAimPose(p);
        const upper = this.aimFrame(held.row, held.column, p);
        upper.offsetY = held.offsetY;
        // Fully extended on ignition; a one-pixel recoil follows, then returns to hold.
        const recoil = this.attack > .015 && this.attack < .085 ? 1 : 0;
        upper.offsetX = recoil && p.aim.x ? -recoil : 0;
        upper.offsetY -= recoil * p.aim.y;
        return {base, upper};
    }
}
