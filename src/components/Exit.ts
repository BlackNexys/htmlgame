import { GameElement } from './GameElement';
import type { Rect } from '../interfaces/Geometry';
import { overlaps } from '../game/movement/physics';

export class Exit extends GameElement {
    constructor(bounds: Rect) { super(bounds); this.spawn(bounds); }
    reachedBy(actor: Rect) { return overlaps(this, actor); }
}
