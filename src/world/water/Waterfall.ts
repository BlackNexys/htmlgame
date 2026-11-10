import {GameElement} from '../../components/GameElement';
import type {WaterfallDefinition} from './WaterDefinition';
import type {WaterBody} from './WaterBody';

/** A vertical connection. Its height follows the receiving surface rather than an authored duplicate. */
export class Waterfall extends GameElement {
    readonly id:string;
    readonly kind='waterfall';
    constructor(readonly definition:WaterfallDefinition,source:{x:number;y:number},readonly receiver:WaterBody){
        super({width:definition.width,height:receiver.y-source.y-definition.y});this.id=definition.id;
        this.spawn({x:source.x+definition.x-this.width/2,y:source.y+definition.y});
    }
    get overRim(){return this.definition.overRim??false;}
    get impact(){return {x:this.x+this.width/2,y:this.y2};}
    socket(name:string){
        if(name==='mouth')return {x:this.x+this.width/2,y:this.y};
        if(name==='impact')return this.impact;
        throw Error(`Unknown waterfall socket ${this.id}.${name}`);
    }
}
