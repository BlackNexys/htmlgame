export type EnemyKind = 'zombie' | 'skeleton' | 'ghoul' | 'ghost' | 'wight' | 'necromancer';
export type EnemyState = 'idle' | 'windup' | 'attack' | 'recover' | 'phase';
export type EnemyHit = 'ignored' | 'blocked' | 'damaged';
export interface AimLine { x: number; y: number; endX: number; endY: number; }
