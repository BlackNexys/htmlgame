import type { NarrativeState } from './NarrativeState';
export const conditions = {
    'knows-registry': (s: NarrativeState) => s.has('learned-about-registry'),
    'has-record': (s: NarrativeState) => s.has('found-transfer-record'),
    'knows-destination': (s: NarrativeState) => s.has('learned-next-destination'),
};
export function conditionMet(id: string | undefined, state: NarrativeState) {
    return id === undefined || Object.hasOwn(conditions,id) && conditions[id as keyof typeof conditions](state);
}
