import { facts, milestones, keepsakes, stages, freshCampaign, type CampaignSave } from './NarrativeCatalog';

interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void; }
const key = 'underworld-campaign:v1';
const fields = ['version','facts','milestones','keepsakes','unlockedStages','completedStages','unlockedWeapons','discoveredModifiers'];
export function parseCampaign(value: unknown): CampaignSave {
    const data = value as CampaignSave;
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== 1 || Object.keys(data).some(k => !fields.includes(k))) throw Error('Unsupported campaign save');
    const catalogs = {facts, milestones, keepsakes, unlockedStages: stages, completedStages: stages};
    for (const field of fields.slice(1) as (keyof Omit<CampaignSave,'version'>)[]) {
        const list = data[field];
        if (!Array.isArray(list) || list.length > 1000 || new Set(list).size !== list.length ||
            !list.every(id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(id))) throw Error('Invalid campaign collection');
        if (Object.hasOwn(catalogs, field) && !list.every(id => Object.hasOwn(catalogs[field as keyof typeof catalogs],id))) throw Error('Unknown campaign discovery');
    }
    if (!data.unlockedStages.includes('narrative-study') || !data.completedStages.every(id => data.unlockedStages.includes(id))) throw Error('Invalid stage progress');
    const normalized = structuredClone(data);
    // Additive v1 catalog extension: preserve every existing discovery and stage.
    if (!normalized.unlockedStages.includes('last-platform-demo')) normalized.unlockedStages.push('last-platform-demo');
    return normalized;
}

/** One atomic localStorage value. Invalid/future saves are preserved until explicit reset. */
export class SaveStore {
    warning = '';
    private protected = false;
    constructor(private readonly storage?: StorageAdapter) {}
    static browser() { try { return new SaveStore(window.localStorage); } catch { return new SaveStore(); } }
    load(): CampaignSave {
        if (!this.storage) { this.warning = 'Journey storage is unavailable. Progress will last for this session.'; return freshCampaign(); }
        try {
            const raw = this.storage.getItem(key);
            if (!raw) return freshCampaign();
            if (raw.length > 200000) throw Error('Save too large');
            return parseCampaign(JSON.parse(raw));
        } catch {
            this.protected = true;
            this.warning = 'The saved journey could not be read and has been preserved. New progress is in memory; reset it in Journey to start a new save.';
            return freshCampaign();
        }
    }
    save(data: CampaignSave) {
        const valid = parseCampaign(data);
        if (this.protected) return false;
        try {
            if (!this.storage) throw Error('Storage unavailable');
            this.storage.setItem(key, JSON.stringify(valid)); this.warning = ''; return true;
        } catch { this.warning = 'The journey could not be saved. Progress is still available for this session; reloading or changing stages may lose it.'; return false; }
    }
    reset() { this.protected = false; const data = freshCampaign(); this.save(data); return data; }
}
