import {resolveParameters, type ParameterSchema, type ParameterValues} from './AssemblyParameters';
import {levelCollections, type LevelDocument} from '../LevelDocument';
export type SceneObjects = Pick<LevelDocument, 'terrain' | 'decorations' | 'enemies' | 'npcs' | 'interactables' | 'signs' | 'water' | 'props'>;
export function emptyScene(): SceneObjects {
    return Object.fromEntries(levelCollections.map(c => [c, []])) as unknown as SceneObjects;
}
/** Immutable reusable composition. Children retain their structure/water/actor types. */
export class SceneAssembly {
    private readonly objects: SceneObjects;
    constructor(objects: SceneObjects, readonly name = 'Assembly', private readonly fields: ParameterSchema = {},
        private readonly factory?: (parameters: ParameterValues) => SceneObjects) {
        this.objects = structuredClone(objects); this.fields = structuredClone(fields); resolveParameters(this.fields);
    }
    get schema() { return structuredClone(this.fields); }
    parameters(input: ParameterValues = {}) { return resolveParameters(this.fields, input); }
    snapshot(parameters: ParameterValues = {}): SceneObjects {
        const values = this.parameters(parameters);
        return structuredClone(this.factory ? this.factory(values) : this.objects);
    }
}
