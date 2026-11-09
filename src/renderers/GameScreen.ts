import type { GameAssets } from '../interfaces/Assets';
import type { GameEvent } from '../interfaces/Game';
import type { World } from '../game/World';
import { tuning as T } from '../game/config';
import { BackgroundRenderer } from './BackgroundRenderer';
import { MapRenderer } from './MapRenderer';
import { CharacterRenderer } from './CharacterRenderer';
import { EnemyRenderer } from './EnemyRenderer';
import { CorpseRenderer } from './CorpseRenderer';
import { ProjectileRenderer } from './ProjectileRenderer';
import { ParticleRenderer } from './ParticleRenderer';
import { DebugRenderer } from './DebugRenderer';
import { NPCRenderer } from './NPCRenderer';
import { InteractableRenderer } from './InteractableRenderer';
import { ConfluenceEnvironment } from '../environment/ConfluenceEnvironment';

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
    private readonly npcs: NPCRenderer;
    private readonly objects:InteractableRenderer;
    private readonly environment?:ConfluenceEnvironment;

    constructor(public readonly canvas: HTMLCanvasElement, assets: GameAssets) {
        canvas.width = T.viewportWidth; canvas.height = T.viewportHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('This browser could not create a canvas renderer.');
        this.ctx = ctx; ctx.imageSmoothingEnabled = false;
        this.background = new BackgroundRenderer(ctx);
        if(assets.environment)this.environment=new ConfluenceEnvironment(ctx,assets.environment);
        this.map = new MapRenderer(ctx, assets.wall,this.environment?.terrain,this.environment?.exit);
        this.character = new CharacterRenderer(ctx, assets.hero, assets.heroAim, assets.bootFire);
        this.enemies = new EnemyRenderer(ctx, assets);
        this.corpses = new CorpseRenderer(ctx, this.enemies);
        this.projectiles = new ProjectileRenderer(ctx, assets.flicker);
        this.particles = new ParticleRenderer(ctx);
        this.diagnostics = new DebugRenderer(ctx);
        this.npcs = new NPCRenderer(ctx, assets.npcs);
        this.objects=new InteractableRenderer(ctx,this.environment?.objects);
    }

    resetAnimation() { this.character.reset(); }
    update(world: World, dt: number, events: GameEvent[] = []) { this.character.update(world.player, dt, events, world.state === 'dead'); }

    draw(world: World) {
        if(!this.environment?.drawBackground(world.camera))this.background.draw(world.camera, world.elapsed);
        this.ctx.save(); this.ctx.translate(-Math.round(world.camera.x), -Math.round(world.camera.y));
        this.environment?.drawScenery(world.camera,world.elapsed,world.level);
        this.map.draw(world.level, world.camera);
        world.interactables.forEach(object=>{if(world.camera.canSee(object))this.objects.draw(object);});
        world.npcs.forEach(npc => { if (world.camera.canSee(npc)) this.npcs.draw(npc); });
        world.corpses.forEach(corpse => { if (world.camera.canSee(corpse.enemy)) this.corpses.draw(corpse); });
        world.enemies.forEach(enemy => { if (world.camera.canSee(enemy)) this.enemies.draw(enemy, world.elapsed, world.corpses); });
        this.character.draw(world.player, world.elapsed);
        this.projectiles.draw(world.projectiles, world.effects.flicker);
        this.particles.draw(world.particles);
        if (this.debug) this.diagnostics.bounds(world);
        this.ctx.restore();
        if (this.debug) this.diagnostics.overlay(world);
    }
}
