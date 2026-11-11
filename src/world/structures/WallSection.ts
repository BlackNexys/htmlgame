import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';
export class WallSection extends Structure {
    constructor(definition:StructureDefinition,solid=true){super(definition,solid);}
    protected parts(){return [{x:0,y:0,width:this.width,height:this.height}];}
}
