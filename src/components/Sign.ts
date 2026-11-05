import { GameElement } from './GameElement';
import type { SignDefinition } from '../interfaces/Level';

export class Sign extends GameElement {
    readonly title: string;
    readonly text: string;
    constructor(definition: SignDefinition) {
        super({width: 0, height: 0});
        this.spawn(definition);
        this.title = definition.title;
        this.text = definition.text;
    }
}
