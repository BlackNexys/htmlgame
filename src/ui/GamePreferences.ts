export type MenuMotion = 'system' | 'animated' | 'still';
export interface GamePreferencesValue { muted: boolean; showHints: boolean; menuMotion: MenuMotion; }
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;
const key = 'underworld-preferences:v1';

export class GamePreferences {
    private current: GamePreferencesValue = {muted: false, showHints: true, menuMotion: 'system'};
    private readonly storage?: PreferenceStorage;
    constructor(storage?: PreferenceStorage) {
        try {
            this.storage = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
            const value = JSON.parse(this.storage?.getItem(key) || 'null');
            if (typeof value?.muted === 'boolean') this.current.muted = value.muted;
            if (typeof value?.showHints === 'boolean') this.current.showHints = value.showHints;
            if (['system','animated','still'].includes(value?.menuMotion)) this.current.menuMotion = value.menuMotion;
        } catch { /* Preferences remain usable when browser storage is unavailable. */ }
    }
    get value() { return {...this.current}; }
    update(value: Partial<GamePreferencesValue>) {
        if (typeof value.muted === 'boolean') this.current.muted = value.muted;
        if (typeof value.showHints === 'boolean') this.current.showHints = value.showHints;
        if (value.menuMotion && ['system','animated','still'].includes(value.menuMotion)) this.current.menuMotion = value.menuMotion;
        try { this.storage?.setItem(key, JSON.stringify(this.current)); } catch { /* Session preferences still apply. */ }
        return this.value;
    }
}
