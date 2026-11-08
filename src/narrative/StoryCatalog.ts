import type { Fact, Keepsake, Milestone, Stage } from './NarrativeCatalog';

/** Stories share mechanics, while their evidence stays independent of test fixtures. */
export interface StoryDefinition {
    start: Stage;
    facts: { arrival: Fact; met: Fact; registry: Fact; record: Fact; destination: Fact };
    milestones: readonly Milestone[];
    keepsakes: readonly Keepsake[];
    completedLead: string;
    lockedCard: string;
}
export const studyStory: StoryDefinition = {
    start: 'narrative-study',
    facts: { arrival:'arrived-at-last-platform', met:'met-rail-attendant', registry:'learned-about-registry', record:'found-transfer-record', destination:'learned-next-destination' },
    milestones: ['registry-investigated'], keepsakes: ['lost-letter'],
    completedLead: 'Follow the next line beyond the platform.',
    lockedCard:'locked-card',
};
export const lastPlatformStory: StoryDefinition = {
    start: 'last-platform-demo',
    facts: { arrival:'platform-arrival', met:'platform-met-attendant', registry:'platform-knows-registry', record:'platform-found-transfer', destination:'platform-knows-destination' },
    milestones: ['platform-registry-investigated'], keepsakes: ['platform-letter'],
    completedLead: 'S-17 is open. The journey continues beyond this demo.',
    lockedCard:'platform-locked-card',
};
