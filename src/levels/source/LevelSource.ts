import type {LevelDocument} from '../LevelDocument';
import {parseLevelDocument} from '../LevelValidation';
import {compileLevel} from '../LevelCompiler';
import {applyLayoutOperations} from './LayoutOperations';
import {parseLevelLayout} from './LayoutValidation';
import type {LevelLayout} from './LevelLayout';
import {SceneBuilder} from './SceneBuilder';
export type LevelMetadata = Pick<LevelDocument, 'id' | 'name' | 'width' | 'height' | 'spawn' | 'exit'> & Partial<Pick<LevelDocument, 'revision' | 'gridSize' | 'presentation'>>;
/** Source and workshop share one build path; the simulation consumes validated data. */
export class LevelSource {
    private readonly metadata: LevelMetadata;
    constructor(metadata: LevelMetadata, private readonly build: (scene: SceneBuilder) => void, private readonly companion?: LevelLayout) { this.metadata = structuredClone(metadata); }
    get id() { return this.metadata.id; }
    emptyLayout(): LevelLayout {
        return {version: 1, source: this.id, sourceRevision: this.metadata.revision ?? 1, revision: this.metadata.revision ?? 1, instances: {}, operations: []};
    }
    get layout(): LevelLayout { return structuredClone(this.companion ?? this.emptyLayout()); }
    withLayout(layout: LevelLayout): LevelSource {
        const checked = parseLevelLayout(layout);
        if (checked.source !== this.id || checked.sourceRevision !== (this.metadata.revision ?? 1)) throw Error('Layout source/revision mismatch; rebase against the current source');
        const source = new LevelSource(this.metadata, this.build, checked); source.document(); return source;
    }
    project(input: LevelLayout = this.layout) {
        const layout = parseLevelLayout(input);
        if (layout.source !== this.id || layout.sourceRevision !== (this.metadata.revision ?? 1)) throw Error('Layout source/revision mismatch');
        const scene = new SceneBuilder(layout); this.build(scene);
        const instances = scene.assemblyInstances;
        for (const id of Object.keys(layout.instances)) if (!instances.some(i => i.id === id)) throw Error(`Layout targets missing assembly instance ${id}`);
        // Validate after root edits too: root mounts may refer to generated assembly children.
        let raw = {schemaVersion: 2, revision: layout.revision, gridSize: 8, ...structuredClone(this.metadata), ...scene.snapshot()} as LevelDocument;
        const owned = new Set(instances.flatMap(i => Object.values(i.objects).flat().map(o => `${i.id}--${o.id}`)));
        for (const operation of layout.operations) if (operation && operation.op !== 'set' && owned.has(operation.op === 'remove' ? operation.id : String(operation.value?.id))) throw Error('Generated children need instance-local overrides');
        if (layout.operations.length) {
            raw = applyLayoutOperations(raw, layout);
        }
        const document = parseLevelDocument({...raw, revision: layout.revision});
        return {document, instances, root: scene.rootObjects};
    }
    document(layout?: LevelLayout): LevelDocument { return this.project(layout).document; }
    compile(layout?: LevelLayout) { return compileLevel(this.document(layout)); }

}
export function defineLevel(metadata: LevelMetadata, build: (scene: SceneBuilder) => void): LevelSource { return new LevelSource(metadata, build); }
