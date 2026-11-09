import type { Weapon, WeaponDefinition } from '../interfaces/Weapon';
import type { Character } from '../components/Character';
import type { WeaponContext } from '../interfaces/Simulation';
import { FlickerProjectile } from '../components/FlickerProjectile';
import { heroMuzzle } from '../game/animation/HeroPose';

/** Playtest values from the Flicker v1.1 spec. Modifiers remain unequipped. */
export const flicker = {
    id: 'flicker', name: 'Flicker', ectoplasmCost: 0, fireInterval: .20,
    projectile: {speed: 800, lifetime: .9, damage: 1, width: 16, height: 9},
    visuals: 'flicker-v1', audio: 'spectral-ignition', modifier: null,
} as const satisfies WeaponDefinition;

export class Flicker implements Weapon {
    readonly definition = flicker;
    fire(world: WeaponContext, player: Character) {
        const {projectile: p} = flicker;
        const magnitude = Math.hypot(player.aim.x, player.aim.y);
        const dx = player.aim.x / magnitude, dy = player.aim.y / magnitude;
        // A stable collision box encloses the rotated core, independent of flame flicker.
        const width = Math.abs(dx) * p.width + Math.abs(dy) * p.height;
        const height = Math.abs(dx) * p.height + Math.abs(dy) * p.width;
        const origin = {x: player.x + player.width / 2, y: player.y + 13.5};
        const shot = new FlickerProjectile({x: origin.x - width / 2, y: origin.y - height / 2,
            width, height, vx: dx * p.speed, vy: dy * p.speed});
        world.events.push('fire');
        const palm = heroMuzzle(player);
        // Sweep from inside the body to the actual hand, including upward/sideways offsets.
        // No ignition is drawn through a wall and no flight time is consumed by this sweep.
        if (shot.manifestAt(world, palm.x, palm.y)) {
            world.weaponEvents.push({kind: 'ignition', ...palm, angle: Math.atan2(dy, dx)});
            world.projectiles.push(shot);
        }
    }
}
