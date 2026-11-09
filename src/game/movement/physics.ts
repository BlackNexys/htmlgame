import type { Rect, Body } from '../../interfaces/Geometry';
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Earliest normalized impact time for a moving rectangle, also used for aimed
// enemy bolts. Returning the nearest impact prevents shots passing through stone.
export interface SweptImpact { time: number; normalX: number; normalY: number; }
export function sweptImpact(a: Rect, dx: number, dy: number, b: Rect): SweptImpact | undefined {
    if (overlaps(a, b)) return {time: 0, normalX: 0, normalY: 0};
    const axis = (min: number, max: number, delta: number, low: number, high: number): [number, number] => {
        if (delta === 0) return max > low && min < high ? [-Infinity, Infinity] : [Infinity, -Infinity];
        const first = (low - max) / delta, last = (high - min) / delta;
        return delta > 0 ? [first, last] : [last, first];
    };
    const x = axis(a.x, a.x + a.width, dx, b.x, b.x + b.width);
    const y = axis(a.y, a.y + a.height, dy, b.y, b.y + b.height);
    const entry = Math.max(x[0], y[0]), exit = Math.min(x[1], y[1]);
    if (entry < 0 || entry > 1 || entry > exit || !Number.isFinite(entry)) return undefined;
    return {time: entry, normalX: x[0] >= y[0] ? -Math.sign(dx) : 0, normalY: y[0] >= x[0] ? -Math.sign(dy) : 0};
}
export function impactTime(a: Rect, dx: number, dy: number, b: Rect) { return sweptImpact(a, dx, dy, b)?.time; }

export interface BodyContacts { ground: boolean; ceiling: boolean; left: boolean; right: boolean; }
export function bodyContacts(body: Rect, solids: Rect[]): BodyContacts {
    const result = {ground: false, ceiling: false, left: false, right: false};
    const epsilon = .001;
    for (const wall of solids) {
        const horizontal = body.x < wall.x + wall.width - epsilon && body.x + body.width > wall.x + epsilon;
        const vertical = body.y < wall.y + wall.height - epsilon && body.y + body.height > wall.y + epsilon;
        if (horizontal && Math.abs(body.y + body.height - wall.y) <= epsilon) result.ground = true;
        if (horizontal && Math.abs(body.y - wall.y - wall.height) <= epsilon) result.ceiling = true;
        if (vertical && Math.abs(body.x - wall.x - wall.width) <= epsilon) result.left = true;
        if (vertical && Math.abs(body.x + body.width - wall.x) <= epsilon) result.right = true;
    }
    return result;
}

/** Continuous player motion, including diagonal corner impacts and sliding. */
export function sweepBody(body: Body, solids: Rect[], dt: number) {
    let remaining = dt;
    let blockedX = false, blockedY = false;
    for (let iteration = 0; iteration < 3 && remaining > 1e-9; iteration++) {
        const dx = body.vx * remaining, dy = body.vy * remaining;
        if (!dx && !dy) break;
        let closest: SweptImpact | undefined;
        let touching: BodyContacts | undefined;
        for (const wall of solids) {
            const hit = sweptImpact(body, dx, dy, wall);
            if (!hit || (hit.normalX === 0 && hit.normalY === 0)) continue;
            // Floating-point travel can stop a fraction before a seam. Its tiny
            // positive X impact must not become a wall while sliding on the floor.
            if(hit.time<=1e-9 && hit.normalX){
                touching ??= bodyContacts(body,solids);
                if(touching.ground && dy>=0 && Math.abs(body.y+body.height-wall.y)<1e-7){
                    hit.normalX=0;hit.normalY=-1;hit.time=0;
                }else if(touching.ceiling && dy<=0 && Math.abs(body.y-wall.y-wall.height)<1e-7){
                    hit.normalX=0;hit.normalY=1;hit.time=0;
                }
            }
            // A zero-time corner at a tile seam must slide along an existing
            // supporting face. An actual floor/wall corner still blocks both axes.
            if (hit.time === 0 && hit.normalX && hit.normalY) {
                touching ??= bodyContacts(body, solids);
                const supportedX = hit.normalX < 0 ? touching.right : touching.left;
                const supportedY = hit.normalY < 0 ? touching.ground : touching.ceiling;
                if (supportedY && !supportedX) hit.normalX = 0;
                if (supportedX && !supportedY) hit.normalY = 0;
            }
            if (!closest || hit.time < closest.time - 1e-9) closest = {...hit};
            else if (Math.abs(hit.time - closest.time) <= 1e-9) {
                closest.normalX ||= hit.normalX; closest.normalY ||= hit.normalY;
            }
        }
        if (!closest) { body.x += dx; body.y += dy; break; }
        body.x += dx * closest.time; body.y += dy * closest.time;
        if (closest.normalX) { body.vx = 0; blockedX = true; }
        if (closest.normalY) { body.vy = 0; blockedY = true; }
        remaining *= 1 - closest.time;
    }
    const contacts = bodyContacts(body, solids);
    body.grounded = contacts.ground && body.vy >= 0;
    return {...contacts, blockedX, blockedY};
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
