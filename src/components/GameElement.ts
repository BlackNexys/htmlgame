import { GameScreen } from "./GameScreen";
import { ICoord } from "../interfaces/Coords";

export interface IGameElement {
    gameArea: GameScreen;
    spriteSrc: string;
}

export class GameElement {
    gameArea: GameScreen;
    width: number = 64;
    height: number = 64;
    x: number;
    y: number;
    x2: number;
    y2: number;
    sprite: HTMLImageElement = new Image();
    spriteSrc: string;

    constructor({gameArea, spriteSrc = "./assets/null.png"} : IGameElement) {
        this.spriteSrc = spriteSrc;
        this.gameArea = gameArea;
        this.sprite.src = this.spriteSrc;
    }
    
    spawn({x, y}: ICoord) {
        this.x = x;
        this.y = y;
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
    }

    render() {
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;

        this.gameArea.context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}