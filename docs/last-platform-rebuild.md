# The Last Platform: river crossing

Rebuilt from an empty layout on 9 November 2026. Play **`/?level=last-platform-rebuild`**. The older district remains at `/?level=last-platform-demo` for comparison. The [authoring friction log](level-authoring-friction.md) records concrete obstacles encountered during this rebuild, workarounds and candidate improvements.

This is a fresh layout using the current structure and water architecture and the approved cyberundead kit. It retains the existing evidence-to-departure story and isolated preview behavior. No new movement powers or water mechanics are required.

## Route and composition

The world is 11,872 by 2,112 pixels, with 8-pixel editor snapping. Its 29 structures use explicit materials, 24-40 pixel physical decks and mostly 80-pixel rises; bridge envelopes are separate from their decks. The route occupies several connected height bands rather than inheriting the old terrain coordinates.

| Beat | Layout and purpose |
| --- | --- |
| Arrivals | Broad safe platform at Y=1248, complete station shelter, booth, timetable and neutral attendant |
| Concourse | Two broad 80-pixel rises, room to run and the first zombie; visible roof/viaduct split |
| River viaduct | Three supported bridge decks, 104-pixel gaps and one 40-pixel rise; skeleton and ghoul in separate lanes |
| Freight exchange | A visible 240-pixel descent into the approach, joined by the lower recovery route; two short climbs into a broad work yard |
| Registry | Purposeful climb to Y=928, quiet gallery, benches and the physical transfer ledger |
| Archive | Two descending terraces into Y=1168; zombie/necromancer setup, then a separate east reading desk for the route index |
| Departure | Descending terraces to Y=1488, broad wight encounter, physical shutter and outbound lead |

The optional roof route branches from the concourse, rises to Y=768, contains the unfinished letter and rejoins the eastern viaduct before freight. The lower towpath at Y=1488 catches missed bridge jumps and climbs forward into freight. Neither branch skips required evidence. Both axes and the existing vertical camera are exercised.

The complete main pilot takes about 37 seconds before the final exit approach, excluding reading, inspection and deliberation. It uses ordinary running, jumping and firing, with normal health; sprint is not required. This is a reachability measurement, not a first-time-player pacing or difficulty claim. The roof and recovery routes also pass with normal combat enabled.

## Buildings and water

Scenery assemblies now follow the owning structure's type, material and actual deck thickness. A bridge stays a bridge when moved; its piers terminate at the next floor beneath their footprint or at the world foundation. Masonry galleries and their inset windows remain rear art, independent of colliders. Floor-attached furniture is now authored in the level's `props` collection, separate from wall/support composition. Story objects also have explicit visual bounds and mounts; see [authored scene art](authored-scene-art.md).

The station's two mounted gutters feed a contained canal beneath the arrival platforms. Its eastern spill empties into the soul-river at Y=1760. The freight floor carries an outfall, collector, receiving basin and rim overflow; all five falling connections end in authored receiving water and avoid playable floors. The eleven water elements use the shared network and renderers. The river spans the full world width.

The materials remain dark blue masonry and signal glass, cyan water/electronics, magenta accents and warm amber lamps. Water is cosmetic and freezes with simulation time. Missing optional art preserves gameplay. The current kit is reused; no generated concept image is substituted for runtime geometry.

The actual [whole-level render](../public/docs/last-platform-overview-rebuild.png) is reviewable at full resolution. Its city backdrop is uniformly fitted and repeated for the overview; normal gameplay uses the existing parallax camera. Regenerate it and room crops from structural/water IDs:

```sh
node scripts/capture-confluence-overview.mjs http://127.0.0.1:3012 rebuild
```

## Story and saves

F interacts; K opens Journey. The optional letter, ledger, index and shutter retain their stable IDs and existing effects. Knowledge alone cannot complete the stage: the player must physically release the shutter. S-17 remains an onward lead, not a built next chapter.

The rebuild always runs in an isolated preview session, even without `preview=1`. It neither loads nor writes campaign progress. Session discoveries survive stage restart; a page reload starts a fresh preview. Journey reset stays in this level.

## Verification and remaining questions

The real simulation verifies main-route combat, physical evidence access, shutter release and completion, plus the roof Keepsake and a missed-jump recovery with ordinary combat. Support endpoints and coordinate-independent bridge dressing have regression checks. Browser tests use named route beats and actual keyboard/card controls; inventory checks verify runtime JSON, restart and workshop round trips.

Run `npm run level:audit`, `npm run check` and the relevant browser tests after edits. See the [friction log](level-authoring-friction.md) for the final verification record and limitations discovered during construction.

Human playtest questions remain: does the roof split read at speed; is the towpath visible before a missed jump; does the freight drop feel deliberate; is the quiet Registry a satisfying pause; and does the descent to departure provide enough variety? The prototype establishes connected spaces, not final balance or finished pacing.
