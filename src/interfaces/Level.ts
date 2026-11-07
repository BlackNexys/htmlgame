import type { EnemyKind } from './Enemy';
import type { Rect } from './Geometry';
import type { NPCSpawn } from './NPC';

export interface EnemySpawn { x: number; y: number; left: number; right: number; kind?: EnemyKind; }
export interface SignDefinition { x: number; y: number; title: string; text: string; }
export interface Level {
    width: number;
    height: number;
    solids: Rect[];
    decorations?: Rect[];
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    npcs?: NPCSpawn[];
    exit: Rect;
    signs?: SignDefinition[];
}
