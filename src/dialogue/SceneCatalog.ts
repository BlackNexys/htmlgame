import { kineticDemo } from './kineticDemo';
import type { DialogueScene } from './DialogueScene';

/** Level files reference stable scene IDs, never executable scripts or arbitrary URLs. */
export const sceneCatalog: Readonly<Record<string, DialogueScene>> = {
    'station-exchange': kineticDemo,
};
export function sceneFor(id: string) { return Object.hasOwn(sceneCatalog, id) ? sceneCatalog[id] : undefined; }
