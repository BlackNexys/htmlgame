import { Actor } from './Actor';
import { GameScreen } from "./GameScreen";

interface ICharacter {
    gameArea: GameScreen;
}

export class Character extends Actor {

    constructor({...gameElementProps} : ICharacter) {
        super({spriteSrc: "./assets/ghostman idel/pixil-frame-0.png", ...gameElementProps});
    }

    init() {
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            this.keyHandler({code: event.code});
        }, false);
        window.addEventListener("keyup", (event: KeyboardEvent) => {
            this.keyHandler({code: event.code});
        }, false);
    };

    keyHandler({code} : {code: string}) {
        switch (code) {
            case "KeyS":
            case "ArrowDown":
                // Handle "back"
                break;
            case "KeyW":
            case "ArrowUp":
                this.jump();
                break;
            case "KeyA":
            case "ArrowLeft":
                this.moveX(true);
                break;
            case "KeyD":
            case "ArrowRight":
                this.moveX(false);
                break;
        }
    }
}