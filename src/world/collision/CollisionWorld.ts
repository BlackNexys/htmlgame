import type {Body,Rect} from '../../interfaces/Geometry';
import {bodyContacts,sweepBody,moveBody,overlaps,impactTime} from '../../game/movement/physics';
import {ColliderHandle} from './ColliderHandle';
import type {CollisionQueries} from './CollisionQueries';

/** Shared rectangle queries for all actors, weapons and visibility. Registration owns lifecycle. */
export class CollisionWorld implements CollisionQueries {
    private readonly active:ColliderHandle[]=[];
    get solids():readonly ColliderHandle[]{return this.active;}
    private readonly handles=new Map<string,ColliderHandle>();
    private readonly dropping=new WeakMap<Body,Set<ColliderHandle>>();
    private forBody(body:Rect){
        const ignored=this.dropping.get(body as Body);
        if(!ignored)return this.active;
        for(const shape of ignored)if(body.y>=shape.y2||body.x>=shape.x2||body.x+body.width<=shape.x||!this.handles.has(shape.id))ignored.delete(shape);
        return this.active.filter(shape=>!ignored.has(shape));
    }
    /** Ignore only the supporting one-way surfaces, until this actor clears them. */
    dropThrough(body:Body){
        const supports=this.forBody(body).filter(shape=>bodyContacts(body,[shape]).ground);
        if(!supports.length||supports.some(shape=>shape.collision!=='one-way'))return false;
        this.dropping.set(body,new Set(supports));return true;
    }
    private validate(bounds:Rect){if(![bounds.x,bounds.y,bounds.width,bounds.height].every(Number.isFinite)||bounds.width<=0||bounds.height<=0)throw Error('Collider requires finite positive geometry');}
    register(id:string,owner:string,bounds:Rect,collision:'solid'|'one-way'='solid'){
        this.validate(bounds);
        if(this.handles.has(id))throw Error(`Collider already registered: ${id}`);
        const handle=new ColliderHandle(id,owner,bounds,collision);this.handles.set(id,handle);this.active.push(handle);return handle;
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
    contacts(body:Rect){return bodyContacts(body,this.forBody(body));}
    sweep(body:Body,dt:number){return sweepBody(body,this.forBody(body),dt);}
    move(body:Body,dt:number){moveBody(body,this.forBody(body),dt);}
    overlaps(bounds:Rect){return this.solids.some(r=>r.collision!=='one-way'&&overlaps(bounds,r));}
    hasSupport(probe:Rect){return this.solids.some(r=>r.collision==='one-way'
        ?probe.x<r.x2&&probe.x+probe.width>r.x&&probe.y<=r.y+.001&&probe.y+probe.height>r.y
        :overlaps(probe,r));}
    cast(bounds:Rect,dx:number,dy:number,ignore?:Rect){
        let first:number|undefined;
        for(const shape of this.solids){if(shape===ignore||shape.collision==='one-way')continue;const time=impactTime(bounds,dx,dy,shape);if(time!==undefined&&(first===undefined||time<first))first=time;}
        return first;
    }
}
