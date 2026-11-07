import type { GameEvent } from '../../interfaces/Game';
import type { Character } from '../../components/Character';
import { characterAtlas } from './CharacterAtlas';
import { characterAimAtlas } from './CharacterAimAtlas';

export type CharacterClip = 'idle' | 'run' | 'air' | 'attack' | 'hurt' | 'defeat';
export interface CharacterFrame { row: number; column: number; anchorX: number; anchorY: number; mirror: boolean; sheet?: 'aim'; offsetY?: number; }

const rows: Record<CharacterClip, number> = {idle: 0, run: 1, air: 2, attack: 3, hurt: 4, defeat: 5};

export class CharacterAnimation {
    private elapsed = 0;
    private attack = -1;
    private hurt = -1;
    private death = -1;
    private landing = -1;
    private airborne = false;

    update(character: Character, dt: number, events: GameEvent[] = [], dead = false) {
        this.elapsed += dt;
        if (events.includes('fire')) this.attack = 0;
        if (events.includes('hurt')) this.hurt = 0;
        if (this.airborne && character.grounded) this.landing = 0;
        this.airborne = !character.grounded;
        if (this.attack >= 0) { this.attack += dt; if (this.attack >= 0.18) this.attack = -1; }
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
        if (this.hurt >= 0 && !character.crouched) return {base: this.frame('hurt', Math.min(5, Math.floor(this.hurt * 20)))};
        let base: CharacterFrame;
        const p = character;
        if (p.crouched) base = this.aimFrame(0, Math.floor(this.elapsed * (Math.abs(p.vx) > 10 ? 10 : 6)) % 6, p);
        else if (p.motion === 'wall-slide') base = this.frame('air', 4);
        else if (p.motion === 'wall-jump') base = this.frame('air', 1);
        else if (!p.grounded) {
            const column = p.vy < -610 ? 0 : p.vy < -470 ? 1 : p.vy < -170 ? 2 : p.vy < 130 ? 3 : 4;
            base = this.frame('air', column);
        } else if (this.landing >= 0) base = this.frame('air', 5);
        else {
            const running = p.motion === 'running' || p.motion === 'sprinting';
            base = this.frame(running ? 'run' : 'idle', Math.floor(this.elapsed * (p.motion === 'sprinting' ? 18 : running ? 14 : 8)) % 6);
        }
        const column = this.attack < 0 ? 1 : Math.min(5, Math.floor(this.attack / 0.18 * 6));
        if (p.aim.y) {
            const row = p.aim.y < 0 ? p.aim.x ? 3 : 2 : p.aim.x ? 4 : 5;
            const aim = this.aimFrame(row, column, p);
            if (p.crouched) aim.offsetY = 12;
            // Downward poses include tucked legs and an unobstructed firing lane.
            return p.aim.y > 0 ? {base: aim} : {base, upper: aim};
        }
        if (this.attack < 0) return {base};
        if (p.crouched) return {base: this.aimFrame(1, column, p)};
        const attack = this.frame('attack', Math.min(5, Math.floor(this.attack / 0.18 * 6)));
        attack.mirror = p.aim.x !== p.facing;
        // Keep moving legs while firing. The atlas upper body is composited at
        // the hips rather than replacing a run or airborne pose with standing.
        return p.motion === 'idle' && p.grounded ? {base: attack} : {base, upper: attack};
    }
}
