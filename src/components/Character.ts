import { Actor } from './Actor';
import { GameScreen } from "./GameScreen";

interface ICharacter {
    gameArea: GameScreen;
}

export class Character extends Actor {

    constructor({...gameElementProps} : ICharacter) {
        super({spriteSrc: "./assets/char-sprite.png", ...gameElementProps});
        this.width = 48;
        this.height = 48;
    }

    init() {
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            this.keyHandler({code: event.code, state: true});
        }, false);
        window.addEventListener("keyup", (event: KeyboardEvent) => {
            this.keyHandler({code: event.code, state: false});
        }, false);
    };

    keyHandler({code, state} : {code: string, state: boolean}) {
        switch (code) {
            case "KeyS":
            case "ArrowDown":
                // Handle "back"
                break;
            case "KeyW":
            case "ArrowUp":
                if (state && !this.moving.up) this.jumpRequested = true;
                this.moving.up = state;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.moving.left = state
                break;
            case "KeyD":
            case "ArrowRight":
                this.moving.right = state
                break;
        }
    }
}
