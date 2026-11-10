import {levelCollections} from '../LevelDocument';
import type {LevelLayout} from './LevelLayout';

export function parseLevelLayout(input: unknown): LevelLayout {
    const object = (v: unknown, keys: readonly string[], path: string): Record<string, unknown> => {
        if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error(`${path}: expected an object`);
        for (const k of Object.keys(v)) if (!keys.includes(k)) throw Error(`${path}.${k}: unknown field`);
        return v as Record<string, unknown>;
    };
    const slug = (v: unknown) => { if (typeof v !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(v)) throw Error('Layout needs valid IDs'); };
    const integer = (v: unknown) => { if (!Number.isSafeInteger(v) || Math.abs(v as number) > Number.MAX_SAFE_INTEGER - 1) throw Error('Layout needs safe whole numbers'); };
    const root = object(input, ['version','source','sourceRevision','revision','instances','operations'], 'layout');
    if (root.version !== 1) throw Error('Unsupported layout version');
    slug(root.source); integer(root.sourceRevision); integer(root.revision);
    if ((root.sourceRevision as number) < 0 || (root.revision as number) < 0) throw Error('Invalid layout revision');
    if (!root.instances || typeof root.instances !== 'object' || Array.isArray(root.instances)) throw Error('Layout instances must be an object');
    if (Object.keys(root.instances).length > 1000) throw Error('Too many assembly instances');
    for (const [id, entry] of Object.entries(root.instances)) {
        slug(id);
        const i = object(entry, ['x','y','parameters','children'], `instance ${id}`);
        for (const key of ['x','y']) if (i[key] !== undefined) integer(i[key]);
        if (i.parameters !== undefined) {
            if (!i.parameters || typeof i.parameters !== 'object' || Array.isArray(i.parameters)) throw Error('Invalid assembly parameters');
            for (const v of Object.values(i.parameters)) if (!['number','boolean','string'].includes(typeof v) || typeof v === 'number' && !Number.isFinite(v)) throw Error('Parameters must be finite primitive values');
        }
        if (i.children !== undefined) {
            if (!Array.isArray(i.children) || i.children.length > 1000) throw Error('Invalid child overrides');
            const seen = new Set<string>();
            for (const value of i.children) {
                const c = object(value, ['collection','id','remove','set','unset'], `instance ${id}.child`);
                slug(c.id);
                if (!levelCollections.includes(c.collection as typeof levelCollections[number])) throw Error('Unknown override collection');
                const key = `${c.collection}:${c.id}`;
                if (seen.has(key)) throw Error(`Duplicate child override ${key}`); seen.add(key);
                if (c.remove !== undefined && c.remove !== true) throw Error('remove must be true or omitted');
                if (c.remove && (c.set || c.unset)) throw Error('Removed children cannot have property overrides');
                if (c.set !== undefined) {
                    if (!c.set || typeof c.set !== 'object' || Array.isArray(c.set) || Object.hasOwn(c.set, 'id')) throw Error('Child property overrides cannot change identity');
                }
                if (c.unset !== undefined && (!Array.isArray(c.unset) || !c.unset.every(k => typeof k === 'string' && k !== 'id'))) throw Error('Invalid unset properties');
            }
        }
    }
    if (!Array.isArray(root.operations) || root.operations.length > 1000) throw Error('Layout operations must be a bounded array');
    if (new TextEncoder().encode(JSON.stringify(input)).byteLength > 1_000_000) throw Error('Layout exceeds 1 MB');
    return structuredClone(input) as LevelLayout;
}
