import type { Controls } from '../../interfaces/Game';

export interface AimDirection { x: number; y: number; }

/** Opposing keys cancel on each axis; down is a grounded stance, an airborne aim. */
export function resolveAim(input: Controls, grounded: boolean, facing: number): AimDirection {
    const x = Number(input.right) - Number(input.left);
    const vertical = Number(!!input.down) - Number(!!input.up);
    const y = grounded ? Math.min(0, vertical) : vertical;
    return {x: x || (y ? 0 : facing), y};
}
