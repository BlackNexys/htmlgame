# Level reset and friction decisions

10 November 2026. The old layouts are deliberately removed, rather than migrated. Their successful traversal tests were evidence for those layouts, not requirements for the next authoring model. Historical logs and art remain useful evidence.

The user suggested importable compiled JavaScript during the reset. The implemented direction is TypeScript source modules, compiled by Vite, using focused composition classes. TypeScript defines reusable composition; the existing plain-data scene contract remains the compiled output.

| Observation | Decision / current result |
| --- | --- |
| F07 / SX01: hundreds of flat room placements | Implemented source assemblies, reusable factories/imports/loops and translated instances with stable child paths. Compiled runtime data remains flat. No increase to object caps. |
| SX07: deep selections remain offscreen | Implemented selection focus, repeat focus button, ID filtering and assembly-instance groups. Browser verification covers a selection at world Y=3000. |
| F01: hidden coordinate-dependent art | Removed obsolete level placement tables and the old named-level presentation converter. Keep the reusable art catalogs. |
| F02 / F04 / F05: story bounds, authored props, railings | Keep the already separated runtime contracts; the new source API composes them without merging concerns. |
| F03 / SX04: map-specific review tooling | Captures/profiling now load source modules by ID, with generic focus IDs. Removed old map aliases and map-specific capture branches. |
| F06 / SX06: test drivers tied to visuals/maps | Keep opt-in read-only observations, generic controller/pilot helpers and input tests. Remove deleted-map pilots; replacement browser tests use source-built data and real keys. |
| SX02: local interactions should not grant unrelated evidence | Existing effect-free cards remain; authored levels are standalone unless explicitly registered later. No campaign chapter is playable after reset. Save data is preserved. |
| SX03: horizontal position is not route completion | Retain the neutral HUD label. Route-aware objectives require explicit route/beat semantics; deferred until a small new layout exercises them. |
| SX05: overhead routes spoil takeoff; piers do not resize automatically | Source factories can derive supports from parameters. A controller-driven jump/headroom preview is still open; no claim that composition solves clearance. |
| SX08: water outside gameplay framing | Continue to review water in normal camera views as well as overviews. No new layout exists to prove this resolved. |
| SX09: static draw timings hide frame spikes | Keep bounded static profiler with its limitations. Live frame traces and representative devices remain open; no performance target is claimed. |

## Next implementation sequence

1. Build one small, source-authored room pair and water connection. Exercise moving, widening and reusing the same factory without copied coordinates. Keep notes on the assembly API.
2. Add an isolated takeoff/headroom preview using the actual controller, then compare it with real keyboard traversal. Do not substitute a generic reachability arc.
3. Define route/beat authoring only when the room pair needs it; support westbound and vertical progress without treating X as completion.
4. Add live frame traces covering simulation and drawing, then profile the real route on representative devices. Optimize measured causes.
5. Expand the next level only once those experiments are comfortable. Add its route tests as evidence for the new layout, not compatibility with the deleted ones.

## Verification

Replacement tests cover local/nested assembly placement, stable identities, detached snapshots, actor patrol translation, mounted props, thin physical decks, compound doorways, source/receiver water translation, invalid mounts/overlap/upward flows, CLI source export, and persistence foundations. Browser checks cover an empty boot, missing source diagnostics, source-built snapshot play, independent workshop export, grouped filtering and deep-selection focus, alongside retained menu/actor/dialogue workflows. Final verification on 10 November 2026:

- `npm run check`: all 115 unit/simulation checks, TypeScript checking and the production build passed.
- `npm run level:audit`: zero authored modules, intentionally; no legacy layouts remain in the public level directory.
- The initial 106-case Chromium/Firefox run passed 98 checks and exposed eight failures. Deleted-map assumptions, an 8-pixel drag target, duplicate workshop links and an expensive inactive-clock test accounted for those failures.
- The affected 52-case browser recheck passed 50; the two remaining Chromium failures were corrected and all four Chromium/Firefox counterparts then passed. A further 18 title-layout checks passed. All initial failures have successful rechecks; these results combine the full run and focused reruns rather than claiming a final single green full-suite run.
- Real Vite discovery/import was exercised with a temporary source module importing a separate assembly module, including game load, workshop import, generic capture and profiling. The files and temporary public overview were removed afterward.
- Reviewed the actual workshop rendering and verified deep selection is inside the stage viewport. `git diff --check` is clean.

The long inactive-window check retains its 45-second interval and freeze/no-catch-up assertions, using the installed clock API's inactive-time jump instead of rendering every skipped frame. This changes the test's execution cost, not the menu's motion behavior.


## Source/editor unification follow-up

Implemented on 10 November 2026. The workshop now retains source identity and edits real assembly instances through the same build path as runtime. Parameter schemas, instance dragging, scoped child overrides, resets, source-aware history and draft restoration replace the initial snapshot-only limitation. Exported `.layout.ts` companions preserve source factories/imports and are automatically used by the browser loader, CLI and audit. See [the shared workflow](source-editor-workflow.md).

During verification, untouched inspector defaults and unchanged assembly controls initially risked becoming accidental overrides; the inspectors now preserve inheritance. Corrupt source drafts are preserved with explicit errors rather than silently reopening a flattened preview. Source code still owns factory definitions and placement calls; adding instances from a visual assembly catalog and independently editing nested instances remain future editor work.

Unification verification: 124 unit/simulation checks plus type/build passed; 18 editor browser checks passed; the full source/editor/export/CLI/game round trip passed in Chromium and Firefox. Temporary test sources were removed, leaving the authored-level directory empty.
