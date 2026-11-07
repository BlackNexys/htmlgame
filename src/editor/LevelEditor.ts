import { EditorSession } from './EditorSession';
import { EditorCanvas, type EditorTool } from './EditorCanvas';
import { EditorInspector } from './EditorInspector';
import { EditorFiles } from './EditorFiles';
import { EditorPreview } from './EditorPreview';
import { createBlankLevel } from './createBlankLevel';
import { selectedObject, type EditorSelection } from './EditorSelection';
import { formatDocument, type LevelDocument } from '../levels/LevelDocument';
import type { LevelChanges, LevelOperation } from '../levels/LevelChanges';
import { parseLevelJson } from '../levels/LevelValidation';
import { LevelLoader } from '../levels/LevelLoader';
import type { EnemyKind } from '../interfaces/Enemy';
import type { NPCKind } from '../interfaces/NPC';
import { npcCatalog } from '../game/NPCCatalog';
import { conversationChoices } from '../dialogue/SceneCatalog';
import { interactionPresets } from '../narrative/InteractionPresets';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export interface LevelEditorAPI {
    getDocument(): LevelDocument;
    applyChanges(changes: LevelChanges): LevelDocument;
    getSelection(): EditorSelection;
    select(selection: EditorSelection): void;
}
declare global { interface Window { levelEditor?: LevelEditorAPI; } }

export class LevelEditor {
    private readonly files = new EditorFiles();
    private readonly session: EditorSession;
    private readonly canvas: EditorCanvas;
    private readonly inspector: EditorInspector;
    private readonly json = element<HTMLTextAreaElement>('level-json');
    private readonly status = element<HTMLElement>('editor-status');
    private selection: EditorSelection;
    private jsonDirty = false;
    private draftRevision = 0;
    private pendingProperties = false;
    private editEpoch = 0;

