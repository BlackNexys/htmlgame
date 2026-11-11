import type {InteractableDefinition} from '../../interfaces/Interactable';
import type {Structure} from '../structures/Structure';
export function resolveInteractables(items:readonly InteractableDefinition[],structures:readonly Structure[],bounds:{width:number;height:number}){
    return items.map(item=>{
        const parent=item.mount?structures.find(s=>s.id===item.mount!.parent):undefined;
        if(item.mount&&!parent)throw Error(`Missing interaction mount parent: ${item.mount.parent}`);
        const p=item.mount?parent!.socket(item.mount.socket):{x:0,y:0},r={...structuredClone(item),x:item.x+p.x,y:item.y+p.y};
        if(r.x<0||r.y<0||r.x+r.width>bounds.width||r.y+r.height>bounds.height)throw Error(`${item.id}: interaction extends outside the level`);
        if(r.visual){const v=r.visual;if(r.x+v.x<0||r.y+v.y<0||r.x+v.x+v.width>bounds.width||r.y+v.y+v.height>bounds.height)throw Error(`${item.id}: visual extends outside the level`);}
        return r;
    });
}
