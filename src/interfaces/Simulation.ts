import type { Character } from '../components/Character';
import type { Enemy } from '../components/Enemy';
import type { Corpse } from '../components/Corpse';
import type { Map } from '../components/Map';
import type { Projectile } from '../components/Projectile';
import type { CollisionSystem } from '../game/systems/CollisionSystem';
import type { Combat } from '../game/systems/Combat';
import type { Graveyard } from '../game/systems/Graveyard';
import type { ParticleSystem } from '../game/systems/ParticleSystem';
import type { Ectoplasm } from '../game/systems/Ectoplasm';
import type { GameEvent } from './Game';
import type { FlickerEvent } from './Weapon';

/** Capabilities available to projectiles; session state and bookkeeping stay in World. */
export interface ProjectileContext {
    readonly level: Pick<Map, 'width' | 'height'>;
    readonly player: Character;
    readonly enemies: readonly Enemy[];
    readonly collisions: Pick<CollisionSystem, 'firstImpact'>;
    readonly combat: Pick<Combat, 'hurtPlayer' | 'hitEnemy'>;
    readonly effects: Pick<ParticleSystem, 'burst'>;
    readonly events: GameEvent[];
    readonly weaponEvents: FlickerEvent[];
}

/** Weapons can emit shots and spend ammunition, but cannot replace world collections. */
export interface WeaponContext extends ProjectileContext {
    readonly projectiles: Projectile[];
    readonly ectoplasm: Pick<Ectoplasm, 'spend'>;
}

export interface CharacterContext extends WeaponContext {
    readonly level: Pick<Map, 'width' | 'height' | 'spawn' | 'collision'>;
}

/** Enemy decisions see terrain, their target and explicit corpse/projectile services. */
export interface EnemyContext {
    readonly level: Pick<Map, 'width' | 'height' | 'collision'>;
    readonly player: Character;
    readonly collisions: Pick<CollisionSystem, 'canSee'>;
    readonly graveyard: Pick<Graveyard, 'find' | 'reactivate' | 'releaseClaims'>;
    readonly corpses: readonly Corpse[];
    readonly projectiles: Projectile[];
    readonly events: GameEvent[];
}
