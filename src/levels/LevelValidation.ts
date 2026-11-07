import type { LevelDocument } from './LevelDocument';
import type { Rect } from '../interfaces/Geometry';
import { enemyTuning } from '../game/config';
import { overlaps } from '../game/movement/physics';
import { npcCatalog } from '../game/NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';
import { sceneFor } from '../dialogue/SceneCatalog';

const slug = /^[a-z][a-z0-9-]{0,79}$/;
export class LevelValidationError extends Error {
    constructor(public readonly issues: string[]) { super(issues.join('\n')); this.name = 'LevelValidationError'; }
}

/** Validate untrusted JSON before it reaches the simulation or editor history. */
export function parseLevelDocument(value: unknown): LevelDocument {
    const issues: string[] = [];
    const fail = (path: string, message: string) => { issues.push(`${path}: ${message}`); };
    const object = (input: unknown, path: string, keys: string[]): Record<string, unknown> => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) { fail(path, 'must be an object'); return {}; }
        const result = input as Record<string, unknown>;
        for (const key of Object.keys(result)) if (!keys.includes(key)) fail(`${path}.${key}`, 'unknown field');
        return result;
    };
    const number = (input: unknown, path: string, min: number, max: number) => {
        if (typeof input !== 'number' || !Number.isFinite(input) || !Number.isInteger(input) || input < min || input > max) {
            fail(path, `must be an integer between ${min} and ${max}`); return min;
        }
        return input;
    };
    const string = (input: unknown, path: string, max: number) => {
        if (typeof input !== 'string' || !input.trim() || input.length > max) { fail(path, `must be nonempty text up to ${max} characters`); return ''; }
        return input;
    };
    const id = (input: unknown, path: string) => {
        const result = string(input, path, 80);
        if (!slug.test(result)) fail(path, 'use lowercase letters, numbers, and hyphens, starting with a letter');
        return result;
    };
    const root = object(value, 'level', ['schemaVersion', 'id', 'name', 'revision', 'tileSize', 'width', 'height', 'spawn', 'exit', 'terrain', 'decorations', 'enemies', 'npcs', 'signs']);
    if (root.schemaVersion !== 1) fail('schemaVersion', 'only version 1 is supported');
    if (root.tileSize !== 48) fail('tileSize', 'version 1 uses 48-pixel tiles');
    const width = number(root.width, 'width', 960, 32736);
    const height = number(root.height, 'height', 576, 16368);
    if (width % 48 || height % 48) fail('dimensions', 'width and height must be multiples of 48');
    const point = (input: unknown, path: string, keys = ['x', 'y']) => {
        const p = object(input, path, keys);
        return {x: number(p.x, `${path}.x`, 0, width), y: number(p.y, `${path}.y`, 0, height)};
    };
    const rect = (input: unknown, path: string, identified = false) => {
        const keys = ['x', 'y', 'width', 'height', ...(identified ? ['id'] : [])];
        const p = object(input, path, keys);
        const result = {...point(input, path, keys), width: number(p.width, `${path}.width`, 1, width), height: number(p.height, `${path}.height`, 1, height)};
        if (result.x + result.width > width || result.y + result.height > height) fail(path, 'rectangle extends outside the level');
        return result;
    };
    const seen = new Set<string>();
    const objectId = (input: unknown, path: string) => {
        const result = id(input, `${path}.id`);
        if (seen.has(result)) fail(`${path}.id`, 'must be unique across all collections');
        seen.add(result);
        return result;
    };
    const array = <T>(input: unknown, path: string, parse: (item: unknown, path: string) => T): T[] => {
        if (!Array.isArray(input)) { fail(path, 'must be an array'); return []; }
        if (input.length > 1000) { fail(path, 'at most 1000 objects are allowed'); return []; }
        return input.map((item, index) => parse(item, `${path}[${index}]`));
    };
    let tiles = 0;
    const terrain = (input: unknown, path: string) => {
        const p = object(input, path, ['id', 'x', 'y', 'width', 'height']);
        const bounds = rect(input, path, true);
        if ([bounds.x, bounds.y, bounds.width, bounds.height].some(n => n % 48)) fail(path, 'terrain and decorations must align to the 48-pixel grid');
        tiles += bounds.width * bounds.height / (48 * 48);
        return {id: objectId(p.id, path), ...bounds};
    };
    const result: LevelDocument = {
        schemaVersion: 1, id: id(root.id, 'id'), name: string(root.name, 'name', 120),
        revision: number(root.revision, 'revision', 0, Number.MAX_SAFE_INTEGER - 1), tileSize: 48, width, height,
        spawn: point(root.spawn, 'spawn'), exit: rect(root.exit, 'exit'),
        terrain: array(root.terrain, 'terrain', terrain), decorations: array(root.decorations, 'decorations', terrain),
        enemies: array(root.enemies, 'enemies', (input, path) => {
            const p = object(input, path, ['id', 'kind', 'x', 'y', 'patrol']);
            const kind = p.kind as keyof typeof enemyTuning;
            if (typeof kind !== 'string' || !Object.hasOwn(enemyTuning, kind)) fail(`${path}.kind`, 'unknown enemy kind');
            const patrol = object(p.patrol, `${path}.patrol`, ['left', 'right']);
            return {id: objectId(p.id, path), kind, ...point(input, path, ['id', 'kind', 'x', 'y', 'patrol']), patrol: {
                left: number(patrol.left, `${path}.patrol.left`, 0, width), right: number(patrol.right, `${path}.patrol.right`, 0, width),
            }};
        }),
        signs: array(root.signs, 'signs', (input, path) => {
            const p = object(input, path, ['id', 'x', 'y', 'title', 'text']);
            return {id: objectId(p.id, path), ...point(input, path, ['id', 'x', 'y', 'title', 'text']), title: string(p.title, `${path}.title`, 120), text: string(p.text, `${path}.text`, 300)};
        }),
        npcs: root.npcs === undefined ? [] : array(root.npcs, 'npcs', (input, path) => {
            const p = object(input, path, ['id', 'kind', 'x', 'y', 'scene']);
            const kind = p.kind as NPCKind;
            if (typeof kind !== 'string' || !Object.hasOwn(npcCatalog, kind)) fail(`${path}.kind`, 'unknown NPC kind');
            const scene = id(p.scene, `${path}.scene`);
            if (!sceneFor(scene)) fail(`${path}.scene`, 'unknown dialogue scene');
            return {id: objectId(p.id, path), kind, scene, ...point(input, path, ['id', 'kind', 'x', 'y', 'scene'])};
        }),
    };
    if (tiles > 10000) fail('terrain', 'at most 10000 expanded tiles are allowed, including decorations');
    for (let i = 0; i < result.terrain.length; i++) {
        for (let j = 0; j < i; j++) if (overlaps(result.terrain[i], result.terrain[j])) fail(`terrain[${i}]`, `overlaps ${result.terrain[j].id}`);
    }
    const actor = (x: number, y: number, w: number, h: number, path: string) => {
        const bounds: Rect = {x: x - w / 2, y: y - h, width: w, height: h};
        if (bounds.x < 0 || bounds.y < 0 || bounds.x + w > width || y > height) fail(path, 'actor bounds extend outside the level');
        if (result.terrain.some(block => overlaps(bounds, block))) fail(path, 'actor overlaps solid terrain');
    };
    actor(result.spawn.x, result.spawn.y, 32, 52, 'spawn');
    if (result.terrain.some(block => overlaps(result.exit, block))) fail('exit', 'overlaps solid terrain');
    result.enemies.forEach((enemy, index) => {
        const stats = Object.hasOwn(enemyTuning, enemy.kind) ? enemyTuning[enemy.kind] : undefined;
        if (!stats) return;
        actor(enemy.x, enemy.y, stats.width, stats.height, `enemies[${index}]`);
        if (enemy.patrol.left > enemy.x || enemy.patrol.right < enemy.x || enemy.patrol.left > enemy.patrol.right) fail(`enemies[${index}].patrol`, 'range must contain the enemy');
        if (enemy.patrol.left < stats.width / 2 || enemy.patrol.right + stats.width / 2 > width) fail(`enemies[${index}].patrol`, 'actor bounds extend outside the level');
    });
    result.npcs.forEach((npc, index) => {
        const info = Object.hasOwn(npcCatalog, npc.kind) ? npcCatalog[npc.kind] : undefined;
        if (info) actor(npc.x, npc.y, info.width, info.height, `npcs[${index}]`);
    });
    if (!issues.length && new TextEncoder().encode(JSON.stringify(result)).byteLength > 1_000_000) fail('level', 'document exceeds 1 MB');
    if (issues.length) throw new LevelValidationError(issues);
    return result;
}

export function parseLevelJson(json: string): LevelDocument {
    if (json.length > 1_000_000 || new TextEncoder().encode(json).byteLength > 1_000_000) throw new LevelValidationError(['level: file exceeds 1 MB']);
    let value: unknown;
    try { value = JSON.parse(json); } catch { throw new LevelValidationError(['level: invalid JSON syntax']); }
    return parseLevelDocument(value);
}
