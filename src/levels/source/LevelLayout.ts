import type {LevelOperation} from '../LevelChanges';
import type {LevelCollection} from '../LevelDocument';
import type {ParameterValues, ParameterSchema} from './AssemblyParameters';
import type {SceneObjects} from './SceneAssembly';

export interface ChildOverride {
    collection: LevelCollection;
    id: string;
    remove?: boolean;
    set?: Record<string, unknown>;
    unset?: string[];
}
export interface InstanceLayout { x?: number; y?: number; parameters?: ParameterValues; children?: ChildOverride[]; }
/** Editable companion to executable source. No expanded copies of generated rooms. */
export interface LevelLayout {
    version: 1;
    source: string;
    sourceRevision: number;
    revision: number;
    instances: Record<string, InstanceLayout>;
    operations: LevelOperation[];
}
export interface AssemblyInstanceView {
    id: string;
    name: string;
    x: number;
    y: number;
    parameters: ParameterValues;
    schema: ParameterSchema;
    /** Unplaced, parameterized definition before per-child overrides. */
    objects: SceneObjects;
}
