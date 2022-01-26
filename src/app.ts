import { GameScreen } from "./components/GameScreen";
import { Wall } from "./components/Wall";
import { Character } from "./components/Character";
import { Actor } from "./components/Actor";

import { Map } from "./components/map";
import level0 from "./maps/level0";
import { GameElement } from "./components/GameElement";

const gameScreen = new GameScreen();

window.onload = function() {
    const walls: Wall[] = [];
    const char = new Character({gameArea: gameScreen});
    const level = new Map({map: level0});
    
    level.place(placeEntities);
    char.init();
    
    gameScreen.init(async () => {
        const entities: GameElement[] = [char, ...walls];

        for (let index = 0; index < entities.length; index++) {
            const entity = entities[index];
            if (entity instanceof Actor) {
                await entity.checkCollisions(entities);
            }
            await entity.render();
            
        }
    });

    function placeEntities({type, x, y}: {type: number, x: number, y: number}) {
        switch (type) {
            case 1:
                const wall = new Wall({gameArea: gameScreen});
                wall.spawn({x, y});
                walls.push(wall);
                break;
            case 2:
                char.spawn({x, y});
                break;
        
            default:
                break;
        }
    }
}
