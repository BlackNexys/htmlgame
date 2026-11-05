import type { Level } from '../interfaces/Level';
import type { Controls, GameEvent, PlayState } from '../interfaces/Game';
import { Enemy } from '../components/Enemy';
import { Character } from '../components/Character';
import { Map } from '../components/Map';
import { Camera } from '../components/Camera';
import { Projectile } from '../components/Projectile';
import { createEnemy } from './EnemyFactory';
import { CollisionSystem } from './CollisionSystem';
import { ParticleSystem } from './ParticleSystem';
import { Graveyard } from './Graveyard';
import { Combat } from './Combat';

export class World {
    readonly player: Character;
    readonly level: Map;
    readonly camera = new Camera();
    readonly effects = new ParticleSystem();
    readonly collisions: CollisionSystem;
    readonly graveyard: Graveyard;
    readonly combat: Combat;
    enemies: Enemy[];
    projectiles: Projectile[] = [];
    events: GameEvent[] = [];
    state: PlayState = 'playing';
    elapsed = 0;

    constructor(level: Level) {
        this.level = new Map(level);
        this.collisions = new CollisionSystem(this.level);
        this.graveyard = new Graveyard(this);
        this.combat = new Combat(this);
        this.player = new Character({gameArea: this});
        this.enemies = this.level.enemies.map((spawn, id) => createEnemy({gameArea: this, spawn, id}));
        this.camera.follow(this.player, this.level);
    }

    get defeated() { return this.combat.defeated; }
    get corpses() { return this.graveyard.corpses; }
    get particles() { return this.effects.particles; }

    update(dt: number, input: Controls) {
        this.events = [];
        if (this.state !== 'playing') return;
        this.elapsed += dt;
        this.player.update(dt, input);
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
        if (this.player.health <= 0 || this.player.y > this.level.height + 100) this.state = 'dead';
        if (this.state === 'playing' && this.level.exit.reachedBy(this.player)) { this.state = 'won'; this.events.push('win'); }
        this.effects.update(dt);
        this.camera.follow(this.player, this.level);
    }
}
