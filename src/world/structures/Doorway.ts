import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';

/** Rear jambs frame a walk-through opening; only the overhead lintel blocks movement. */
export class Doorway extends Structure {
    constructor(definition:StructureDefinition,solid=true){super(definition,solid);}

    protected parts(){
        const t=this.definition.thickness??Math.min(16,Math.floor(this.width/3),Math.floor(this.height/3));
        return [
            {x:0,y:0,width:this.width,height:t},
            {x:0,y:t,width:t,height:this.height-t},
            {x:this.width-t,y:t,width:t,height:this.height-t},
        ];
    }

    override colliderParts(){return super.colliderParts().slice(0,1);}

    override surfaces(){
        return super.surfaces().map((surface,index)=>index>0
            ? {...surface,layer:this.definition.layer??'rear' as const}
            : surface);
    }

    override socket(name:string){
        if(name==='opening')return {x:this.x+this.width/2,y:this.y+this.height};
        return super.socket(name);
    }
}
