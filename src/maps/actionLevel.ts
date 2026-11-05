import { tuning } from '../game/config';
import type { Rect } from '../interfaces/Geometry';
import type { EnemyKind } from '../interfaces/Enemy';
import type { Level } from '../interfaces/Level';

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
        signs: [
            {x: 150, y: 470, title: 'THE LOWER PASSAGE', text: 'KEEP GOING EAST'},
            {x: 850, y: 336, title: 'WATCH THE EMITTER', text: 'JUMP THE FIRING LANE'},
            {x: 1620, y: 430, title: 'KEEP YOUR FEET MOVING', text: 'THE GHOUL COMMITS TO ITS LEAP'},
            {x: 2450, y: 330, title: 'A FAULT IN THE SIGNAL', text: 'STRIKE WHEN IT BECOMES SOLID'},
            {x: 3040, y: 350, title: 'OBSOLETE SECURITY', text: 'THE SHIELD OPENS BEFORE A BASH'},
            {x: 3720, y: 350, title: 'UNFINISHED BUSINESS', text: 'BREAK THE REACTIVATION LINK'},
        ],
    };
}
