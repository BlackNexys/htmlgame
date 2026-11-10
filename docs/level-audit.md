> Historical record: all authored levels were removed on 10 November 2026. Play URLs and old test totals below describe the retired layouts. See the [reset decisions](level-authoring-reset.md) and [current source workflow](level-source-authoring.md).

# Shipped level audit

All ten playable JSON files use schema version 2 and explicit structure kinds. The 48-pixel artwork repeat no longer dictates their collision geometry. Existing campaign and interaction IDs are preserved.

## Inventory and purpose

Append the URL below to the game server address. `preview=1` isolates narrative progress from the campaign save. The action dialogue entry deliberately uses `dialogueDemo=action` to enable its travelling conversation.

| Level | Preview URL | Verified route |
| --- | --- | --- |
| Last Platform rebuild | `/?level=last-platform-rebuild&preview=1` | Forward station route, physical evidence, operated shutter and exit; existing tests also cover roof and recovery branches |
| Last Platform comparison | `/?level=last-platform-demo&preview=1` | Vertical district, registry, archive, shutter and departure; existing tests cover optional balcony and return routes |
| Lower Passage | `/?level=lower-passage&preview=1` | Ground route, steps and mixed enemy combat |
| Movement course | `/?level=movement-course&preview=1` | Sprint, gap recovery, wall jumps and final landing |
| Dialogue course | `/?dialogueDemo=action&preview=1` | Both optional overlooks, ground return and exit |
| Narrative study | `/?level=narrative-study&preview=1` | Floor-level Keepsake, ledger, index, physical gate and exit |
| Departure study | `/?level=departure-study&preview=1` | Continuation stage entry and exit |
| NPC study | `/?level=npc-study&preview=1` | Safe entry, neutral attendant, distant combat and exit |
| Construction study | `/?level=construction-study&preview=1` | Thin ledge, bridge, tall wall, open doorway and exit |
| Sluice Exchange | `/?level=sluice-exchange` | Folded main route, rooftop inspection, crouched culvert, two actual missed-jump recoveries and exit |

The mechanics and narrative studies remain small test spaces. They are not additional finished campaign districts. The original `src/maps/level0.ts` and archived design-pack files are historical source material, outside the shipped JSON inventory.

## Revisions made

- Migrated the six remaining version-1 maps to version 2. All maps now declare their structure types, including the older Last Platform comparison. Collider footprints remain unchanged except for the deliberate study edits below.
- Removed the narrative study's unused overhead `letter-perch`. Its Keepsake is intentionally collected on the floor; the inaccessible perch implied a route that served no interaction.
- Moved the dialogue course's overlooks closer to their steps. Each approach now has a 96-pixel horizontal gap and 96-pixel rise. Both upper routes are traversed in the audit with ordinary movement, jumping and combat.
- Added guidance to the construction study's upper approach. The ledge and bridge lead past the tall wall before the floor-level doorway exercise.
- Moved the older district's viaduct marksman and patrol onto its firing ledge; it previously started over the gap and fell immediately. Grounded enemies and NPCs now have spawn-support regression checks. Ghosts intentionally float.
- Retained a separate version-1 Lower Passage fixture to keep legacy import compatibility tested after migrating the actual playable map.

Water remains authored in the two Confluence districts and construction study. The small courses do not gain rivers solely to exercise the water API. Networks resolve through the same validated mounts and receiving surfaces, with downward falls and no water collision blockers.

## Repeatable verification

```sh
npm run level:audit
npm run check
npm run test:browser
```

`level:audit` discovers all shipped JSON maps, checks current format and spawn support, round-trips workshop documents, and traverses each completion route. Traversal uses the real fixed-step simulation, normal health, movement and combat. Story plans complete only after the player reaches the relevant physical object; the pilot does not teleport, remove enemies or bypass shutters.

The browser inventory test loads every map in Chromium and Firefox, checks asset responses and runtime errors, verifies restart, and imports/exports the file through the workshop. Entry screenshots are written to `artifacts/level-audit/`. The wider browser suite exercises actual keyboard routes, dialogue, saving, the workshop, water and rendering.

These checks establish playable routes and compatibility, not final encounter balance or finished visual composition. Water is cosmetic; no swimming, water damage or current-force behavior is implied. Add a completion route whenever adding a shipped map; automatic validation alone cannot prove reachability.

Audit result, 2026-11-09: all 19 inventory/route checks and all 166 unit/simulation tests passed; TypeScript and the production build passed. The complete 198-test browser suite passed in Chromium and Firefox. After the final marksman correction, a rebuilt game passed all 24 affected-level and inventory browser checks, including exact runtime JSON matching and workshop round trips.

Later the same day, the [river-crossing rebuild](last-platform-rebuild.md) replaced the earlier preview layout. Its updated named routes, normal-combat branches and structure-based dressing pass all 167 unit/simulation tests and 46 targeted browser checks, including the complete nine-map inventory. The [authoring friction log](level-authoring-friction.md) records what constructing this new layout exposed.

The subsequent [authored scene-art migration](authored-scene-art.md) passes all 177 unit/simulation tests, the full 204-test browser suite and 34 final editor/rendering rechecks. Both Confluence scenes now store their prop and story-art placements in their level documents, with explicit presentation/materials and shared route/capture anchors. All nine entry, completion and workshop round-trip checks remain covered.

On 10 November 2026, the new [Sluice Exchange](sluice-exchange.md) brings the inventory to ten levels. All 187 unit/simulation checks and the full 214-test Chromium/Firefox suite pass, including the new folded route, roof loop, crouched culvert, two recovery paths, optional inspections and large workshop document. Its [friction record](sluice-exchange-friction.md) retains the initial browser failures and resulting fixes.
