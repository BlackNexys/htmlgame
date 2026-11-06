import type { EnemyKind } from './Enemy';
export interface GameAssets {
    hero: HTMLImageElement;
    heroAim: HTMLImageElement;
    wall: HTMLImageElement;
    enemies: Record<EnemyKind, HTMLImageElement>;
}
