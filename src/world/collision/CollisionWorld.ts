import type {Body,Rect} from '../../interfaces/Geometry';
import {bodyContacts,sweepBody,moveBody,overlaps,impactTime} from '../../game/movement/physics';
import {ColliderHandle} from './ColliderHandle';
import type {CollisionQueries} from './CollisionQueries';

/** Shared rectangle queries for all actors, weapons and visibility. Registration owns lifecycle. */
export class CollisionWorld implements CollisionQueries {
    private readonly active:ColliderHandle[]=[];
    get solids():readonly ColliderHandle[]{return this.active;}
    private readonly handles=new Map<string,ColliderHandle>();
    private validate(bounds:Rect){if(![bounds.x,bounds.y,bounds.width,bounds.height].every(Number.isFinite)||bounds.width<=0||bounds.height<=0)throw Error('Collider requires finite positive geometry');}
    register(id:string,owner:string,bounds:Rect){
        this.validate(bounds);
        if(this.handles.has(id))throw Error(`Collider already registered: ${id}`);
        const handle=new ColliderHandle(id,owner,bounds);this.handles.set(id,handle);this.active.push(handle);return handle;
    }
    remove(handle:ColliderHandle){
        if(this.handles.get(handle.id)!==handle)return;
        this.handles.delete(handle.id);const index=this.active.indexOf(handle);if(index>=0)this.active.splice(index,1);
    }
    update(handle:ColliderHandle,bounds:Rect){
        this.validate(bounds);
        if(this.handles.get(handle.id)!==handle)throw Error('Collider is not registered');
        handle.x=bounds.x;handle.y=bounds.y;handle.width=bounds.width;handle.height=bounds.height;
    }
    contacts(body:Rect){return bodyContacts(body,this.solids);}
    sweep(body:Body,dt:number){return sweepBody(body,this.solids,dt);}
    move(body:Body,dt:number){moveBody(body,this.solids,dt);}
    overlaps(bounds:Rect){return this.solids.some(r=>overlaps(bounds,r));}
    cast(bounds:Rect,dx:number,dy:number,ignore?:Rect){
        let first:number|undefined;
        for(const shape of this.solids){if(shape===ignore)continue;const time=impactTime(bounds,dx,dy,shape);if(time!==undefined&&(first===undefined||time<first))first=time;}
        return first;
    }
}
