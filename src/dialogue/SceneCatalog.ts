import { kineticDemo } from './kineticDemo';
import type { DialogueScene } from './DialogueScene';
import { registryScenes } from './registryScenes';
import { sceneRules } from '../narrative/SceneResolver';

/** Level files reference stable scene IDs, never executable scripts or arbitrary URLs. */
export const sceneCatalog: Readonly<Record<string, DialogueScene>> = {
    'station-exchange': kineticDemo,
    ...registryScenes,
};
export function sceneFor(id: string) { return Object.hasOwn(sceneCatalog, id) ? sceneCatalog[id] : undefined; }
export const conversationChoices:Readonly<Record<string,{title:string}>>={...sceneCatalog,...Object.fromEntries(Object.keys(sceneRules).map(id=>[id,{title:`${id} (fact-driven)`}]))};
