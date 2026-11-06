import type { Weapon } from '../interfaces/Weapon';
import type { Character } from '../components/Character';
import type { World } from '../game/World';
import { Flicker } from './Flicker';

/** One concrete starting weapon; each owned weapon retains its own cadence. */
export class WeaponController {
    readonly selected: Weapon = new Flicker();
    private cooldown = 0;

    update(dt: number, firing: boolean, world: World, player: Character) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (!firing || this.cooldown > 1e-9) return;
        const weapon = this.selected;
        // Zero-cost weapons never depend on reserve, assets, or audio readiness.
        if (weapon.definition.ectoplasmCost > 0 && !world.ectoplasm.spend(weapon.definition.ectoplasmCost)) return;
        weapon.fire(world, player);
        this.cooldown = weapon.definition.fireInterval;
    }
}
