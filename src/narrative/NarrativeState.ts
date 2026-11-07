import { freshCampaign, type CampaignSave, type Fact, type Keepsake } from './NarrativeCatalog';

/** Campaign knowledge is distinct from an actor's current-attempt conversation count. */
export class NarrativeState {
    private data: CampaignSave;
    constructor(save = freshCampaign()) { this.data = structuredClone(save); }
    has(fact: Fact) { return this.data.facts.includes(fact); }
    owns(keepsake: Keepsake) { return this.data.keepsakes.includes(keepsake); }
    snapshot(): CampaignSave { return structuredClone(this.data); }
    replace(save: CampaignSave) { this.data = structuredClone(save); }
}
