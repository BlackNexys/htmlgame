import type { GameAssets } from '../interfaces/Assets';
import type { GameEvent } from '../interfaces/Game';
import type { World } from '../game/World';
import { tuning as T } from '../game/config';
import { BackgroundRenderer } from '../renderers/BackgroundRenderer';
import { MapRenderer } from '../renderers/MapRenderer';
import { CharacterRenderer } from '../renderers/CharacterRenderer';
import { EnemyRenderer } from '../renderers/EnemyRenderer';
import { CorpseRenderer } from '../renderers/CorpseRenderer';
import { ProjectileRenderer } from '../renderers/ProjectileRenderer';
import { ParticleRenderer } from '../renderers/ParticleRenderer';
import { DebugRenderer } from '../renderers/DebugRenderer';

export class GameScreen {
    debug = false;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly background: BackgroundRenderer;
    private readonly map: MapRenderer;
    private readonly character: CharacterRenderer;
    private readonly enemies: EnemyRenderer;
    private readonly corpses: CorpseRenderer;
    private readonly projectiles: ProjectileRenderer;
    private readonly particles: ParticleRenderer;
    private readonly diagnostics: DebugRenderer;

    constructor(public readonly canvas: HTMLCanvasElement, assets: GameAssets) {
        canvas.width = T.viewportWidth; canvas.height = T.viewportHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('This browser could not create a canvas renderer.');
        this.ctx = ctx; ctx.imageSmoothingEnabled = false;
        this.background = new BackgroundRenderer(ctx);
        this.map = new MapRenderer(ctx, assets.wall);
        this.character = new CharacterRenderer(ctx, assets.hero);
        this.enemies = new EnemyRenderer(ctx, assets);
        this.corpses = new CorpseRenderer(ctx, this.enemies);
        this.projectiles = new ProjectileRenderer(ctx);
        this.particles = new ParticleRenderer(ctx);
        this.diagnostics = new DebugRenderer(ctx);
    }

    resetAnimation() { this.character.reset(); }
    update(world: World, dt: number, events: GameEvent[] = []) { this.character.update(world.player, dt, events, world.state === 'dead'); }

    draw(world: World) {
        this.background.draw(world.camera, world.elapsed);
        this.ctx.save(); this.ctx.translate(-Math.round(world.camera.x), -Math.round(world.camera.y));
        this.map.draw(world.level, world.camera);
        world.corpses.forEach(corpse => { if (world.camera.canSee(corpse.enemy)) this.corpses.draw(corpse); });
        world.enemies.forEach(enemy => { if (world.camera.canSee(enemy)) this.enemies.draw(enemy, world.elapsed, world.corpses); });
        this.character.draw(world.player, world.elapsed);
        this.projectiles.draw(world.projectiles);
        this.particles.draw(world.particles);
        if (this.debug) this.diagnostics.bounds(world);
        this.ctx.restore();
        if (this.debug) this.diagnostics.overlay(world);
    }
}
