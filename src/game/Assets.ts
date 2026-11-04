import type { EnemyKind } from './Enemy';
import { enemyTuning } from './config';
export interface Assets { hero: HTMLImageElement; wall: HTMLImageElement; enemies: Record<EnemyKind, HTMLImageElement>; }
export async function loadAssets(): Promise<Assets> {
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const timer = window.setTimeout(() => reject(new Error(`Loading timed out: ${src}`)), 15000);
        img.onload = () => { clearTimeout(timer); resolve(img); };
        img.onerror = () => { clearTimeout(timer); reject(new Error(`Could not load ${src}`)); };
        img.src = src;
    });
    const [wall, hero] = await Promise.all([load('./assets/wall.png'),
        load('./assets/character-animations-v1.png')]);
    if (hero.naturalWidth !== 1254 || hero.naturalHeight !== 1254) throw new Error('Unexpected character atlas dimensions');
    const kinds = Object.keys(enemyTuning) as EnemyKind[];
    const sheets = await Promise.all(kinds.map(kind => load(`./assets/enemies/${kind}-v1.png`)));
    const enemies = {} as Record<EnemyKind, HTMLImageElement>;
    sheets.forEach((sheet, index) => {
        if (sheet.naturalWidth !== 1254 || sheet.naturalHeight !== 1254) throw new Error(`Unexpected ${kinds[index]} atlas dimensions`);
        enemies[kinds[index]] = sheet;
    });
    return {wall, hero, enemies};
}
