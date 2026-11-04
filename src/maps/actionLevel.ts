import { tuning } from '../game/config';
import { Rect } from '../game/physics';
import type { EnemyKind } from '../game/Enemy';

export interface EnemySpawn { x: number; y: number; left: number; right: number; kind?: EnemyKind; }
export interface Level { width: number; height: number; solids: Rect[]; spawn: {x: number; y: number}; enemies: EnemySpawn[]; exit: Rect; }

export function createActionLevel(): Level {
    const t = tuning.tile;
    const solids: Rect[] = [];
    const row = (x: number, y: number, length: number) => {
        for (let i = 0; i < length; i++) solids.push({x: (x + i) * t, y: y * t, width: t, height: t});
    };
    row(0, 12, 112); row(0, 13, 112);
    // Low obstacles on the main route and optional elevated platforms.
    row(14, 11, 2); row(30, 11, 2); row(47, 11, 2); row(63, 11, 2);
    row(19, 9, 4); row(36, 9, 4); row(53, 9, 4); row(69, 9, 4);
    row(88, 11, 2); row(95, 9, 4);
    const roster: {column: number; kind: EnemyKind}[] = [
        {column: 10, kind: 'zombie'}, {column: 24, kind: 'skeleton'},
        {column: 38, kind: 'ghoul'}, {column: 52, kind: 'ghost'},
        {column: 66, kind: 'wight'}, {column: 76, kind: 'zombie'},
        {column: 79, kind: 'wight'}, {column: 83, kind: 'necromancer'},
    ];
    return {
        width: 112 * t, height: 14 * t, solids,
        spawn: {x: 3 * t, y: 12 * t - 52},
        enemies: roster.map(({column, kind}) => ({
            kind, x: column * t, y: kind === 'ghost' ? 470 : 12 * t - 48,
            left: (column - 3) * t, right: (column + 3) * t,
        })),
        exit: {x: 108 * t, y: 12 * t - 108, width: 64, height: 108},
    };
}
