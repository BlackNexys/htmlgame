import type {SceneObjects} from './SceneAssembly';
import type {ChildOverride} from './LevelLayout';

export function applyChildOverrides(objects: SceneObjects, overrides: readonly ChildOverride[] = []): SceneObjects {
    const result = structuredClone(objects);
    for (const override of overrides) {
        const entries = result[override.collection] as unknown as Record<string, unknown>[];
        const index = entries.findIndex(item => item.id === override.id);
        if (index < 0) throw Error(`Override targets missing child ${override.id}`);
        if (override.remove) entries.splice(index, 1);
        else {
            entries[index] = {...entries[index], ...override.set};
            for (const key of override.unset ?? []) delete entries[index][key];
        }
    }
    return result;
}
