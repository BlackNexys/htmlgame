import type { World } from '../game/World';
import { tuning } from '../game/config';
import { Interactable } from '../components/Interactable';

/** A world-anchored DOM prompt, readable by assistive technology as well as visually. */
export class InteractionPrompt {
    private readonly element = document.querySelector<HTMLElement>('#interaction')!;
    update(world: World, override?:string) {
        const target = world.state === 'playing' ? world.interactions.nearest(world.player, world.interactionTargets) : undefined;
        this.element.hidden = !target;
        if (!target) return;
        const verb=target instanceof Interactable?target.interactionVerb:target.conversations?'Talk again to':'Talk to';
        const text = override ?? `F · ${verb} ${target.displayName}`;
        if (this.element.textContent !== text) this.element.textContent = text;
        this.element.style.left = `${(target.x + target.width / 2 - world.camera.x) / tuning.viewportWidth * 100}%`;
        const anchor=target instanceof Interactable && target.height>120?Math.max(target.y,Math.min(world.player.y,target.y2-64)):target.y;
        this.element.style.top = `${(anchor - 26 - world.camera.y) / tuning.viewportHeight * 100}%`;
    }
}
