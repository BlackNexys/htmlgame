import type { Rect } from './Geometry';
export interface ProjectileProps {
    x: number; y: number; vx: number; vy?: number;
    width?: number; height?: number; life?: number;
}
export interface CollisionTarget { bounds: Rect; hit: () => 'damaged' | 'blocked' | 'ignored' | void; }
export interface Impact { time: number; target?: CollisionTarget; }
