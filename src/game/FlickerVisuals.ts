import type { FlickerEffectKind } from '../interfaces/Weapon';

export const flickerVisuals = {
    cell: 32, columns: 6, flightFrameTime: .05,
    effects: {
        ignition: {row: 8, frameTime: .018, duration: .108},
        enemy: {row: 9, frameTime: .028, duration: .168},
        terrain: {row: 10, frameTime: .02, duration: .12},
        blocked: {row: 11, frameTime: .022, duration: .132},
    } satisfies Record<FlickerEffectKind, {row: number; frameTime: number; duration: number}>,
} as const;

/** Matches the packed clockwise rows: right, down-right, down, ... up-right. */
export function flickerDirection(vx: number, vy: number) {
    return (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8;
}
