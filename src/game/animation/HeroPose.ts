import type { Character } from '../../components/Character';
import { heroPoseAtlas } from './HeroPoseAtlas';

/** Reviewed palm centres in the held-pose cells. Shared by visuals and simulation. */
export const palmSockets = [heroPoseAtlas[6],heroPoseAtlas[7],heroPoseAtlas[8]] as const;

export function heroAimPose(player: Character) {
    const stance = player.motion === 'sprinting' ? 2
        : player.motion === 'running' || !player.grounded ? 1 : 0;
    const column = player.aim.y < 0 ? player.aim.x ? 2 : 1 : player.aim.y > 0 ? player.aim.x ? 3 : 4 : 0;
    const facing = player.aim.x || player.facing;
    const row = player.crouched ? 1 : 6 + stance;
    const [x,y] = player.crouched ? heroPoseAtlas[1][column] : palmSockets[stance][column];
    return {row, column, facing, offsetY:0,
        palm: {x: (x - 128) * 98 / 256 * facing, y: (y - 240) * 98 / 256}};
}

export function heroMuzzle(player: Character) {
    const pose = heroAimPose(player);
    return {x: player.x + player.width / 2 + pose.palm.x, y: player.y2 + pose.palm.y};
}
