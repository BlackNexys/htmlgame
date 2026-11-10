import {cloneDocument, levelCollections, type LevelDocument} from './LevelDocument';
import type {LevelOperation} from './LevelChanges';

/** Apply a bounded edit batch, then let the caller validate the complete resulting scene. */
export function editLevelObjects(input: LevelDocument, operations: readonly LevelOperation[]): LevelDocument {
    if (!Array.isArray(operations) || operations.length > 1000) throw Error('At most 1000 operations are allowed');
    const next = cloneDocument(input);
    for (const operation of operations as readonly LevelOperation[]) {
        if (!operation || typeof operation !== 'object') throw Error('Invalid patch operation');
        if (operation.op === 'set') {
            if (!['id','name','width','height','spawn','exit','gridSize','presentation'].includes(operation.field)) throw Error('Unsupported set field');
            Object.assign(next, {[operation.field]: operation.value});
        } else if (operation.op === 'remove' || operation.op === 'upsert') {
            if (!levelCollections.includes(operation.collection)) throw Error('Unsupported collection');
            const entries = next[operation.collection] as {id: string}[];
            const id = operation.op === 'remove' ? operation.id : operation.value?.id;
            if (typeof id !== 'string') throw Error('Operation needs an object ID');
            const index = entries.findIndex(item => item.id === id);
            if (operation.op === 'remove') {
                if (index < 0) throw Error(`Object not found: ${id}`);
                entries.splice(index, 1);
            } else if (index < 0) entries.push(structuredClone(operation.value) as unknown as {id: string});
            else entries[index] = structuredClone(operation.value) as unknown as {id: string};
        } else throw Error('Unsupported patch operation');
    }
    return next;
}
