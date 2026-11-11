# A Light Left On: construction friction

10 November 2026. Observations from building and playing the first small experience slice through source-backed assemblies. This record includes fixes and open work; it is not a claim that all authoring problems are solved.

## LQ01 ? A valid water connection can still look impossible

Rendered review showed a collector spill disappearing through the recovery stair's masonry. A background-crossing flag made the graph valid but did not make that construction convincing.

Fixed: shorten the catch landing and reposition the collector to create a 48-pixel open shaft before the first return step. The spill fits inside that shaft; the player can jump across it. Both waterfalls now validate without background-crossing exceptions and are checked against actual colliders. Added a visible collector hanger and bearing. Reviewed the lower route and river in the actual renderer.

## LQ02 ? Structural ownership alone is not place ownership

The first blockout mounted courtyard furniture to its floor but left its inhabitant at a root world position. Moving the assembly would move the building without moving the person who belonged there. The encounter's actors had the same problem.

Fixed: create focused LamplightCourt and ServiceYard factories containing their geometry, actors, signs and local details. A courtyard movement test verifies the NPC and resolved interaction move with it; a yard-width edit verifies enemy placement regenerates. Do not solve this with hidden renderer offsets or actor-name branches.

## LQ03 ? Adjacent places constrain independent edits

An attempted rightward courtyard move and wider yard correctly failed because adjoining solid building bodies overlapped. Editing a safe vertical courtyard offset and a narrower yard verified ownership without bypassing those checks.

Open: connected streets need a convenient way to edit several instance origins/parameters atomically, and perhaps explicit connection anchors. The editor currently configures one instance at a time. The source can express a complete arrangement, but the tool should eventually make coordinated layout revisions easier. Avoid weakening overlap validation to make a room drag succeed.

## LQ04 ? Spawn and exit are still world metadata

Furniture and story objects can follow structure mounts; the player spawn and exit are explicitly authored world rectangles. Moving an arrival or departure instance does not automatically move them.

Open: evaluate semantic arrival/departure anchors when revising this slice. This pass keeps those metadata positions explicit. Do not invent coupling from instance names.

## LQ05 ? Profiling silently selected no views

The static profiler sampled only wide objects explicitly marked platform or bridge. This scene has narrow bridges and broad solid quays, so it produced an empty view list.

Fixed: default to broad terrain regardless of kind, accept explicit comma-separated terrain IDs, and fail clearly if no view is selected. First representative sample: compile median about 0.4 ms, construction about 1.1 ms; the courtyard draw-call median was about 1.3 ms and p95 1.8 ms. These are warm headless Canvas submission timings, not FPS, GPU completion or a live combat trace. No budgets were raised.

## LQ06 ? Reaching a waypoint is not finishing an encounter

The browser pilot reached the yard endpoint before its last opponent was defeated. Waypoint braking could also leave it facing away while firing. Initial route checks passed before the cover was aligned to its proper collision height, which exposed the assumption after that art/geometry correction.

Action: require the real-keyboard pilot to face the surviving opponent and finish ordinary held fire before checking combat completion. No health overrides, direct damage, teleportation or enemy tuning changes. The read-only observation now includes facing, so the pilot can turn before stationary fire. Each firing lane is cleared before crossing the cargo obstacle; firing back through that obstacle is not treated as a valid counter. Keep the full conversation playback and both recovery/completion checks separate from compilation.

## What became easier

The scene is authored directly in TypeScript, with small reusable factories and no expanded JSON source file. A cohesive courtyard is one instance rather than unrelated edits. Waterfall heights follow receivers. Existing bounds, collision, dialogue and campaign-isolation checks still apply. The whole scene uses 73 props, rather than hundreds of copied placements, because wall textures repeat inside authored bounds.

## Next questions from play

Test movement and camera with a person before adding length. Check whether the recovery stair reads as a route, whether standing fire makes the yard too passive, and whether the quiet scene lands emotionally. Controller-based clearance previews, coordinated multi-instance editing, semantic endpoint anchors and live frame traces remain candidate tools; prioritize the one that obstructs the next useful revision.

Verification outcome: 128 unit/simulation checks and the type/build checks passed. The broad browser pass reported 114 successes and two initial slice failures; all six final slice rechecks passed in Chromium/Firefox after the input-pilot corrections. Actual renderer crops, normal gameplay views and the kinetic exchange were reviewed. These checks do not establish first-visit enjoyment or final encounter balance.
