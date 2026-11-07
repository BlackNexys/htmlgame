import type { NPC } from '../../components/NPC';
import type { Character } from '../../components/Character';
import type { CollisionSystem } from './CollisionSystem';

/** Picks one reachable actor; never launches UI or decides scene progression. */
export class InteractionSystem {
    constructor(private readonly collisions: Pick<CollisionSystem, 'canSee'>) {}
    nearest(player: Pick<Character, 'x' | 'y' | 'width' | 'height' | 'grounded' | 'health'>, npcs: readonly NPC[]): NPC | undefined {
        if (!player.grounded || player.health <= 0) return undefined;
        const center = player.x + player.width / 2, feet = player.y + player.height;
        return npcs.filter(npc => Math.abs(npc.x + npc.width / 2 - center) <= 88 &&
            Math.abs(npc.y2 - feet) <= 32 && this.collisions.canSee(player, npc))
            .sort((a, b) => Math.abs(a.x + a.width / 2 - center) - Math.abs(b.x + b.width / 2 - center) || a.id.localeCompare(b.id))[0];
    }
}
