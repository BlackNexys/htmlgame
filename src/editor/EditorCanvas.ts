import { characterAtlas } from '../game/animation/CharacterAtlas';
import { cloneDocument, levelCollections, type LevelDocument, type LevelPoint, type LevelObject } from '../levels/LevelDocument';
import type { LevelOperation } from '../levels/LevelChanges';
import { enemyTuning } from '../game/config';
import type { EnemyKind } from '../interfaces/Enemy';
import { selectionBounds, selectedObject, type EditorSelection } from './EditorSelection';
import { npcCatalog } from '../game/NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';
import { interactionPresets } from '../narrative/InteractionPresets';

export type EditorTool = 'select' | 'terrain' | 'decorations' | 'enemy' | 'npc' | 'interactable' | 'spawn' | 'exit' | 'sign';
interface Drag { start: LevelPoint; end: LevelPoint; selection?: EditorSelection; }

/** Authoring canvas only: no World, game loop, physics updates, or live entities. */
export class EditorCanvas {
    tool: EditorTool = 'select';
    enemy: EnemyKind = 'zombie';
    npc: NPCKind = 'rail-attendant';
    scene = 'station-exchange';
    interactionPreset='record';
    selection: EditorSelection;
    private document: LevelDocument;
    private zoom = .5;
    private drag?: Drag;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly artwork = new Map<string, HTMLImageElement>();

    constructor(private readonly canvas: HTMLCanvasElement, document: LevelDocument,
        private readonly edit: (operations: LevelOperation[]) => void,
        private readonly select: (selection: EditorSelection) => void,
        private readonly report: (message: string) => void) {
        this.document = document;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create the editor canvas');
        this.ctx = context;
        canvas.addEventListener('pointerdown', event => this.pointerDown(event));
        canvas.addEventListener('pointermove', event => this.pointerMove(event));
        canvas.addEventListener('pointerup', event => this.pointerUp(event));
        canvas.addEventListener('pointercancel', () => { this.drag = undefined; this.draw(); });
        for (const kind of ['hero', ...Object.keys(enemyTuning), ...Object.keys(npcCatalog)]) {
            const image = new Image();
            image.onload = () => { this.artwork.set(kind, image); this.draw(); };
            image.src = kind === 'hero' ? './assets/'+characterAtlas.image : Object.hasOwn(npcCatalog, kind) ? npcCatalog[kind as NPCKind].image : `./assets/enemies/${kind}-v1.png`;
        }
        this.update(document);
    }

