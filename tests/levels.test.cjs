require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {parseLevelDocument, parseLevelJson} = require('../src/levels/LevelValidation.ts');
const {compileLevel} = require('../src/levels/LevelCompiler.ts');
const {applyLevelChanges} = require('../src/levels/LevelChanges.ts');
const {formatDocument} = require('../src/levels/LevelDocument.ts');
const {EditorSession} = require('../src/editor/EditorSession.ts');
const {createBlankLevel} = require('../src/editor/createBlankLevel.ts');
const {World} = require('../src/game/World.ts');
const original = require('../public/levels/lower-passage.json');
const patch = (document, operations) => ({levelId: document.id, baseRevision: document.revision, operations});

test('the shipped JSON preserves terrain, actor anchors, enemy roster and fresh runtime state', () => {
    const document = parseLevelDocument(original), level = compileLevel(document);
    assert.equal(level.solids.length, 254);
    assert.deepEqual(level.spawn, {x: 144, y: 524});
    assert.deepEqual(level.exit, {x: 5184, y: 468, width: 64, height: 108});
    const world = new World(level);
    assert.equal(world.enemies.length, 8);
    assert.deepEqual(world.enemies.map(enemy => enemy.x), [480, 1152, 1824, 2496, 3168, 3648, 3792, 3984]);
    assert.equal(world.enemies.find(enemy => enemy.kind === 'ghost').y2, 518);
    assert.ok(world.enemies.filter(enemy => enemy.kind !== 'ghost').every(enemy => enemy.y2 === 576));
    level.solids[0].x = 900;
    assert.equal(compileLevel(document).solids[0].x, 0);
    assert.equal(parseLevelJson(formatDocument(document)).name, document.name);
});

test('decoration renders as separate tiles without becoming solid collision', () => {
    const document = createBlankLevel();
    document.decorations.push({id: 'wall-in-background', x: 144, y: 480, width: 48, height: 96});
    const level = compileLevel(document);
    assert.equal(level.decorations.length, 2);
    assert.ok(level.solids.every(wall => wall.y >= 576));
    assert.equal(new World(level).level.decorations.length, 2);
});

test('invalid documents are rejected with field paths before constructing a world', () => {
    const cases = [
        [document => document.schemaVersion = 2, /schemaVersion/],
        [document => document.spawn.y = 600, /spawn: actor overlaps/],
        [document => document.exit.y = 576, /exit:.*outside|exit: overlaps/],
        [document => document.terrain[0].width = 50, /terrain\[0\].*48-pixel/],
        [document => document.decorations.push({...document.terrain[0]}), /must be unique/],
        [document => document.terrain.push({...document.terrain[0], id: 'duplicate-floor'}), /overlaps floor/],
        [document => document.enemies.push({id: 'bad-enemy', kind: 'dragon', x: 600, y: 576, patrol: {left: 500, right: 700}}), /unknown enemy kind/],
        [document => document.enemies.push({id: 'bad-patrol', kind: 'zombie', x: 600, y: 576, patrol: {left: 700, right: 800}}), /range must contain/],
        [document => document.unrecognised = true, /unknown field/],
    ];
    for (const [mutate, expected] of cases) {
        const document = createBlankLevel(); mutate(document);
        assert.throws(() => parseLevelDocument(document), expected);
    }
    assert.throws(() => parseLevelJson('{invalid'), /invalid JSON/);
    assert.throws(() => parseLevelJson(' '.repeat(1_000_001)), /exceeds 1 MB/);
});

test('AI patches are atomic, ID-addressed and reject stale or wrong-level changes', () => {
    const document = createBlankLevel();
    const updated = applyLevelChanges(document, patch(document, [{op: 'upsert', collection: 'signs', value: {id: 'ai-hint', x: 240, y: 400, title: 'LOOK EAST', text: 'The next jump is yours.'}}]));
    assert.equal(updated.revision, 2); assert.equal(document.signs.length, 0);
    assert.equal(updated.signs[0].id, 'ai-hint');
    assert.throws(() => applyLevelChanges(updated, patch(document, [{op: 'set', field: 'name', value: 'stale'}])), /Revision conflict/);
    assert.throws(() => applyLevelChanges(updated, {...patch(updated, []), levelId: 'wrong-level'}), /different level/);
    assert.throws(() => applyLevelChanges(updated, patch(updated, [{op: 'set', field: 'name', value: 'Partial edit'}, {op: 'set', field: 'spawn', value: {x: 160, y: 600}}])), /overlaps/);
    assert.equal(updated.name, 'Untitled level');
    const removed = applyLevelChanges(updated, patch(updated, [{op: 'remove', collection: 'signs', id: 'ai-hint'}]));
    assert.equal(removed.signs.length, 0);
});

test('editor undo and redo keep revisions increasing and snapshots isolated', () => {
    const session = new EditorSession(createBlankLevel());
    const leaked = session.document; leaked.name = 'Mutation outside the editor';
    assert.equal(session.document.name, 'Untitled level');
    session.apply(patch(session.document, [{op: 'set', field: 'name', value: 'Human edit'}]));
    session.undo(); assert.equal(session.document.name, 'Untitled level'); assert.equal(session.document.revision, 3);
    session.redo(); assert.equal(session.document.name, 'Human edit'); assert.equal(session.document.revision, 4);
    assert.throws(() => session.replace({...session.document, name: 'Old draft'}, 2), /Revision conflict/);
    session.undo();
    session.apply(patch(session.document, [{op: 'set', field: 'name', value: 'New branch'}]));
    assert.equal(session.canRedo, false);
});

test('CLI validates and patches JSON files, preserving files after stale or invalid patches', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'underworld-level-test-'));
    try {
        const filename = path.join(directory, 'level.json'), changes = path.join(directory, 'patch.json');
        const document = createBlankLevel(); fs.writeFileSync(filename, formatDocument(document));
        fs.writeFileSync(changes, JSON.stringify(patch(document, [{op: 'set', field: 'name', value: 'AI edited file'}])));
        const run = (...args) => spawnSync(process.execPath, ['scripts/levels.cjs', ...args], {cwd: path.resolve(__dirname, '..'), encoding: 'utf8'});
        assert.equal(run('validate', filename).status, 0);
        assert.equal(run('--', 'validate', filename).status, 0);
        assert.equal(run('patch', filename, changes).status, 0);
        const saved = fs.readFileSync(filename, 'utf8'); assert.equal(parseLevelJson(saved).name, 'AI edited file');
        const stale = run('patch', filename, changes); assert.equal(stale.status, 1); assert.match(stale.stderr, /Revision conflict/);
        assert.equal(fs.readFileSync(filename, 'utf8'), saved);
        assert.equal(run('summary', filename).status, 0);
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
});
