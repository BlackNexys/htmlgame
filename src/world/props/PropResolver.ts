import type {Structure} from '../structures/Structure';
import type {PropDefinition} from './PropDefinition';
import {SceneryProp} from './SceneryProp';
export function resolveProps(definitions:readonly PropDefinition[],structures:readonly Structure[],bounds:{width:number;height:number}){
    return definitions.map(d=>{
        const parent=d.mount?structures.find(s=>s.id===d.mount!.parent):undefined;
        if(d.mount&&!parent)throw Error(`Missing prop mount parent: ${d.mount.parent}`);
        const anchor=d.mount?parent!.socket(d.mount.socket):{x:0,y:0};
        const prop=new SceneryProp({...d,x:d.x+anchor.x,y:d.y+anchor.y});
        if(!Number.isFinite(prop.x)||!Number.isFinite(prop.y)||prop.x<0||prop.y<0||prop.x2>bounds.width||prop.y2>bounds.height)throw Error(`${d.id}: resolved prop extends outside the level`);
        return prop;
    }).sort((a,b)=>(a.definition.depth??0)-(b.definition.depth??0));
}
