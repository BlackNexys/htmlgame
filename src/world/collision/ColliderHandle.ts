import {GameElement} from '../../components/GameElement';
import type {Rect} from '../../interfaces/Geometry';

/** Identity and geometry of one registered blocker, independent of its visual surface. */
export class ColliderHandle extends GameElement {
    readonly shape='rectangle';
    constructor(readonly id:string,readonly owner:string,bounds:Rect,readonly collision:'solid'|'one-way'='solid'){super(bounds);this.spawn(bounds);}
}
