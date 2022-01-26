import { entry } from "../../webpack.config";
import { GameElement } from "./GameElement";
import { GameScreen } from "./GameScreen";

interface ICords {
    TL?: Cord;
    TR?: Cord;
    TC?: Cord;
    BL?: Cord;
    BR?: Cord;
    BC?: Cord;
    CL?: Cord;
    CR?: Cord;
}

class Cord {
    x: number; y: number;
    constructor({x, y}: {x: number, y: number}) {
        this.x = x;
        this.y = y;
    }
}

class Cords {
    TL?: Cord;
    TR?: Cord;
    TC?: Cord;
    BL?: Cord;
    BR?: Cord;
    BC?: Cord;
    CL?: Cord;
    CR?: Cord;

    constructor({TL, TR, TC, BL, BR, BC, CL, CR}: ICords) {
        this.TL = TL;
        this.TR = TR;
        this.TC = TC;
        this.BL = BL;
        this.BR = BR;
        this.BC = BC;
        this.CL = CL;
        this.CR = CR;
    }
}

class Collisions {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
}

export class Actor extends GameElement {
    movement: number = 8;
    isJumping: boolean = false;
    jumpTimeout: any;
    fallAccel: number = -1;
    fallSpeed: number = 0;
    cords: Cords = new Cords({
        TL: new Cord({x: this.x, y: this.y}),
        TR: new Cord({x: this.x2, y: this.y}),
        TC: new Cord({x: this.x2 - this.width / 2, y: this.y}),
        BL: new Cord({x: this.x, y: this.y2}),
        BR: new Cord({x: this.x2, y: this.y2}),
        BC: new Cord({x: this.x2 - this.width / 2, y: this.y2}),
        CL: new Cord({x: this.x, y: this.y2 - this.height / 2}),
        CR: new Cord({x: this.x2, y: this.y2 - this.height / 2}),
    });
    collisions: Collisions = new Collisions();

    jump () {
        if (!this.collisions.top) {
            this.fallSpeed = this.fallSpeed - 4;
            this.y = this.y - this.height*2;
        }
    }

    checkCollisions (gameEntities: GameElement[]) {
        const visualZone = [this.x - 128, this.x2 + 128, this.y - 128, this.y2 + 128];
        this.cords = new Cords({
            TL: new Cord({x: this.x, y: this.y}),
            TR: new Cord({x: this.x2, y: this.y}),
            TC: new Cord({x: this.x2 - this.width / 2, y: this.y}),
            BL: new Cord({x: this.x, y: this.y2}),
            BR: new Cord({x: this.x2, y: this.y2}),
            BC: new Cord({x: this.x2 - this.width / 2, y: this.y2}),
            CL: new Cord({x: this.x, y: this.y2 - this.height / 2}),
            CR: new Cord({x: this.x2, y: this.y2 - this.height / 2}),
        });
        const collisions = gameEntities.filter(entry => {
            return this != entry && entry.x > visualZone[0] && entry.x2 < visualZone[1] && entry.y > visualZone[2] && entry.y2 < visualZone[3];
        }).map((entry, index) => {
            return new Cords({
                TL: new Cord({x: entry.x, y: entry.y}),
                TR: new Cord({x: entry.x2, y: entry.y}),
                TC: new Cord({x: entry.x2 - entry.width / 2, y: entry.y}),
                BL: new Cord({x: entry.x, y: entry.y2}),
                BR: new Cord({x: entry.x2, y: entry.y2}),
                BC: new Cord({x: entry.x2 - entry.width / 2, y: entry.y2}),
                CL: new Cord({x: entry.x, y: entry.y2 - entry.height / 2}),
                CR: new Cord({x: entry.x2, y: entry.y2 - entry.height / 2}),
            });
        })        

        this.collisions.top = collisions.filter((cords: Cords) => {
            return cords.BL.x <= this.cords.TC.x && cords.BR.x >= this.cords.TC.x && this.cords.TC.y == cords.BC.y;
        }).length > 0;

        this.collisions.bottom = collisions.filter((cords: Cords) => {
            return cords.TL.x <= this.cords.BC.x && cords.TR.x >= this.cords.BC.x && this.cords.BC.y == cords.TC.y;
        }).length > 0;

        this.collisions.left = collisions.filter((cords: Cords) => {
            // Todo
            return false;
        }).length > 0;

        this.collisions.right = collisions.filter((cords: Cords) => {
            // Todo
            return cords.BL.x > this.cords.TC.x && cords.BR.x < this.cords.TC.x && this.cords.TC.y == cords.BC.y;
        }).length > 0;

        this.gravityHandler(collisions);
    }

    gravityHandler (collisions: Cords[]): void {
        if (!this.collisions.bottom) {
            this.fallSpeed = this.fallSpeed + 1;
            const projectedY = this.y - Math.max(this.fallAccel * this.fallSpeed^2, -16);

            const potentialCol = collisions.filter((cords: Cords) => {
                return cords.TL.x <= this.cords.BC.x && cords.TR.x >= this.cords.BC.x && cords.TC.y >= projectedY + this.height;
            });

            this.y = potentialCol.length > 0 ? potentialCol[0].TC.y - this.height : projectedY;
        } else {
            this.fallSpeed = 0;
        };
    }

    moveX (moveForward: boolean) {
        if (moveForward && !this.collisions.right) {
            this.x = this.x - this.movement;
            return;
        }
        if (!moveForward && !this.collisions.left) {
            this.x = this.x + this.movement;
            return;
        }
    }

    async render() {
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;

        this.gameArea.context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}