import type { NarrativeState } from './NarrativeState';
export class ObjectiveTracker {
    current(state: NarrativeState) {
        if (state.snapshot().completedStages.includes('narrative-study')) return 'Follow the next line beyond the platform.';
        if (state.has('learned-next-destination')) return 'Open the departure gate and follow the next lead.';
        if (state.has('found-transfer-record')) return 'Decode the route at the terminal, or ask the attendant.';
        if (state.has('learned-about-registry')) return 'Look for a transfer ledger in the Registry.';
        return 'Find a lead: speak with someone, or explore the station.';
    }
}
