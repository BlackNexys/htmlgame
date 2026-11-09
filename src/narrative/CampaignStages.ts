import type { Stage } from './NarrativeCatalog';
import { studyStory, lastPlatformStory, type StoryDefinition } from './StoryCatalog';

export interface CampaignStage {
    story: StoryDefinition;
    arrivalEffect?: string;
    completionEffect: string;
    exitCondition?: string;
    exitObject?: string;
    next?: Stage;
    completionCopy?: { title: string; message: string };
}

/** Only playable chapters are registered here. Unbuilt destinations have no navigation link. */
const campaignStages: Partial<Record<Stage, CampaignStage>> = {
    'narrative-study': {
        story: studyStory, arrivalEffect:'arrive-station', completionEffect:'complete-opening',
        exitCondition:'knows-destination', next:'departure-study',
    },
    'departure-study': { story:studyStory, completionEffect:'complete-departure' },
    'last-platform-demo': {
        story:lastPlatformStory, arrivalEffect:'platform-arrive', completionEffect:'platform-complete',
        exitCondition:'platform-has-destination', exitObject:'departure-shutter', next:'outbound-line',
        completionCopy: {
            title: 'A lead, not an answer',
            message: 'The Last Platform is behind you. S-17 leads onward. The journey continues beyond this demo.',
        },
    },
};
export function campaignStage(id: string): CampaignStage | undefined {
    if(id==='last-platform-rebuild')return campaignStages['last-platform-demo'];
    return Object.hasOwn(campaignStages,id) ? campaignStages[id as Stage] : undefined;
}
