import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';
/** A platform's authored thickness is physical; no texture-cell padding is added. */
export class Platform extends Structure {
    constructor(definition:StructureDefinition,solid=true){super(definition,solid);}
    protected parts(){return [{x:0,y:0,width:this.width,height:this.definition.thickness??this.height}];}
    override socket(name:string){return name==='underside'?{x:this.x+this.width/2,y:this.y+(this.definition.thickness??this.height)}:super.socket(name);}
}
