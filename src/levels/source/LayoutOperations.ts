import {editLevelObjects} from '../LevelOperations';
import type {LevelDocument} from '../LevelDocument';
import type {LevelLayout} from './LevelLayout';

export function applyLayoutOperations(document: LevelDocument, layout: LevelLayout): LevelDocument {
    if (layout.operations.some(op => op?.op === 'set' && op.field === 'id')) throw Error('A source layout cannot rename its source');
    return editLevelObjects(document, layout.operations.map(op => op.op === 'set' && op.field === 'presentation' && op.value === null ? {...op, value: undefined} : op));
}
