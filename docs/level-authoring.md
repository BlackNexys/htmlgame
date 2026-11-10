# Level authoring and collaboration

Open `/editor.html` through the development or preview server. The **Level workshop** is a separate application entry point with its own UI, state, history, canvas, and browser draft. It shares the JSON contract and validation with the game. It does not import the game controller, construct a simulation, or modify a running game.

## Worldbuilding and level scope

The [Deadways atlas](Worldbuilding/Underworld_Deadways_World_Atlas_v0_1.md) supplies exploratory setting ideas. Its regions are not required levels or a prescribed campaign sequence. The Lower Passage, movement course and dialogue studies remain mechanics fixtures. The separate [Last Platform demo](last-platform-demo.md) now explores the supplied station design with an inhabited railway district, an upper viaduct/gallery route, inhabited side rooms and a canal return spine and draft writing; this does not lock the atlas's wider geography. Its runtime JSON differs from the preserved design-pack source. The newer [Last Platform rebuild](last-platform-rebuild.md) is the forward-route candidate; the older district remains a comparison level. See the [level audit](level-audit.md) for the complete playable inventory. Import `public/levels/last-platform-demo.json` to edit the integrated route and registered interactions.

For a future level brief, record a candidate setting and its status, the movement/combat questions to test, and any proposed interactions separately from supported features. Keep spectacle subordinate to readable routes, threats, and collision boundaries. The current schema supports neutral NPCs with direct or conditional scene references and inspect/collect/operate objects, including an optional saved Keepsake in `narrative-study`. It supports authored visual water networks with rivers, canals, basins, drains and connected waterfalls. Water currently has no swimming, damage or current-force mechanics. It has no regional simulation, playable train or gravity-transition system. Decorations and signs cannot stand in for implementing those mechanics. A setting assignment does not require new runtime fields unless a concrete gameplay need warrants them.

## Human workflow

1. Open the existing example, create a new level, or choose **Open JSON**.
2. Use **Terrain** to place structures and choose their kind in the inspector. Walls, platforms, bridges and open doorways have different collider and surface compositions. **Decoration** creates structures without collision; choose rear or foreground placement in the inspector. Place the **Player**, **Exit**, **Enemy**, **NPC**, or **Sign** by clicking; select the enemy type or NPC type/scene before placement. NPC coordinates mark their feet, and the inspector can change the registered scene reference.
3. Use **Select / move** to pick and drag an object. Use the object list and inspector for keyboard access and precise coordinates. The configurable grid is a placement aid. Inspector values accept whole-pixel geometry, including thin platforms and dimensions that are not multiples of 48. Socket mounts store offsets relative to their parent.
4. Apply inspector or level properties. Invalid changes leave the committed document unchanged. **Reset property edits** discards unapplied form changes. Undo/redo covers validated changes, including JSON and AI patches; Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z work outside text inputs.
5. Use **Playtest** to launch a separate game instance from a frozen JSON snapshot. Closing it leaves the editor and its history intact. Restarting the playtest retains that snapshot.
6. **Export JSON** downloads the current validated level. Save it under `public/levels/<id>.json`, commit it, and play `/?level=<id>`. The editor's browser draft does not write project files automatically.

The browser restores the last committed document and any unapplied JSON text after a reload when local storage is available. New/open/example actions replace the current document and clear its undo history; export important work before switching files. Browser storage is a convenience for one workshop draft, not a shared repository or a multi-user synchronization service.

The JSON panel supports direct editing. **Validate and apply JSON** validates the complete document and checks the revision from which the text was edited. When another edit has advanced the revision, the text stays intact and applying reports a conflict. **Download JSON draft** preserves that exact text, including an invalid or stale draft. **Reset JSON draft** replaces it with the latest committed document. Merge your changes into the latest revision before applying again.

## File format

Each level is one JSON file, independent of editor state or executable scripts. Images and fonts remain shared game assets. All shipped maps use `schemaVersion: 2`; [`public/levels/level.schema.json`](../public/levels/level.schema.json) documents the structural contract. Runtime validation adds geometry and relationship checks.

