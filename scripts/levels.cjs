require('tsx/cjs');
const fs = require('node:fs');
const path = require('node:path');
const {parseLevelJson} = require('../src/levels/LevelValidation.ts');
const {formatDocument} = require('../src/levels/LevelDocument.ts');
const {applyLevelChanges} = require('../src/levels/LevelChanges.ts');

try {
    const args = process.argv.slice(2);
    if (args[0] === '--') args.shift();
    const [command, filename, patchFile] = args;
    if (!['build', 'validate', 'summary', 'format', 'patch'].includes(command) || !filename || (command === 'patch' && !patchFile)) {
        throw new Error('Usage: npm run level -- <build|validate|summary|format|patch> <source.level.ts|level.json> [output.json|changes.json]');
    }
    const target = path.resolve(filename);
    if (command === 'build') {
        let source = require(target).default;
        const companion = target.replace(/\.level\.ts$/, '.layout.ts');
        if (companion !== target && fs.existsSync(companion)) source = source.withLayout(require(companion).default);
        const {LevelSource} = require('../src/levels/source/LevelSource.ts');
        if (!(source instanceof LevelSource)) throw new Error('Module must default-export defineLevel(...)');
        const compiled = source.document();
        if (patchFile) { fs.writeFileSync(path.resolve(patchFile), formatDocument(compiled), {flag: 'wx'}); console.log(`Built ${compiled.id}`); }
        else process.stdout.write(formatDocument(compiled));
        process.exit(0);
    }
    const original = fs.readFileSync(target, 'utf8');
    const document = parseLevelJson(original);
    if (command === 'validate') console.log(`${document.id}: valid revision ${document.revision}`);
    if (command === 'summary') console.log(JSON.stringify({
        id: document.id, name: document.name, revision: document.revision,
        size: {width: document.width, height: document.height},
        objects: Object.fromEntries(['terrain', 'decorations', 'enemies', 'npcs', 'interactables', 'signs', 'water', 'props'].map(collection => [collection, document[collection].map(item => item.id)])),
    }, null, 2));
    if (command === 'format' || command === 'patch') {
        const updated = command === 'patch' ? applyLevelChanges(document, JSON.parse(fs.readFileSync(patchFile, 'utf8'))) : document;
        const lock = `${target}.lock`, temporary = `${target}.${process.pid}.tmp`;
        const handle = fs.openSync(lock, 'wx');
        try {
            if (fs.readFileSync(target, 'utf8') !== original) throw new Error('File changed during the operation; reload before retrying');
            fs.writeFileSync(temporary, formatDocument(updated), {flag: 'wx'});
            fs.renameSync(temporary, target);
        } finally {
            fs.closeSync(handle); fs.rmSync(lock, {force: true}); fs.rmSync(temporary, {force: true});
        }
        console.log(`${updated.id}: saved revision ${updated.revision}`);
    }
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
