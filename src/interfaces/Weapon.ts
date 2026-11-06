import type { Character } from '../components/Character';
import type { World } from '../game/World';

export interface WeaponDefinition {
    readonly id: string;
    readonly name: string;
    readonly ectoplasmCost: number;
    readonly fireInterval: number;
    readonly projectile: {readonly speed: number; readonly lifetime: number; readonly damage: number; readonly width: number; readonly height: number};
    readonly visuals: string;
    readonly audio: string;
    readonly modifier: string | null;
}
export interface Weapon {
    readonly definition: WeaponDefinition;
    fire(world: World, player: Character): void;
}
export type FlickerEffectKind = 'ignition' | 'enemy' | 'terrain' | 'blocked';
export interface FlickerEvent { kind: FlickerEffectKind; x: number; y: number; angle: number; }
export interface FlickerEffect extends FlickerEvent { age: number; }
