# A Light Left On

10 November 2026. First source-authored experience slice after the level reset. This is a small piece to play, revise and discuss; its writing and location remain provisional.

## Play

Open the game and choose **Play**, or use `/?level=lantern-quay`. `/?sandbox=1` opens the empty controls workspace. Dialogue-study URLs retain their own empty backdrop. The workshop starts a separate blank draft; choose `lantern-quay` and **Open level source** to edit the slice.

Move with A/D or arrows, hold Space for higher jumps, hold Shift to sprint, hold J/X to fire, and use F to interact. The courtyard conversation is manual: Enter reveals/advances, and Skip exchange exits it. Combat and movement freeze during dialogue and inspections.

## The experience

- **Arrival:** a sheltered, inhabited quay with a warm lamp, bench, timetable and a clear run-up before the ascent.
- **Rise:** three 96-pixel steps lead to a skyline lookout. The main route gains 384 pixels of height.
- **Crossing:** two open spans above the canal infrastructure. A missed first jump lands on the low walk, where four rising landings reconnect with the same street. A narrow drainage gap is intentionally jumpable.
- **Service yard:** one committed zombie and one skeleton firing lane, separated by a low cargo obstacle. Both can be defeated using the existing Flicker and movement. The exit does not require a kill quota.
- **Lamplight court:** an optional saved-seat inspection and a short, expressive exchange about looking back for someone. It awards no discoveries, Keepsakes or campaign effects.
- **Departure:** a final lower terrace and the ordinary exit.

The river has a visible receiver beneath the lower route. A deck gutter feeds an elevated collector, whose spill reaches the river through an open channel. Neither waterfall intersects solid terrain. Water remains cosmetic; the slice adds no swimming or hazard rules.

## Construction

The 4800 by 1800 scene contains 16 collider-owning structures, 73 props, five water elements, two enemies, one neutral NPC and one inspection. The source is `src/content/levels/lantern-quay.level.ts`. Four focused factories build quay terraces, the crossing/recovery structure, the service-yard encounter and the inhabited courtyard. The active scenery mode is authored; no renderer recognizes this level's ID or invents its dressing.

Nested ownership matters: moving the courtyard carries its NPC, signs, bench, lamp and interaction bounds. Changing the service-yard width regenerates its skeleton placement and patrol. Both use the same source/layout path as runtime and the workshop. Instance parameters remain subject to complete-scene collision and bounds validation.

The scene uses the approved Confluence asset kit and existing hero/enemy/NPC art. Dark masonry, cyan water and electronics, magenta detail and warm habitation follow the user's cyberundead reference. No new generative-art assets or speculative gameplay systems were necessary for this slice.

See [the whole-level renderer view](../public/docs/lantern-quay-overview.png), [source/editor workflow](source-editor-workflow.md) and [friction notes](lantern-quay-friction.md).

## Verification and limits

Main and actual missed-jump recovery routes complete in simulation with normal health/combat. The automated routes take roughly 17-19 seconds without reading or conversation; they are not a human completion-time estimate or evidence of final balance. Real keyboard tests exercise both routes, enemy defeat, saved-seat inspection, the complete courtyard exchange, frozen simulation during interactions and the exit. The level does not read or overwrite campaign progress.

The next discussion should follow a human playthrough: the run-up and jump rhythm, readability of the recovery path, whether the two-enemy encounter creates enough interest, and whether the quiet exchange feels earned. Additions should follow those observations rather than expand the map by default.

Final verification: all 128 unit/simulation checks, TypeScript checking and the production build passed. The broader 116-case browser run passed 114 checks and exposed two slice-pilot failures; after correcting normal-input aiming and encounter checkpoints, all six final slice checks passed in Chromium and Firefox, including complete dialogue playback and source-backed room editing. These are combined full-run and focused-recheck results.
