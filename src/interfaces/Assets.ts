import type { EnemyKind } from './Enemy';
import type { NPCKind } from './NPC';
import type { EnvironmentImages } from './Environment';
export interface GameAssets {
    hero: HTMLImageElement;
    heroAim: HTMLImageElement;
    bootFire?: HTMLImageElement;
    flicker?: HTMLImageElement;
    wall: HTMLImageElement;
    enemies: Record<EnemyKind, HTMLImageElement>;
    npcs?: Partial<Record<NPCKind, HTMLImageElement>>;
    environment?: EnvironmentImages;
}
