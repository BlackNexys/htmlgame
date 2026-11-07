import type { Level } from '../interfaces/Level';
import type { Rect } from '../interfaces/Geometry';
import type { TerrainDefinition } from './LevelDocument';
import { parseLevelDocument } from './LevelValidation';
import { enemyTuning } from '../game/config';
import { npcCatalog } from '../game/NPCCatalog';

function tiles(rectangles: TerrainDefinition[], size: number): Rect[] {
    return rectangles.flatMap(rect => {
        const output: Rect[] = [];
        for (let y = rect.y; y < rect.y + rect.height; y += size) {
            for (let x = rect.x; x < rect.x + rect.width; x += size) output.push({x, y, width: size, height: size});
        }
        return output;
    });
}

export function compileLevel(input: unknown): Level {
    const document = parseLevelDocument(input);
    return {
        width: document.width, height: document.height,
        solids: tiles(document.terrain, document.tileSize), decorations: tiles(document.decorations, document.tileSize),
        spawn: {x: document.spawn.x - 16, y: document.spawn.y - 52}, exit: {...document.exit},
        enemies: document.enemies.map(enemy => ({
            kind: enemy.kind, x: enemy.x - enemyTuning[enemy.kind].width / 2, y: enemy.y - 48,
            left: enemy.patrol.left - enemyTuning[enemy.kind].width / 2, right: enemy.patrol.right - enemyTuning[enemy.kind].width / 2,
        })),
        signs: document.signs.map(sign => ({x: sign.x, y: sign.y, title: sign.title, text: sign.text})),
        npcs: document.npcs.map(npc => ({...npc, x: npc.x - npcCatalog[npc.kind].width / 2, y: npc.y - npcCatalog[npc.kind].height})),
    };
}
