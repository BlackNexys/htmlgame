export interface Rect { x: number; y: number; width: number; height: number; }
export interface Body extends Rect { vx: number; vy: number; grounded: boolean; }