[`lower-passage.json`](../public/levels/lower-passage.json) is the migrated playable level. Its terrain is stored as 11 structures instead of 254 individual tile objects. The compiler creates concrete structure instances and their collider parts directly; repeating artwork does not create physics tiles. Legacy version-1 files still import and normalize to version 2.

| Field | Meaning |
| --- | --- |
| `id`, `name` | Stable lowercase file ID and display name |
| `revision` | Nonnegative integer; committed edits, undo, and redo increase it |
| `gridSize` | Editor snapping aid; geometry is independent of it |
| `width`, `height` | Level dimensions in whole world pixels |
| `spawn` | Player's bottom-center position |
| `exit` | Exit rectangle, top-left position and size |
| `terrain` | Typed structures with bounds, collider parts and stable IDs |
| `decorations` | Noncolliding structures with rear/foreground layers and depth |
| `props` | Catalog artwork with explicit visual bounds, structure mounts, layers and depth; no collision |
| `presentation` | Optional explicit environment and scene-composition choice |
| `water` | Visual water bodies, mounted drains and source-to-receiver waterfalls |
| `enemies` | ID, kind, bottom-center position, and center-based patrol limits |
| `npcs` | Optional array of neutral actor ID, kind, bottom-center position and registered scene ID; omitted arrays normalize to empty |
| `interactables` | Optional inspect/collect/operate objects with top-left bounds, label, reach, registered card/scene and optional effect, condition and solid flag; omitted arrays normalize to empty |
| `signs` | ID, text origin X/Y, heading, and message |

All authored coordinates use **world pixels**, with X increasing east and Y increasing down. For example, an enemy at `{ "x": 504, "y": 576 }` stands with its feet at Y=576. Patrol `left` and `right` describe the same center anchor. Actor sprite dimensions do not need to be subtracted by the author. The compiler handles the existing runtime's top-left and enemy spawn conventions.

Object IDs must be unique across all collections and use lowercase letters, digits, and hyphens, beginning with a letter. Keep IDs stable when moving or editing an object. Use new IDs for new objects. Collection order is preserved for readable diffs.

Validation checks finite integer coordinates, known kinds, dimensions, duplicate IDs, collider overlap, actor/exit overlap with colliders, actor bounds and patrol containment. It also resolves mounts and water connections, rejecting cycles, missing sockets and invalid flow direction. It limits files to 1 MB and collections to 1000 objects. The version-1 importer still enforces its original 48-pixel geometry contract. These checks do not prove that a jump or the exit is reachable; playtesting and simulation tests still serve that purpose.

## AI file workflow

See [neutral NPCs](npc-system.md) for neutral combat policy and [narrative systems](narrative-system.md) for object JSON, catalogs and saving. Current NPC kind: `rail-attendant`; scenes include the direct `station-exchange` and the fact-driven `registry-attendant` resolver. The workshop's **Object** tool places ledger, letter, route-index and gate presets; the inspector edits bounds, label, reach, kind, scene, effect, condition and solidity. Invalid reference combinations are rejected before commit.

An agent can read and edit the same JSON that the workshop imports and exports. Use the existing IDs and consult the schema. Prefer a revision-checked patch for bounded edits:

```sh
npm run level -- summary public/levels/lower-passage.json
npm run level -- validate public/levels/lower-passage.json
npm run level -- patch public/levels/lower-passage.json changes.json
```

`format` normalizes whitespace without changing the revision. Direct file edits should increment the revision when changing content.

Example `changes.json` (replace `baseRevision` with the current revision reported by `summary`):

```json
{
  "levelId": "lower-passage",
  "baseRevision": 1,
  "operations": [
    {
      "op": "upsert",
      "collection": "signs",
      "value": {
        "id": "sign-1",
        "x": 150,
        "y": 470,
        "title": "THE LOWER PASSAGE",
        "text": "WATCH THE NEXT LEDGE"
      }
    }
  ]
}
```

Supported operations:

