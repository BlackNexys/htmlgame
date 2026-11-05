import { formatDocument, type LevelDocument } from '../levels/LevelDocument';
import { parseLevelJson } from '../levels/LevelValidation';

const draftKey = 'underworld-level-editor:v1';
const jsonDraftKey = 'underworld-level-editor-json:v1';
export class EditorFiles {
    restore(): LevelDocument | undefined {
        try { const json = localStorage.getItem(draftKey); return json ? parseLevelJson(json) : undefined; }
        catch { return undefined; }
    }
    saveDraft(document: LevelDocument) {
        try { localStorage.setItem(draftKey, formatDocument(document)); return true; }
        catch { return false; }
    }
    restoreJsonDraft(levelId: string): {json: string; baseRevision: number} | undefined {
        try {
            const value = JSON.parse(localStorage.getItem(jsonDraftKey) || 'null');
            if (value?.levelId === levelId && typeof value.json === 'string' && value.json.length <= 1_000_000 && Number.isSafeInteger(value.baseRevision) && value.baseRevision >= 0) return {json: value.json, baseRevision: value.baseRevision};
        } catch { /* A damaged optional text draft must not prevent opening a valid level. */ }
        return undefined;
    }
    saveJsonDraft(json: string, levelId: string, baseRevision: number) {
        try {
            if (json.length > 1_000_000) return false;
            localStorage.setItem(jsonDraftKey, JSON.stringify({json, levelId, baseRevision})); return true;
        } catch { return false; }
    }
    clearJsonDraft() { try { localStorage.removeItem(jsonDraftKey); } catch { /* Storage is optional. */ } }
    async read(file: File) {
        if (file.size > 1_000_000) throw new Error('Level files must be smaller than 1 MB');
        return parseLevelJson(await file.text());
    }
    download(level: LevelDocument) {
        this.downloadJson(formatDocument(level), `${level.id}.json`);
    }
    downloadJson(json: string, filename: string) {
        const url = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
        const link = document.createElement('a');
        link.href = url; link.download = filename; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

