import type { CharacterContext, EnemyContext } from '../interfaces/Simulation';
import type { Level } from '../interfaces/Level';
import type { Controls, GameEvent, PlayState } from '../interfaces/Game';
import { Enemy } from '../components/Enemy';
import { Character } from '../components/Character';
import { Map } from '../components/Map';
import { Camera } from '../components/Camera';
import { Projectile } from '../components/Projectile';
import { createEnemy } from './EnemyFactory';
import { CollisionSystem } from './systems/CollisionSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { Graveyard } from './systems/Graveyard';
import { Combat } from './systems/Combat';
import { Ectoplasm } from './systems/Ectoplasm';
import type { FlickerEvent } from '../interfaces/Weapon';
import type { NPC } from '../components/NPC';
import { createNPC } from './NPCFactory';
import { InteractionSystem } from './systems/InteractionSystem';
import { Interactable } from '../components/Interactable';
import { Wall } from '../components/Wall';

export class World implements CharacterContext, EnemyContext {
    readonly player: Character;
    readonly level: Map;
    readonly camera = new Camera();
    readonly effects = new ParticleSystem();
    readonly collisions: CollisionSystem;
    readonly graveyard: Graveyard;
    readonly combat: Combat;
    readonly ectoplasm = new Ectoplasm();
    readonly npcs: NPC[];
    readonly interactables: Interactable[];
    get interactionTargets(){return [...this.npcs,...this.interactables.filter(item=>item.active)];}
    readonly interactions: InteractionSystem;
    enemies: Enemy[];
    projectiles: Projectile[] = [];
    events: GameEvent[] = [];
    weaponEvents: FlickerEvent[] = [];
    state: PlayState = 'playing';
    elapsed = 0;

    constructor(level: Level) {
        this.level = new Map(level);
        this.interactables=this.level.interactables.map(definition=>new Interactable(definition));
        for(const object of this.interactables)if(object.definition.solid){object.blocker=new Wall(object);this.level.solids.push(object.blocker);}
        this.collisions = new CollisionSystem(this.level);
        this.interactions = new InteractionSystem(this.collisions);
        this.graveyard = new Graveyard(this);
        this.combat = new Combat(this);
        this.player = new Character({gameArea: this});
        this.enemies = this.level.enemies.map((spawn, id) => createEnemy({gameArea: this, spawn, id}));
        this.npcs = this.level.npcs.map(createNPC);
        this.camera.follow(this.player, this.level);
    }

    get defeated() { return this.combat.defeated; }
    syncInteractables(){for(let i=this.level.solids.length-1;i>=0;i--)if(this.interactables.some(object=>object.blocker===this.level.solids[i] && !object.active))this.level.solids.splice(i,1);}
    get corpses() { return this.graveyard.corpses; }
    get particles() { return this.effects.particles; }

    update(dt: number, input: Controls) {
        this.events = [];
        this.weaponEvents = [];
        if (this.state !== 'playing') return;
        this.elapsed += dt;
        this.player.update(dt, input);
        this.npcs.forEach(npc => npc.update(dt, this.player, this.level.solids));
        this.graveyard.update(dt);
        for (const enemy of [...this.enemies]) {
            if (enemy.health <= 0) continue;
            const previous = enemy.state;
            enemy.update(dt);
            if (enemy.state === 'windup' && previous !== 'windup') this.events.push('charge');
            if (enemy.y > this.level.height + 100) this.combat.defeatEnemy(enemy);
        }
        this.projectiles = this.projectiles.filter(shot => shot.update(this, dt));
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        this.combat.checkContacts();
        if (this.player.health <= 0 || this.player.y > this.level.height + 100) { this.state = 'dead'; this.player.clearActions(); }
        if (this.state === 'playing' && this.level.exit.enabled && this.level.exit.reachedBy(this.player)) { this.state = 'won'; this.events.push('win'); }
        this.effects.update(dt);
        this.effects.consume(this.weaponEvents);
        this.camera.follow(this.player, this.level, dt);
    }
}
