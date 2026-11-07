import { NPC } from './NPC';
import type { NPCSpawn } from '../interfaces/NPC';
import type { Rect } from '../interfaces/Geometry';

export class RailAttendant extends NPC {
    constructor(spawn: NPCSpawn) { super(spawn); }
    protected updateBehavior(player: Rect) {
        const dx = player.x + player.width / 2 - this.x - this.width / 2;
        if (Math.abs(dx) < 200 && Math.abs(player.y + player.height - this.y2) < 96) this.facing = Math.sign(dx) || this.facing;
    }
}
