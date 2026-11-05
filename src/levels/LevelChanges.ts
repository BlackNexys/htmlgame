import { cloneDocument, levelCollections, type LevelCollection, type LevelDocument } from './LevelDocument';
import { parseLevelDocument } from './LevelValidation';

export type LevelOperation =
    | {op: 'set'; field: 'id' | 'name' | 'width' | 'height' | 'spawn' | 'exit'; value: unknown}
    | {op: 'upsert'; collection: LevelCollection; value: Record<string, unknown>}
    | {op: 'remove'; collection: LevelCollection; id: string};
export interface LevelChanges { levelId: string; baseRevision: number; operations: LevelOperation[]; }

/** A patch is atomic: no partial edits survive validation or revision failures. */
export function applyLevelChanges(input: LevelDocument, changes: LevelChanges): LevelDocument {
    const current = parseLevelDocument(input);
    if (!changes || changes.levelId !== current.id) throw new Error('Patch targets a different level');
    if (changes.baseRevision !== current.revision) throw new Error(`Revision conflict: expected ${changes.baseRevision}, current revision is ${current.revision}`);
    if (!Array.isArray(changes.operations) || !changes.operations.length || changes.operations.length > 1000) throw new Error('Patch needs between 1 and 1000 operations');
    const next = cloneDocument(current);
    for (const operation of changes.operations) {
        if (!operation || typeof operation !== 'object') throw new Error('Invalid patch operation');
        if (operation.op === 'set') {
            if (!['id', 'name', 'width', 'height', 'spawn', 'exit'].includes(operation.field)) throw new Error('Unsupported set field');
            Object.assign(next, {[operation.field]: operation.value});
        } else if (operation.op === 'remove' || operation.op === 'upsert') {
            if (!levelCollections.includes(operation.collection)) throw new Error('Unsupported collection');
            const collection = next[operation.collection] as {id: string}[];
            const id = operation.op === 'remove' ? operation.id : operation.value?.id;
            if (typeof id !== 'string') throw new Error('Operation needs an object ID');
            const index = collection.findIndex(item => item.id === id);
            if (operation.op === 'remove') {
                if (index < 0) throw new Error(`Object not found: ${id}`);
                collection.splice(index, 1);
            } else if (index < 0) collection.push(operation.value as unknown as {id: string});
            else collection[index] = operation.value as unknown as {id: string};
        } else throw new Error('Unsupported patch operation');
    }
    next.revision++;
    return parseLevelDocument(next);
}
