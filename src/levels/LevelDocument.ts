import type { EnemyKind } from '../interfaces/Enemy';
import type { Rect } from '../interfaces/Geometry';
import type { NPCKind } from '../interfaces/NPC';
import type { InteractableDefinition } from '../interfaces/Interactable';
import type {StructureDefinition} from '../world/structures/StructureDefinition';
import type {WaterDefinition} from '../world/water/WaterDefinition';
import type {PropDefinition,PresentationDefinition} from '../world/props/PropDefinition';

export interface LevelPoint { x: number; y: number; }
export interface TerrainDefinition extends StructureDefinition {}
export interface LevelEnemy extends LevelPoint {
    id: string;
    kind: EnemyKind;
    patrol: { left: number; right: number; };
}
export interface LevelSign extends LevelPoint { id: string; title: string; text: string; }
export interface LevelNPC extends LevelPoint { id: string; kind: NPCKind; scene: string; }

/** Authoring coordinates are world pixels. Actors are anchored at bottom center. */
export interface LevelDocument {
    schemaVersion: 2;
    id: string;
    name: string;
    revision: number;
    gridSize:number;
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
    water:WaterDefinition[];
    props:PropDefinition[];
    presentation?:PresentationDefinition;
}

export type LevelCollection = 'terrain' | 'decorations' | 'enemies' | 'npcs' | 'interactables' | 'signs' | 'water' | 'props';
export type LevelObject = TerrainDefinition | LevelEnemy | LevelNPC | LevelSign | InteractableDefinition | WaterDefinition | PropDefinition;
export const levelCollections: LevelCollection[] = ['terrain', 'decorations', 'enemies', 'npcs', 'interactables', 'signs','water','props'];

export function cloneDocument(document: LevelDocument): LevelDocument {
    return JSON.parse(JSON.stringify(document));
}

export function formatDocument(document: LevelDocument) { return JSON.stringify(document, null, 2) + '\n'; }
