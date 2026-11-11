import {Structure} from './Structure';
import type {StructureDefinition} from './StructureDefinition';

/** The collision deck is independent of the open construction envelope below it. */
export class Bridge extends Structure {
    constructor(definition:StructureDefinition,solid=true){super(definition,solid);}

    private get deckThickness(){return this.definition.thickness??this.height;}

    protected parts(){
        return [{x:0,y:0,width:this.width,height:this.deckThickness}];
    }

    override socket(name:string){
        const inset=Math.min(24,this.width/4);
        if(name==='underside')return {x:this.x+this.width/2,y:this.y+this.deckThickness};
        if(name==='supportLeft')return {x:this.x+inset,y:this.y+this.deckThickness};
        if(name==='supportRight')return {x:this.x+this.width-inset,y:this.y+this.deckThickness};
        return super.socket(name);
    }
}
