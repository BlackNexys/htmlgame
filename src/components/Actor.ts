import { entry } from "../../webpack.config";
import { GameElement } from "./GameElement";
import { GameScreen } from "./GameScreen";
import { Coords, Coord } from "../interfaces/Coords";

export class Actor extends GameElement {
    movement: number = 16;
    isJumping: boolean = false;
    jumpTimeout: any;
    fallAccel: number = -1;
    fallSpeed: number = 0;
    faceRight: boolean = true;
    coords: Coords = new Coords({
        TL: new Coord({x: this.x, y: this.y}),
        TR: new Coord({x: this.x2, y: this.y}),
        BL: new Coord({x: this.x, y: this.y2}),
        BR: new Coord({x: this.x2, y: this.y2}),
    });

    gravity () {
        const colids = this.gameArea.checkCollisions(this);
        if (!colids.bottom) {
            this.fallSpeed = this.fallSpeed + 1;
            const projectedY = this.y - Math.max(this.fallAccel * this.fallSpeed^2, -16);

            const potentialCol = colids.collisions.filter((coords: Coords) => {
                return coords.TL.x <= this.coords.BR.x && coords.TR.x >= this.coords.BL.x && coords.TL.y >= projectedY + this.height;
            });

            this.y = potentialCol.length > 0 ? potentialCol[0].TL.y - this.height : projectedY;
        } else {
            this.fallSpeed = 0;
        };
    }

    moveLeft () {
        const colids = this.gameArea.checkCollisions(this);
        this.faceRight = false;
        if (!colids.left) {
            this.x = this.x - this.movement;
            return;
        }
    }

    moveRight () {
        const colids = this.gameArea.checkCollisions(this);
        this.faceRight = true;
        if (!colids.right) {
            this.x = this.x + this.movement;
            return;
        }
    }

    jump () {
        const colids = this.gameArea.checkCollisions(this);
        if (!colids.top) {
            this.y = this.y - this.height;
        }
    }

    async render() {
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
        this.gravity();

        this.gameArea.context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}