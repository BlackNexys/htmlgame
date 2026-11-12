import {CollisionWorld} from '../world/collision/CollisionWorld';
import {resolveStructures} from '../world/scene/AttachmentResolver';
import type {Structure} from '../world/structures/Structure';
import type {SurfaceDefinition} from '../world/surfaces/SurfaceDefinition';
import { Exit } from './Exit';
import { Sign } from './Sign';
import type { EnemySpawn, Level } from '../interfaces/Level';
import type { NPCSpawn } from '../interfaces/NPC';
import type { InteractableDefinition } from '../interfaces/Interactable';
import {WaterNetwork} from '../world/water/WaterNetwork';
import {resolveProps} from '../world/props/PropResolver';
import type {SceneryProp} from '../world/props/SceneryProp';

export class Map {
    id?: string;
    revision?:number;
    readonly props:SceneryProp[];
    interactables: InteractableDefinition[];
    width: number;
    height: number;
    readonly collision=new CollisionWorld();
    get solids(){return this.collision.solids;}
    decorations:SurfaceDefinition[];
    readonly structures:Structure[];
    readonly surfaces:SurfaceDefinition[];
    readonly water:WaterNetwork;
    spawn: {x: number; y: number};
    enemies: EnemySpawn[];
    npcs: NPCSpawn[];
    exit: Exit;
    signs: Sign[];

    constructor(level: Level) {
        this.id=level.id;
        this.revision=level.revision;
        this.interactables=(level.interactables??[]).map(item=>({...item}));
        this.width = level.width;
        this.height = level.height;
        this.structures=level.structureDefinitions?resolveStructures(level.structureDefinitions.terrain,level.structureDefinitions.decorations):resolveStructures(level.solids.map((r,i)=>({id:`terrain-${i}`,...r})),(level.decorations??[]).map((r,i)=>({id:`decoration-${i}`,...r})));
        this.surfaces=this.structures.flatMap(s=>s.surfaces()).sort((a,b)=>(a.depth??0)-(b.depth??0));
        this.props=resolveProps(level.props??[],this.structures,this);
        this.decorations=this.surfaces.filter(s=>s.layer==='rear');
        level.solids.forEach((r,i)=>this.collision.register(r.id??`terrain-${i}`,r.owner??`terrain-${i}`,r,r.collision));
        this.water=new WaterNetwork(level.water??[],this.structures,this,this.solids);
        this.spawn = {...level.spawn};
        this.enemies = level.enemies.map(spawn => ({...spawn}));
        this.npcs = (level.npcs ?? []).map(spawn => ({...spawn}));
        this.exit = new Exit(level.exit);
        this.signs = (level.signs || []).map(definition => new Sign(definition));
    }
}