- `upsert`: add or replace one complete object by ID in `terrain`, `decorations`, `enemies`, `npcs`, `interactables`, `signs`, `water`, or `props`.
- `remove`: remove an object by `collection` and `id`; missing IDs produce an error.
- `set`: replace `id`, `name`, `width`, `height`, `gridSize`, `presentation`, `spawn`, or `exit` with `value`.

The whole patch validates before committing. Multiple changes that depend on each other belong in one patch. A wrong level ID, stale revision, or invalid result leaves the document untouched. Successful patches increment the revision once. The CLI locks cooperating writes and replaces the file atomically; external tools should still coordinate or use Git to merge independent branches. It does not provide distributed transactions or automatic conflict merging.

After a file edit, use **Open JSON** in the workshop to load that file. Workshop exports are regular files that agents can validate, patch, review, and commit. File import/export is the collaboration boundary; there is no hidden connection to an AI service.

## Live browser-agent workflow

The editor exposes a browser-local API for an agent controlling the page:

```js
const document = window.levelEditor.getDocument();
window.levelEditor.applyChanges({
  levelId: document.id,
  baseRevision: document.revision,
  operations: [{ op: 'set', field: 'name', value: 'The Forgotten Passage' }]
});
window.levelEditor.select({ collection: 'enemies', id: 'skeleton-2' });
```

`getDocument()` and `getSelection()` return copies. `applyChanges()` uses the same validator, revision checks, history, and local-draft persistence as human actions. Patches are refused while a human has unapplied property-form edits. Unapplied JSON text remains visible after a patch so its revision conflict can be resolved explicitly. This API exists only in the editor window, including when its independent playtest is open.

## Runtime boundary

`LevelLoader` fetches only the requested level JSON when the game starts. `LevelCompiler` translates validated documents into the simulation's `Level` interface. `Game` keeps the loaded definition for clean restarts. The synchronous `src/maps/actionLevel.ts` wrapper exists for tests; it is not imported by the browser runtime. The original `level0.ts` remains an old reference format.

The game can also load a same-origin JSON URL through `?levelUrl=...`. The workshop uses a temporary Blob URL for playtests and revokes it when the playtest closes. No editor model, undo history, or mutable map is passed into the game. Every `levelUrl` run uses an isolated in-memory narrative session, even when the document has a campaign stage ID. `preview=1` also explicitly isolates a normal level URL. Playtest discoveries, reset and onward links cannot overwrite the real campaign.

Run `npm run check` and `npm run test:browser` after changes. Editor tests cover visual edits, property changes, undo/redo, JSON round trips, draft persistence, AI conflicts, snapshot isolation, chosen-map restart, and runtime loading failures in Chromium and Firefox.

## Verifying a level revision

Run `npm run level:audit` to validate every shipped map, round-trip its workshop document, check spawn support and traverse its completion route. Run `npm run check` for all simulation checks and the production build, then `npm run test:browser` for actual game/editor coverage in Chromium and Firefox. The inventory browser test checks assets, restart and file import/export for every playable JSON. See [world structures](world-structures.md) and [water elements](water-elements.md) for the current authoring contracts.

When adding a shipped map, the entry and workshop checks discover it automatically. Add a completion route to `tests/level-audit.test.cjs`; validation alone cannot establish a playable path. Preserve narrative object IDs when revising existing chapters.

Keep the [authoring friction log](level-authoring-friction.md) alongside level work: record concrete obstacles as they occur, their cost, the workaround used and whether an improvement was implemented or remains a proposal. The current entries come from the fresh Last Platform river-crossing rebuild.

The [authoring improvement plan](level-authoring-improvement-plan.md) defines the proposed sequence for portable props, explicit story-art anchors, proper railing rendering, structured browser observations and removal of legacy placement rules.

Props and story-art placement are implemented. See [authored scene art](authored-scene-art.md) for the catalog, mounts, editor controls, visual/interaction bounds, railing renderer and opt-in observation API. Environment selection is explicit, so copying a scene to a new ID preserves its appearance.
