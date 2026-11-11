import {editLevelObjects} from './LevelOperations';
import { type LevelCollection, type LevelDocument } from './LevelDocument';
import { parseLevelDocument } from './LevelValidation';

export type LevelOperation =
    | {op: 'set'; field: 'id' | 'name' | 'width' | 'height' | 'spawn' | 'exit' | 'gridSize' | 'presentation'; value: unknown}
    | {op: 'upsert'; collection: LevelCollection; value: Record<string, unknown>}
    | {op: 'remove'; collection: LevelCollection; id: string};
export interface LevelChanges { levelId: string; baseRevision: number; operations: LevelOperation[]; }

/** A patch is atomic: no partial edits survive validation or revision failures. */
export function applyLevelChanges(input: LevelDocument, changes: LevelChanges): LevelDocument {
    const current = parseLevelDocument(input);
    if (!changes || changes.levelId !== current.id) throw new Error('Patch targets a different level');
    if (changes.baseRevision !== current.revision) throw new Error(`Revision conflict: expected ${changes.baseRevision}, current revision is ${current.revision}`);
    if (!Array.isArray(changes.operations) || !changes.operations.length || changes.operations.length > 1000) throw new Error('Patch needs between 1 and 1000 operations');
    const next = editLevelObjects(current, changes.operations);
    next.revision++;
    return parseLevelDocument(next);
}
