import type { GameAssets } from '../interfaces/Assets';
import type { EnemyKind } from '../interfaces/Enemy';
import { enemyTuning } from './config';

export class AssetLoader {
    async load(): Promise<GameAssets> {
        const [wall, hero] = await Promise.all([this.image('./assets/wall.png'), this.image('./assets/character-animations-v1.png')]);
        if (hero.naturalWidth !== 1254 || hero.naturalHeight !== 1254) throw new Error('Unexpected character atlas dimensions');
        const kinds = Object.keys(enemyTuning) as EnemyKind[];
        const sheets = await Promise.all(kinds.map(kind => this.image(`./assets/enemies/${kind}-v1.png`)));
        const enemies = {} as Record<EnemyKind, HTMLImageElement>;
        sheets.forEach((sheet, index) => {
            if (sheet.naturalWidth !== 1254 || sheet.naturalHeight !== 1254) throw new Error(`Unexpected ${kinds[index]} atlas dimensions`);
            enemies[kinds[index]] = sheet;
        });
        return {wall, hero, enemies};
    }

    private image(src: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            const timer = window.setTimeout(() => reject(new Error(`Loading timed out: ${src}`)), 15000);
            image.onload = () => { clearTimeout(timer); resolve(image); };
            image.onerror = () => { clearTimeout(timer); reject(new Error(`Could not load ${src}`)); };
            image.src = src;
        });
    }
}
