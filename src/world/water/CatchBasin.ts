import {WaterBody} from './WaterBody';
import type {WaterBodyDefinition} from './WaterDefinition';
import {basinGeometry} from './WaterHardwareGeometry';
export class CatchBasin extends WaterBody {
    readonly kind='basin';
    constructor(definition:WaterBodyDefinition){super(definition);}
    override get current(){return this.definition.current??4;}
    get hardware(){return basinGeometry(this);}
    override get surfaceBounds(){return this.hardware.surface;}
    override socket(name:string){return name==='spill'?this.hardware.spill:super.socket(name);}
}
