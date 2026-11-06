export type PlayerAction = 'left' | 'right' | 'up' | 'down' | 'jump' | 'sprint' | 'fire';
export interface Controls {
    left: boolean; right: boolean; jump: boolean; fire: boolean;
    up?: boolean; down?: boolean; sprint?: boolean;
    jumpHeld?: boolean; jumpReleased?: boolean;
    held?: readonly PlayerAction[]; pressed?: readonly PlayerAction[]; released?: readonly PlayerAction[];
}
export interface InputSnapshot extends Controls {
    up: boolean; down: boolean; sprint: boolean;
    jumpHeld: boolean; jumpReleased: boolean;
    held: readonly PlayerAction[]; pressed: readonly PlayerAction[]; released: readonly PlayerAction[];
}
export type PlayState = 'playing' | 'dead' | 'won';
export type GameMode = 'loading' | 'ready' | 'menu' | PlayState | 'paused' | 'error';
export type GameEvent = 'fire' | 'hit' | 'hurt' | 'defeat' | 'jump' | 'win' | 'enemyFire' | 'charge' | 'block' | 'revive';
