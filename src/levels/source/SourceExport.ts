import {levelCollections, type LevelDocument} from '../LevelDocument';
import {parseLevelDocument} from '../LevelValidation';

/** Honest snapshot export. It does not pretend to reconstruct the original functions. */
export function formatLevelSource(input: LevelDocument): string {
    const document = parseLevelDocument(input);
    const {schemaVersion: _schema, terrain: _terrain, decorations: _decorations, enemies: _enemies,
        npcs: _npcs, interactables: _interactables, signs: _signs, water: _water, props: _props, ...metadata} = document;
    const lines = ["import {defineLevel} from '../../levels/source';", '', `export default defineLevel(${JSON.stringify(metadata, null, 2)}, scene => {`];
    for (const c of levelCollections) for (const item of document[c]) lines.push(`    scene.add('${c}', ${JSON.stringify(item)});`);
    lines.push('});', '');
    return lines.join('\n');
}

export function formatLevelLayout(layout: import('./LevelLayout').LevelLayout): string {
    return "import type {LevelLayout} from '../../levels/source';\n\nexport default " + JSON.stringify(layout, null, 2) + ' satisfies LevelLayout;\n';
}
