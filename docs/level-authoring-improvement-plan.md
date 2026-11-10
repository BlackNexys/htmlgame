# Level authoring improvement plan

9 November 2026. Status: phases 1-5 implemented on 9 November 2026. The original scope and acceptance criteria below remain the design record; [authored scene art](authored-scene-art.md) describes the shipped contract. Final verification is tracked in the [friction log](level-authoring-friction.md).

Based on the [authoring friction log](level-authoring-friction.md) and the [river-crossing rebuild](last-platform-rebuild.md). The goal is to build and revise a dressed, playable level through its document and workshop, with predictable attachments and repeatable verification.

## Priorities and current status

| Friction | Current state | Delivered scope |
| --- | --- | --- |
| F04: props require scenery code | Implemented: authored catalog props | Phases 1-2: shared art catalog, portable loading, authored props and workshop tools |
| F02: story art has hidden offsets | Implemented: separate mounted bounds | Phase 3: explicit placement and shared visual bounds |
| F05: railing uses sliced terrain art | Implemented: dedicated railing renderer | Phase 3: dedicated railing presentation and fallback |
| F06: browser tests intercept debug paint | Implemented: detached observations | Phase 4: structured read-only observations and shared pilot tooling |
| F03: duplicate route/capture coordinates | Implemented: shared anchors and captures | Phase 4: finish structural/object references and migrate other route tests |
| F01: scenery depends on coordinates | Implemented; historical conversion is v1-only | Phase 5: migrate remaining presentation data and remove active coordinate fallbacks |

The order puts the largest authoring gap first. Phase 4 can be implemented independently of the visual work if browser test maintenance becomes the immediate bottleneck. Each phase should leave the current game playable and be reviewable on its own.

## Architectural decisions

- Keep collision structures, cosmetic props, interaction behavior, asset loading and rendering separate. A bench does not become a wall because its art occupies a rectangle.
- Use concrete placed classes and focused files, consistent with structures, water and actors. Proposed names below describe responsibilities, not a requirement to introduce a framework.
- Store reusable sprite facts in a validated catalog: asset key, frame, natural size, pivot and sizing mode. Store a particular placement, mount and layer in the level document.
- Keep authored coordinates and resolved coordinates distinct. Resolve attachments once for compilation/preview; renderers consume resolved placements and do not invent floor offsets.
- Reuse the existing socket contract and atomic document changes. Start with structure parents; do not expand into arbitrary actor-following attachment graphs.
- Preserve IDs, collision footprints, story effects and save behavior during migration. Changes in visual placement must not silently change interaction reach or solidity.

## Phase 1 - Portable asset catalog and loading

Addresses the foundation of F04 and part of F01.

Create a browser-free scene-art catalog with stable asset keys for the existing bench, lamp, cargo, junction, ticket booth, timetable, canopy, inset windows, railing and story art. Separate it from `ConfluenceScene.ts`, which currently mixes reusable art information and placements for the old district. Catalog entries identify the required kit and sprite frame; runtime image handles stay in the loader/renderer.

Refactor `EnvironmentLoader` to accept explicit presentation requirements from the compiled level, rather than requiring one of three recognized level IDs. A level may request the Confluence environment, while prop references request their asset packs. A generic mechanics fixture should retain its simple background and avoid downloading the full city kit merely because it has one bench.

Introduce optional, validated document presentation metadata for explicit environment selection. Keep art-pack inference limited to referenced assets, not geography or the spelling of the level ID. Water's existing minimal loading behavior should remain supported.

Keep compatibility adapters for existing scene selection until Phase 5 has migrated those documents. Missing image files retain a readable fallback and do not prevent playing or editing. Unknown catalog keys are authoring errors; they should not silently draw an unrelated sprite.

**Done when:** a newly named level can display the same bench/canopy as the rebuild without a loader conditional or new placement code. The editor and runtime resolve the same catalog entry. Missing optional images preserve play; levels without those references do not request the packs.

## Phase 2 - Authored props and workshop placement

Closes the first production slice of F04.

Add a `props` collection, distinct from the existing structure `decorations`. A proposed `SceneryProp` class owns identity and resolved placement; `PropDefinition`, catalog validation, attachment resolution, `PropRenderer` and editor inspection each live in their own focused files. Static sprite variants share the class; future animated/interactive behavior gets its own responsibility rather than accumulating in a giant prop class.

