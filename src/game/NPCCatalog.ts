import type { NPCKind } from '../interfaces/NPC';

/** Pure metadata shared by validation, rendering and the workshop. */
export const npcCatalog = {
    'rail-attendant': {name: 'Rail attendant', width: 32, height: 64,
        image: './assets/npcs/rail-attendant-v1.png', frames: 4, size: 88},
} as const satisfies Record<NPCKind, {name: string; width: number; height: number; image: string; frames: number; size: number}>;
