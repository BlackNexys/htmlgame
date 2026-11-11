import {cloneDocument, type LevelDocument} from '../levels/LevelDocument';
import {applyLevelChanges, type LevelChanges} from '../levels/LevelChanges';
import {parseLevelDocument} from '../levels/LevelValidation';
import type {LevelSource} from '../levels/source/LevelSource';
import type {LevelLayout, InstanceLayout, AssemblyInstanceView} from '../levels/source/LevelLayout';
import {editSourceLayout, documentChanges} from '../levels/source/SourceEdits';

interface Snapshot {document: LevelDocument; source?: LevelSource; layout?: LevelLayout; instances?: AssemblyInstanceView[];}
/** A history entry keeps source identity and authoring deltas alongside its validated preview. */
export class EditorSession {
    private current: Snapshot;
    private past: Snapshot[] = [];
    private future: Snapshot[] = [];
    private listeners = new Set<() => void>();
    constructor(document: LevelDocument) { this.current = {document: parseLevelDocument(document)}; }
    get document() { return cloneDocument(this.current.document); }
    get source() { return this.current.source; }
    get layout() { return this.current.layout ? structuredClone(this.current.layout) : undefined; }
    get instances() { return this.current.source ? structuredClone(this.current.instances ??= this.current.source.project(this.current.layout).instances) : []; }
    get canUndo() { return this.past.length > 0; }
    get canRedo() { return this.future.length > 0; }
    subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
    private snapshot(): Snapshot { return {document: this.document, source: this.source, layout: this.layout}; }
    apply(changes: LevelChanges) {
        if (this.source && this.current.layout) {
            const layout = editSourceLayout(this.source, this.current.layout, changes);
            this.commit({document: this.source.document(layout), source: this.source, layout});
        } else this.commit({document: applyLevelChanges(this.document, changes)});
    }
    configureInstance(id: string, edit: InstanceLayout, baseRevision: number) {
        this.changeLayout(baseRevision, layout => {
            if (!this.instances.some(i => i.id === id)) throw Error(`Unknown assembly instance ${id}`);
            const previous = layout.instances[id] ?? {};
            layout.instances[id] = {...previous, ...structuredClone(edit), parameters: {...previous.parameters, ...edit.parameters}};
        });
    }
    resetOverride(instance: string, child: string | undefined, baseRevision: number) {
        this.changeLayout(baseRevision, layout => {
            const owner = this.instances.find(i => i.id === instance);
            if (!owner) throw Error(`Unknown assembly instance ${instance}`);
            if (child && !Object.values(owner.objects).flat().some(o => o.id === child)) throw Error(`Unknown assembly child ${child}`);
            if (!child) delete layout.instances[instance];
            else if (layout.instances[instance]) layout.instances[instance].children = layout.instances[instance].children?.filter(c => c.id !== child);
        });
    }
    private changeLayout(baseRevision: number, edit: (layout: LevelLayout) => void) {
        if (!this.source || !this.current.layout) throw Error('Open a level source to edit assemblies');
        if (baseRevision !== this.document.revision) throw Error('Revision conflict: layout changed');
        const layout = this.layout!; edit(layout); layout.revision = baseRevision + 1;
        this.commit({source: this.source, layout, document: this.source.document(layout)});
    }
    replace(document: LevelDocument, baseRevision: number) {
        if (baseRevision !== this.document.revision || document.id !== this.document.id) throw Error('Revision conflict: reset the JSON draft or export it before applying to the current level');
        const checked = parseLevelDocument(document);
        if (this.source) {
            const changes = documentChanges(this.document, checked);
            if (changes.operations.length) this.apply(changes);
        } else this.commit({document: parseLevelDocument({...checked, revision: baseRevision + 1})});
    }
    load(document: LevelDocument) {
        this.current = {document: parseLevelDocument(document)}; this.past = []; this.future = []; this.emit();
    }
    loadSource(source: LevelSource, layout: LevelLayout = source.layout) {
        const document = source.document(layout);
        this.current = {source, layout: structuredClone(layout), document}; this.past = []; this.future = []; this.emit();
    }
    private revised(snapshot: Snapshot): Snapshot {
        const revision = this.document.revision + 1;
        if (snapshot.source && snapshot.layout) {
            const layout = {...structuredClone(snapshot.layout), revision};
            return {source: snapshot.source, layout, document: snapshot.source.document(layout)};
        }
        return {document: parseLevelDocument({...snapshot.document, revision})};
    }
    undo() {
        const previous = this.past.at(-1); if (!previous) return;
        const next = this.revised(previous); this.past.pop(); this.future.push(this.snapshot()); this.current = next; this.emit();
    }
    redo() {
        const future = this.future.at(-1); if (!future) return;
        const next = this.revised(future); this.future.pop(); this.past.push(this.snapshot()); this.current = next; this.emit();
    }
    private commit(snapshot: Snapshot) {
        this.past.push(this.snapshot()); if (this.past.length > 100) this.past.shift();
        this.current = snapshot; this.future = []; this.emit();
    }
    private emit() { for (const listener of this.listeners) listener(); }
}
