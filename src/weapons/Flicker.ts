import type { Weapon, WeaponDefinition } from '../interfaces/Weapon';
import type { Character } from '../components/Character';
import type { World } from '../game/World';
import { FlickerProjectile } from '../components/FlickerProjectile';

/** Playtest values from the Flicker v1.1 spec. Modifiers remain unequipped. */
export const flicker = {
    id: 'flicker', name: 'Flicker', ectoplasmCost: 0, fireInterval: .20,
    projectile: {speed: 800, lifetime: .9, damage: 1, width: 16, height: 9},
    visuals: 'flicker-v1', audio: 'spectral-ignition', modifier: null,
} as const satisfies WeaponDefinition;

export class Flicker implements Weapon {
    readonly definition = flicker;
    fire(world: World, player: Character) {
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
        world.weaponEvents.push({kind: 'ignition', x: origin.x + dx * 20, y: origin.y + dy * 20, angle: Math.atan2(dy, dx)});
        // Sweep the manifestation path; no life/time is consumed before flight.
        if (shot.manifest(world, 24)) world.projectiles.push(shot);
    }
}
