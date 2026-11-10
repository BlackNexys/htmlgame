import type {Rect} from '../../interfaces/Geometry';

/** Serializable presentation bounds, independent of a structure's collision envelope. */
export interface SurfaceDefinition extends Rect {
    id:string;
    owner:string;
    material?:number;
    appearance:'terrain'|'outfall'|'railing';
    layer:'terrain'|'rear'|'foreground';
    depth?:number;
}
