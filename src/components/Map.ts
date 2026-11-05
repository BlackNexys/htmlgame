import { Wall } from './Wall';
import { Exit } from './Exit';
import { Sign } from './Sign';
import type { EnemySpawn, Level } from '../interfaces/Level';

export class Map implements Level {
    width: number;
    height: number;
    solids: Wall[];
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    exit: Exit;
    signs: Sign[];

    constructor(level: Level) {
        this.width = level.width;
        this.height = level.height;
        this.solids = level.solids.map(bounds => new Wall(bounds));
        this.spawn = {...level.spawn};
        this.enemies = level.enemies.map(spawn => ({...spawn}));
        this.exit = new Exit(level.exit);
        this.signs = (level.signs || []).map(definition => new Sign(definition));
    }
}