    constructor(initial: LevelDocument) {
        this.session = new EditorSession(initial);
        const savedJson = this.files.restoreJsonDraft(initial.id);
        if (savedJson) { this.jsonDirty = true; this.json.value = savedJson.json; this.draftRevision = savedJson.baseRevision; }
        const edit = (operations: LevelOperation[]) => this.edit(operations);
        this.canvas = new EditorCanvas(element('level-canvas'), initial, edit, selection => this.select(selection), message => this.report(message, true));
        this.inspector = new EditorInspector(element('object-properties'), element('object-list'), operations => this.run(() => edit(operations)), selection => this.select(selection));
        const preview = new EditorPreview(element('playtest-dialog'), element('playtest-frame'));
        element('playtest').onclick = () => this.run(() => preview.open(this.session.document));
        element('close-playtest').onclick = () => element<HTMLDialogElement>('playtest-dialog').close();
        element('undo').onclick = () => this.run(() => this.session.undo());
        element('redo').onclick = () => this.run(() => this.session.redo());
        element('delete-object').onclick = () => this.run(() => this.inspector.remove());
        element('export-level').onclick = () => this.files.download(this.session.document);
        element('export-draft').onclick = () => this.files.downloadJson(this.json.value, `${this.session.document.id}.draft.json`);
        element('reset-properties').onclick = () => this.render();
        element('new-level').onclick = () => this.run(() => this.load(createBlankLevel()));
        element('open-level').onclick = () => element<HTMLInputElement>('level-file').click();
        element<HTMLInputElement>('level-file').onchange = event => {
            const input = event.currentTarget as HTMLInputElement;
            const file = input.files?.[0];
            if (file) {
                const revision = this.session.document.revision, id = this.session.document.id, epoch = this.editEpoch;
                void this.files.read(file).then(document => {
                    if (this.session.document.revision !== revision || this.session.document.id !== id || epoch !== this.editEpoch) throw new Error('The draft changed while opening the file. Open it again to replace the draft.');
                    this.load(document);
                }).catch(error => this.report(String(error), true));
            }
            input.value = '';
        };
        element('load-example').onclick = () => {
            const revision = this.session.document.revision, id = this.session.document.id, epoch = this.editEpoch;
            void new LevelLoader().document('lower-passage').then(document => {
                if (this.session.document.revision !== revision || this.session.document.id !== id || epoch !== this.editEpoch) throw new Error('The draft changed while loading. Click Load example again to replace it.');
                this.load(document);
            }).catch(error => this.report(String(error), true));
        };
        this.json.addEventListener('input', () => {
            this.editEpoch++; this.jsonDirty = true; this.updateDraftLabel();
            if (!this.files.saveJsonDraft(this.json.value, this.session.document.id, this.draftRevision)) this.report('JSON text could not be saved locally. Download the JSON draft to preserve it.', true);
        });
        element('apply-json').onclick = () => this.run(() => {
            const document = parseLevelJson(this.json.value);
            if (document.revision !== this.draftRevision) throw new Error('Keep the draft revision unchanged; it identifies the snapshot being edited');
            this.session.replace(document, this.draftRevision);
            this.jsonDirty = false; this.syncJson();
        });
        element('reset-json').onclick = () => { this.jsonDirty = false; this.syncJson(); };
        element<HTMLFormElement>('level-properties').onsubmit = event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget as HTMLFormElement);
            this.run(() => this.edit(['id', 'name', 'width', 'height'].map(field => ({op: 'set', field: field as 'id' | 'name' | 'width' | 'height', value: field === 'width' || field === 'height' ? Number(data.get(field)) : String(data.get(field))}))));
        };
        for (const button of document.querySelectorAll<HTMLElement>('[data-tool]')) {
            button.onclick = () => {
                this.canvas.tool = button.dataset.tool as EditorTool;
                for (const tool of document.querySelectorAll('[data-tool]')) tool.setAttribute('aria-pressed', String(tool === button));
                element('tool-help').textContent = this.canvas.tool === 'select'
                    ? 'Click an object to select it. Drag to move in 48-pixel steps; use the inspector for exact positions.'
                    : this.canvas.tool === 'terrain' || this.canvas.tool === 'decorations'
                        ? 'Drag a rectangle on the grid. Terrain blocks movement; decoration is visual only.'
                        : 'Click to place. Actor positions mark the feet; place them on top of a platform.';
            };
        }
        element<HTMLSelectElement>('enemy-kind').onchange = event => { this.canvas.enemy = (event.currentTarget as HTMLSelectElement).value as EnemyKind; };
        element<HTMLSelectElement>('npc-kind').replaceChildren(...Object.entries(npcCatalog).map(([id, info]) => new Option(info.name, id)));
        element<HTMLSelectElement>('npc-scene').replaceChildren(...Object.entries(conversationChoices).map(([id, scene]) => new Option(`${id} · ${scene.title}`, id)));
        element<HTMLSelectElement>('interaction-preset').replaceChildren(...Object.entries(interactionPresets).map(([id,preset])=>new Option(preset.label,id)));
        element<HTMLSelectElement>('interaction-preset').onchange=event=>{this.canvas.interactionPreset=(event.currentTarget as HTMLSelectElement).value;};
        element<HTMLSelectElement>('npc-kind').onchange = event => { this.canvas.npc = (event.currentTarget as HTMLSelectElement).value as NPCKind; };
        element<HTMLSelectElement>('npc-scene').onchange = event => { this.canvas.scene = (event.currentTarget as HTMLSelectElement).value; };
        element<HTMLSelectElement>('zoom').onchange = event => { this.canvas.setZoom(Number((event.currentTarget as HTMLSelectElement).value)); this.syncZoom(); };
        element('fit-map').onclick = () => { this.canvas.fit(); this.syncZoom(); };
        for (const id of ['level-properties', 'object-properties']) element(id).addEventListener('input', () => { this.editEpoch++; this.pendingProperties = true; });
        document.addEventListener('keydown', event => this.keyDown(event));
        this.session.subscribe(() => this.render());
        window.levelEditor = Object.freeze({
            getDocument: () => this.session.document,
            applyChanges: changes => {
                if (this.pendingProperties) throw new Error('Apply or reset pending property edits before an AI patch');
                this.session.apply(changes); return this.session.document;
            },
            getSelection: () => typeof this.selection === 'object' ? {...this.selection} : this.selection,
            select: selection => this.select(selection),
        } satisfies LevelEditorAPI);
        this.render();
    }

    private load(document: LevelDocument) { this.files.clearJsonDraft(); this.jsonDirty = false; this.selection = undefined; this.session.load(document); this.report(`Opened ${document.name}. Changes are saved as a local draft; export JSON to share.`); }
    private edit(operations: LevelOperation[]) {
        const document = this.session.document;
        this.session.apply({levelId: document.id, baseRevision: document.revision, operations});
    }
    private select(selection: EditorSelection) {
        if (selection && !selectedObject(this.session.document, selection)) throw new Error('Selected object does not exist');
        this.selection = selection; this.canvas.selection = selection; this.canvas.draw();
        this.inspector.update(this.session.document, selection);
        element<HTMLElementTagNameMap['bl-button']>('delete-object').disabled = typeof selection !== 'object';
    }
    private render() {
        const document = this.session.document;
        this.pendingProperties = false;
        if (this.selection && !selectedObject(document, this.selection)) this.selection = undefined;
        this.canvas.selection = this.selection; this.canvas.update(document);
        this.syncZoom();
        this.inspector.update(document, this.selection);
        element<HTMLElementTagNameMap['bl-button']>('undo').disabled = !this.session.canUndo;
        element<HTMLElementTagNameMap['bl-button']>('redo').disabled = !this.session.canRedo;
        element<HTMLElementTagNameMap['bl-button']>('delete-object').disabled = typeof this.selection !== 'object';
        element('revision').textContent = `Revision ${document.revision}`;
        const form = element<HTMLFormElement>('level-properties');
        for (const name of ['id', 'name', 'width', 'height'] as const) (form.elements.namedItem(name) as HTMLInputElement).value = String(document[name]);
        const stored = this.files.saveDraft(document);
        this.report(stored ? 'Valid level · local draft saved' : 'Valid level · browser storage unavailable; export JSON to keep your work', !stored);
        if (!this.jsonDirty) this.syncJson();
        else { this.updateDraftLabel(); this.files.saveJsonDraft(this.json.value, document.id, this.draftRevision); }
    }
    private syncJson() { const document = this.session.document; this.files.clearJsonDraft(); this.json.value = formatDocument(document); this.draftRevision = document.revision; this.updateDraftLabel(); }
    private syncZoom() {
        const input = element<HTMLSelectElement>('zoom'), value = String(this.canvas.scale);
        if (![...input.options].some(option => option.value === value)) {
            input.querySelector('[data-custom]')?.remove();
            const option = new Option(`${Math.round(this.canvas.scale * 100)}%`, value); option.dataset.custom = 'true'; input.add(option);
        }
        input.value = value;
    }
    private updateDraftLabel() {
        element('json-status').textContent = this.jsonDirty ? `Unapplied JSON from revision ${this.draftRevision} · current revision ${this.session.document.revision}` : `JSON matches revision ${this.draftRevision}`;
    }
    private report(message: string, error = false) { this.status.textContent = message; this.status.dataset.error = String(error); }
    private run(action: () => void) { try { action(); } catch (error) { this.report(error instanceof Error ? error.message : 'Could not complete the action', true); } }
    private keyDown(event: KeyboardEvent) {
        if (element<HTMLDialogElement>('playtest-dialog').open) return;
        if (event.composedPath().some(target => target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable))) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); this.run(() => { if (event.shiftKey) this.session.redo(); else this.session.undo(); }); }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); this.run(() => this.session.redo()); }
        if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); this.run(() => this.inspector.remove()); }
    }
}
