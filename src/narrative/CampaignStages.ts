import type {Stage} from './NarrativeCatalog';
import type {StoryDefinition} from './StoryCatalog';
export interface CampaignStage {
    story: StoryDefinition; arrivalEffect?: string; completionEffect: string;
    exitCondition?: string; exitObject?: string; next?: Stage;
    completionCopy?: {title: string; message: string};
}
/** The level reset intentionally leaves no playable campaign chapters registered. */
export function campaignStage(_id: string): CampaignStage | undefined { return undefined; }
