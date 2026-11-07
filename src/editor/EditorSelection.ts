import type { LevelCollection, LevelDocument, LevelEnemy, LevelNPC, LevelPoint } from '../levels/LevelDocument';
import { enemyTuning } from '../game/config';
import type { Rect } from '../interfaces/Geometry';
import { npcCatalog } from '../game/NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';
import type { InteractionKind } from '../interfaces/Interactable';

export type EditorSelection = {collection: LevelCollection; id: string} | 'spawn' | 'exit' | undefined;
export interface SelectedObject extends LevelPoint {
    id?: string; width?: number; height?: number;
    kind?: LevelEnemy['kind'] | LevelNPC['kind'] | InteractionKind; patrol?: LevelEnemy['patrol']; title?: string; text?: string; scene?: string;
    label?:string;reach?:number;sceneId?:string;effectId?:string;conditionId?:string;solid?:boolean;
}
export function selectionKey(selection: EditorSelection) { return typeof selection === 'string' ? selection : selection ? `${selection.collection}:${selection.id}` : ''; }
export function selectionFromKey(key: string): EditorSelection {
    if (key === 'spawn' || key === 'exit') return key;
    const [collection, id] = key.split(':');
    if (!['terrain', 'decorations', 'enemies', 'npcs', 'interactables', 'signs'].includes(collection) || !id) return undefined;
    return {collection: collection as LevelCollection, id};
}
export function selectedObject(document: LevelDocument, selection: EditorSelection): SelectedObject | undefined {
    if (!selection) return undefined;
    return typeof selection === 'string' ? document[selection] : document[selection.collection].find(item => item.id === selection.id);
}
export function selectionBounds(document: LevelDocument, selection: Exclude<EditorSelection, undefined>): Rect | undefined {
    if (selection === 'spawn') return {x: document.spawn.x - 16, y: document.spawn.y - 52, width: 32, height: 52};
    if (selection === 'exit') return document.exit;
    const item = selectedObject(document, selection);
    if (!item) return undefined;
    if (item.width !== undefined && item.height !== undefined) return {x:item.x,y:item.y,width:item.width,height:item.height};
    if (item.kind) {
        const stats = item.scene !== undefined ? npcCatalog[item.kind as NPCKind] : enemyTuning[item.kind as LevelEnemy['kind']];
        return {x: item.x - stats.width / 2, y: item.y - stats.height, width: stats.width, height: stats.height};
    }
    return {x: item.x, y: item.y - 28, width: 160, height: 36};
}
