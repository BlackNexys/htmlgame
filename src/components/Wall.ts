import { GameElement } from './GameElement';
import type { Rect } from '../interfaces/Geometry';

export class Wall extends GameElement {
    constructor(bounds: Rect) {
        super(bounds);
        this.spawn(bounds);
    }
}
