import {GameElement} from '../../components/GameElement';
import type {DrainDefinition} from './WaterDefinition';

/** Gutter/downpipe or collector infrastructure, with explicit inlet and outlet sockets. */
export class Drain extends GameElement {
    readonly id:string;
    readonly kind='drain';
    constructor(readonly definition:DrainDefinition){super(definition);this.id=definition.id;this.spawn(definition);}
    get profile(){return this.definition.profile??'gutter';}
    socket(name:string){
        if(name==='inlet'||name==='topLeft')return {x:this.x,y:this.y};
        if(name==='mouth')return {x:this.x+(this.definition.outletX??(this.profile==='collector'?this.width:Math.max(this.width/2,this.width-96))),y:this.y2};
        throw Error(`Unknown drain socket ${this.id}.${name}`);
    }
}
