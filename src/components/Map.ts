import { GameElement } from "./GameElement";
import { GameScreen } from "./GameScreen";
import { Wall } from "./Wall";
import { Character } from "./Character";

export class Map {
    map: any[];
    entities: GameElement[] = [];
    gameArea: GameScreen;

    constructor({ map, gameArea }: { map: any[], gameArea: GameScreen}) {
        this.map = map;
        this.gameArea = gameArea;
    }

    place(hero: Character) {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                switch (this.map[y][x]) {
                    case 1:
                        const wall = new Wall({gameArea: this.gameArea});
                        wall.spawn({x: x * wall.width, y: y * wall.height});
                        this.entities.push(wall);
                        break;
                    case 2:
                        hero.spawn({x: x * hero.width, y: y * hero.height});
                        this.entities.push(hero);
                        break;
                
                    default:
                        break;
                }
            }
        }
    }

    placeEntities({type, x, y}: {type: number, x: number, y: number}) {
        
    }
}