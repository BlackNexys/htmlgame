import type {Rect} from '../../interfaces/Geometry';
import type {Structure} from '../structures/Structure';
import {overlaps} from '../../game/movement/physics';
import type {WaterDefinition} from './WaterDefinition';
import {WaterBody} from './WaterBody';
import {River} from './River';
import {Canal} from './Canal';
import {CatchBasin} from './CatchBasin';
import {Drain} from './Drain';
import {Waterfall} from './Waterfall';

export type WaterElement=WaterBody|Drain|Waterfall;

/** Resolve a level-owned network with no level IDs, coordinate heuristics or render dependencies. */
export class WaterNetwork {
    readonly elements:readonly WaterElement[];
    readonly bodies:readonly WaterBody[];
    readonly drains:readonly Drain[];
    readonly falls:readonly Waterfall[];

    constructor(definitions:readonly WaterDefinition[],structures:readonly Structure[],bounds:{width:number;height:number},solids:readonly Rect[]=[]){
        const authored=new Map(definitions.map(d=>[d.id,d]));
        const placed=new Map<string,Structure|WaterElement>(structures.map(s=>[s.id,s]));
        const visiting=new Set<string>();
        const visit=(id:string):Structure|WaterElement=>{
            const existing=placed.get(id);if(existing)return existing;
            const d=authored.get(id);if(!d)throw Error(`Missing water connection: ${id}`);
            if(visiting.has(id))throw Error(`Water attachment cycle: ${id}`);visiting.add(id);
            let element:WaterElement;
            if(d.kind==='waterfall'){
                const source=visit(d.from.parent).socket(d.from.socket),receiver=visit(d.to);
                if(!(receiver instanceof WaterBody))throw Error(`Waterfall ${id} requires a receiving water body`);
                element=new Waterfall(d,source,receiver);
                if(element.height<=0)throw Error(`Waterfall ${id} must flow downward`);
                if(element.x<receiver.x-1e-6||element.x2>receiver.x2+1e-6)throw Error(`Waterfall ${id} misses its receiving water body`);
                if(!d.behindTerrain&&solids.some(s=>overlaps(element,s)))throw Error(`Waterfall ${id} crosses solid terrain; mark a deliberate background crossing explicitly`);
            }else{
                const anchor=d.mount?visit(d.mount.parent).socket(d.mount.socket):{x:0,y:0};
                const resolved={...d,x:d.x+anchor.x,y:d.y+anchor.y};
                switch(resolved.kind){
                    case 'river':element=new River(resolved);break;
                    case 'canal':element=new Canal(resolved);break;
                    case 'basin':element=new CatchBasin(resolved);break;
                    case 'drain':element=new Drain(resolved);break;
                }
            }
            if(element.x<0||element.y<0||element.x2>bounds.width||element.y2>bounds.height)throw Error(`Water element ${id} extends outside the level`);
            visiting.delete(id);placed.set(id,element);return element;
        };
        this.elements=definitions.map(d=>visit(d.id) as WaterElement).sort((a,b)=>(a.definition.depth??0)-(b.definition.depth??0));
        this.bodies=this.elements.filter((e):e is WaterBody=>e instanceof WaterBody);
        this.drains=this.elements.filter((e):e is Drain=>e instanceof Drain);
        this.falls=this.elements.filter((e):e is Waterfall=>e instanceof Waterfall);
    }
    get(id:string){return this.elements.find(e=>e.id===id);}
}
