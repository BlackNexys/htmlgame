import type { Level } from '../interfaces/Level';
import { parseLevelDocument } from './LevelValidation';
import { enemyTuning } from '../game/config';
import { npcCatalog } from '../game/NPCCatalog';
import {resolveStructures} from '../world/scene/AttachmentResolver';
import {resolveInteractables} from '../world/scene/InteractableResolver';

export function compileLevel(input: unknown): Level {
    const document = parseLevelDocument(input);
    const structures=resolveStructures(document.terrain,document.decorations);
    return {
        id: document.id,
        revision:document.revision,presentation:document.presentation,props:structuredClone(document.props),
        width: document.width, height: document.height,
        solids:structures.flatMap(s=>s.colliderParts()),
        decorations:structures.filter(s=>!s.solid).flatMap(s=>s.surfaces()),
        structureDefinitions:{terrain:structuredClone(document.terrain),decorations:structuredClone(document.decorations)},
        water:structuredClone(document.water),
        spawn: {x: document.spawn.x - 16, y: document.spawn.y - 52}, exit: {...document.exit},
        enemies: document.enemies.map(enemy => ({
            kind: enemy.kind, x: enemy.x - enemyTuning[enemy.kind].width / 2, y: enemy.y - 48,
            left: enemy.patrol.left - enemyTuning[enemy.kind].width / 2, right: enemy.patrol.right - enemyTuning[enemy.kind].width / 2,
        })),
        signs: document.signs.map(sign => ({x: sign.x, y: sign.y, title: sign.title, text: sign.text})),
        npcs: document.npcs.map(npc => ({...npc, x: npc.x - npcCatalog[npc.kind].width / 2, y: npc.y - npcCatalog[npc.kind].height})),
        interactables: resolveInteractables(document.interactables,structures,document),
    };
}
