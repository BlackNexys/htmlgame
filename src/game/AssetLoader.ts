import type { GameAssets } from '../interfaces/Assets';
import type { EnemyKind } from '../interfaces/Enemy';
import { enemyTuning } from './config';
import { characterAtlas } from './animation/CharacterAtlas';
import { characterAimAtlas } from './animation/CharacterAimAtlas';
import { npcCatalog } from './NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';

export class AssetLoader {
    async load(): Promise<GameAssets> {
        const [wall, hero, heroAim, flicker] = await Promise.all([this.image('./assets/wall.png'), this.image(`./assets/${characterAtlas.image}`), this.image(`./assets/${characterAimAtlas.image}`),
            this.image('./assets/weapons/flicker/flicker-v1.png').then(image => {
                if (image.naturalWidth !== 192 || image.naturalHeight !== 416) return undefined;
                return image;
            }).catch(() => undefined)]);
        if (hero.naturalWidth !== characterAtlas.width || hero.naturalHeight !== characterAtlas.height) throw new Error('Unexpected character atlas dimensions');
        if (heroAim.naturalWidth !== characterAimAtlas.width || heroAim.naturalHeight !== characterAimAtlas.height) throw new Error('Unexpected character aiming atlas dimensions');
        const kinds = Object.keys(enemyTuning) as EnemyKind[];
        const sheets = await Promise.all(kinds.map(kind => this.image(`./assets/enemies/${kind}-v1.png`)));
        const enemies = {} as Record<EnemyKind, HTMLImageElement>;
        sheets.forEach((sheet, index) => {
            if (sheet.naturalWidth !== 1254 || sheet.naturalHeight !== 1254) throw new Error(`Unexpected ${kinds[index]} atlas dimensions`);
            enemies[kinds[index]] = sheet;
        });
        const npcs: NonNullable<GameAssets['npcs']> = {};
        await Promise.all((Object.keys(npcCatalog) as NPCKind[]).map(async kind => {
            const image = await this.image(npcCatalog[kind].image).catch(() => undefined);
            if (image && image.naturalWidth / image.naturalHeight > 2.8 && image.naturalWidth / image.naturalHeight < 4.2) npcs[kind] = image;
        }));
        return {wall, hero, heroAim, flicker, enemies, npcs};
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
