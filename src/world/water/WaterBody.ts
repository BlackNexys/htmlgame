import {GameElement} from '../../components/GameElement';
import type {WaterBodyDefinition} from './WaterDefinition';

/** Placed receiving water. Bounds are visual volume, never solid collision. */
export abstract class WaterBody extends GameElement {
    readonly id:string;
    abstract readonly kind:'river'|'canal'|'basin';
    protected constructor(readonly definition:WaterBodyDefinition){super(definition);this.id=definition.id;this.spawn(definition);}
    get current(){return this.definition.current??8;}
    get surfaceBounds(){return {x:this.x,y:this.y,width:this.width,height:this.height};}
    socket(name:string):{x:number;y:number}{
        switch(name){
            case 'topLeft':case 'surfaceLeft':return {x:this.x,y:this.y};
            case 'surface':return {x:this.x+this.width/2,y:this.y};
            case 'surfaceRight':return {x:this.x+this.width,y:this.y};
            case 'spill':return {x:this.x+this.width-Math.min(32,this.width/2),y:this.y};
            case 'bottomLeft':return {x:this.x,y:this.y2};
            default:throw Error(`Unknown water socket ${this.id}.${name}`);
        }
    }
}
