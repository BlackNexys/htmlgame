import type { Character } from '../components/Character';
import type { CharacterFrame } from '../game/animation/CharacterAnimation';
import { characterAtlas } from '../game/animation/CharacterAtlas';
import { tuning } from '../game/config';

interface Ember { x: number; y: number; age: number; life: number; facing: number; phase: number; strength: number; }
/** Cosmetic, bounded world-space trails. Never participates in damage or collision. */
export class BootFlameRenderer {
    private time = 0;
    private strength = 0;
    private emission = 0;
    private embers: Ember[] = [];
    private ground?: {x: number; y: number};
    constructor(private readonly image?: HTMLImageElement) {}
    reset() { this.time = this.strength = this.emission = 0; this.embers = []; this.ground = undefined; }
    update(player: Character, dt: number, dead: boolean, frame?: CharacterFrame) {
        if (dead) { this.reset(); return; }
        this.time += dt;
        this.embers = this.embers.filter(ember => {
            ember.age += dt; ember.x -= ember.facing * 28 * dt; ember.y -= 12 * dt;
            return ember.age < ember.life;
        });
        const moving = player.grounded && !player.crouched && Math.abs(player.vx) > tuning.speed && player.sprintCharge > 0;
        this.strength = moving ? Math.min(player.sprintCharge, (Math.abs(player.vx) - tuning.speed) / (tuning.sprintSpeed - tuning.speed)) : 0;
        this.ground = moving ? {x: player.x + player.width / 2, y: player.y2} : undefined;
        if (!this.image || !this.strength || !frame || frame.sheet === 'aim' || ![1,6].includes(frame.row)) { this.emission = 0; return; }
        this.emission += dt;
        if (this.emission < 1 / 60) return;
        this.emission %= 1 / 60;
        const scale = characterAtlas.size / characterAtlas.cell;
        for (const [index,sole] of characterAtlas.boots[frame.row][frame.column].entries()) {
            const facing = player.facing * (frame.mirror ? -1 : 1);
            this.embers.push({x: player.x + player.width / 2 + (sole.x - frame.anchorX) * scale * facing,
                y: player.y2 + (sole.y - frame.anchorY) * scale, age: 0, life: .18 + .12 * this.strength,
                facing, phase: (Math.floor(this.time * 20) + index * 3) % 6, strength: this.strength});
        }
        if (this.embers.length > 64) this.embers.splice(0, this.embers.length - 64);
    }
    drawTrail(c: CanvasRenderingContext2D) {
        if (!this.image) return;
        c.save();
        if (this.ground) {
            c.fillStyle = '#ff329e';
            for (let n=3;n>0;n--) { c.globalAlpha = this.strength * .035; c.fillRect(Math.round(this.ground.x - n*14), Math.round(this.ground.y - 2), n*28, n*2); }
        }
        for (const ember of this.embers) {
            const fade = 1 - ember.age / ember.life;
            c.save(); c.translate(Math.round(ember.x), Math.round(ember.y)); c.scale(ember.facing, 1);
            c.globalAlpha = fade * fade * .45;
            const w = (18 + ember.strength * 25) * fade, h = 12 * fade;
            c.drawImage(this.image, ember.phase * 32, 0, 32, 24, -w*30/32, -h*22/24, w, h);
            c.restore();
        }
        c.restore();
    }
    draw(c: CanvasRenderingContext2D, frame: CharacterFrame) {
        if (!this.image || this.strength <= 0 || frame.sheet === 'aim' || ![1,6].includes(frame.row)) return;
        const soles = characterAtlas.boots[frame.row]?.[frame.column];
        if (!soles) return;
        const scale = characterAtlas.size / characterAtlas.cell;
        c.save(); c.globalAlpha *= .7 + this.strength * .3;
        soles.forEach((sole, index) => {
            const phase = Math.floor(this.time * 20 + index * 3) % 6;
            const w = 18 + this.strength * 40, h = 10 + this.strength * 12;
            const x = (sole.x - frame.anchorX) * scale * (frame.mirror ? -1 : 1);
            const y = (sole.y - frame.anchorY) * scale;
            c.drawImage(this.image!, phase * 32, 0, 32, 24,
                Math.round(x - w*30/32), Math.round(y - h*22/24), Math.round(w), Math.round(h));
            c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .8;
            // A compact second exposure makes the root hotter than the long tongues.
            c.drawImage(this.image!, phase * 32, 0, 32, 24,
                Math.round(x - w*.32*30/32), Math.round(y - h*.65*22/24), Math.round(w*.32), Math.round(h*.65));
            c.restore();
        });
        c.restore();
    }
}
