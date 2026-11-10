import {GameElement} from '../../components/GameElement';
import type {PropDefinition} from './PropDefinition';
export class SceneryProp extends GameElement {
    readonly id:string;
    constructor(readonly definition:PropDefinition){super(definition);this.id=definition.id;this.spawn(definition);}
}
