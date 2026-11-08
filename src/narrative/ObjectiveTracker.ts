import type { NarrativeState } from './NarrativeState';
import { studyStory, type StoryDefinition } from './StoryCatalog';
export class ObjectiveTracker {
    current(state: NarrativeState, story: StoryDefinition = studyStory) {
        if (state.snapshot().completedStages.includes(story.start)) return story.completedLead;
        if (state.has(story.facts.destination)) return 'Open the departure gate and follow the next lead.';
        if (state.has(story.facts.record)) return 'Decode the route at the terminal, or ask the attendant.';
        if (state.has(story.facts.registry)) return 'Look for a transfer ledger in the Registry.';
        return 'Find a lead: speak with someone, or explore the station.';
    }
}