The placement contract should be small: stable ID, catalog asset key, X/Y, optional display size, optional structure mount, rear/foreground layer and depth. Unmounted X/Y are the placed visual rectangle's top-left; mounted X/Y are offsets from the parent's socket. Catalog pivots position the artwork inside that contract. Default sizing preserves aspect ratio. Stretching or repeating is allowed only where the asset explicitly supports it.

Props contribute no colliders, narrative effects or water behavior. Initially they can mount to structures, including nonsolid structural decorations; prop-to-prop and water-to-prop dependencies are deferred until an actual placement needs them. Reuse the same socket validation and coordinate math without merging structures, water and props into one all-purpose entity.

Integrate the collection through the full authoring path: parser/compiler, published schema, global ID uniqueness, bounds checks, revision patches, CLI summary/format, editor selection/inspector, undo/redo, local draft storage, import/export and snapshot playtests. Missing parents and off-level resolved bounds must reject the entire edit atomically.

The workshop needs a prop picker, placement preview and visible anchor/bounds overlays. Load its art through the shared catalog/asset service without importing `Game` or constructing a simulation. Moving a parent should visibly move its props before launching a playtest.

Migrate the rebuild's props from `RebuiltConfluenceProps` into explicit mounted placements. Convert repeated bridge railing placements into ordinary prop records for this slice; reusable placement brushes/prefabs can follow once repetition is measured. Remove automatic dressing for converted structures so authored and generated furniture cannot double up.

**Done when:** add a lamp, bench and canopy in the workshop; mount them to a platform; move and resize that platform; undo/redo; export, reload and play. Their placements agree in both views, and the level's colliders and story state remain unchanged. The rebuilt arrival, freight and Registry furniture can be revised without editing TypeScript.

## Phase 3 - Story-art anchors and proper railings

Addresses F02 and F05 using the shared catalog.

### Story objects

Add a separate presentation record to interactable authoring: catalog art reference, visual placement/size and a shared structure mount where needed. Keep the existing interaction rectangle, reach, conditions, effects and optional blocker as gameplay data. The editor should show both visual and interaction bounds and label which is being edited.

Use a resolved placement result consumed by both preview and runtime. Put asset pivots in the catalog; put exceptional placement offsets in the document. Remove the object-ID-based `24`, `18` and `10` pixel bottom corrections and the comparison district's hardcoded story-art bottoms after migrating those objects.

Allow supported state appearances, such as shutter open/closed, to reference catalog assets. The renderer reads object state; the catalog does not open gates or award discoveries. Collected objects retain the existing visibility behavior.

Migrate the letter, ledger, index and shutter at their current visible positions. Test moving the floor and all its attached presentation/gameplay bounds together, and test an intentional visual-only adjustment that leaves reach and the blocker unchanged. Keep stable story IDs and saved evidence compatibility.

**Done when:** the workshop shows exactly where the ledger's feet and interaction rectangle will be; moving its parent carries both predictably; no story-object renderer contains an ID-specific placement offset. Collection, inspection, gate operation and restart still work through real input.

### Railings

Give the existing `Railing` structure its own surface appearance and a focused renderer. Its outer visual envelope should be drawn as a railing, instead of feeding each narrow bar through the terrain atlas. Keep collider parts independent: nonsolid decorative railings remain nonsolid; an explicitly solid structure retains its authored collision contract.

Use compatible end posts/repeating bays for arbitrary widths where the kit permits, clipping at the actual bounds. Supply a procedural metal-bar fallback when art is unavailable. Do not stretch one post across a long span or turn a foreground railing into an invisible full rectangle.

Use the prop catalog for a simple complete railing sprite, while the `Railing` structure remains the adjustable construction. They serve different authoring needs and should have explicit picker labels.

**Done when:** short, long and odd-width railings look coherent on rear and foreground layers, preserve transparency against a white background, and retain the construction study's passage/projectile behavior when nonsolid.

## Phase 4 - Stable observations and traversal references

Addresses F06 and finishes the reusable part of F03.

Add a small snapshot builder in a debug/observation module. `Game` supplies the current session to it, but snapshot creation does not become another simulation. Expose the adapter only through an explicit development/test option; ordinary game sessions do not need a global debug API.

