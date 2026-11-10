import type { LevelDocument } from '../levels/LevelDocument';

export function createBlankLevel(): LevelDocument {
    return {
        schemaVersion: 2, id: 'untitled-level', name: 'Untitled level', revision: 1,
        gridSize:48, width: 1920, height: 672,
        spawn: {x: 160, y: 576}, exit: {x: 1776, y: 468, width: 64, height: 108},
        terrain: [{id: 'floor', x: 0, y: 576, width: 1920, height: 96,material:0}],
        decorations: [], enemies: [], npcs: [], interactables: [], signs: [],water:[],props:[],
    };
}
