import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';
import type {SurfaceDefinition} from '../surfaces/SurfaceDefinition';
/** A mounted architectural outlet. Water behavior is owned by its water renderer. */
export class Outfall extends Structure {
    constructor(definition:StructureDefinition,solid=false){super(definition,solid);}
    protected parts(){return [{x:0,y:0,width:this.width,height:this.height}];}
    override surfaces():SurfaceDefinition[]{return [{id:`${this.id}/surface`,owner:this.id,x:this.x,y:this.y,width:this.width,height:this.height,depth:this.definition.depth,appearance:'outfall',layer:this.definition.layer??'rear'}];}
    override socket(name:string){return name==='mouth'?{x:this.x+this.width/2,y:this.y+this.height*7/12}:name==='inlet'?{x:this.x,y:this.y+this.height/4}:super.socket(name);}
}
