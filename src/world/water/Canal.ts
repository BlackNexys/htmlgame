import {WaterBody} from './WaterBody';
import type {WaterBodyDefinition} from './WaterDefinition';
export class Canal extends WaterBody {
    readonly kind='canal';
    constructor(definition:WaterBodyDefinition){super(definition);}
}
