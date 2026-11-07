/** Prototype evidence, not a declaration of the final story or metaphysics. */
export const facts = {
    'arrived-at-last-platform': 'Reached the station.',
    'met-rail-attendant': 'Met the railway attendant.',
    'learned-about-registry': 'Arrival records are kept in the Registry.',
    'found-transfer-record': 'A transfer was recorded under the traveller’s partner’s name.',
    'learned-next-destination': 'The recorded route points to the next railway destination.',
};
export const milestones = {'registry-investigated': 'Investigated the Registry.'};
export const keepsakes = {'lost-letter': 'An unfinished letter'};
export const stages = {'narrative-study': 'The station · narrative prototype', 'departure-study': 'Beyond the platform · prototype'};
export type Fact = keyof typeof facts;
export type Milestone = keyof typeof milestones;
export type Keepsake = keyof typeof keepsakes;
export type Stage = keyof typeof stages;
export interface CampaignSave {
    version: 1; facts: Fact[]; milestones: Milestone[]; keepsakes: Keepsake[];
    unlockedStages: Stage[]; completedStages: Stage[]; unlockedWeapons: string[]; discoveredModifiers: string[];
}
export function freshCampaign(): CampaignSave {
    return {version: 1, facts: [], milestones: [], keepsakes: [], unlockedStages: ['narrative-study'], completedStages: [], unlockedWeapons: ['flicker'], discoveredModifiers: []};
}
