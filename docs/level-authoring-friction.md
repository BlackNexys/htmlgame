# Level authoring friction log

Started 9 November 2026 while rebuilding `last-platform-rebuild` from an empty layout. This is a working record of obstacles encountered during actual work, rather than a speculative architecture wishlist. Entries retain the observed problem even when a local fix is made.

The [implementation plan](level-authoring-improvement-plan.md) has now been implemented for F01-F06. See [authored scene art](authored-scene-art.md) for the current contract. The original observations and workarounds below are retained as history; the status paragraphs describe the replacement. F07 records a newly measured follow-up.

| Item | Implemented replacement |
| --- | --- |
| F01 | Explicit environment/materials; authored comparison placements; bounded v1-only conversion |
| F02 | Mounted interaction bounds plus separate visual records, shared by editor and runtime |
| F03 | Shared structural/object route anchors, keyboard driver and ID-based captures |
| F04 | Catalog-backed `props`, portable pack loading and complete workshop/file/history support |
| F05 | Dedicated railing surface renderer and transparent fallback |
| F06 | Opt-in detached observations; no canvas-paint protocol in route tests |

## F01 - Scenery depends on old world coordinates

Observed: `RebuiltConfluenceAssemblies` chooses bridge status and material from fixed X/Y thresholds. `ConfluenceTerrainRenderer` also has positional material fallbacks. Moving a structure into another district can change its appearance without an authoring edit.

Cost: a new layout requires reading renderer code as well as editing the level file. It is easy to get masonry behind a bridge or the wrong district material.

Status: implemented. Both Confluence scenes have explicit presentation and materials; the comparison scene uses authored props. Normal rendering and loading no longer infer presentation from a level ID or coordinate. Historical inference is limited to the v1 import converter.

Action in this rebuild: use explicit materials on every structure, and derive bridge/scenery assemblies from the owning structure. Keep the comparison district's legacy fallback intact.

## F02 - Placed story art and interaction bounds have different anchors

Status: implemented. The workshop edits and labels both bounds; their common mount is resolved once. Renderer-specific story-ID offsets were removed with `ConfluenceObjectsRenderer`.

Observed: the letter, ledger and route index use hidden bottom offsets of 24, 18 and 10 pixels in `ConfluenceObjectsRenderer`. Their JSON rectangles are interaction bounds, not the complete rendered sprite bounds.

Cost: positioning a desk on a floor requires discovering an art-specific offset in TypeScript. A valid interaction can still look unsupported.

Workaround: place each existing object relative to its floor using the current offsets, then verify rendered crops. Possible improvement: expose an explicit visual anchor or asset placement metadata, shared with the workshop. No story/schema expansion is needed just to move these four objects.

## F03 - A layout change is repeated in traversal and capture tools

Observed: the rebuilt route helper has absolute waypoint coordinates; the browser test slices that list at numeric indices to find the ledger/index/gate; the overview script has another hardcoded list of camera crops.

Cost: moving a room requires updating unrelated lists, and an innocent route edit can send the browser test to the wrong interaction.

Status: implemented. Both district pilots share structural/object anchors and a real-keyboard driver. All overview crop targets use IDs. Rebuilt interaction stops follow mounted objects, and actual collider parts come from observations.

Action in this rebuild: group traversal by named story beats and derive footholds/captures from structure IDs. Keep actual traversal assertions independent: proximity, evidence, health and completion still come from the real simulation.

## F04 - The JSON cannot place most existing scenery props

Status: implemented. Props are independent placed classes, catalog-backed and portable. The rebuilt furniture and older district art are in JSON. Bench/lamp/canopy placement, mounting, parent edits, history and export/reload/play are browser acceptance tests.

Observed: structure decorations support wall, doorway, outfall and railing compositions, but the existing bench, cargo, lamp, canopy and inset art is placed by scenery code rather than through the level document. Water sources can already be mounted explicitly.

Cost: the workshop cannot author a complete dressed scene, even though geometry and water are portable. A code-only dressing pass is still necessary.

