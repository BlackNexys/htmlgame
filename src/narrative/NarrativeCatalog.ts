/** Prototype evidence, not a declaration of the final story or metaphysics. */
export const facts = {
    'arrived-at-last-platform': 'Reached the station.',
    'met-rail-attendant': 'Met the railway attendant.',
    'learned-about-registry': 'Arrival records are kept in the Registry.',
    'found-transfer-record': 'A transfer was recorded under the traveller’s partner’s name.',
    'learned-next-destination': 'The recorded route points to the next railway destination.',
    'platform-arrival': 'Reached the Last Platform.',
    'platform-met-attendant': 'Met the Last Platform attendant.',
    'platform-knows-registry': 'Take the upper viaduct east and follow the Registry signs to the reading gallery. The transfer ledger is at the east desk; freight also has a Registry stair.',
    'platform-found-transfer': 'Her name appears in a recorded S-17 transfer. Authorization is redacted.',
    'platform-knows-destination': 'S-17 points beyond the Last Platform; the departure shutter can be released.',
};
export const milestones = {'registry-investigated': 'Investigated the Registry.', 'platform-registry-investigated': 'Found an onward lead in the Registry.'};
export const keepsakes = {'lost-letter': 'An unfinished letter', 'platform-letter': 'An unfinished letter · Last Platform'};
export const stages = {
    'narrative-study': 'The station · narrative prototype',
    'departure-study': 'Beyond the platform · prototype',
    'last-platform-demo': '01 · The Last Platform',
    'outbound-line': 'S-17 · beyond the Last Platform',
};
export type Fact = keyof typeof facts;
export type Milestone = keyof typeof milestones;
export type Keepsake = keyof typeof keepsakes;
export type Stage = keyof typeof stages;
export interface CampaignSave {
    version: 1; facts: Fact[]; milestones: Milestone[]; keepsakes: Keepsake[];
    unlockedStages: Stage[]; completedStages: Stage[]; unlockedWeapons: string[]; discoveredModifiers: string[];
}
export function freshCampaign(): CampaignSave {
    return {version: 1, facts: [], milestones: [], keepsakes: [], unlockedStages: ['narrative-study','last-platform-demo'], completedStages: [], unlockedWeapons: ['flicker'], discoveredModifiers: []};
}
