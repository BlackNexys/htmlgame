import { levelCollections, type LevelDocument } from '../levels/LevelDocument';
import type { LevelOperation } from '../levels/LevelChanges';
import { enemyTuning } from '../game/config';
import { selectedObject, selectionFromKey, selectionKey, type EditorSelection } from './EditorSelection';

/** DOM property inspector. Authored text is always inserted as text, never HTML. */
export class EditorInspector {
    private document!: LevelDocument;
    private selection: EditorSelection;
    constructor(private readonly form: HTMLFormElement, private readonly list: HTMLSelectElement,
        private readonly edit: (operations: LevelOperation[]) => void,
        private readonly select: (selection: EditorSelection) => void) {
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
        this.field('x', 'X', item.x); this.field('y', 'Y', item.y);
        if (item.width !== undefined && item.height !== undefined) { this.field('width', 'Width', item.width); this.field('height', 'Height', item.height); }
        if (item.kind && item.patrol) {
            const label = window.document.createElement('label'); label.textContent = 'Enemy type';
            const input = window.document.createElement('select'); input.name = 'kind';
            input.replaceChildren(...Object.keys(enemyTuning).map(kind => new Option(kind, kind)));
            input.value = item.kind; label.append(input); this.form.append(label);
            this.field('left', 'Patrol left', item.patrol.left); this.field('right', 'Patrol right', item.patrol.right);
        }
        if (item.title !== undefined && item.text !== undefined) { this.field('title', 'Heading', item.title); this.field('text', 'Message', item.text); }
        const button = window.document.createElement('bl-button'); button.type = 'submit'; button.textContent = 'Apply properties';
        this.form.append(button);
        const note = window.document.createElement('p'); note.className = 'editor-help';
        note.textContent = selection === 'spawn' || (typeof selection === 'object' && selection.collection === 'enemies')
            ? 'Actor X/Y mark the center of the feet. Patrol limits use the same center anchor.'
            : 'X/Y mark the top-left corner. Terrain and decoration sizes follow the 48-pixel grid.';
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
        const data = new FormData(this.form);
        const x = Number(data.get('x')), y = Number(data.get('y'));
        const value = {...item, x, y};
        if (value.width !== undefined) { value.width = Number(data.get('width')); value.height = Number(data.get('height')); }
        if (value.kind) {
            value.kind = String(data.get('kind')) as keyof typeof enemyTuning;
            value.patrol = {left: Number(data.get('left')), right: Number(data.get('right'))};
        }
        if (value.title !== undefined) { value.title = String(data.get('title')); value.text = String(data.get('text')); }
        this.edit([typeof this.selection === 'string'
            ? {op: 'set', field: this.selection, value}
            : {op: 'upsert', collection: this.selection.collection, value}]);
    }
}
