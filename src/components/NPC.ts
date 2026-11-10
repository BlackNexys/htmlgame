import { Actor } from './Actor';
import type { NPCSpawn } from '../interfaces/NPC';
import type { Rect } from '../interfaces/Geometry';
import { npcCatalog } from '../game/NPCCatalog';
import type {CollisionQueries} from '../world/collision/CollisionQueries';

/** Neutral actors have no enemy lifecycle, combat targets, corpse or defeat rewards. */
export abstract class NPC extends Actor {
    readonly id: string;
    readonly kind: NPCSpawn['kind'];
    readonly scene: string;
    readonly displayName: string;
    facing = 1;
    elapsed = 0;
    conversations = 0;
    constructor(spawn: NPCSpawn) {
        const info = npcCatalog[spawn.kind];
        super({width: info.width, height: info.height});
        this.id = spawn.id; this.kind = spawn.kind; this.scene = spawn.scene; this.displayName = info.name;
        this.spawn(spawn);
    }
    update(dt: number, player: Rect, collision:CollisionQueries) {
        this.elapsed += dt;
        this.applyGravity(dt); this.move(dt, collision);
        this.updateBehavior(player);
    }
    completeConversation() { this.conversations++; }
    protected abstract updateBehavior(player: Rect): void;
}
