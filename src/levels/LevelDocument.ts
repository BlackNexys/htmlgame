import type { EnemyKind } from '../interfaces/Enemy';
import type { Rect } from '../interfaces/Geometry';
import type { NPCKind } from '../interfaces/NPC';
import type { InteractableDefinition } from '../interfaces/Interactable';

export interface LevelPoint { x: number; y: number; }
export interface TerrainDefinition extends Rect { id: string; }
export interface LevelEnemy extends LevelPoint {
    id: string;
    kind: EnemyKind;
    patrol: { left: number; right: number; };
}
export interface LevelSign extends LevelPoint { id: string; title: string; text: string; }
export interface LevelNPC extends LevelPoint { id: string; kind: NPCKind; scene: string; }

/** Authoring coordinates are world pixels. Actors are anchored at bottom center. */
export interface LevelDocument {
    schemaVersion: 1;
    id: string;
    name: string;
    revision: number;
    tileSize: 48;
    width: number;
    height: number;
    spawn: LevelPoint;
    exit: Rect;
    terrain: TerrainDefinition[];
    decorations: TerrainDefinition[];
    enemies: LevelEnemy[];
    npcs: LevelNPC[];
    interactables: InteractableDefinition[];
    signs: LevelSign[];
}

export type LevelCollection = 'terrain' | 'decorations' | 'enemies' | 'npcs' | 'interactables' | 'signs';
export type LevelObject = TerrainDefinition | LevelEnemy | LevelNPC | LevelSign | InteractableDefinition;
export const levelCollections: LevelCollection[] = ['terrain', 'decorations', 'enemies', 'npcs', 'interactables', 'signs'];

export function cloneDocument(document: LevelDocument): LevelDocument {
    return JSON.parse(JSON.stringify(document));
}

export function formatDocument(document: LevelDocument) { return JSON.stringify(document, null, 2) + '\n'; }
