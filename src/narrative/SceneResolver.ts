import { conditionMet } from './Conditions';
import type { NarrativeState } from './NarrativeState';

export const sceneRules = {
    'registry-attendant': [
        {when: 'knows-destination', scene: 'attendant-farewell'},
        {when: 'has-record', scene: 'attendant-record'},
        {when: 'knows-registry', scene: 'attendant-directions'},
        {scene: 'attendant-introduction'},
    ],
} as const;
export class SceneResolver {
    resolve(id: string, state: NarrativeState): string {
        if (!Object.hasOwn(sceneRules,id)) return id;
        const rules: readonly {when?: string; scene: string}[] = sceneRules[id as keyof typeof sceneRules];
        return rules.find(rule => conditionMet(rule.when,state))!.scene;
    }
}
