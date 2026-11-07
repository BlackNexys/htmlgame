import type { World } from '../game/World';
import { tuning } from '../game/config';

/** A world-anchored DOM prompt, readable by assistive technology as well as visually. */
export class InteractionPrompt {
    private readonly element = document.querySelector<HTMLElement>('#interaction')!;
    update(world: World) {
        const target = world.state === 'playing' ? world.interactions.nearest(world.player, world.npcs) : undefined;
        this.element.hidden = !target;
        if (!target) return;
        const text = `F · ${target.conversations ? 'Talk again to' : 'Talk to'} ${target.displayName}`;
        if (this.element.textContent !== text) this.element.textContent = text;
        this.element.style.left = `${(target.x + target.width / 2 - world.camera.x) / tuning.viewportWidth * 100}%`;
        this.element.style.top = `${(target.y - 26 - world.camera.y) / tuning.viewportHeight * 100}%`;
    }
}