Return fresh, serializable observations: loaded level ID/revision, session mode, simulation state/time, player bounds/velocity/ground and wall contact, relevant enemy bounds/state, camera bounds, interaction target IDs and blocker/exit state. Expose resolved static collision geometry through the same observation boundary so browser pilots do not treat a bridge's open envelope as a solid deck. Do not return live entity references, store handles or mutation methods.

Replace canvas paint interception in the rebuilt, comparison and construction route tests. Keep keyboard input, modal buttons and physical proximity as the way tests perform actions. Tests must still fail on an unreachable object, closed shutter, death or wrong level; observing state must not grant the ability to repair it.

Finish route references: structure ID plus local landing position, named interaction target and an explicitly requested approach side. Keep deliberate off-edge fall tests as explicit offsets from bridge boundaries. The rebuilt helper still has absolute X overrides, even though its story beats and capture anchors are now named.

Share the browser input driver and observation reader, while retaining separate level-specific route expectations. Derive capture focus from structure/water/object IDs. A missing or renamed anchor should give a direct error, not an unexplained navigation timeout. Avoid an automatic pathfinder that could route around the exact broken connection a test is meant to exercise.

**Done when:** turning off F2 or changing debug labels/colors cannot break route tests; moving a supported room/desk does not require editing capture coordinates and browser list indices; missing route anchors fail clearly. Editing a returned snapshot cannot move the player or change game state.

## Phase 5 - Remove the remaining legacy placement rules

Completes F01 and extends F04 beyond the rebuild.

Migrate remaining shipped Confluence presentation to explicit materials, environment selection and authored prop/story-art placements. Separate intentional procedural construction rules from level-specific placement lists: supports following a deck are useful; choosing a bridge or district from X/Y thresholds is not.

For old comparison scenery, migrate in small areas and compare rendered crops before removing its adapter. Catalog the additional architectural/landmark art needed for those areas rather than promising that the initial bench/lamp slice covers the entire district. Keep supported procedural wall/inset assemblies focused on their owning structures; any per-level exceptions must be visible in document presentation data.

Remove active loader level-ID branches, story-art coordinate tables and material-coordinate fallbacks only after their callers/documents have migrated. Normalize omitted material to a documented default for new data. Preserve old v1 import appearance through a bounded compatibility conversion; do not break legacy import or force generic mechanics maps into the Confluence style.

**Done when:** copying the rebuilt level to a new ID, or moving a decorated bridge into the station's former coordinates, preserves its kit and attachments. Every shipped map still loads and completes. No active scenery rule determines a structure's type, material or furniture from legacy world coordinates.

## Compatibility and scope

Use optional additive v2 fields for the first authoring slices and keep v1 imports supported. Ship parser, compiler, editor, CLI and published schema changes together. Bump a document's revision on migration. Do not use the campaign save format to store cosmetic placement, or silently drop new fields on import/export. Older tools that reject the extended document need an updated reader; do not describe them as forward-compatible.

No new movement mechanics, slopes, swimming, bosses, checkpoint policy, general scripting, arbitrary asset URLs or external editor integration are part of this plan. These fixes also do not establish encounter balance or first-visit pacing.

## Verification and completion criteria

Keep regression coverage proportional to the changed boundaries: asset references/loading, mount resolution, art/gameplay bounds, layer order, stateful story art and read-only observations. Preserve actual browser route completion and visual review; JSON validity alone cannot establish correct placement.

For each implementation slice, run the relevant focused checks and `npm run check`. Run targeted Chromium/Firefox tests for the touched editor/runtime paths. After migration, run `npm run level:audit` and the complete browser suite. Compare actual-renderer crops for arrivals, viaduct, freight water, Registry, archive and departure, including missing-art and white-background transparency checks where relevant.

The final acceptance exercise is to duplicate the river-crossing preview under a new ID, move a decorated platform, place a canopy/bench/railing, reposition a mounted ledger and export/reload/play it through the workshop. That exercise must require no new renderer branch, loader level-ID exception, hidden placement compensation or edited screenshot coordinates.

Update the friction log after each phase with what became easier, what still required a workaround and any new obstacle observed. Mark an item closed only after the authoring exercise succeeds; replacing a workaround with another hidden coordinate list is not completion.
