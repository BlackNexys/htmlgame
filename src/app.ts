import { GameScreen } from "./components/GameScreen";

import { Character } from "./components/Character";
import { Actor } from "./components/Actor";
import { Map } from "./components/Map";

import level0 from "./maps/level0";
import { GameElement } from "./components/GameElement";


window.onload = function() {
    const gameScreen = new GameScreen();
    const hero = new Character({gameArea: gameScreen});
    const level = new Map({map: level0, gameArea: gameScreen});
    gameScreen.map = level;
    level.place(hero);
    hero.init();
    
    gameScreen.init(async () => {
        for (let index = 0; index < level.entities.length; index++) {
            const entity = level.entities[index];
            await entity.render();
        }
    });

    
}
