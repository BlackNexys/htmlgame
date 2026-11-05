import type { EnemyKind } from './Enemy';
export interface GameAssets {
    hero: HTMLImageElement;
    wall: HTMLImageElement;
    enemies: Record<EnemyKind, HTMLImageElement>;
}