    update(document: LevelDocument) {
        this.document = document;
        this.drag = undefined;
        this.resize(); this.draw();
    }
    get scale() { return this.zoom; }
    setZoom(zoom: number) { this.zoom = Math.max(.05, Math.min(2, zoom)); this.resize(); this.draw(); }
    fit() { this.setZoom((this.canvas.parentElement!.clientWidth - 4) / this.document.width); }
    private resize() {
        this.zoom = Math.min(this.zoom, 8192 / this.document.width, 4096 / this.document.height,
            Math.sqrt(8_000_000 / (this.document.width * this.document.height)));
        this.canvas.width = Math.ceil(this.document.width * this.zoom);
        this.canvas.height = Math.ceil(this.document.height * this.zoom);
    }
    private point(event: PointerEvent): LevelPoint {
        const bounds = this.canvas.getBoundingClientRect();
        return {x: Math.round((event.clientX - bounds.left) / this.zoom), y: Math.round((event.clientY - bounds.top) / this.zoom)};
    }
    private hit(point: LevelPoint): EditorSelection {
        const selections: Exclude<EditorSelection, undefined>[] = [
            ...(['decorations', 'terrain', 'enemies', 'npcs', 'interactables', 'signs'] as const).flatMap(collection => this.document[collection].map(item => ({collection, id: item.id}))), 'spawn', 'exit',
        ];
        return selections.reverse().find(selection => {
            const r = selectionBounds(this.document, selection);
            return r && point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.height;
        });
    }
    private pointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        this.canvas.focus({preventScroll: true}); this.canvas.setPointerCapture(event.pointerId);
        const point = this.point(event);
        if (this.tool === 'select') {
            this.selection = this.hit(point); this.select(this.selection);
            this.drag = {start: point, end: point, selection: this.selection};
        } else this.drag = {start: point, end: point};
        this.draw();
    }
    private pointerMove(event: PointerEvent) {
        if (!this.drag) return;
        this.drag.end = this.point(event); this.draw();
    }
    private delta() {
        return this.drag ? {x: Math.round((this.drag.end.x - this.drag.start.x) / 48) * 48, y: Math.round((this.drag.end.y - this.drag.start.y) / 48) * 48} : {x: 0, y: 0};
    }
    private moved(document: LevelDocument, selection: Exclude<EditorSelection, undefined>, delta: LevelPoint) {
        const item = selectedObject(document, selection);
        if (!item) return undefined;
        const moved = {...item, x: item.x + delta.x, y: item.y + delta.y};
        if (moved.patrol) moved.patrol = {left: moved.patrol.left + delta.x, right: moved.patrol.right + delta.x};
        if (typeof selection === 'string') return {op: 'set' as const, field: selection, value: moved};
        return {op: 'upsert' as const, collection: selection.collection, value: moved};
    }
    private rectangle() {
        const start = this.drag!.start, end = this.drag!.end;
        const left = Math.max(0, Math.floor(Math.min(start.x, end.x) / 48) * 48);
        const top = Math.max(0, Math.floor(Math.min(start.y, end.y) / 48) * 48);
        const right = Math.min(this.document.width, (Math.floor(Math.max(start.x, end.x) / 48) + 1) * 48);
        const bottom = Math.min(this.document.height, (Math.floor(Math.max(start.y, end.y) / 48) + 1) * 48);
        return {x: left, y: top, width: right - left, height: bottom - top};
    }
    private newId(prefix: string) {
        const ids = new Set(levelCollections.flatMap(collection => this.document[collection].map(item => item.id)));
        let index = 1; while (ids.has(`${prefix}-${index}`)) index++;
        return `${prefix}-${index}`;
    }
    private pointerUp(event: PointerEvent) {
        if (!this.drag) return;
        this.drag.end = this.point(event);
        try {
            if (this.tool === 'select') {
                const delta = this.delta();
                const operation = this.drag.selection && this.moved(this.document, this.drag.selection, delta);
                if (operation && (delta.x || delta.y)) this.edit([operation]);
            } else if (this.tool === 'terrain' || this.tool === 'decorations') {
                const id = this.newId(this.tool === 'terrain' ? 'terrain' : 'decoration');
                this.edit([{op: 'upsert', collection: this.tool, value: {id, ...this.rectangle()}}]);
                this.selection = {collection: this.tool, id}; this.select(this.selection);
            } else {
                const x = Math.floor(this.drag.end.x / 48) * 48 + 24;
                const y = Math.round(this.drag.end.y / 48) * 48;
                if (this.tool === 'spawn') { this.edit([{op: 'set', field: 'spawn', value: {x, y}}]); this.selection = 'spawn'; }
                if (this.tool === 'exit') { this.edit([{op: 'set', field: 'exit', value: {x: x - 24, y: y - 108, width: 64, height: 108}}]); this.selection = 'exit'; }
                if (this.tool === 'enemy') {
                    const id = this.newId(this.enemy), half = enemyTuning[this.enemy].width / 2;
                    this.edit([{op: 'upsert', collection: 'enemies', value: {id, kind: this.enemy, x, y, patrol: {
                        left: Math.max(half, x - 144), right: Math.min(this.document.width - half, x + 144),
                    }}}]);
                    this.selection = {collection: 'enemies', id};
                }
                if (this.tool === 'sign') {
                    const id = this.newId('sign');
                    this.edit([{op: 'upsert', collection: 'signs', value: {id, x: x - 24, y, title: 'NEW SIGN', text: 'Edit this message in the inspector.'}}]);
                    this.selection = {collection: 'signs', id};
                }
                if (this.tool === 'npc') {
                    const id = this.newId(this.npc);
                    this.edit([{op: 'upsert', collection: 'npcs', value: {id, kind: this.npc, x, y, scene: this.scene}}]);
                    this.selection = {collection: 'npcs', id};
                }
                if(this.tool==='interactable'){
                    const preset=interactionPresets[this.interactionPreset],id=this.newId(this.interactionPreset);
                    this.edit([{op:'upsert',collection:'interactables',value:{id,...preset,x:x-preset.width/2,y:y-preset.height}}]);
                    this.selection={collection:'interactables',id};
                }
                this.select(this.selection);
            }
        } catch (error) { this.report(error instanceof Error ? error.message : 'Could not apply edit'); }
        this.drag = undefined; this.draw();
    }

    draw() {
        const c = this.ctx;
        const css = getComputedStyle(document.documentElement);
        const color = (name: string) => css.getPropertyValue(name).trim();
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = color('--game-void'); c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        c.scale(this.zoom, this.zoom); c.imageSmoothingEnabled = false;
        c.strokeStyle = color('--game-slate'); c.lineWidth = 1 / this.zoom;
        for (let x = 0; x <= this.document.width; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, this.document.height); c.stroke(); }
        for (let y = 0; y <= this.document.height; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(this.document.width, y); c.stroke(); }
        const view = cloneDocument(this.document);
        if (this.drag?.selection) {
            const operation = this.moved(view, this.drag.selection, this.delta());
            if (operation?.op === 'set') Object.assign(view, {[operation.field]: operation.value});
            if (operation?.op === 'upsert') {
                const items = view[operation.collection] as LevelObject[];
                const index = items.findIndex(item => item.id === operation.value.id);
                if (index >= 0) items[index] = operation.value as unknown as LevelObject;
            }
        }
        for (const block of view.decorations) { c.fillStyle = color('--game-slate'); c.fillRect(block.x, block.y, block.width, block.height); }
        for (const block of view.terrain) {
            c.fillStyle = color('--game-steel'); c.fillRect(block.x, block.y, block.width, block.height);
            c.strokeStyle = color('--game-stone'); c.strokeRect(block.x, block.y, block.width, block.height);
            c.fillStyle = color('--game-ash'); c.fillRect(block.x, block.y, block.width, 3);
        }
        c.strokeStyle = color('--game-magenta'); c.lineWidth = 3 / this.zoom;
        c.strokeRect(view.exit.x, view.exit.y, view.exit.width, view.exit.height);
        const actor = (kind: string, x: number, y: number, width: number, height: number) => {
            c.fillStyle = kind === 'hero' ? color('--game-magenta-edge') : color('--game-steel');
            c.fillRect(x - width / 2, y - height, width, height);
            const image = this.artwork.get(kind);
            if (image) {
                const isNPC = Object.hasOwn(npcCatalog, kind);
                const cell = image.width / (kind === 'hero' ? 6 : 4), size = kind === 'hero' ? characterAtlas.size : isNPC ? npcCatalog[kind as NPCKind].size : 80;
                const width = isNPC ? size * cell / image.height : size;
                c.drawImage(image, 0, 0, cell, isNPC ? image.height : cell, x - (kind==='hero'?characterAtlas.anchors.idle.x[0]/characterAtlas.cell: .5)*width, y - size * (kind==='hero'?characterAtlas.anchors.idle.y[0]/characterAtlas.cell:.94), width, size);
            }
            c.fillStyle = kind === 'hero' ? color('--game-magenta') : color('--game-cyan');
            c.fillRect(x - 3, y - 3, 6, 6);
        };
        actor('hero', view.spawn.x, view.spawn.y, 32, 52);
        for (const enemy of view.enemies) {
            const stats = enemyTuning[enemy.kind];
            c.setLineDash([8, 6]); c.strokeStyle = color('--game-cyan'); c.lineWidth = 1 / this.zoom;
            c.beginPath(); c.moveTo(enemy.patrol.left, enemy.y + 8); c.lineTo(enemy.patrol.right, enemy.y + 8); c.stroke(); c.setLineDash([]);
            actor(enemy.kind, enemy.x, enemy.y, stats.width, stats.height);
            c.fillStyle = color('--game-ash'); c.font = '16px monospace'; c.fillText(enemy.id, enemy.x - 16, enemy.y - 88);
        }
        for (const npc of view.npcs) {
            const info = npcCatalog[npc.kind]; actor(npc.kind, npc.x, npc.y, info.width, info.height);
            c.fillStyle = color('--game-bone'); c.font = '16px monospace'; c.fillText(npc.id, npc.x - 16, npc.y - 88);
        }
        for(const object of view.interactables){c.fillStyle=object.kind==='collect'?'#bca084':'#385269';c.fillRect(object.x,object.y,object.width,object.height);c.strokeStyle='#63dfeb';c.strokeRect(object.x,object.y,object.width,object.height);c.fillStyle='#d5e1dc';c.font='14px monospace';c.fillText(object.label,object.x,object.y-8);}
        c.font = '16px monospace'; c.fillStyle = color('--game-bone');
        for (const sign of view.signs) { c.fillText(sign.title, sign.x, sign.y); c.fillStyle = color('--game-dust'); c.fillText(sign.text, sign.x, sign.y + 22); c.fillStyle = color('--game-bone'); }
        if (this.selection) {
            const bounds = selectionBounds(view, this.selection);
            if (bounds) { c.strokeStyle = color('--game-cyan-core'); c.lineWidth = 2 / this.zoom; c.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6); }
        }
        if (this.drag && (this.tool === 'terrain' || this.tool === 'decorations')) {
            const r = this.rectangle(); c.fillStyle = '#63dfeb44'; c.fillRect(r.x, r.y, r.width, r.height);
            c.strokeStyle = color('--game-cyan'); c.strokeRect(r.x, r.y, r.width, r.height);
        }
    }
}
