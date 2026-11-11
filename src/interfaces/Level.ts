import type { EnemyKind } from './Enemy';
import type { Rect } from './Geometry';
import type { NPCSpawn } from './NPC';
import type { InteractableDefinition } from './Interactable';
import type {StructureDefinition} from '../world/structures/StructureDefinition';
import type {WaterDefinition} from '../world/water/WaterDefinition';
import type {PropDefinition,PresentationDefinition} from '../world/props/PropDefinition';

export interface EnemySpawn { x: number; y: number; left: number; right: number; kind?: EnemyKind; }
export interface SignDefinition { x: number; y: number; title: string; text: string; }
export interface Level {
    id?: string;
    revision?:number;
    presentation?:PresentationDefinition;
    props?:PropDefinition[];
    width: number;
    height: number;
    solids: (Rect & {id?:string;owner?:string})[];
    structureDefinitions?:{terrain:StructureDefinition[];decorations:StructureDefinition[]};
    water?:WaterDefinition[];
    decorations?: Rect[];
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    npcs?: NPCSpawn[];
    interactables?: InteractableDefinition[];
    exit: Rect;
    signs?: SignDefinition[];
}
