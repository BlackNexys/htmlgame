import {AssemblyInspector} from './AssemblyInspector';
import {assemblyBounds} from './AssemblyBounds';
import type {LevelSource} from '../levels/source/LevelSource';
import type {LevelLayout, InstanceLayout} from '../levels/source/LevelLayout';
import { EditorSession } from './EditorSession';
import { EditorCanvas, type EditorTool } from './EditorCanvas';
import { EditorInspector } from './EditorInspector';
import { EditorFiles } from './EditorFiles';
import { EditorPreview } from './EditorPreview';
import { createBlankLevel } from './createBlankLevel';
import { selectedObject, type EditorSelection } from './EditorSelection';
import { formatDocument,levelCollections, type LevelDocument } from '../levels/LevelDocument';
import type { LevelChanges, LevelOperation } from '../levels/LevelChanges';
import { parseLevelJson } from '../levels/LevelValidation';
import {levelSourceIds, loadLevelSource} from '../content/LevelRegistry';
import {selectionBounds} from './EditorSelection';
import type { EnemyKind } from '../interfaces/Enemy';
import type { NPCKind } from '../interfaces/NPC';
import { npcCatalog } from '../game/NPCCatalog';
import { conversationChoices } from '../dialogue/SceneCatalog';
import { interactionPresets } from '../narrative/InteractionPresets';
import {structureKinds,type StructureKind} from '../world/structures/StructureDefinition';
import type {WaterDefinition} from '../world/water/WaterDefinition';
import {sceneArt} from '../world/props/SceneArtCatalog';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export interface LevelEditorAPI {
    getDocument(): LevelDocument;
    applyChanges(changes: LevelChanges): LevelDocument;
    getLayout(): LevelLayout | undefined;
    configureAssembly(id: string, edit: InstanceLayout, baseRevision: number): void;
    resetAssembly(id: string, child: string | undefined, baseRevision: number): void;
    selectAssembly(id: string): void;
    getSelection(): EditorSelection;
    select(selection: EditorSelection): void;
}
declare global { interface Window { levelEditor?: LevelEditorAPI; } }

export class LevelEditor {
    private readonly files = new EditorFiles();
    private readonly session: EditorSession;
    private readonly canvas: EditorCanvas;
    private readonly inspector: EditorInspector;
    private readonly assemblies: AssemblyInspector;
    private readonly json = element<HTMLTextAreaElement>('level-json');
    private readonly status = element<HTMLElement>('editor-status');
    private selection: EditorSelection;
    private jsonDirty = false;
    private draftRevision = 0;
    private pendingProperties = false;
    private editEpoch = 0;

