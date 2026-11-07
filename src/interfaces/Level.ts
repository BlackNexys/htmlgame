import type { EnemyKind } from './Enemy';
import type { Rect } from './Geometry';
import type { NPCSpawn } from './NPC';
import type { InteractableDefinition } from './Interactable';

export interface EnemySpawn { x: number; y: number; left: number; right: number; kind?: EnemyKind; }
export interface SignDefinition { x: number; y: number; title: string; text: string; }
export interface Level {
    id?: string;
    width: number;
    height: number;
    solids: Rect[];
    decorations?: Rect[];
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    npcs?: NPCSpawn[];
    interactables?: InteractableDefinition[];
    exit: Rect;
    signs?: SignDefinition[];
}
