import type {Body,Rect} from '../../interfaces/Geometry';
import type {BodyContacts} from '../../game/movement/physics';
export interface CollisionQueries {
    contacts(body:Rect):BodyContacts;
    sweep(body:Body,dt:number):BodyContacts & {blockedX:boolean;blockedY:boolean};
    move(body:Body,dt:number):void;
    overlaps(bounds:Rect):boolean;
    cast(bounds:Rect,dx:number,dy:number,ignore?:Rect):number|undefined;
}
