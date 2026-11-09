# Underworld: level-design research and a fresh demo blueprint

**Research date:** 8 November 2026  
**Status:** Design proposal for discussion and blockout. The current playable level remains the reference build.  
**Companion:** [Environment kit specification](confluence-kit-spec.md)  
**Route sketch:** [Proposed route relationships](last-platform-route-proposal.svg)

## Recommendation

Build the next Last Platform layout around running, shooting and readable changes of elevation. Establish a small set of reliable gameplay spaces, then build a modular environment kit that can dress them consistently.

The present demo proves that the systems connect and the world can look convincing. Its repeated small landings, long return climbs and individually positioned architectural images are still shaping too much of the experience. Adding more isolated pictures will not resolve that. We need a deliberate route, a construction vocabulary and a shared scale.

Keep the user's essential direction: a Jazz-inspired action platformer that occupies both axes, cyberpunk infrastructure inhabited by undead people, and the personal search for a soulmate. Use the current movement and free Flicker as the design baseline. The proposed layout below does not depend on new powers, moving trains, water physics, bosses or checkpoint rules.

## What the research supports

These are selected sources and bounded takeaways, followed by our own application. They are not a claim that one formula produces every good platformer.

| Source | Relevant finding | Application proposed for Underworld |
| --- | --- | --- |
| [Yacht Club: Plague Knight mobility](https://www.yachtclubgames.com/blog/plague-knight-mobility-design/) | The team specified movement limits in tiles and worked within a level grid tuned to those abilities. | Measure our actual controller before choosing gaps, clearances and room sizes. Do not inherit another game's distances. |
| [Yacht Club: Specter level planning](https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-1-5/) | Different movement abilities required substantially different spaces and level layouts. | Design for our running, aimed fire and wall movement; a visual resemblance to Jazz is insufficient by itself. |
| [Yacht Club: rooms and encounters](https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-2-5/) | Legibility, usable empty space and an escalation followed by relief shape encounters. | Introduce a threat in generous space, vary its use, combine familiar demands, then provide a quieter stretch. |
| [Yacht Club: final passes](https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-4-5/) | Separate passes address fast traversal, placement and background art that communicates gameplay. | Review the route at both cautious and fast speeds. Give art an explicit job: show support, destination, danger or habitation. |
| [Itay Keren: Scroll Back](https://gamedesignskills.com/game-design/camera-design-2d-side-scroller-games/) | Camera framing must balance relevant information, player control and comfort; forward framing is one useful technique. | Treat the visible approach and landing as part of each encounter. Test drops and direction changes with our real camera. |
| [Bethesda developers: Fallout 4 modular level design](https://gdcvault.com/play/1023202/-Fallo) | The session describes modular art kits and iterative level production as complementary tools. | Adopt compatible modules and repeatable assemblies. This is a production analogy from a 3D game, not a prescription for our movement. |
| [Tiled: terrain sets](https://doc.mapeditor.org/en/stable/manual/terrain/) | Terrain selection can encode compatible corners, edges or both. Missing combinations can be identified explicitly. | Specify connection rules and test shapes before producing decorative variants. This does not require switching editors. |
| [Pedro Medeiros: Making Tiles](https://www.patreon.com/saint11/posts/making-tiles-12881715) | His public notes recommend checking a repeating tile in both axes. | Review materials as repeated surfaces and assembled rooms, rather than judging isolated squares. |
| [Jazz2Online: archived developer quotations](https://www.jazz2online.com/33/design/) | The page attributes frequent in-editor playtesting and theme-constrained encounter construction to Cliff Bleszinski. | Work in short playable increments. This is an archive of attributed testimony, not a newly verified original interview. |

Research limits: the Bethesda takeaway above uses the session description; its full slide deck was not available through the browser. The Medeiros takeaway uses the accessible text, not an unseen tutorial image. The proposed numbers, route and production priorities below are our design recommendations.

## What our build currently permits

Sources: [movement tuning](../src/game/config.ts), [camera](../src/components/Camera.ts), [level authoring](level-authoring.md). Measurements are reproducible with:

```sh
node scripts/analyze-platformer-movement.cjs
```

The measurement uses the real World simulation at 120 Hz, a flat floor, no enemies and a one-second run-up. Sprint measurements include the full 0.6-second grounded buildup (remeasured 2026-11-09). Same-height travel is body displacement, **not a guaranteed gap width**. Actual gaps also depend on body size, takeoff timing, height difference, ceilings and landing space.

| Current property | Value |
| --- | --- |
| Collision grid / viewport | 48px / 960 x 576px, or 20 x 12 cells |
| Standing / crouching height | 52px / 32px |
| Run / sprint speed | 330 / 480px per second |
| Held jump, measured peak | 133.21px above takeoff, about 2.78 cells |
| Held jump, measured airtime | About 0.78 seconds |
| Same-height travel at run / sprint | 255.75 / 372px |
| Run jump released at 0.1 seconds | 107.5px peak; 222.75px same-height travel |
| Release-to-stop travel at run / sprint | 23.38 / 50.38px on the flat fixture |
| Existing camera | Horizontal velocity look-ahead; vertical dead zone and smoothing |

Initial blockout targets, to be verified by play:

- Use 48px rises for easy flow and occasional 96px rises for deliberate hops. A 144px rise exceeds the measured ordinary jump.
- Start ordinary same-height gaps at 96-144px. Use larger gaps only after testing a clear run-up and a forgiving landing.
- Start a raised landing with no more than a 96px gap; test its underside and approach separately. A reachable top can still be awkward because platforms are solid on every side.
- Give a full-jump corridor about 240px floor-to-ceiling clearance. The measured jump plus standing height is about 185px, so 192px leaves little spare room.
- Start ordinary landings at 192px wide; use 288px or more for a turn, decision or fight. These are proposed comfort targets, not engine requirements.
- Include 6-12-cell uninterrupted running stretches between precision actions. Do not require a jump at every two or three steps.
- Keep a mandatory landing or a clear intermediate catch visible before committing to a drop. A camera change may eventually help, but the first blockout must work with the current camera.
- Do not make sprinting, wall-jumping or coyote-time edge cases mandatory for the first main-route jumps. They can improve an optional route.

## Diagnosis of the current demo

These are design observations from its map, implementation and recent visual review, not measured first-time-player results.

1. **Reachability is stronger than pacing evidence.** Automated routes establish that the player can finish, return and recover. They do not establish that a newcomer knows where to go or enjoys the rhythm.
2. **Verticality often takes the form of repeated small steps.** Long switchbacks occupy time without necessarily adding a new decision. Replace some with broad terraces, short climbs with a purpose and controlled drops into a new kind of space.
3. **Art still has several independent coordinate lists.** Terrain, rear supports, shells, windows and props can disagree. Reusable assemblies with shared anchors would prevent many of the attachment fixes we have been making.
4. **The terrain vocabulary is narrow.** The active terrain renderer selects left/top/right/interior variants. It does not yet provide a complete vocabulary for concave corners, undersides and arbitrary junctions.
5. **The original pacing brief has drifted.** The supplied [v0.1 design](The_Last_Platform_Demo_v0_1/Last_Platform_Level_Design_v0_1.md) calls for a quiet Registry and no mandatory backtracking. The current version has Registry enemies and a long westward public-hall return on the critical route.

A deliberate return can be good level design. Here, the next prototype should first test the original forward-progress promise, with optional loops doing the exploration work.

## Proposed shape of the rebuilt stage

Think of a district crossing with connected upper and lower routes. A useful starting envelope is 8-12 camera widths of forward progress and roughly 2-3 meaningful height bands. These are planning bounds, not a committed world size. Avoid stretching the current 7200 x 3840 map into a new shape before testing its encounters.

The [route sketch](last-platform-route-proposal.svg) shows relationships and pacing, not traversable collision or final dimensions.

| Beat | Player experience | Geometry and encounter proposal | Architectural purpose |
| --- | --- | --- | --- |
| A. Arrivals | Orient, see the city, optionally talk | A safe approach and space to try movement. No hostile firing lane reaches the attendant. | One unmistakable station entrance and shelter; destination silhouette ahead. |
| B. Service concourse | Learn to move and shoot without losing flow | Broad floor, a gentle rise, one zombie; introduce a skeleton only after a recovery space. | Repeatable station bays and clearly visible platform edges. |
| C. River viaduct | Run, choose a route, see the scale of the world | Wide bridge sections with forgiving gaps. A visible lower catch route rejoins forward. Separate the first ghoul encounter from the hardest jump. | Bridge decks, proper abutments, restrained railings and one spectral landmark. |
| D. Freight terraces | Combine movement and familiar combat | A short purposeful descent, a broad fight space, then a clear climb toward the Registry. Use a ghoul and an already understood ranged threat in separate lanes first. | Cargo/workshop bays make the change of height feel like infrastructure. |
| E. Registry | Breathe and obtain the first concrete lead | A quiet gallery on the forward route; ledger visible and safely approachable. All required approaches converge here. | A strong signal-glass landmark and a calm reading desk. |
| F. Archive underworks | Understand reactivation, then read the route | A modest descent into a readable zombie/necromancer setup. Keep the route-index interaction outside the active fight lane. | Machinery, record storage and an explicitly mounted terminal. |
| G. Departure | Apply familiar skills and leave with direction | A wight encounter on a generous floor, then the operable shutter and a quiet exit. The wight is an existing enemy, not a promised boss. | A grounded transit portal and outgoing-line vista. |

Upper route: an optional roof/maintenance loop branches after orientation, leads to the existing letter, and rejoins before or at the viaduct. It offers movement expression and a view, not mandatory evidence.

Lower route: a towpath catches missed viaduct jumps and leads forward into freight. Provide short local returns where necessary; avoid requiring a climb through the entire district to recover one mistake.

Optional inhabited space: a small tenants' spur near freight can provide a pause and setting detail. Keep it visibly optional and quick to leave. A ghost encounter can live in a separate optional setup rather than forcing every enemy type into the main teaching sequence.

The mandatory evidence order remains ledger -> route index -> physical shutter operation -> exit. Side paths must reconnect before the next required clue, or provide an obvious local return. Important discoveries and the Keepsake continue to save immediately. Recorded transfer evidence does not establish consent, coercion or a culprit.

## A small vocabulary of gameplay spaces

Build these as disposable greyboxes before generating their art:

| Pattern | What makes it worth keeping | Failure to look for |
| --- | --- | --- |
| Runway into a hop | The player can preserve momentum and see the landing | A ceiling bonk or immediate enemy hit after a correct jump |
| Two-level firing space | Height offers a useful aiming/positioning choice | Both routes require stopping under the same projectile lane |
| Short climb with a view | The destination and next action become clearer as the player rises | A staircase exists only to consume height |
| Upper branch with rejoin | A visible optional opportunity rewards control or curiosity | The branch looks mandatory or hides required evidence |
| Miss-and-recover route | Falling changes the route without a confusing long reset | The recovery is harder to understand than the failed jump |
| Quiet interaction pocket | The player can approach, read and resume safely | A projectile arrives immediately when dialogue closes |

Give every room a short card: intention, entrance, exit, movement demand, threat, safe recovery, camera reveal, optional branch and art required. If two consecutive rooms have the same card, revise one.

## Build sequence and review gates

1. **Movement yard.** Use the existing movement course and measurements to try the spacing targets at walking, running and sprinting speeds. Add only the missing experiments.
2. **First playable chunk.** Greybox arrivals, concourse and viaduct, including one upper branch and one lower catch. Aim for a useful 2-4-minute first-visit experiment; duration is a hypothesis.
3. **Human playtest.** Watch several people who have not seen the map. Record where they stop, lose the route, miss a jump or get hit before understanding a threat. Automated completion remains a separate check.
4. **Kit proof room.** Build one exterior bay, one interior bay, a bridge joint and a stair/landing junction from the proposed components. Verify scale and joins before making more variants.
5. **Full greybox route.** Connect the remaining beats and required clues. Validate both directions at branch junctions, early arrival at locked objects and all recovery paths.
6. **Art pass.** Dress the tested route from the kit. Reuse and revise modules as needed; do not change a proven jump to fit a decorative image.
7. **Whole-level passes.** Review camera reveals, enemy sightlines, visual collision language, attachment points, fast traversal, dialogue safety and low-health completion.

Suggested trial criteria: a newcomer can identify the next main opening without opening Journey at every junction; the first threat is visible well before its attack lands; a missed introductory jump has an understandable recovery; repeated encounters change context; no required clue can be skipped into an obscure dead end. Start with roughly one second of warning for the first threat, then adjust through playtests rather than treating that as a universal rule.

Retain the original 8-12-minute first-visit and 4-6-minute repeat targets as hypotheses until measured. Without checkpoints or health-refill rules, long mandatory combat sequences may be too punishing; solve the first version by pacing and scope before assuming those new systems.

## Decisions to postpone

New power behavior, health pickups, checkpoints, water hazards, slopes, ladders, one-way or moving platforms, train travel, bosses and final canon remain separate decisions. The first blockout can establish whether the existing game feels good without choosing them.

The immediate next implementation should be the **three-beat greybox and a small kit proof room**, followed by a play session. The rest of the level should grow from what those two experiments establish.
