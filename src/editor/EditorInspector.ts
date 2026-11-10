import { levelCollections, type LevelDocument } from '../levels/LevelDocument';
import type { LevelOperation } from '../levels/LevelChanges';
import { enemyTuning } from '../game/config';
import { npcCatalog } from '../game/NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';
import { conversationChoices } from '../dialogue/SceneCatalog';
import type { InteractionKind } from '../interfaces/Interactable';
import { inspections } from '../narrative/InspectionCatalog';
import { effectCatalog } from '../narrative/EffectApplier';
import { conditions } from '../narrative/Conditions';
import { selectedObject, selectionFromKey, selectionKey, type EditorSelection } from './EditorSelection';
import {structureKinds,type StructureKind} from '../world/structures/StructureDefinition';
import {WaterInspector} from './WaterInspector';
import type {WaterDefinition} from '../world/water/WaterDefinition';
import {PropInspector} from './PropInspector';
import {StoryArtInspector} from './StoryArtInspector';
import type {PropDefinition} from '../world/props/PropDefinition';
import type {InteractableDefinition} from '../interfaces/Interactable';

/** DOM property inspector. Authored text is always inserted as text, never HTML. */
export class EditorInspector {
    private document!: LevelDocument;
    private selection: EditorSelection;
    private readonly water:WaterInspector;
    private readonly props:PropInspector;
    private readonly storyArt:StoryArtInspector;
    constructor(private readonly form: HTMLFormElement, private readonly list: HTMLSelectElement,
        private readonly edit: (operations: LevelOperation[]) => void,
        private readonly select: (selection: EditorSelection) => void) {
        this.water=new WaterInspector(form);
        this.props=new PropInspector(form);this.storyArt=new StoryArtInspector(form);
        form.addEventListener('submit', event => { event.preventDefault(); this.submit(); });
        list.addEventListener('change', () => this.select(selectionFromKey(list.value)));
    }

    update(document: LevelDocument, selection: EditorSelection) {
        this.document = document; this.selection = selection;
        const options = [new Option('Player spawn', 'spawn'), new Option('Exit', 'exit')];
        for (const collection of levelCollections) {
            for (const item of document[collection]) options.push(new Option(`${item.id} · ${collection}`, `${collection}:${item.id}`));
        }
        this.list.replaceChildren(...options); this.list.value = selectionKey(selection);
        this.form.replaceChildren();
        const item = selectedObject(document, selection);
        if (!item || !selection) {
            const message = window.document.createElement('p'); message.textContent = 'Select an object on the map or in the list to edit its properties.';
            this.form.append(message); return;
        }
        const heading = window.document.createElement('h3');
        heading.textContent = typeof selection === 'string' ? (selection === 'spawn' ? 'Player spawn' : 'Exit') : selection.id;
        this.form.append(heading);
        if(typeof selection==='object'&&selection.collection==='props'){
            this.props.render(item as PropDefinition);const button=window.document.createElement('bl-button');button.type='submit';button.textContent='Apply properties';this.form.append(button);return;
        }
        if(typeof selection==='object'&&selection.collection==='water'){
            this.water.render(item as WaterDefinition,document);
            const button=window.document.createElement('bl-button');button.type='submit';button.textContent='Apply properties';this.form.append(button);return;
        }
        this.field('x', 'X', item.x); this.field('y', 'Y', item.y);
        if (item.width !== undefined && item.height !== undefined) { this.field('width', 'Width', item.width); this.field('height', 'Height', item.height); }
        if(typeof selection==='object'&&['terrain','decorations'].includes(selection.collection)){
            const label=window.document.createElement('label');label.textContent='Structure type';
            const input=window.document.createElement('select');input.name='structureKind';input.replaceChildren(...structureKinds.map(k=>new Option(k,k)));input.value=item.kind??'wall';label.append(input);this.form.append(label);
            this.field('material','Material (0 station, 1 steel, 2 Registry, 3 archive)',item.material??0);
            this.field('depth','Depth within draw layer',item.depth??0);
            this.field('thickness','Deck / frame thickness (optional)',item.thickness??'');
            this.field('parent','Mount parent ID (optional)',item.mount?.parent??'');
            this.field('socket','Mount socket',item.mount?.socket??'bottomLeft');
            for(const name of ['thickness','parent'])this.form.querySelector<HTMLInputElement>(`[name="${name}"]`)!.required=false;
            if(selection.collection==='decorations'){
                const label=window.document.createElement('label');label.textContent='Draw layer';const select=window.document.createElement('select');select.name='layer';select.replaceChildren(new Option('Behind actors','rear'),new Option('In front of actors','foreground'));select.value=item.layer??'rear';label.append(select);this.form.append(label);
            }
        }
        if (item.kind && item.patrol) {
            const label = window.document.createElement('label'); label.textContent = 'Enemy type';
            const input = window.document.createElement('select'); input.name = 'kind';
            input.replaceChildren(...Object.keys(enemyTuning).map(kind => new Option(kind, kind)));
            input.value = item.kind; label.append(input); this.form.append(label);
            this.field('left', 'Patrol left', item.patrol.left); this.field('right', 'Patrol right', item.patrol.right);
        }
        if (item.title !== undefined && item.text !== undefined) { this.field('title', 'Heading', item.title); this.field('text', 'Message', item.text); }
        if (item.scene !== undefined) {
            const label = window.document.createElement('label'); label.textContent = 'NPC type';
            const kind = window.document.createElement('select'); kind.name = 'kind';
            kind.replaceChildren(...Object.entries(npcCatalog).map(([id, info]) => new Option(info.name, id))); kind.value = item.kind!;
            label.append(kind); this.form.append(label);
            const sceneLabel = window.document.createElement('label'); sceneLabel.textContent = 'Dialogue scene';
            const scene = window.document.createElement('select'); scene.name = 'scene';
            scene.replaceChildren(...Object.entries(conversationChoices).map(([id, data]) => new Option(`${id} · ${data.title}`, id))); scene.value = item.scene;
            sceneLabel.append(scene); this.form.append(sceneLabel);
        }
        if(item.sceneId!==undefined){
            this.storyArt.render(item as InteractableDefinition);
            this.field('label','Label',item.label!);this.field('reach','Reach',item.reach!);
            const choice=(name:string,title:string,values:string[],value:string)=>{const label=window.document.createElement('label');label.textContent=title;const select=window.document.createElement('select');select.name=name;select.replaceChildren(...values.map(id=>new Option(id||'(none)',id)));select.value=value;label.append(select);this.form.append(label);};
            choice('kind','Action',['inspect','collect','operate'],item.kind!);
            choice('sceneId','Inspection card',Object.keys(inspections),item.sceneId);
            choice('effectId','Completion effect',['',...Object.keys(effectCatalog)],item.effectId??'');
            choice('conditionId','Required condition',['',...Object.keys(conditions)],item.conditionId??'');
            choice('solid','Blocks movement',['false','true'],String(item.solid??false));
        }
        const button = window.document.createElement('bl-button'); button.type = 'submit'; button.textContent = 'Apply properties';
        this.form.append(button);
        const note = window.document.createElement('p'); note.className = 'editor-help';
        note.textContent = selection === 'spawn' || (typeof selection === 'object' && ['enemies', 'npcs'].includes(selection.collection))
            ? 'Actor X/Y mark the center of the feet. Patrol limits use the same center anchor.'
            : item.mount?'X/Y are local offsets from the parent socket. Moving the parent also moves this object.':'X/Y mark the top-left corner. Structure sizes are independent of the optional snapping grid.';
        if (typeof selection === 'object' && selection.collection === 'npcs') note.textContent = 'NPC X/Y mark the center of the feet. The scene runs when the player presses F nearby; conversations are repeatable.';
        this.form.append(note);
    }

