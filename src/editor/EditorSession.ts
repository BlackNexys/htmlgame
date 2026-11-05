import { cloneDocument, type LevelDocument } from '../levels/LevelDocument';
import { applyLevelChanges, type LevelChanges } from '../levels/LevelChanges';
import { parseLevelDocument } from '../levels/LevelValidation';

/** Editor-only history. Snapshots never share mutable state with callers. */
export class EditorSession {
    private current: LevelDocument;
    private past: LevelDocument[] = [];
    private future: LevelDocument[] = [];
    private listeners = new Set<() => void>();

    constructor(document: LevelDocument) { this.current = parseLevelDocument(document); }
    get document() { return cloneDocument(this.current); }
    get canUndo() { return this.past.length > 0; }
    get canRedo() { return this.future.length > 0; }
    subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

    apply(changes: LevelChanges) { this.commit(applyLevelChanges(this.current, changes)); }

    replace(document: LevelDocument, baseRevision: number) {
        if (baseRevision !== this.current.revision || document.id !== this.current.id) throw new Error('Revision conflict: reset the JSON draft or export it before applying to the current level');
        this.commit(parseLevelDocument({...document, revision: this.current.revision + 1}));
    }

    load(document: LevelDocument) {
        this.current = parseLevelDocument(document);
        this.past = []; this.future = [];
        this.emit();
    }

    undo() {
        const previous = this.past.at(-1);
        if (!previous) return;
        const document = parseLevelDocument({...previous, revision: this.current.revision + 1});
        this.past.pop();
        this.future.push(this.document);
        this.current = document;
        this.emit();
    }

    redo() {
        const next = this.future.at(-1);
        if (!next) return;
        const document = parseLevelDocument({...next, revision: this.current.revision + 1});
        this.future.pop();
        this.past.push(this.document);
        this.current = document;
        this.emit();
    }

    private commit(document: LevelDocument) {
        this.past.push(this.document);
        if (this.past.length > 100) this.past.shift();
        this.current = document;
        this.future = [];
        this.emit();
    }
    private emit() { for (const listener of this.listeners) listener(); }
}
