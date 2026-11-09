# The Last Platform: rebuilt preview

8 November 2026. Play **`/?level=last-platform-rebuild`**. The previous district remains at `/?level=last-platform-demo` for comparison.

This is a new playable layout built from the [research blueprint](level-design-research.md), using the approved cyberundead assets. It includes the complete existing evidence-to-departure sequence. It is a first construction and traversal pass, not final pacing or final environment art.

## Route

The level is 10,560 × 1,920 pixels, on the existing 48-pixel grid.

| Beat | Purpose |
| --- | --- |
| Arrivals | Safe orientation, attendant, grounded station shelter |
| Concourse | Broad movement space, small rises, first zombie |
| River viaduct | Separated bridge sections, skeleton then ghoul |
| Freight | Landing and fighting room, climb toward the Registry |
| Registry | Quiet reading gallery and transfer ledger |
| Archive | Descent, zombie/necromancer encounter, route index at the east end |
| Departure | Wight on a broad floor, physical shutter release, exit |

The roof branch climbs from the concourse, contains the existing unfinished letter, and reconnects at freight. Missing a viaduct jump lands on the canal maintenance route, which proceeds east to freight. Neither branch bypasses the required evidence. The camera follows both horizontal and vertical travel.

Controls and powers are unchanged. F interacts, K opens Journey. Mandatory rises are at most 96 pixels. The new routes are tested without sprinting. The prototype is compact: the automated pilot traverses the main route in roughly 35 seconds excluding reading and deliberation. That is a reachability measurement, **not** evidence that the original 8–12 minute first-visit target has been met.

## Construction

`RebuiltConfluenceAssemblies` extracts exposed floor runs from compiled collision tiles. Each support terminates on the first floor under its own footprint, or at the world foundation. `RebuiltConfluenceScenery` owns the decorative wall fields, inset windows, support shafts, lamps, shelter and textured canal. Physics remains in the level data and simulation.

This replaces the old layout's unrelated placement lists for the preview. Windows are quiet insets; the arrival canopy retains its complete front-facing silhouette. Wall shading preserves opacity. The letter, ledger, index and shutter use their relocated interaction anchors.

Support caps, feet and wall bands use the building kit's textured trims instead of flat gray rectangles. The animated soul-river spans the full level below the routes, drawn in front of deep foundations so it stays visible.

The approved [water concept](Worldbuilding/water-concepts/water-studies-v1.png) is implemented as two station gutter/downpipe connections feeding a quiet elevated canal, a canal-end spill into the river, and one freight collector/sluice with a receiving basin and a separate overflow. This replaces automatic waterfalls under bridge spans. The [v7 drainage kit](../public/assets/environment/confluence/v7/README.md) provides visible mouths and basin geometry. Surface water is dark, with subdued texture, slow horizontal currents and broken reflections; brighter foam and spray stay local to impacts. All water is cosmetic and pauses with simulation time. Routes and collision remain unchanged.

`RebuiltConfluenceWaterways` owns the connections, `ConfluenceDrainageRenderer` draws dry infrastructure, and `RebuiltSoulRiverRenderer` handles surfaces and impacts using the shared downward waterfall renderer. `node scripts/check-water-motion.mjs` compares rendered pixels across time: the material moves down ten pixels over a quarter second and remains identical at frozen time. It writes a four-frame motion strip to `artifacts/water-motion.png`.

The initial pass reuses v4 terrain/props/water, v5 walls, v6 insets/canopy and the v3 city. The approved water pass adds generated v7 drainage modules; it establishes no new story canon. The [kit specification](confluence-kit-spec.md) still tracks missing authored junctions, richer building silhouettes, regional landmarks and final material topology. The simple support assemblies are an initial implementation, not the complete production kit.

## Preview and saves

This layout always runs with isolated preview progress, including when the URL omits `preview=1`. It neither loads nor writes the existing campaign save. Discoveries remain for stage restarts within the current session; reloading starts a fresh preview. Journey reset stays in this rebuilt level. The regular demo retains its immediate permanent discoveries and Keepsakes.

The same existing story effects and gate conditions are used. Learning the destination alone cannot finish the level: the player must physically operate the shutter. S-17 remains an onward lead, not a playable next chapter.

## Verification and review

Simulation tests cover the main route with ordinary combat, roof letter/rejoin, a real fall into the recovery route, construction support endpoints and save isolation. Browser tests use keyboard controls to read the ledger, decode the index, operate the shutter and finish in Chromium and Firefox. A fractional tile-seam collision discovered during this playthrough also has a regression test.

The [whole-level render](../public/docs/last-platform-overview-rebuild.png) uses the actual game renderers. Regenerate with the dev server running:

```sh
node scripts/capture-confluence-overview.mjs http://127.0.0.1:3012 rebuild
```

Next human playtest questions: does the roof split read clearly; can the lower route be recognized while falling; does combat have enough breathing room; and are the long Registry/departure floors satisfying? Tune those before spending time on dense final dressing. No claim of perfect difficulty, timing or visual polish yet.