    remove() {
        if (typeof this.selection !== 'object') return;
        this.edit([{op: 'remove', collection: this.selection.collection, id: this.selection.id}]);
        this.select(undefined);
    }
    private field(name: string, title: string, value: string | number) {
        const label = window.document.createElement('label'); label.textContent = title;
        const input = window.document.createElement('input'); input.name = name; input.value = String(value);
        input.type = typeof value === 'number' ? 'number' : 'text'; input.required = true;
        if (input.type === 'number') input.step = '1';
        if (input.type === 'text') input.maxLength = name === 'text' ? 300 : 120;
        label.append(input); this.form.append(label);
    }
    private submit() {
        const item = selectedObject(this.document, this.selection);
        if (!item || !this.selection) return;
        if(typeof this.selection==='object'&&this.selection.collection==='props'){this.edit([{op:'upsert',collection:'props',value:{...this.props.read(item as PropDefinition)}}]);return;}
        if(typeof this.selection==='object'&&this.selection.collection==='water'){
            this.edit([{op:'upsert',collection:'water',value:{...this.water.read(item as WaterDefinition)}}]);return;
        }
        const data = new FormData(this.form);
        const x = Number(data.get('x')), y = Number(data.get('y'));
        const value = {...item, x, y};
        if (value.width !== undefined) { value.width = Number(data.get('width')); value.height = Number(data.get('height')); }
        if(typeof this.selection==='object'&&['terrain','decorations'].includes(this.selection.collection)){
            value.kind=String(data.get('structureKind')) as StructureKind;value.material=Number(data.get('material'));
            value.depth=Number(data.get('depth'));
            const thickness=String(data.get('thickness')),parent=String(data.get('parent')).trim();
            if(thickness)value.thickness=Number(thickness);else delete value.thickness;
            if(parent)value.mount={parent,socket:String(data.get('socket'))};else delete value.mount;
            if(this.selection.collection==='decorations')value.layer=String(data.get('layer')) as 'rear'|'foreground';
        }
        if (value.kind && value.patrol) {
            value.kind = String(data.get('kind')) as keyof typeof enemyTuning;
            value.patrol = {left: Number(data.get('left')), right: Number(data.get('right'))};
        }
        if (value.scene !== undefined) { value.kind = String(data.get('kind')) as NPCKind; value.scene = String(data.get('scene')); }
        if(value.sceneId!==undefined){
            Object.assign(value,this.storyArt.read(value as InteractableDefinition));
            value.kind=String(data.get('kind')) as InteractionKind;value.label=String(data.get('label'));value.reach=Number(data.get('reach'));value.sceneId=String(data.get('sceneId'));value.solid=data.get('solid')==='true';
            const effect=String(data.get('effectId')),condition=String(data.get('conditionId'));
            if(effect)value.effectId=effect;else delete value.effectId;if(condition)value.conditionId=condition;else delete value.conditionId;
        }
        if (value.title !== undefined) { value.title = String(data.get('title')); value.text = String(data.get('text')); }
        this.edit([typeof this.selection === 'string'
            ? {op: 'set', field: this.selection, value}
            : {op: 'upsert', collection: this.selection.collection, value}]);
    }
}
