import type {ParameterSchema, ParameterValues, ValuesOf} from './AssemblyParameters';
import type {LevelLayout, AssemblyInstanceView} from './LevelLayout';
import {applyChildOverrides} from './ChildOverrides';
import {levelCollections, type LevelCollection, type LevelPoint} from '../LevelDocument';
import {emptyScene, SceneAssembly, type SceneObjects} from './SceneAssembly';
import {placeScene} from './ScenePlacement';
/** Authoring only: no images, runtime entities, collision registration or saves. */
export class SceneBuilder {
    private readonly objects = emptyScene();
    private readonly root = emptyScene();
    get rootObjects() { return structuredClone(this.root); }
    private readonly instances = new Map<string, AssemblyInstanceView>();
    constructor(private readonly layout?: LevelLayout) {}
    get assemblyInstances() { return structuredClone([...this.instances.values()]); }
    add<C extends LevelCollection>(collection: C, ...items: SceneObjects[C]): this {
        (this.objects[collection] as unknown[]).push(...structuredClone(items));
        (this.root[collection] as unknown[]).push(...structuredClone(items));
        return this;
    }
    place(instance: string, origin: LevelPoint, assembly: SceneAssembly, parameters: ParameterValues = {}) {
        if (this.instances.has(instance)) throw new Error(`Duplicate assembly instance: ${instance}`);
        const edit = this.layout?.instances[instance];
        const position = {x: edit?.x ?? origin.x, y: edit?.y ?? origin.y};
        const values = assembly.parameters({...parameters, ...edit?.parameters});
        const objects = assembly.snapshot(values);
        const placed = placeScene(applyChildOverrides(objects, edit?.children), instance, position);
        this.instances.set(instance, {id: instance, name: assembly.name, ...position, parameters: values, schema: assembly.schema, objects});
        for (const c of levelCollections) (this.objects[c] as unknown[]).push(...placed[c]);
        const ids = new Set(levelCollections.flatMap(c => placed[c].map(o => o.id)));
        return {child(id: string): string {
            const qualified = `${instance}--${id}`;
            if (!ids.has(qualified)) throw new Error(`Assembly ${instance} has no child ${id}`);
            return qualified;
        }};
    }
    snapshot(): SceneObjects { return structuredClone(this.objects); }
}
export function defineAssembly(build: (scene: SceneBuilder) => void): SceneAssembly;
export function defineAssembly<S extends ParameterSchema>(definition: {name: string; parameters: S}, build: (scene: SceneBuilder, parameters: ValuesOf<S>) => void): SceneAssembly;
export function defineAssembly(definition: ((scene: SceneBuilder) => void) | {name: string; parameters: ParameterSchema}, build?: (scene: SceneBuilder, parameters: ParameterValues) => void): SceneAssembly {
    if (typeof definition === 'function') {
        const scene = new SceneBuilder(); definition(scene); return new SceneAssembly(scene.snapshot());
    }
    if (!build || !definition.name.trim()) throw Error('Parameterized assembly needs a name and factory');
    return new SceneAssembly(emptyScene(), definition.name, definition.parameters, values => {
        const scene = new SceneBuilder(); build(scene, values); return scene.snapshot();
    });
}
