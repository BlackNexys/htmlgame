import { GameElement } from './GameElement';
import type { InteractableDefinition } from '../interfaces/Interactable';
import type {ColliderHandle} from '../world/collision/ColliderHandle';

/** Physical/local object state only. Its narrative significance belongs to the host layer. */
export class Interactable extends GameElement {
    readonly id: string;
    collected = false;
    operated = false;
    blocker?: ColliderHandle;
    constructor(readonly definition: InteractableDefinition) {
        super(definition); this.id = definition.id; this.spawn(definition);
    }
    get displayName() { return this.definition.label; }
    get active() { return !this.collected && !this.operated; }
    get interactionVerb() { return this.definition.kind === 'inspect' ? 'Inspect' : this.definition.kind === 'collect' ? 'Collect' : 'Operate'; }
}
