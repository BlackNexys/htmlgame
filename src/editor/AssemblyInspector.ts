import type {AssemblyInstanceView, InstanceLayout, LevelLayout} from '../levels/source/LevelLayout';
import type {ParameterValues} from '../levels/source/AssemblyParameters';
import type {EditorSelection} from './EditorSelection';

/** Assembly controls edit a source layout; the child inspector still edits semantic objects. */
export class AssemblyInspector {
    private instances: AssemblyInstanceView[] = [];
    private current?: string;
    private child?: string;
    private layout?: LevelLayout;
    constructor(private readonly list: HTMLSelectElement, private readonly form: HTMLFormElement,
        private readonly configure: (id: string, edit: InstanceLayout) => void,
        private readonly reset: (id: string, child?: string) => void,
        private readonly focus: (instance: AssemblyInstanceView) => void,
        private readonly changed: () => void) {
        list.onchange = () => { this.current = list.value || undefined; this.child = undefined; this.render(); const i = this.selected; if (i) this.focus(i); };
        form.onsubmit = event => {
            event.preventDefault(); const instance = this.selected; if (!instance) return;
            const data = new FormData(form), parameters: ParameterValues = {};
            for (const [key, field] of Object.entries(instance.schema)) {
                const value = field.type === 'number' ? Number(data.get(`param-${key}`)) : field.type === 'boolean' ? data.get(`param-${key}`) === 'true' : String(data.get(`param-${key}`));
                if (value !== instance.parameters[key]) parameters[key] = value;
            }
            const x = Number(data.get('x')), y = Number(data.get('y'));
            this.configure(instance.id, {...(x !== instance.x ? {x} : {}), ...(y !== instance.y ? {y} : {}), parameters});
        };
        form.addEventListener('input', changed);
    }
    get selected() { return this.instances.find(i => i.id === this.current); }
    select(id: string) {
        if (!this.instances.some(i => i.id === id)) throw Error(`Unknown assembly instance ${id}`);
        this.current = id; this.child = undefined; this.list.value = id; this.render(); this.focus(this.selected!);
    }
    update(instances: AssemblyInstanceView[], layout: LevelLayout | undefined, selection: EditorSelection) {
        this.instances = instances; this.layout = layout;
        if (typeof selection === 'object') {
            const owner = instances.find(i => i.objects[selection.collection].some(o => `${i.id}--${o.id}` === selection.id));
            this.child = owner ? selection.id.slice(owner.id.length + 2) : undefined;
            if (owner) this.current = owner.id;
        } else this.child = undefined;
        if (!instances.some(i => i.id === this.current)) this.current = undefined;
        this.list.replaceChildren(new Option('(select assembly)', ''), ...instances.map(i => new Option(`${i.id} / ${i.name}`, i.id)));
        this.list.value = this.current ?? ''; this.list.disabled = !instances.length;
        this.render(layout);
    }
    private render(layout: LevelLayout | undefined = this.layout) {
        this.form.replaceChildren(); const instance = this.selected;
        const message = document.createElement('p'); message.className = 'editor-help';
        if (!instance) { message.textContent = 'Open a level source and select an assembly. Source functions define its reusable parts; these controls edit its placement and parameters.'; this.form.append(message); return; }
        const field = (name: string, title: string, input: HTMLInputElement | HTMLSelectElement) => {
            const label = document.createElement('label'); label.textContent = title; input.name = name; label.append(input); this.form.append(label);
        };
        for (const axis of ['x','y'] as const) { const input = document.createElement('input'); input.type = 'number'; input.step = '1'; input.required = true; input.value = String(instance[axis]); field(axis, axis.toUpperCase(), input); }
        for (const [key, definition] of Object.entries(instance.schema)) {
            let input: HTMLInputElement | HTMLSelectElement;
            if (definition.type === 'number') {
                input = document.createElement('input'); input.type = 'number'; input.min = String(definition.min); input.max = String(definition.max); input.step = String(definition.step ?? 1); input.required = true;
            } else {
                input = document.createElement('select');
                const options = definition.type === 'boolean' ? ['true','false'] : definition.options;
                input.replaceChildren(...options.map(v => new Option(v, v)));
            }
            input.value = String(instance.parameters[key]); field(`param-${key}`, key, input);
        }
        const button = (text: string, action?: () => void) => { const b = document.createElement('bl-button'); b.textContent = text; b.type = action ? 'button' : 'submit'; if (action) b.onclick = action; this.form.append(b); };
        button('Apply assembly'); button('Focus assembly', () => this.focus(instance));
        button('Reset assembly to source', () => this.reset(instance.id));
        const overrides = layout?.instances[instance.id]?.children ?? [];
        const overridden = this.child && overrides.some(o => o.id === this.child);
        message.textContent = this.child ? `${this.child}: ${overridden ? 'explicit local override' : 'inherited from source'}. ${overrides.length} child override(s) in this instance.` : `${overrides.length} child override(s). Resetting the assembly restores its authored placement, parameters and children.`;
        this.form.append(message);
        if (overridden) button('Reset child override', () => this.reset(instance.id, this.child));
    }
}
