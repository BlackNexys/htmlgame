import type {StructureDefinition} from '../structures/StructureDefinition';
import {createStructure} from '../structures/StructureFactory';
import type {Structure} from '../structures/Structure';

/** Resolve socket-local offsets in dependency order, rejecting missing parents, sockets and cycles. */
export function resolveStructures(terrain:readonly StructureDefinition[],decorations:readonly StructureDefinition[]=[]):Structure[]{
    const definitions=new Map([...terrain,...decorations].map(d=>[d.id,d]));
    const solids=new Set(terrain.map(d=>d.id)),resolved=new Map<string,Structure>(),visiting=new Set<string>();
    const visit=(id:string):Structure=>{
        const ready=resolved.get(id);if(ready)return ready;
        const d=definitions.get(id);if(!d)throw Error(`Missing structure parent: ${id}`);
        if(visiting.has(id))throw Error(`Attachment cycle: ${id}`);visiting.add(id);
        const anchor=d.mount?visit(d.mount.parent).socket(d.mount.socket):{x:0,y:0};
        const instance=createStructure({...d,x:d.x+anchor.x,y:d.y+anchor.y},solids.has(id));
        visiting.delete(id);resolved.set(id,instance);return instance;
    };
    return [...definitions.keys()].map(visit);
}
