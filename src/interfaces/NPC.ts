export type NPCKind = 'rail-attendant';
/** Runtime anchors are top-left; the level compiler converts authored feet positions. */
export interface NPCSpawn { id: string; kind: NPCKind; x: number; y: number; scene: string; }
