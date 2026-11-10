import {GameElement} from '../../components/GameElement';
import type {Rect} from '../../interfaces/Geometry';
import type {StructureDefinition} from './StructureDefinition';
import type {SurfaceDefinition} from '../surfaces/SurfaceDefinition';
import type {ColliderDefinition} from '../collision/ColliderDefinition';

/** A placed construction. Concrete types define local parts; each consumer gets its own output. */
export abstract class Structure extends GameElement {
    readonly id:string;

    protected constructor(readonly definition:StructureDefinition,readonly solid:boolean){
        super(definition);
        this.id=definition.id;
        this.spawn(definition);
    }

    protected abstract parts():Rect[];

    colliderParts():ColliderDefinition[]{
        if(!this.solid)return [];
        return this.parts().map((part,index)=>({
            id:`${this.id}/collider-${index}`,owner:this.id,shape:'rectangle',
            x:this.x+part.x,y:this.y+part.y,width:part.width,height:part.height,
        }));
    }

    surfaces():SurfaceDefinition[]{
        return this.parts().map((part,index)=>({
            id:`${this.id}/surface-${index}`,owner:this.id,
            x:this.x+part.x,y:this.y+part.y,width:part.width,height:part.height,
            material:this.definition.material,depth:this.definition.depth,appearance:'terrain',
            layer:this.solid?'terrain':this.definition.layer??'rear',
        }));
    }

    socket(name:string){
        const points:Record<string,{x:number;y:number}>={
            topLeft:{x:0,y:0},topRight:{x:this.width,y:0},
            bottomLeft:{x:0,y:this.height},bottomRight:{x:this.width,y:this.height},
            center:{x:this.width/2,y:this.height/2},underside:{x:this.width/2,y:this.height},
            deckStart:{x:0,y:0},deckEnd:{x:this.width,y:0},
        };
        if(!Object.hasOwn(points,name))throw Error(`Unknown socket ${this.id}.${name}`);
        const point=points[name];
        return {x:this.x+point.x,y:this.y+point.y};
    }
}
