# Source-first level authoring

10 November 2026. This replaces shipped JSON layouts as the authoring workflow. All ten previous layouts, the legacy numeric map and their route-specific tests have been removed. Artwork, worldbuilding, narrative/save systems and historical friction observations remain. No old chapter is registered as playable. The first new source-authored slice, [A Light Left On](lantern-quay.md), is the default Play destination. `/?sandbox=1` retains the empty workspace.

## Author a module

Save `src/content/levels/my-level.level.ts`. Its filename must match its exported level ID. The registry discovers these modules through build-owned imports; there is no hand-maintained list. Vite compiles TypeScript into the browser build.

```ts
import {defineLevel, defineAssembly} from '../../levels/source';

// This can live in another module and accept width, theme, floors or other parameters.
const walkway = defineAssembly(scene => {
    scene.add('terrain', {
        id: 'deck', kind: 'platform', x: 0, y: 0,
        width: 1920, height: 96, thickness: 24, material: 1,
    });
    scene.add('props', {
        id: 'bench', asset: 'confluence-bench', x: 200, y: -64,
        width: 128, height: 64,
        mount: {parent: 'deck', socket: 'topLeft'},
    });
});

export default defineLevel({
    id: 'my-level', name: 'My level', width: 1920, height: 960,
    spawn: {x: 160, y: 576},
    exit: {x: 1776, y: 468, width: 64, height: 108},
    presentation: {environment: 'confluence', scenery: 'authored'},
}, scene => {
    scene.place('arrival', {x: 0, y: 576}, walkway);
});
```

Open `/?level=my-level`. `npm run level:audit` builds every source twice, rejects inconsistent results, verifies filename/ID agreement and compiles its scene. `npm run level -- build src/content/levels/my-level.level.ts` prints the compiled JSON; append an output filename to create a snapshot without overwriting an existing file. `npm run check` checks TypeScript throughout `src` as well as engine tests.

## Responsibilities

- `LevelSource`: immutable metadata plus a build function, producing fresh validated documents and runtime levels.
- `SceneBuilder`: typed additions and assembly placement. Ordinary TypeScript functions, parameters, loops and imports provide reuse.
- `SceneAssembly`: detached reusable local composition.
- `ScenePlacement`: translates children and remaps structural mounts, water endpoints and patrol ranges. A mounted offset is never translated twice.
- `LevelValidation` / `LevelCompiler`: validate expanded scene constraints and build existing runtime structures. JSON schema v2 is now an interchange contract, not a language for authoring reuse.
- `LevelRegistry`: imports repository-owned `.level.ts` modules. Uploaded JSON is data; an uploaded script or arbitrary URL is never executed as a level module.
- Runtime classes: retain collision, actor, water and rendering responsibilities. Layout code runs during loading/building, not on simulation ticks.

An assembly can contain any existing collection, including nested assemblies. Each child retains its semantic type. `arrival` + local child `deck` becomes `arrival--deck`; further nesting keeps that path stable. `place(...)` returns `child(localId)` to obtain checked IDs for connections added outside the assembly. Internal references must name local children. Story/catalog references are not renamed. Duplicate placements and generated ID collisions fail instead of sharing children.

Coordinates are whole pixels; local coordinates may be negative if final resolved bounds are valid. Placement translates without scaling, rotation or reflection: those transforms need explicit semantics for actors, collision and water. Natural sprite scaling remains a prop responsibility. Receiver relationships still determine fall endpoints. Resizing a pier to its receiving floor remains an explicit calculation in an assembly factory; it is not hidden renderer behavior.

Source functions should be deterministic and free of browser, simulation or storage dependencies. Use parameters or a fixed seed for variants. Compilation checks bounds, actual collision parts, actor overlap, IDs, asset references, mounts, water direction/connections and existing expanded-scene budgets. Compact source does not exempt its generated output from those budgets. Audit determinism is a check, not a sandbox for trusted repository code.

## Shared source and workshop authoring

The source module and workshop now use the same assembly build path. **Open level source** preserves the source binding. The Assemblies panel edits instance X/Y and declared parameters; **Move assembly** drags the selected instance as a whole. Its structures, mounted props, water connections and actors regenerate together.

A generated child's inspector edits create explicit, local property overrides. The panel labels inherited versus overridden children. **Reset child override** removes that exception; **Reset assembly to source** restores its authored placement, parameters and children. Unchanged fields and unrelated instances remain inherited. Undo/redo, compiled-JSON edits and local draft restoration preserve source ownership.

**Export source layout** writes `<id>.layout.ts`. Save it beside `<id>.level.ts` in `src/content/levels`. Browser loading, workshop loading, CLI compilation and source audit automatically apply the companion through `LevelSource.withLayout(...)`. Source functions, imports and loops remain in the original module. The layout contains instance changes, property deltas and root edits, not expanded copies of generated rooms. It records source ID/revision; a mismatch or missing instance/child rejects the build instead of silently dropping changes.

For a blank or imported JSON draft, **Export TypeScript** still creates a new `.level.ts` starting point. **Export JSON snapshot** always exports compiled scene data. Opening JSON intentionally opens a standalone draft; it cannot restore source ownership. Source drafts are stored separately by source identity and recompiled on restoration. A source draft that cannot restore is preserved in browser storage with an error message.

See [the source/editor workflow](source-editor-workflow.md) for parameter definitions, exported layout examples, API edits and verification. The object list also filters IDs and groups assembly children. List/API selection and **Focus selection** focus the actual bounds, including deep vertical rooms, without increasing full-canvas pixel budgets.

## What remains to establish

Source composition and navigation address the repeated-placement bottleneck. A controller-driven takeoff/headroom preview, route-aware objectives, live frame timing and representative-device profiling remain follow-ups. Human playtesting still establishes route clarity, encounter balance and pacing. A successful compilation never proves a playable level. The next level should be a small composition exercise before a new stress map.
