import { GameElement, IGameElement } from "./GameElement";
import { GameScreen } from "./GameScreen"; 

interface IWall {
    gameArea: GameScreen;
}

export class Wall extends GameElement {

    constructor({...gameElementProps} : IWall) {
        super({spriteSrc: "./assets/wall.png", ...gameElementProps});
    }
}