import {WaterBody} from './WaterBody';
import type {WaterBodyDefinition} from './WaterDefinition';
export class CatchBasin extends WaterBody {
    readonly kind='basin';
    constructor(definition:WaterBodyDefinition){super(definition);}
    override get current(){return this.definition.current??4;}
    override get surfaceBounds(){const inset=Math.min(32,this.width/12);return {x:this.x+inset,y:this.y,width:this.width-inset*2,height:Math.min(80,this.height)};}
    override socket(name:string){return name==='spill'?{x:this.x+this.width*.75,y:this.y+this.height/2}:super.socket(name);}
}
