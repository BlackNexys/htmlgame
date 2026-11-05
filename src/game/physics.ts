import type { Rect, Body } from '../interfaces/Geometry';
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Earliest normalized impact time for a moving rectangle, also used for aimed
// enemy bolts. Returning the nearest impact prevents shots passing through stone.
export function impactTime(a: Rect, dx: number, dy: number, b: Rect): number | undefined {
    if (overlaps(a, b)) return 0;
    const axis = (min: number, max: number, delta: number, low: number, high: number): [number, number] => {
        if (delta === 0) return max > low && min < high ? [-Infinity, Infinity] : [Infinity, -Infinity];
        const first = (low - max) / delta, last = (high - min) / delta;
        return delta > 0 ? [first, last] : [last, first];
    };
    const x = axis(a.x, a.x + a.width, dx, b.x, b.x + b.width);
    const y = axis(a.y, a.y + a.height, dy, b.y, b.y + b.height);
    const entry = Math.max(x[0], y[0]), exit = Math.min(x[1], y[1]);
    return entry >= 0 && entry <= 1 && entry <= exit ? entry : undefined;
}

// Resolve crossings against the whole axis travel, including fast movement.
export function moveBody(body: Body, solids: Rect[], dt: number) {
    const oldX = body.x;
    let x = oldX + body.vx * dt;
    for (const wall of solids) {
        if (body.y >= wall.y + wall.height || body.y + body.height <= wall.y) continue;
        if (body.vx > 0 && oldX + body.width <= wall.x && x + body.width >= wall.x) x = Math.min(x, wall.x - body.width);
        if (body.vx < 0 && oldX >= wall.x + wall.width && x <= wall.x + wall.width) x = Math.max(x, wall.x + wall.width);
    }
    if (x !== oldX + body.vx * dt) body.vx = 0;
    body.x = x;
    const oldY = body.y;
    let y = oldY + body.vy * dt;
    body.grounded = false;
    for (const wall of solids) {
        if (body.x >= wall.x + wall.width || body.x + body.width <= wall.x) continue;
        if (body.vy >= 0 && oldY + body.height <= wall.y && y + body.height >= wall.y) {
            y = Math.min(y, wall.y - body.height);
            body.grounded = true;
        }
        if (body.vy < 0 && oldY >= wall.y + wall.height && y <= wall.y + wall.height) y = Math.max(y, wall.y + wall.height);
    }
    if (body.grounded || y !== oldY + body.vy * dt) body.vy = 0;
    body.y = y;
}
