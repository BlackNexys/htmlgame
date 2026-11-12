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
import {WaterRenderer} from './water/WaterRenderer';
import {PropRenderer} from '../world/props/PropRenderer';

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
    private readonly water:WaterRenderer;
    private readonly props:PropRenderer;

    constructor(public readonly canvas: HTMLCanvasElement, assets: GameAssets) {
        canvas.width = T.viewportWidth; canvas.height = T.viewportHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('This browser could not create a canvas renderer.');
        this.ctx = ctx; ctx.imageSmoothingEnabled = false;
        this.background = new BackgroundRenderer(ctx);
        if(assets.environment&&!['water','props'].includes(assets.environment.layout??''))this.environment=new ConfluenceEnvironment(ctx,assets.environment);
        this.props=new PropRenderer(ctx,assets.environment);
        this.water=new WaterRenderer(ctx,assets.environment);
        this.map = new MapRenderer(ctx, assets.wall,this.environment?.terrain,this.environment?.exit,assets.environment);
        this.character = new CharacterRenderer(ctx, assets.hero, assets.heroAim, assets.bootFire);
        this.enemies = new EnemyRenderer(ctx, assets);
        this.corpses = new CorpseRenderer(ctx, this.enemies);
        this.projectiles = new ProjectileRenderer(ctx, assets.flicker);
        this.particles = new ParticleRenderer(ctx);
        this.diagnostics = new DebugRenderer(ctx);
        this.npcs = new NPCRenderer(ctx, assets.npcs);
        this.objects=new InteractableRenderer(ctx,this.props);
    }

    resetAnimation() { this.character.reset(); }
    update(world: World, dt: number, events: GameEvent[] = []) { this.character.update(world.player, dt, events, world.state === 'dead'); }

    draw(world: World) {
        if(!this.environment?.drawBackground(world.camera))this.background.draw(world.camera, world.elapsed);
        this.ctx.save(); this.ctx.translate(-Math.round(world.camera.x), -Math.round(world.camera.y));
        this.environment?.drawScenery(world.camera,world.elapsed,world.level);
        for(const prop of world.level.props)if(prop.definition.layer!=='foreground'&&world.camera.canSee(prop))this.props.draw(prop.definition.asset,prop,prop.definition,world.camera);
        this.water.draw(world.level.water,world.camera,world.elapsed);
        this.map.draw(world.level, world.camera);
        world.interactables.forEach(object=>{const v=object.definition.visual;if(world.camera.canSee(v?{x:object.x+v.x,y:object.y+v.y,width:v.width,height:v.height}:object))this.objects.draw(object);});
        world.npcs.forEach(npc => { if (world.camera.canSee(npc)) this.npcs.draw(npc); });
        world.corpses.forEach(corpse => { if (world.camera.canSee(corpse.enemy)) this.corpses.draw(corpse); });
        world.enemies.forEach(enemy => { if (world.camera.canSee(enemy)) this.enemies.draw(enemy, world.elapsed, world.corpses); });
        this.character.draw(world.player, world.elapsed);
        this.projectiles.draw(world.projectiles, world.effects.flicker, world.effects.flickerSparks);
        this.particles.draw(world.particles);
        this.map.drawForeground(world.level,world.camera);
        for(const prop of world.level.props)if(prop.definition.layer==='foreground'&&world.camera.canSee(prop))this.props.draw(prop.definition.asset,prop,prop.definition,world.camera);
        if (this.debug) this.diagnostics.bounds(world);
        this.ctx.restore();
        if (this.debug) this.diagnostics.overlay(world);
    }
}
