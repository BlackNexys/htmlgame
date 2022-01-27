export interface ICoords {
    TL?: Coord;
    TR?: Coord;
    BL?: Coord;
    BR?: Coord;
}

export class ICoord {
    x: number; 
    y: number;
}

export class Coord {
    x: number; y: number;

    constructor({x, y}: ICoord) {
        this.x = x;
        this.y = y;
    }
}

export class Coords {
    TL?: Coord;
    TR?: Coord;
    BL?: Coord;
    BR?: Coord;

    constructor({TL, TR, BL, BR}: ICoords) {
        this.TL = TL;
        this.TR = TR;
        this.BL = BL;
        this.BR = BR;
    }
}

export class Collisions {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    collisions?: Coords[];

    constructor({top, bottom, left, right, collisions}: {top: boolean, bottom: boolean, left: boolean, right: boolean, collisions?: Coords[]}) {
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
        this.collisions = collisions;
    }
}