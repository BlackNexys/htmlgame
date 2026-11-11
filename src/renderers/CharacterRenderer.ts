import type { Character } from '../components/Character';
import type { GameEvent } from '../interfaces/Game';
import { CharacterAnimation, type CharacterFrame } from '../game/animation/CharacterAnimation';
import { characterAtlas } from '../game/animation/CharacterAtlas';
import { characterAimAtlas } from '../game/animation/CharacterAimAtlas';
import { BootFlameRenderer } from './BootFlameRenderer';
import { heroAimPose } from '../game/animation/HeroPose';
import { heroPaletteImage } from './HeroPalette';

export class CharacterRenderer {
    private animation = new CharacterAnimation();
    private readonly boots: BootFlameRenderer;
    private readonly image: HTMLCanvasElement | HTMLImageElement;
    private readonly aimImage: HTMLCanvasElement | HTMLImageElement;
    constructor(private readonly ctx: CanvasRenderingContext2D, image: HTMLImageElement, aimImage: HTMLImageElement, bootFire?: HTMLImageElement, refinedPalette = true) {
        this.image=refinedPalette?heroPaletteImage(image):image;this.aimImage=refinedPalette?heroPaletteImage(aimImage):aimImage;
        this.boots = new BootFlameRenderer(bootFire);
    }
    reset() { this.animation = new CharacterAnimation(); this.boots.reset(); }
    update(character: Character, dt: number, events: GameEvent[], dead: boolean) { this.animation.update(character, dt, events, dead); this.boots.update(character, dt, dead, this.animation.sample(character).base); }

    draw(player: Character, elapsed: number) {
        const c = this.ctx;
        this.boots.drawTrail(c);
        if (player.grounded) { c.fillStyle = 'rgba(5,15,20,.5)'; c.fillRect(player.x - 8, player.y2 - 1, 48, 6); }
        c.save(); c.translate(Math.round(player.x + player.width / 2), Math.round(player.y2)); c.scale(player.facing, 1);
        if (player.invulnerable > 0 && Math.floor(elapsed * 16) % 2) c.globalAlpha = .35;
        const pose = this.animation.sample(player);
        this.boots.draw(c, pose.base);
        if (pose.upper) {
            // Standing arms hang below the belt. Move that pose's seam beneath
            // the old hand so it cannot remain as an extra arm during firing.
            const standing = !pose.base.sheet && pose.base.row === 0;
            const hip = player.crouched ? -16 : characterAtlas.hip + (standing ? 8 : 0);
            c.save(); c.beginPath();
            // Keep the belt, legs and lower cloak, excluding the locomotion forearm.
            if (standing || player.crouched) c.rect(-80, hip, 160, 100);
            else { c.rect(-80, hip + 8, 160, 92); c.rect(-80, hip, 92, 8); }
            c.clip(); this.frame(pose.base); c.restore();
            c.save(); c.beginPath(); c.rect(-80, -100, 160, 100 + hip);
            // Downward hands extend below the belt, outside the leg silhouette.
            if (player.aim.y > 0) {
                const side = (player.aim.x || player.facing) * player.facing;
                c.rect(side > 0 ? 12 : -80, hip, 68, Math.max(0, heroAimPose(player).palm.y + 5 - hip));
            }
            c.clip(); this.frame(pose.upper); c.restore();
        } else this.frame(pose.base);
        c.restore();
    }

    private frame(frame: CharacterFrame) {
        const atlas = frame.sheet === 'aim' ? characterAimAtlas : characterAtlas;
        const {cell,size} = atlas;
        const source = frame.sheet === 'aim' ? characterAimAtlas.rows[frame.row] : undefined;
        const height = source?.height ?? cell;
        this.ctx.save();
        if (frame.mirror) this.ctx.scale(-1,1);
        this.ctx.drawImage(frame.sheet === 'aim' ? this.aimImage : this.image, frame.column * cell, source?.sourceY ?? frame.row * cell, cell, height,
            -frame.anchorX / cell * size + (frame.offsetX ?? 0), -frame.anchorY / cell * size + (frame.offsetY ?? 0), size, height / cell * size);
        this.ctx.restore();
    }
}
