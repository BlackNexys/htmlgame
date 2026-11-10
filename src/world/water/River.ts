import {WaterBody} from './WaterBody';
import type {WaterBodyDefinition} from './WaterDefinition';
export class River extends WaterBody {
    readonly kind='river';
    constructor(definition:WaterBodyDefinition){super(definition);}
    override get current(){return this.definition.current??12;}
}
