import {levelCollections, type LevelPoint} from '../LevelDocument';
import type {SceneObjects} from './SceneAssembly';
/** Translate unmounted children once; attachments inherit translation from parents. */
export function placeScene(objects: SceneObjects, instance: string, origin: LevelPoint): SceneObjects {
    if (!/^[a-z][a-z0-9-]*$/.test(instance) || instance.includes('--')) throw new Error('Assembly instance needs a slug without double hyphens');
    if (![origin.x, origin.y].every(Number.isSafeInteger)) throw new Error('Assembly origin must use whole pixels');
    const result = structuredClone(objects), children = new Set<string>();
    for (const c of levelCollections) for (const child of result[c]) {
        if (children.has(child.id)) throw new Error(`Duplicate assembly child: ${child.id}`);
        children.add(child.id);
    }
    const reference = (id: string) => {
        if (!children.has(id)) throw new Error(`Assembly ${instance}: missing local child ${id}`);
        return `${instance}--${id}`;
    };
    for (const collection of levelCollections) for (const item of result[collection]) {
        item.id = reference(item.id);
        if (!('mount' in item && item.mount) && !('from' in item)) { item.x += origin.x; item.y += origin.y; }
        if ('mount' in item && item.mount) item.mount.parent = reference(item.mount.parent);
        if ('from' in item) item.from.parent = reference(item.from.parent);
        if ('to' in item) item.to = reference(item.to);
        if ('patrol' in item) { item.patrol.left += origin.x; item.patrol.right += origin.x; }
    }
    return result;
}
