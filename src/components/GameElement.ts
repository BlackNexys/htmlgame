import type { Rect } from '../interfaces/Geometry';

export class GameElement implements Rect {
    x = 0;
    y = 0;
    width: number;
    height: number;

    constructor({width = 64, height = 64}: {width?: number; height?: number} = {}) {
        this.width = width;
        this.height = height;
    }

    get x2() { return this.x + this.width; }
    get y2() { return this.y + this.height; }

    spawn({x, y}: {x: number; y: number}) {
        this.x = x;
        this.y = y;
    }
}