    constructor(initial: LevelDocument, binding?: {source: LevelSource; layout?: LevelLayout}) {
        this.session = new EditorSession(initial);
        if (binding) { this.session.loadSource(binding.source, binding.layout); initial = this.session.document; }
        const savedJson = this.files.restoreJsonDraft(initial.id);
        if (savedJson) { this.jsonDirty = true; this.json.value = savedJson.json; this.draftRevision = savedJson.baseRevision; }
        const edit = (operations: LevelOperation[]) => this.edit(operations);
        this.canvas = new EditorCanvas(element('level-canvas'), initial, edit, selection => this.select(selection), message => this.report(message, true), (id, origin, revision) => this.run(() => this.session.configureInstance(id, origin, revision)));
        this.inspector = new EditorInspector(element('object-properties'), element('object-list'), operations => this.run(() => edit(operations)), selection => { this.select(selection); this.focusSelection(); });
        this.assemblies = new AssemblyInspector(element('assembly-list'), element('assembly-properties'),
            (id, edit) => this.run(() => this.session.configureInstance(id, edit, this.session.document.revision)),
            (id, child) => this.run(() => this.session.resetOverride(id, child, this.session.document.revision)),
            instance => { const bounds = assemblyBounds(this.session.document, instance); if (bounds) { this.canvas.assembly = {id: instance.id, x: instance.x, y: instance.y}; this.canvas.groupOutline = bounds; this.canvas.focusBounds(bounds); this.syncZoom(); } },
            () => { this.editEpoch++; this.pendingProperties = true; });
        const preview = new EditorPreview(element('playtest-dialog'), element('playtest-frame'));
        element('playtest').onclick = () => this.run(() => preview.open(this.session.document));
        element('close-playtest').onclick = () => element<HTMLDialogElement>('playtest-dialog').close();
        element('undo').onclick = () => this.run(() => this.session.undo());
        element('redo').onclick = () => this.run(() => this.session.redo());
        element('delete-object').onclick = () => this.run(() => this.inspector.remove());
        element('export-source').onclick = () => this.run(() => { const layout = this.session.layout; if (layout) this.files.downloadLayout(layout); else this.files.downloadSource(this.session.document); });
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
        const sources = element<HTMLSelectElement>('source-level');
        sources.replaceChildren(new Option(levelSourceIds.length ? '(choose source)' : '(no authored levels)', ''), ...levelSourceIds.map(id => new Option(id, id)));
        element<HTMLButtonElement>('load-source').disabled = !levelSourceIds.length;
        element('load-source').onclick = () => {
            const revision = this.session.document.revision, epoch = this.editEpoch;
            void loadLevelSource(sources.value).then(source => {
                if (this.session.document.revision !== revision || epoch !== this.editEpoch) throw new Error('Draft changed while importing the source. Import again to replace it.');
                this.files.clearJsonDraft(); this.jsonDirty = false; this.selection = undefined; this.editEpoch++;
                this.session.loadSource(source);
                this.report('Opened source assemblies. Export the source layout to keep instance edits beside the source module.');
            }).catch(error => this.report(String(error), true));
        };
        element('focus-selection').onclick = () => this.focusSelection();
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
            this.run(() => this.edit([...['id', 'name', 'width', 'height'].map(field => ({op: 'set' as const, field: field as 'id' | 'name' | 'width' | 'height', value: field === 'width' || field === 'height' ? Number(data.get(field)) : String(data.get(field))})),{op:'set',field:'presentation',value:data.get('presentation')?{environment:'confluence',scenery:String(data.get('presentation'))}:undefined}]));
        };
        for (const button of document.querySelectorAll<HTMLElement>('[data-tool]')) {
            button.onclick = () => {
                this.canvas.tool = button.dataset.tool as EditorTool;
                for (const tool of document.querySelectorAll('[data-tool]')) tool.setAttribute('aria-pressed', String(tool === button));
                element('tool-help').textContent = this.canvas.tool === 'assembly' ? 'Select an assembly in the Assemblies list, then drag its outline to move the whole instance.' : this.canvas.tool === 'select'
                    ? 'Click an object to select it. Drag using the selected snap; use the inspector for exact dimensions and mounts.'
                    : this.canvas.tool === 'terrain' || this.canvas.tool === 'decorations'
                        ? 'Drag a rectangle on the grid. Terrain blocks movement; decoration is visual only.'
                        : this.canvas.tool==='props'?'Click to place the selected catalog asset. X/Y mark its top-left; mount it to a structure in the inspector.':'Click to place. Actor positions mark the feet; place them on top of a platform.';
            };
        }
        element<HTMLSelectElement>('enemy-kind').onchange = event => { this.canvas.enemy = (event.currentTarget as HTMLSelectElement).value as EnemyKind; };
        element<HTMLSelectElement>('prop-asset').replaceChildren(...Object.keys(sceneArt).map(key=>new Option(key,key)));element<HTMLSelectElement>('prop-asset').value=this.canvas.propAsset;
        element<HTMLSelectElement>('prop-asset').onchange=e=>{this.canvas.propAsset=(e.currentTarget as HTMLSelectElement).value;};
        element<HTMLSelectElement>('structure-kind').replaceChildren(...structureKinds.map(k=>new Option(k,k)));
        element<HTMLSelectElement>('structure-kind').onchange=e=>{this.canvas.structureKind=(e.currentTarget as HTMLSelectElement).value as StructureKind;};
        element<HTMLSelectElement>('water-kind').onchange=e=>{this.canvas.waterKind=(e.currentTarget as HTMLSelectElement).value as 'river'|'canal'|'basin'|'drain';};
        element('connect-water').onclick=()=>this.run(()=>{
            const d=this.session.document,source=element<HTMLSelectElement>('water-source').value,target=element<HTMLSelectElement>('water-target').value;
            if(!source||!target)throw Error('Choose a water source and a receiving water body first');
            const ids=new Set(levelCollections.flatMap(k=>d[k].map(e=>e.id)));let i=1;while(ids.has(`waterfall-${i}`))i++;
            const id=`waterfall-${i}`,sourceWater=d.water.find(w=>w.id===source);
            this.edit([{op:'upsert',collection:'water',value:{id,kind:'waterfall',x:0,y:0,width:12,from:{parent:source,socket:sourceWater&&sourceWater.kind!=='drain'?'spill':'mouth'},to:target}}]);this.select({collection:'water',id});
        });
        element<HTMLSelectElement>('grid-size').onchange=e=>this.run(()=>this.edit([{op:'set',field:'gridSize',value:Number((e.currentTarget as HTMLSelectElement).value)}]));
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
            getLayout: () => this.session.layout,
            configureAssembly: (id, edit, baseRevision) => { if (this.pendingProperties) throw Error('Apply or reset pending property edits before an AI patch'); this.session.configureInstance(id, edit, baseRevision); },
            resetAssembly: (id, child, baseRevision) => { if (this.pendingProperties) throw Error('Apply or reset pending property edits before an AI patch'); this.session.resetOverride(id, child, baseRevision); },
            selectAssembly: id => this.assemblies.select(id),
            getSelection: () => typeof this.selection === 'object' ? {...this.selection} : this.selection,
            select: selection => { this.select(selection); this.focusSelection(); },
        } satisfies LevelEditorAPI);
        this.render();
    }

    private load(document: LevelDocument) { this.editEpoch++; this.files.saveSourceDraft(undefined); this.files.clearJsonDraft(); this.jsonDirty = false; this.selection = undefined; this.session.load(document); this.report(`Opened ${document.name}. Changes are saved as a local draft; export JSON to share.`); }
    private edit(operations: LevelOperation[]) {
        const document = this.session.document;
        this.session.apply({levelId: document.id, baseRevision: document.revision, operations});
    }
    private focusSelection() {
        if (!this.selection) return;
        const bounds = selectionBounds(this.session.document, this.selection);
        if (bounds) { this.canvas.focusBounds(bounds); this.syncZoom(); }
    }
    private select(selection: EditorSelection) {
        if (selection && !selectedObject(this.session.document, selection)) throw new Error('Selected object does not exist');
        this.selection = selection; this.canvas.selection = selection;
        this.assemblies.update(this.session.instances, this.session.layout, selection);
        this.canvas.assembly = this.assemblies.selected;
        this.canvas.groupOutline = this.assemblies.selected ? assemblyBounds(this.session.document, this.assemblies.selected) : undefined;
        this.canvas.draw(); this.inspector.update(this.session.document, selection);
        element<HTMLElementTagNameMap['bl-button']>('delete-object').disabled = typeof selection !== 'object';
    }
    private render() {
        const document = this.session.document;
        this.pendingProperties = false;
        const snap=element<HTMLSelectElement>('grid-size');
        if(![...snap.options].some(o=>Number(o.value)===document.gridSize))snap.add(new Option(`${document.gridSize} px`,String(document.gridSize)));
        snap.value=String(document.gridSize);
        const sources=[...document.terrain,...document.decorations].filter(s=>s.kind==='outfall').map(s=>s.id).concat(document.water.filter(w=>w.kind!=='waterfall').map(w=>w.id));
        const targets=document.water.filter(w=>['river','canal','basin'].includes(w.kind)).map(w=>w.id);
        for(const [id,values] of [['water-source',sources],['water-target',targets]] as const){const select=element<HTMLSelectElement>(id),previous=select.value;select.replaceChildren(new Option('(choose)',''),...values.map(v=>new Option(v,v)));if(values.includes(previous))select.value=previous;}
        if (this.selection && !selectedObject(document, this.selection)) this.selection = undefined;
        this.assemblies.update(this.session.instances, this.session.layout, this.selection);
        this.canvas.assembly = this.assemblies.selected;
        this.canvas.groupOutline = this.assemblies.selected ? assemblyBounds(document, this.assemblies.selected) : undefined;
        this.canvas.selection = this.selection; this.canvas.update(document);
        this.syncZoom();
        this.inspector.update(document, this.selection);
        element<HTMLElementTagNameMap['bl-button']>('undo').disabled = !this.session.canUndo;
        element<HTMLElementTagNameMap['bl-button']>('redo').disabled = !this.session.canRedo;
        element<HTMLElementTagNameMap['bl-button']>('delete-object').disabled = typeof this.selection !== 'object';
        element('revision').textContent = `Revision ${document.revision}`;
        const form = element<HTMLFormElement>('level-properties');
        (form.elements.namedItem('presentation') as HTMLSelectElement).value=document.presentation?.scenery??'';
        for (const name of ['id', 'name', 'width', 'height'] as const) (form.elements.namedItem(name) as HTMLInputElement).value = String(document[name]);
        (form.elements.namedItem('id') as HTMLInputElement).readOnly = !!this.session.source;
        if (this.session.source) element<HTMLSelectElement>('source-level').value = this.session.source.id;
        element('export-source').textContent = this.session.source ? 'Export source layout' : 'Export TypeScript';
        const sourceSaved = this.session.layout ? this.files.saveSourceDraft(this.session.layout) : true;
        const stored = this.files.saveDraft(document) && sourceSaved;
        this.report(stored ? (this.session.source ? 'Valid source layout / local draft saved; export source layout to update the project' : 'Valid level / local draft saved') : 'Browser storage unavailable; export your source layout or snapshot to keep your work', !stored);
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
