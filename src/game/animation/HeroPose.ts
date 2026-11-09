import type { Character } from '../../components/Character';

/** Reviewed palm centres in the held-pose cells. Shared by visuals and simulation. */
export const palmSockets = [
    [[188,135],[159,83],[176,99],[176,163],[163,186]],
    [[195,141],[166,80],[188,101],[186,173],[169,190]],
    [[204,139],[179,82],[201,111],[195,174],[175,194]],
] as const;

export function heroAimPose(player: Character) {
    const stance = player.crouched ? 1 : player.motion === 'sprinting' ? 2
        : player.motion === 'running' || !player.grounded ? 1 : 0;
    const column = player.aim.y < 0 ? player.aim.x ? 2 : 1 : player.aim.y > 0 ? player.aim.x ? 3 : 4 : 0;
    const facing = player.aim.x || player.facing;
    const offsetY = player.crouched ? 12 : 0;
    const [x,y] = palmSockets[stance][column];
    return {row: 6 + stance, column, facing, offsetY,
        palm: {x: (x - 128) * 98 / 256 * facing, y: (y - 240) * 98 / 256 + offsetY}};
}

export function heroMuzzle(player: Character) {
    const pose = heroAimPose(player);
    return {x: player.x + player.width / 2 + pose.palm.x, y: player.y2 + pose.palm.y};
}
