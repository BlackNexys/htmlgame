import type { EnemyKind } from './Enemy';
import type { NPCKind } from './NPC';
export interface GameAssets {
    hero: HTMLImageElement;
    heroAim: HTMLImageElement;
    flicker?: HTMLImageElement;
    wall: HTMLImageElement;
    enemies: Record<EnemyKind, HTMLImageElement>;
    npcs?: Partial<Record<NPCKind, HTMLImageElement>>;
}
