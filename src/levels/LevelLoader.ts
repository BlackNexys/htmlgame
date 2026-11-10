import { parseLevelJson } from './LevelValidation';
import { compileLevel } from './LevelCompiler';
import type { LevelDocument } from './LevelDocument';

export class LevelLoader {
    async document(id: string, signal?: AbortSignal): Promise<LevelDocument> {
        if (!/^[a-z][a-z0-9-]{0,79}$/.test(id)) throw new Error('Invalid level ID');
        const {loadLevelSource} = await import('../content/LevelRegistry');
        if (signal?.aborted) throw signal.reason;
        const level = (await loadLevelSource(id)).document();
        if (signal?.aborted) throw signal.reason;
        if (level.id !== id) throw new Error(`Level ID mismatch: expected ${id}, received ${level.id}`);
        return level;
    }

    async load(id: string, signal?: AbortSignal) { return compileLevel(await this.document(id, signal)); }

    async documentFromURL(source: string, signal?: AbortSignal): Promise<LevelDocument> {
        const url = new URL(source, document.baseURI);
        if (url.origin !== location.origin || !['http:', 'https:', 'blob:'].includes(url.protocol)) throw new Error('Level URLs must use this application\'s origin');
        const response = await fetch(url, {signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)});
        if (!response.ok) throw new Error(`Could not load level (HTTP ${response.status})`);
        return parseLevelJson(await response.text());
    }

    async loadURL(source: string, signal?: AbortSignal) { return compileLevel(await this.documentFromURL(source, signal)); }
}
