import { Assets } from './Assets';
import { World } from './World';
import { Rect } from './physics';
import { tuning as T, enemyTuning } from './config';
import { HeroAnimation, HeroFrame } from './HeroAnimation';
import { GameEvent } from './World';
import { Enemy, vulnerable, shieldRaised } from './Enemy';
import { enemyFrame, enemyNames } from './EnemyVisual';

export class Renderer {
    debug = false;
    private hero = new HeroAnimation();
    private ctx: CanvasRenderingContext2D;
    constructor(public canvas: HTMLCanvasElement, private assets: Assets) {
        canvas.width = T.viewportWidth; canvas.height = T.viewportHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser could not create a canvas renderer.');
        this.ctx = context; context.imageSmoothingEnabled = false;
    }
    resetAnimation() { this.hero = new HeroAnimation(); }
    update(world: World, dt: number, events: GameEvent[] = []) { this.hero.update(world, dt, events); }
    draw(world: World) {
        const c = this.ctx;
        const {x: camX, y: camY} = world.camera;
        c.clearRect(0, 0, T.viewportWidth, T.viewportHeight);
        const sky = c.createLinearGradient(0, 0, 0, T.viewportHeight);
        sky.addColorStop(0, '#0b1620'); sky.addColorStop(1, '#1e393e');
        c.fillStyle = sky; c.fillRect(0, 0, T.viewportWidth, T.viewportHeight);
        for (let i = -1; i < 14; i++) {
            const x = i * 140 - camX * 0.18 % 140;
            c.fillStyle = '#12262e'; c.fillRect(x, 120 + (i % 3) * 24, 95, 400);
            c.fillStyle = '#1c343b'; c.fillRect(x + 12, 90 + (i % 3) * 24, 12, 440);
            c.fillStyle = '#29464a'; c.fillRect(x + 34, 230, 18, 50);
        }
        for (let i = 0; i < 35; i++) {
            const x = ((i * 137.3 - camX * 0.3) % 1000 + 1000) % 1000;
            const y = 70 + (i * 53 % 380) + Math.sin(world.elapsed + i) * 8;
            c.fillStyle = i % 3 ? '#446864' : '#8cb3a0'; c.globalAlpha = 0.45; c.fillRect(x, y, 2, 2);
        }
        c.globalAlpha = 1;
        c.save(); c.translate(-Math.round(camX), -Math.round(camY));
        for (const wall of world.level.solids) {
            if (wall.x + wall.width < camX || wall.x > camX + T.viewportWidth) continue;
            c.drawImage(this.assets.wall, wall.x, wall.y, wall.width, wall.height);
            c.fillStyle = 'rgba(4,16,22,.45)'; c.fillRect(wall.x, wall.y, wall.width, wall.height);
            if (!world.level.solids.some(other => other.x === wall.x && other.y === wall.y - T.tile)) {
                c.fillStyle = '#718779'; c.fillRect(wall.x, wall.y, wall.width, 3);
                c.fillStyle = '#314f4c'; c.fillRect(wall.x, wall.y + 3, wall.width, 4);
            }
        }
        this.sign(150, 470, 'THE LOWER PASSAGE', 'KEEP GOING EAST');
        this.sign(850, 336, 'WATCH THE EMITTER', 'JUMP THE FIRING LANE');
        this.sign(1620, 430, 'KEEP YOUR FEET MOVING', 'THE GHOUL COMMITS TO ITS LEAP');
        this.sign(2450, 330, 'A FAULT IN THE SIGNAL', 'STRIKE WHEN IT BECOMES SOLID');
        this.sign(3040, 350, 'OBSOLETE SECURITY', 'THE SHIELD OPENS BEFORE A BASH');
        this.sign(3720, 350, 'UNFINISHED BUSINESS', 'BREAK THE REACTIVATION LINK');
        const exit = world.level.exit;
        c.shadowColor = '#a5efd2'; c.shadowBlur = 25;
        c.fillStyle = '#547f72'; c.fillRect(exit.x - 8, exit.y - 8, exit.width + 16, exit.height + 8);
        c.shadowBlur = 0; c.fillStyle = '#0e262c'; c.fillRect(exit.x, exit.y, exit.width, exit.height);
        c.fillStyle = '#9cdebd';
        for (let i = 0; i < 4; i++) c.fillRect(exit.x + 10 + i * 13, exit.y + 14, 3, exit.height - 14);
        c.font = '12px monospace'; c.textAlign = 'center'; c.fillText('PASSAGE', exit.x + 32, exit.y - 22);
        for (const corpse of world.corpses) {
            const e = corpse.enemy;
            if (e.x < camX - 100 || e.x > camX + T.viewportWidth + 100) continue;
            c.save(); c.globalAlpha = corpse.revivable ? .7 : .32;
            this.drawEnemy(e, 3, Math.min(3, Math.floor(corpse.age * 7)));
            c.restore();
            if (corpse.revivable) {
                c.fillStyle = corpse.claimedBy !== undefined ? '#b9ffff' : '#478b93';
                c.fillRect(e.x + e.width / 2 - 2, e.y + e.height - 6, 4, 4);
            } else if (e.revives > 0) {
                c.fillStyle = '#8d786e'; c.fillRect(e.x + e.width / 2 - 4, e.y + e.height - 4, 8, 2);
            }
        }
        for (const e of world.enemies) {
            if (e.x < camX - 100 || e.x > camX + T.viewportWidth + 100) continue;
            const frame = enemyFrame(e, world.elapsed);
            c.save();
            if (!vulnerable(e)) c.globalAlpha = .35;
            if (e.flash > 0) c.filter = 'brightness(2)';
            this.drawEnemy(e, frame.row, frame.column); c.restore();
            const telegraph = e.state === 'windup';
            c.textAlign = 'center'; c.font = '9px monospace';
            c.fillStyle = telegraph ? '#ffd39b' : '#a1beb4';
            const label = e.blockFlash > 0 ? 'BLOCKED' : !vulnerable(e) ? 'PHASED' :
                telegraph ? ({zombie: 'LUNGE', skeleton: 'CHARGING', ghoul: 'LEAP', ghost: 'SOLID', wight: 'SHIELD OPEN', necromancer: 'REACTIVATING'})[e.kind] : enemyNames[e.kind];
            c.fillText(label, e.x + e.width / 2, e.y - 23);
            c.fillStyle = '#27383b'; c.fillRect(e.x - 3, e.y - 16, e.width + 6, 3);
            c.fillStyle = vulnerable(e) ? '#9bd4ce' : '#41666a';
            c.fillRect(e.x - 3, e.y - 16, (e.width + 6) * e.health / e.maxHealth, 3);
            if (telegraph) {
                c.fillStyle = '#dfac6b'; c.fillRect(e.x - 3, e.y - 10, (e.width + 6) * (1 - Math.max(0, e.timer) / enemyTuning[e.kind].windup), 3);
                if (e.kind === 'skeleton') {
                    c.save(); c.setLineDash([4, 8]); c.strokeStyle = '#6c8e91'; c.globalAlpha = .5;
                    c.beginPath(); c.moveTo(e.x + e.width / 2, e.y + 26); c.lineTo(e.x + e.width / 2 + e.facing * 230, e.y + 26); c.stroke(); c.restore();
                }
            }
            if (shieldRaised(e)) {
                c.fillStyle = e.blockFlash > 0 ? '#d3ffff' : '#5dabb4';
                c.fillRect(e.x + (e.facing > 0 ? e.width + 2 : -4), e.y + 8, e.blockFlash > 0 ? 4 : 2, e.height - 12);
            }
            if (e.kind === 'necromancer' && e.state === 'windup') {
                const target = world.corpses.find(corpse => corpse.enemy.id === e.targetId);
                if (target) {
                    c.save(); c.strokeStyle = '#84e1e5'; c.setLineDash([5, 5]); c.lineDashOffset = -world.elapsed * 40;
                    c.beginPath(); c.moveTo(e.x + e.width / 2, e.y + 22); c.lineTo(target.enemy.x + target.enemy.width / 2, target.enemy.y + target.enemy.height - 10); c.stroke(); c.restore();
                }
            }
        }
        const p = world.player;
        if (p.grounded) { c.fillStyle = 'rgba(5,15,20,.5)'; c.fillRect(p.x - 8, p.y + p.height - 1, 48, 6); }
        c.save(); c.translate(Math.round(p.x + p.width / 2), Math.round(p.y + p.height)); c.scale(p.facing, 1);
        if (p.invulnerable > 0 && Math.floor(world.elapsed * 16) % 2) c.globalAlpha = 0.35;
        const animation = this.hero.sample(world);
        if (animation.upper) {
            // Split at the hips. Clip the base legs and attack torso at the
            // same destination line, avoiding doubled limbs while moving.
            const hip = -17;
            c.save(); c.beginPath(); c.rect(-80, hip, 160, 100); c.clip(); this.drawHero(animation.base); c.restore();
            c.save(); c.beginPath(); c.rect(-80, -100, 160, 100 + hip); c.clip(); this.drawHero(animation.upper); c.restore();
        } else this.drawHero(animation.base);
        c.restore();
        for (const shot of world.projectiles) {
            c.shadowColor = shot.owner === 'enemy' ? '#44c9ef' : '#ff328e'; c.shadowBlur = 14;
            c.fillStyle = shot.owner === 'enemy' ? '#72e1ed' : '#ff5eae'; c.fillRect(shot.x, shot.y, shot.width, shot.height);
            c.fillStyle = shot.owner === 'enemy' ? '#e2ffff' : '#ffd7ed'; c.fillRect(shot.x + 4, shot.y + 2, 5, 4);
        }
        c.shadowBlur = 0;
        for (const particle of world.particles) {
            c.globalAlpha = Math.min(1, particle.life * 4); c.fillStyle = particle.color; c.fillRect(particle.x, particle.y, 4, 4);
        }
        c.globalAlpha = 1;
        if (this.debug) {
            const outline = (r: Rect, color: string) => { c.strokeStyle = color; c.strokeRect(r.x, r.y, r.width, r.height); };
            world.level.solids.forEach(r => outline(r, '#5c9b8b')); outline(p, '#e9f279');
            world.enemies.forEach(e => outline(e, '#ff7e88')); world.projectiles.forEach(s => outline(s, '#ffffff'));
        }
        c.restore();
        if (this.debug) {
            c.fillStyle = '#081219'; c.fillRect(12, 12, 360, 52);
            c.fillStyle = '#ddf3d8'; c.font = '13px monospace'; c.textAlign = 'left';
            c.fillText(`x ${p.x.toFixed(0)} y ${p.y.toFixed(0)} vx ${p.vx.toFixed(0)} vy ${p.vy.toFixed(0)}`, 22, 33);
            c.fillText(`${p.grounded ? 'grounded' : 'airborne'} · shots ${world.projectiles.length} · F2 hide`, 22, 53);
        }
    }
    private drawEnemy(e: Enemy, row: number, column: number) {
        const image = this.assets.enemies[e.kind], size = enemyTuning[e.kind].size;
        const x = Math.round(column * image.width / 4), y = Math.round(row * image.height / 4);
        const width = Math.round((column + 1) * image.width / 4) - x;
        const height = Math.round((row + 1) * image.height / 4) - y;
        this.ctx.save(); this.ctx.translate(Math.round(e.x + e.width / 2), Math.round(e.y + e.height));
        this.ctx.scale(e.facing, 1);
        this.ctx.drawImage(image, x, y, width, height, -size / 2, -size * (e.kind === 'ghoul' ? .87 : .94), size, size);
        this.ctx.restore();
    }
    private drawHero(frame: HeroFrame) {
        const cell = 209, size = 80;
        this.ctx.drawImage(this.assets.hero, frame.column * cell, frame.row * cell, cell, cell,
            -frame.anchorX / cell * size, -frame.anchorY / cell * size, size, size);
    }
    private sign(x: number, y: number, title: string, text: string) {
        const c = this.ctx;
        c.textAlign = 'left'; c.font = 'bold 12px monospace'; c.fillStyle = '#9fae99'; c.fillText(title, x, y);
        c.font = '10px monospace'; c.fillStyle = '#637f78'; c.fillText(text, x, y + 18);
    }
}