Workaround: keep this pass attached to structural floors and derive placement from their bounds. Possible next improvement: a focused decorative-prop element with catalog asset references and socket mounts; do not give props collision or story responsibilities by default.

## Verification record

At the initial rebuild, the first blockout passed the normal-combat main route, optional roof loop, missed-jump recovery and water graph tests. The finished level passed all 167 unit/simulation tests, TypeScript checking and the production build. All 46 targeted browser checks passed again after the final dressing changes in Chromium and Firefox, including real-input completion, save isolation, water/rendering fallbacks and all nine maps' workshop round trips. The roof and recovery simulations now keep normal combat enabled too.

Actual-renderer crops were reviewed for arrivals, viaduct, recovery, freight water, Registry and departure. The whole-level overview was regenerated. Human route legibility, pacing and encounter balance remain playtest questions; automated completion does not settle them.

## F05 - Generic railing surfaces sample the wrong artwork

Status: implemented. `Railing` supplies its own visual envelope and uses `RailingRenderer`, preserving its separate collider parts. The construction study verifies nonblocking traversal.

Observed in the new Registry/departure crops: thin railing bars use the terrain renderer and produce sliced dark platform textures, rather than a convincing metal railing. The geometry is valid and nonblocking, so JSON validation does not catch this.

Workaround in this level: use the existing complete railing sprite through the floor-attached dressing pass. The three trial railing decorations were removed. Possible improvement: a dedicated railing appearance/renderer, with a material-independent fallback, so the workshop's railing element looks like a railing at arbitrary sizes.

## What was easy this time

Odd-sized decks, 24-pixel bridge thickness, explicit district materials and 80-pixel rises worked without changing physics. Mounting the station drains and freight basin/outlet kept source and receiver positions together. The first water graph validated without upward falls or hidden terrain crossings. Main traversal and both branches passed on their first simulation run.

## F06 - Browser traversal reads state from debug paint calls

Status: implemented. `observe=1` enables a read-only snapshot function. Comparison, rebuilt and construction pilots use it with F2 disabled. Static prop observations are requested separately to avoid copying hundreds of records on every navigation tick.

Observed: the real-keyboard route test intercepts `strokeRect` and `fillText` to recover player/enemy bounds, velocity and movement state from the F2 overlay. It depends on paint colors and debug text formatting, and similar hooks are repeated in other route tests.

Cost: writing or adapting a playtest requires understanding rendering details unrelated to level design. A harmless debug UI edit can break navigation before gameplay is tested.

Workaround: retain the existing observation method for this pass; use shared route input and named beats. Possible improvement: a narrow, read-only test/debug snapshot with explicit bounds and movement state. It should expose observations, not teleportation, rewards or commands that could bypass gameplay.

## F07 - Large migrated assemblies produce long flat prop lists

Observed during the fixes: migrating the comparison district's walls, trims, architectural modules and furniture produces 774 explicit records. The data fits the current 1000-prop budget and the workshop supports it, but the flat list and repeated trim placements are cumbersome to navigate and reuse.

Cost: revising one room can involve selecting many records. Repeating an assembly still takes individual placements or a structured patch.

Status: newly recorded follow-up, outside the original six fixes. Candidate improvement: editor grouping/filtering first, then measured prefab/assembly expansion with stable child IDs and clear ownership. Do not hide the placements in another renderer coordinate table or increase the object cap as a substitute for a useful authoring tool.

## Fix verification record

All 177 unit/simulation checks and the production build pass. The complete 204-test Chromium/Firefox suite passed, followed by all 34 targeted editor/rendering rechecks after the small mirrored-tiling, preview-opacity and selection-performance fixes. Rendered crops were checked for the comparison station, rebuilt Registry and construction doorway/railing, and the three whole-level overviews were regenerated. Human pacing/balance questions remain separate from these tooling fixes.

The subsequent [Sluice Exchange friction record](sluice-exchange-friction.md) pushes these tools through a new 891-prop level, folded routes and a larger water graph. It records assembly/navigation limits, main-jump headroom, controller-test coverage and bounded performance measurements separately from the original six fixes.
