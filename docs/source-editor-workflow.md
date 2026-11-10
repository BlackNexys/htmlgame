# Shared source and editor workflow

10 November 2026. Source modules and the workshop now edit the same assembly instances through `LevelSource` and `LevelLayout`.

## Files and ownership

| File | Owns |
| --- | --- |
| `<id>.level.ts` and imported assembly modules | Factories, imports, loops, defaults, declared parameters, local geometry and original placements |
| `<id>.layout.ts` | Workshop changes to instance origins/parameters, explicit child-property overrides, metadata and root-object edits |
| Exported scene JSON | Compiled interchange/playtest snapshot; no source ownership or executable code |

The matching layout companion lives in `src/content/levels` beside its level module. The browser registry, workshop, `npm run level -- build ...` and `npm run level:audit` automatically apply it. Source code can also call `source.withLayout(layout)` directly. The workshop downloads the companion; save that download into the repository to update the project. It does not silently write repository files.

## Declare editable parameters

```ts
import {defineAssembly} from '../../levels/source';

export const balcony = defineAssembly({
    name: 'Canal balcony',
    parameters: {
        width: {type: 'number', default: 640, min: 320, max: 960, step: 8},
        lit: {type: 'boolean', default: true},
        material: {type: 'choice', default: 'steel', options: ['steel', 'stone']},
    },
}, (scene, parameters) => {
    scene.add('terrain', {
        id: 'deck', kind: 'platform', x: 0, y: 0,
        width: parameters.width, height: 24,
        material: parameters.material === 'steel' ? 1 : 0,
    });
    scene.add('props', {
        id: 'bench', asset: 'confluence-bench', x: 24, y: -64,
        width: 128, height: 64, light: parameters.lit ? 100 : 30,
        mount: {parent: 'deck', socket: 'topLeft'},
    });
});
```

Use `scene.place('west-balcony', {x: 400, y: 700}, balcony, {width: 720})` in a level source. Parameter values are inferred for the TypeScript callback and validated at build time. The workshop generates controls from this same definition. Existing static `defineAssembly(scene => ...)` calls remain supported, with placement controls and no parameters.

Parameters regenerate the assembly through its factory. Supports, furniture and other geometry that depend on width should be calculated from that parameter in the factory. A property override is a deliberate exception to those rules, not an inferred resize relationship.

## Edit in the workshop

1. Choose the module and **Open level source**.
2. Select an instance in **Assemblies**. Change its origin or parameters and choose **Apply assembly**.
3. To move it directly, select **Move assembly** and drag inside its dashed outline. The outline previews the translation; the complete validated scene updates on release.
4. Select a generated child to edit its normal semantic properties. The assembly panel reports whether it is inherited or has an explicit local override. **Reset child override** restores that child; **Reset assembly to source** restores the instance's authored placement, parameters and children.
5. Use undo/redo, reload the draft, and playtest. These operations preserve the source binding.
6. Choose **Export source layout**, then save `<id>.layout.ts` beside the source module. Reopening the game or workshop applies the same layout.

Unchanged controls do not create overrides. Moving an instance changes its origin, while mounted offsets stay local. Water sources, receiving bodies, actor patrols and child references use the same translation rules as ordinary source compilation. Editing one instance does not change another instance that uses the same factory.

A generated child might have this exported exception:

```ts
import type {LevelLayout} from '../../levels/source';

export default {
    version: 1,
    source: 'my-level',
    sourceRevision: 1,
    revision: 4,
    instances: {
        'west-balcony': {
            x: 560,
            parameters: {width: 800},
            children: [
                {collection: 'props', id: 'bench', set: {opacity: 60}, unset: []},
            ],
        },
    },
    operations: [],
} satisfies LevelLayout;
```

The deck and bench remain factory-generated. Their unmodified properties still follow source changes; there is no expanded room copy in this companion.

## Validation, history and drafts

Source layouts identify their source ID and authored revision. Missing instances/children, incompatible revisions, unknown parameters, invalid geometry and broken water or mount references reject the complete edit. Generated children cannot be secretly changed through root-level layout operations. Local child IDs cannot be renamed through an override.

`EditorSession` owns source-aware history. Each accepted state has a validated compiled document and its layout. Undo/redo retain source identity and advance the editor revision. Compiled-JSON edits become explicit root edits or local child deltas, preserving the binding. JSON import deliberately opens a standalone document.

Source drafts store the source identity and layout separately from the compiled preview. Reload resolves the module again and recompiles the layout. An unavailable or incompatible source produces an error and preserves the stored layout. Selecting **New level** explicitly clears that source draft. Compiled snapshots alone cannot restore the functions that generated them.

The browser API exposes `getLayout()`, `selectAssembly(id)`, `configureAssembly(id, changes, baseRevision)` and `resetAssembly(id, childIdOrUndefined, baseRevision)`. Existing `getDocument()` and `applyChanges()` still operate on the compiled preview; source-bound edits become scoped layout deltas. Returned data is detached, and stale revisions fail atomically.

## Boundaries of this slice

The workshop configures existing top-level instances. Defining a new assembly factory, adding placement calls, changing an assembly's internal generation rules and exposing nested instances as separate editable units remain source-code operations. Nested child IDs retain their stable paths and can receive overrides. The editor does not reconstruct or rewrite arbitrary TypeScript functions.

Factories must remain deterministic and use the shared document contracts. Collision, props, water and actors retain their existing classes and validation. Source layouts do not add slopes, one-way platforms, water physics or route semantics.

## Verification

`npm run check` covers parameter regeneration, mounted props and water, actor patrols, scoped property deltas, sibling independence, root edits, compiled-JSON edits, history, resets and invalid/stale layouts.

`npm run test:authoring` performs a production round trip in Chromium and Firefox: import a temporary typed source and assembly, edit parameters and a child, reset/undo, restore the draft after reload, drag the instance, export its companion, rebuild, and compare the CLI, game and reopened workshop. It removes its exclusively created fixture files and restores an empty production build afterward, including on failure. CI runs it on Node 26 after installing the browser dependencies.

Verified on 10 November 2026: all 124 unit/simulation checks, full TypeScript checking and the production build passed. All 18 targeted Chromium/Firefox editor checks passed, including standalone snapshots and corrupt-draft recovery. The production source/layout round trip passed in both browsers, with matching CLI output and no temporary authored levels left behind.
