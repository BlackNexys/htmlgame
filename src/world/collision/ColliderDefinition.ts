import type {Rect} from '../../interfaces/Geometry';

/** Explicit supported shape. Additional shapes require shared-query support before becoming authorable. */
export interface ColliderDefinition extends Rect {
    id:string;
    owner:string;
    shape:'rectangle';
}
