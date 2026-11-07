import type { NPC } from '../../components/NPC';
import type { Character } from '../../components/Character';
import type { CollisionSystem } from './CollisionSystem';
import { Interactable } from '../../components/Interactable';
export type InteractionTarget = NPC | Interactable;

/** Picks one reachable actor; never launches UI or decides scene progression. */
export class InteractionSystem {
    constructor(private readonly collisions: Pick<CollisionSystem, 'canSee'>) {}
    nearest<T extends InteractionTarget>(player: Pick<Character, 'x' | 'y' | 'width' | 'height' | 'grounded' | 'health'>, targets: readonly T[]): T | undefined {
        if (player.health <= 0) return undefined;
        const center = player.x + player.width / 2, feet = player.y + player.height;
        const ranked=targets.flatMap(target=>{
            if(target instanceof Interactable){
                if(!target.active)return [];
                const px=player.x+player.width/2,py=player.y+player.height/2;
                const x=Math.max(target.x,Math.min(px,target.x2)),y=Math.max(target.y,Math.min(py,target.y2));
                const distance=Math.hypot(px-x,py-y);
                const point={x:x+Math.sign(px-x),y:y+Math.sign(py-y),width:.1,height:.1};
                return distance<=target.definition.reach && this.collisions.canSee(player,point,target.blocker)?[{target,distance}]:[];
            }
            if(!player.grounded)return [];
            const distance=Math.abs(target.x+target.width/2-center);
            return distance<=88 && Math.abs(target.y2-feet)<=32 && this.collisions.canSee(player,target)?[{target,distance}]:[];
        });
        return ranked.sort((a,b)=>a.distance-b.distance || a.target.id.localeCompare(b.target.id))[0]?.target;
    }
}
