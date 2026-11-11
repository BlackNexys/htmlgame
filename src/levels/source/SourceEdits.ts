import {applyLevelChanges, type LevelChanges, type LevelOperation} from '../LevelChanges';
import type {LevelObject} from '../LevelDocument';
import type {LevelSource} from './LevelSource';
import type {AssemblyInstanceView, ChildOverride, LevelLayout} from './LevelLayout';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function localObject(input: LevelObject, instance: AssemblyInstanceView): Record<string, unknown> {
    const item = structuredClone(input);
    const prefix = instance.id + '--';
    const local = (id: string) => id.startsWith(prefix) ? id.slice(prefix.length) : id;
    item.id = local(item.id);
    if (!('mount' in item && item.mount) && !('from' in item)) { item.x -= instance.x; item.y -= instance.y; }
    if ('mount' in item && item.mount) item.mount.parent = local(item.mount.parent);
    if ('from' in item) item.from.parent = local(item.from.parent);
    if ('to' in item) item.to = local(item.to);
    if ('patrol' in item) { item.patrol.left -= instance.x; item.patrol.right -= instance.x; }
    return item as unknown as Record<string, unknown>;
}

/** Convert ordinary visual edits into explicit local deltas without freezing a generated room. */
export function editSourceLayout(source: LevelSource, input: LevelLayout, changes: LevelChanges): LevelLayout {
    const project = source.project(input);
    const candidate = applyLevelChanges(project.document, changes);
    const layout = structuredClone(input); layout.revision = candidate.revision;
    for (const operation of changes.operations) {
        if (operation.op === 'set') {
            if (operation.field === 'id') { if (operation.value !== source.id) throw Error('Rename the source module to change its ID'); continue; }
            layout.operations = layout.operations.filter(op => !(op.op === 'set' && op.field === operation.field));
            layout.operations.push({...structuredClone(operation), value: operation.value === undefined ? null : operation.value}); continue;
        }
        const id = operation.op === 'remove' ? operation.id : String(operation.value.id);
        const instance = project.instances.find(i => i.objects[operation.collection].some(o => `${i.id}--${o.id}` === id));
        if (!instance) {
            layout.operations = layout.operations.filter(op => op.op === 'set' || op.collection !== operation.collection || (op.op === 'remove' ? op.id : op.value.id) !== id);
            if (operation.op !== 'remove' || project.root[operation.collection].some(o => o.id === id)) layout.operations.push(structuredClone(operation));
            continue;
        }
        const base = instance.objects[operation.collection].find(o => `${instance.id}--${o.id}` === id)!;
        const entry = layout.instances[instance.id] ??= {};
        const overrides = entry.children ??= [];
        let override: ChildOverride = overrides.find(o => o.collection === operation.collection && o.id === base.id) ?? {collection: operation.collection, id: base.id};
        const existingIndex = overrides.indexOf(override);
        const desired = candidate[operation.collection].find(o => o.id === id);
        if (!desired) override = {collection: operation.collection, id: base.id, remove: true};
        else {
            const before = project.document[operation.collection].find(o => o.id === id);
            const old = before ? localObject(before, instance) : base as unknown as Record<string, unknown>;
            const next = localObject(desired, instance), original = base as unknown as Record<string, unknown>;
            delete override.remove;
            const set = {...override.set}, unset = new Set(override.unset ?? []);
            for (const key of new Set([...Object.keys(old), ...Object.keys(next)])) {
                if (key === 'id' || same(old[key], next[key])) continue;
                delete set[key]; unset.delete(key);
                if (same(original[key], next[key])) continue;
                if (next[key] === undefined) unset.add(key); else set[key] = next[key];
            }
            override.set = set; override.unset = [...unset];
        }
        if (existingIndex >= 0) overrides.splice(existingIndex, 1);
        if (override.remove || Object.keys(override.set ?? {}).length || override.unset?.length) overrides.push(override);
    }
    // Build again through the same public boundary used by runtime and source imports.
    source.project(layout);
    return layout;
}

export function documentChanges(current: import('../LevelDocument').LevelDocument, next: import('../LevelDocument').LevelDocument): LevelChanges {
    const operations: LevelOperation[] = [];
    for (const field of ['id','name','width','height','spawn','exit','gridSize','presentation'] as const) if (!same(current[field], next[field])) operations.push({op: 'set', field, value: next[field]});
    for (const collection of ['terrain','decorations','enemies','npcs','interactables','signs','water','props'] as const) {
        for (const item of current[collection]) if (!next[collection].some(o => o.id === item.id)) operations.push({op: 'remove', collection, id: item.id});
        for (const item of next[collection]) if (!same(current[collection].find(o => o.id === item.id), item)) operations.push({op: 'upsert', collection, value: item as unknown as Record<string, unknown>});
    }
    return {levelId: current.id, baseRevision: current.revision, operations};
}
