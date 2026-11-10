import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';
import type {SurfaceDefinition} from '../surfaces/SurfaceDefinition';

/** Open bars and posts, rather than a filled platform-shaped visual. */
export class Railing extends Structure {
    constructor(definition:StructureDefinition,solid=false){super(definition,solid);}
    override surfaces():SurfaceDefinition[]{return [{id:`${this.id}/surface`,owner:this.id,x:this.x,y:this.y,width:this.width,height:this.height,appearance:'railing',layer:this.solid?'terrain':this.definition.layer??'rear',depth:this.definition.depth}];}
    protected parts(){
        const bars=[{x:0,y:0,width:this.width,height:Math.min(4,this.height)},{x:0,y:Math.floor(this.height/2),width:this.width,height:Math.min(3,this.height/2)}];
        const count=Math.max(1,Math.ceil(this.width/64));
        for(let i=0;i<=count;i++)bars.push({x:Math.round((this.width-Math.min(4,this.width))*i/count),y:0,width:Math.min(4,this.width),height:this.height});
        return bars;
    }
}
