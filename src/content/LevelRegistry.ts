import type {LevelLayout} from '../levels/source/LevelLayout';
import {LevelSource} from '../levels/source/LevelSource';
/** Build-owned imports only. New modules need no registry edit. */
const modules = import.meta.glob<{default: LevelSource}>('./levels/*.level.ts');
const layouts = import.meta.glob<{default: LevelLayout}>('./levels/*.layout.ts');
export const levelSourceIds = Object.keys(modules).map(path => path.slice('./levels/'.length, -'.level.ts'.length)).sort();
export async function loadLevelSource(id: string): Promise<LevelSource> {
    if (!/^[a-z][a-z0-9-]{0,79}$/.test(id)) throw new Error('Invalid level ID');
    const load = modules[`./levels/${id}.level.ts`];
    if (!load) throw new Error(`No authored level named ${id}. Open the workshop to create a new layout.`);
    const source = (await load()).default;
    if (!(source instanceof LevelSource) || source.id !== id) throw new Error(`Level module ${id} must default-export a matching defineLevel source`);
    const companion = layouts[`./levels/${id}.layout.ts`];
    return companion ? source.withLayout((await companion()).default) : source;
}
