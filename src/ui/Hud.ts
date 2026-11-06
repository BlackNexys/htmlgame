import type { World } from '../game/World';
import { tuning } from '../game/config';

export class Hud {
    private readonly health = document.querySelector<HTMLElement>('#health')!;
    private readonly count = document.querySelector<HTMLElement>('#count')!;
    private readonly ectoplasm = document.querySelector<HTMLElement>('#ectoplasm')!;
    private readonly progress = document.querySelector<HTMLElement>('#progress')!;
    private readonly encounter = document.querySelector<HTMLElement>('#encounter')!;

    update(world: World) {
        this.health.textContent = `${world.player.health} / ${tuning.playerHealth}`;
        this.count.textContent = `${world.defeated} / ${world.level.enemies.length}`;
        this.ectoplasm.textContent = `${world.ectoplasm.amount} / ${world.ectoplasm.capacity}`;
        this.progress.style.width = `${Math.min(100, world.player.x / world.level.exit.x * 100)}%`;
        const channeling = world.enemies.find(enemy => enemy.isChanneling && Math.abs(enemy.x - world.player.x) < 720);
        const nearest = channeling || [...world.enemies].sort((a, b) => Math.abs(a.x - world.player.x) - Math.abs(b.x - world.player.x))[0];
        const hint = nearest && (channeling || Math.abs(nearest.x - world.player.x) < 620)
            ? `${nearest.displayName}: ${nearest.hint}` : 'Keep heading east. Flicker is always free; cyan bolts belong to the locals.';
        if (this.encounter.textContent !== hint) this.encounter.textContent = hint;
    }
}
