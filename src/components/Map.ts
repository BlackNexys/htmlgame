import { Wall } from './Wall';
import { Exit } from './Exit';
import { Sign } from './Sign';
import type { EnemySpawn, Level } from '../interfaces/Level';
import type { NPCSpawn } from '../interfaces/NPC';
import type { InteractableDefinition } from '../interfaces/Interactable';

export class Map implements Level {
    id?: string;
    interactables: InteractableDefinition[];
    width: number;
    height: number;
    solids: Wall[];
    decorations: Wall[];
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    npcs: NPCSpawn[];
    exit: Exit;
    signs: Sign[];

    constructor(level: Level) {
        this.id=level.id;
        this.interactables=(level.interactables??[]).map(item=>({...item}));
        this.width = level.width;
        this.height = level.height;
        this.solids = level.solids.map(bounds => new Wall(bounds));
        this.decorations = (level.decorations || []).map(bounds => new Wall(bounds));
        this.spawn = {...level.spawn};
        this.enemies = level.enemies.map(spawn => ({...spawn}));
        this.npcs = (level.npcs ?? []).map(spawn => ({...spawn}));
        this.exit = new Exit(level.exit);
        this.signs = (level.signs || []).map(definition => new Sign(definition));
    }
}
