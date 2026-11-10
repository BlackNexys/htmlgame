# Sluice Exchange authoring friction

Started 9 November 2026; continued 10 November 2026 alongside a new, standalone level built from an empty document. This log records actual construction and playtest findings. The original six authoring fixes remain in [the shared log](level-authoring-friction.md).

## Intent and limits under test

Build a folded, multi-height route using authored scene art, mounted props/story visuals, compound openings, all six existing enemy types and connected water cascades. Test normal-combat completion, rooftop/culvert branches, recovery from missed jumps, camera reversals, editor portability and rendering cost. Do not invent swimming, slopes, new powers or a campaign chapter to make the layout work.

## SX01 - Scene assembly is still repetitive

Observed during initial authoring: composing complete room walls, inset rows, trims and furniture still requires expanding many individual prop placements. The catalog and mounts make the result portable, but the workshop has no reusable room assembly or grouping operation.

Workaround: use bounded construction helpers for this initial authoring pass, then commit the expanded JSON as the runtime/source document. The game must not depend on a second layout generator. Measure the resulting count and editor cost before proposing grouping/prefab work. This is another instance of F07, not a reason to hide placements in a renderer.

## SX02 - Standalone interactions need appropriate content

Observed: most existing inspection cards describe the Last Platform evidence sequence. Reusing them in an unrelated mechanical exchange would imply story discoveries that this level does not award.

Action: add a small set of optional local inspection cards with no effects. Keep the level outside campaign registration; verify a bare URL does not read/write the campaign save. Neutral dialogue uses the existing noncanonical exchange scene.

## SX03 - The HUD assumed eastward progress

Observed during route review: the default encounter hint said to keep heading east and the caption said to find a way east, even while the required middle route heads west. The bar also treated player X divided by exit X as journey progress.

Action: use direction-neutral sign-following copy and label the bar as horizontal position. Route signs explicitly mark both reversals. A route-aware objective/progress model remains a design/tooling follow-up; this level does not pretend the X bar measures completion.

## SX04 - The overview command still recognized only three maps

Observed: the capture tool selected the comparison level, rebuild or construction study through hardcoded CLI aliases. A new level ID could not be reviewed without changing that selector.

Action: accept any validated level ID and optional comma-separated structure/water/object focus IDs. Existing aliases keep their output names. The new level needs no capture-specific layout code. Added a generic static-view profiling command using the same compiled data and actual GameScreen.

## SX05 - Optional overhead routes can spoil a main-route jump

Observed in both browsers: the first normal viaduct jump hit the underside of the optional roof approach and fell to the recovery route. A continuous simulation pilot happened to pass, so the initial green unit route was insufficient evidence of a comfortable takeoff.

Action: move the ascending roof approach 256 pixels earlier, extend its landing back to the existing return stairs, and move the first zombie out of the approach. Preserve normal movement tuning. Verify both continuous traversal and deliberate stops, plus real-keyboard play. This is a real layout correction, not a reduced assertion.

Related observation: socket mounts move a pier's origin, but do not resize it to a different receiving floor. Reseated the moved roof piers against their actual floors. Reusable assemblies should eventually express that relationship explicitly; fixed prop dimensions are currently authored data.

## SX06 - The test pilot did not cover the full controller

Observed while building the culvert test: the shared keyboard driver only sent movement, fire and jump. It ignored the Down input required by an existing crouch mechanic. Its reusable movement logic also lived inside an older level fixture.

Action: extract the unchanged base pilot into a stateless helper and extend the keyboard driver to send Down, Up and Sprint, coercing optional inputs to booleans and releasing every held key. The culvert test confirms the body stays crouched under its ceiling after release and can stand once clear.

Further observed during roof-route regression: the continuous pilot could request a forward jump while still travelling backward from a landing, striking an overhead shelf. It also jumped away from ghoul/wight firing windows and consumed the route's health margin. Add ordinary braking before reversals, crouched firing for ghouls and sustained firing during the wight's existing windup/recovery. No enemy stats, health overrides, teleportation or direct damage calls are used. Add a final encounter sign explaining the shield opening.

## SX07 - Selecting a deep room does not focus the workshop view

Measured in a 1280 by 1100 browser: the workshop caps this world to a 4108 by 1948 canvas (about 47.5% scale). Selecting `lower-works` updates the inspector to world Y=2592 but leaves its screen Y around 1786, below the viewport, with page scroll still zero.

Status: open usability follow-up. Manual scrolling/zooming and the inspector still work, but an object-list selection should offer focus/fit-selection. Together with 891 flat prop records, this makes navigation more cumbersome than editing the individual values. Grouping/filtering and focus-selection are the clearest next editor improvements.

## SX08 - A river can exist in data yet miss normal camera framing

Observed in rendered review: the original river surface at Y=3392 sat below the visible lower gameplay band. The full overview showed water, but the normal recovery/departure views gave too little evidence of the river.

Action: raise the receiving river to Y=3040. Its incoming waterfall endpoints update through references; no fall heights were copied or manually repaired. Local canals and receiving basins remain distinct. Background crossings are explicit, cosmetic connections rather than unimplemented water hazards.

## SX09 - Fast median draw calls do not establish frame pacing

First headless Chromium sample: warmed compile median 2.4 ms, p95 2.8 ms; World construction 1.5 ms. Typical sampled view medians were around 0.2-1.6 ms, but two views had p95 draw-call wall times around 22 ms and a maximum around 29 ms.

Status: measured follow-up, not a claimed 60 fps result. The harness repeatedly submits static 960 by 576 Canvas draws without a live RAF/combat loop or forced GPU completion. Network, memory, GPU work and first-time-player pacing are outside this measurement. Use a real frame trace and multiple devices before declaring a performance limit or optimizing the wrong subsystem.

The full-world overview itself is about 35.4 million pixels, roughly 135 MiB for one uncompressed RGBA surface before other browser allocations. The editor's existing 8-million-pixel cap remains important; no budget was increased to accommodate this level.

## What became easier

The new level ID loaded the correct kit with no runtime ID branch. All furniture and local inspection art are authored placements. The 31-element water graph validated on the first blockout, and receiver movement updated cascade endpoints. Odd bridge thicknesses, a compound doorway and a 40-pixel crouch clearance used existing physics. The current scene contains 54 solid structures, three decorative structures and 891 props, within the original limits.

## Working verification record

Continuous and cautious simulation routes pass with normal health/combat, including rooftop inspection, the culvert and both actual missed-jump recoveries. Final result, 10 November 2026: all 187 unit/simulation checks, TypeScript checking and the production build passed. All 214 browser checks passed across Chromium and Firefox, including all ten level entries/workshop round trips and the new main, roof and combined culvert/recovery keyboard routes. Campaign isolation and modal inspection freeze were verified. Earlier browser failures and the resulting geometry/control corrections are retained above. Automated completion does not establish good human pacing or final encounter balance.

## Next tooling priorities from this experiment

1. Reusable assemblies/group selection with stable child identities, so a room is not hundreds of unrelated edits.
2. Focus/fit-selection and better navigation for tall workshop documents.
3. A controller-based takeoff/headroom preview; reachable platforms alone do not establish a comfortable jump.
4. A route-aware objective display if folded levels become standard, while keeping position separate from completion.
5. Live frame traces on representative devices to investigate pacing spikes before changing budgets or renderer architecture.
