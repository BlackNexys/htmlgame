export interface Controls { left: boolean; right: boolean; jump: boolean; fire: boolean; }
export type PlayState = 'playing' | 'dead' | 'won';
export type GameMode = 'loading' | 'ready' | PlayState | 'paused' | 'error';
export type GameEvent = 'fire' | 'hit' | 'hurt' | 'defeat' | 'jump' | 'win' | 'enemyFire' | 'charge' | 'block' | 'revive';
