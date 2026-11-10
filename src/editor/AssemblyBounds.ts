import type {LevelDocument} from '../levels/LevelDocument';
import type {AssemblyInstanceView} from '../levels/source/LevelLayout';
import type {Rect} from '../interfaces/Geometry';
import {resolveStructures} from '../world/scene/AttachmentResolver';
import {resolveProps} from '../world/props/PropResolver';
import {resolveInteractables} from '../world/scene/InteractableResolver';
import {WaterNetwork} from '../world/water/WaterNetwork';
import {selectionBounds} from './EditorSelection';

export function assemblyBounds(document: LevelDocument, instance: AssemblyInstanceView): Rect | undefined {
    const ids = new Set(Object.values(instance.objects).flat().map(o => `${instance.id}--${o.id}`));
    const structures = resolveStructures(document.terrain, document.decorations);
    const placed = [...structures, ...resolveProps(document.props, structures, document),
        ...resolveInteractables(document.interactables, structures, document), ...new WaterNetwork(document.water, structures, document).elements];
    const bounds: Rect[] = placed.filter(o => ids.has(o.id));
    for (const collection of ['enemies','npcs','signs'] as const) for (const item of document[collection]) if (ids.has(item.id)) {
        const r = selectionBounds(document, {collection, id: item.id}); if (r) bounds.push(r);
    }
    if (!bounds.length) return undefined;
    const x = Math.min(...bounds.map(r => r.x)), y = Math.min(...bounds.map(r => r.y));
    return {x, y, width: Math.max(...bounds.map(r => r.x + r.width)) - x, height: Math.max(...bounds.map(r => r.y + r.height)) - y};
}
