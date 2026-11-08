# The Last Platform · Confluence district demo

**Rebuilt 8 November 2026.** The playable [runtime level](../public/levels/last-platform-demo.json) is revision **4**, **9,408 × 2,496** world pixels. This replaces the revision-3 shelf/shaft blockout with an architectural district. The [supplied design pack](The_Last_Platform_Demo_v0_1/Last_Platform_Level_Design_v0_1.md), its original revision-1 JSON and PNG remain preserved. Draft dialogue and setting details remain candidates, not locked canon.

Open `/?level=last-platform-demo`, or the title footer's **The Last Platform demo** link. **F** interacts and **K** opens Journey. The ordinary movement, jumping, aiming and firing controls apply. `preview=1` and editor playtests keep discoveries in memory.

## The district

The layout is designed around places, overlapping floors and connected routes:

| Place | Floor Y | What happens here |
| --- | --- | --- |
| Arrivals square | 2016 | Safe start, attendant, ticket booth, benches, clock and river-city view |
| Inhabited station frontage | 2016 / 1632 / 1344 | First encounters below; balconies, optional letter and roofs above |
| Viaduct and freight | 1728 / 1344 | Two railway crossings, cargo and bridge supports; a canal towpath catches missed jumps at 2112 |
| Registry square, hall and gallery | 1728 / 1344 / 1056 | Public stairs and freight entrance lead to the same westbound reading gallery and physical transfer ledger |
| Registry overlook | 768 | Optional skyline balcony with a quiet view; returns to the gallery |
| Lower records and archive works | 2112 / 1824 | Lower return beneath the Registry, reversible archive stairs, necromancer encounter and route index |
| Departure | 2112 | Explicit shutter release, quiet final platform and demo completion |

The public route heads east through the frontage, crosses the old viaduct, climbs the public stairs and hall, then turns west into the gallery. The alternate route climbs the frontage's east stair westward, visits the inhabited balcony and optional letter, then heads east over the roofs and freight bridge into the gallery's service entrance.

From the gallery, retrace its eastern stair and descend the archive works to the route index. Departure stairs are reversible. The lower records passage continues beneath the building and viaduct back to arrivals. A separate climb between the bridge spans returns from the canal to the Registry square. Missing a jump or reaching the locked index early leaves a way back.

See the [current district map](The_Last_Platform_Demo_v0_1/Implemented_District_v0_4.svg), also served at `/docs/last-platform-map.svg`. Regenerate it with `node scripts/map-last-platform.cjs`. Dashed lines illustrate connections, not exact jump inputs. The older supplied PNG and revision-3 schematic describe earlier layouts.

## Architecture and art

The existing [v1 Confluence kit](../public/assets/environment/confluence/v1/README.md) supplies four terrain materials, facade bays, props, landmarks and the city/river backdrop. A new [v2 architecture kit](../public/assets/environment/confluence/v2/README.md) adds twelve transparent modules: station entrance, inhabited balcony, canopy, retaining pier, bridge deck and arch, freight cage, maintenance stairs, Registry shelves, counter and gallery, and archive machinery.

Arrival, river crossing, Registry and departure have distinct compositions. Warm windows, lamps, luggage, curtains, paper stacks, mugs, repaired hardware and conduits give the railway ordinary life within the alien city. The traveller retains the established magenta flame and live sprite; actors were not redesigned.

Architecture is background scenery; bright horizontal terrain caps indicate collision. Unused maintenance-stair modules remain available for later authoring rather than suggesting walk surfaces that do not match this map. The current map uses ordinary solid platforms, with headroom and gaps checked against the existing jump. City/river scenery has X/Y parallax; foreground architectural anchors follow world coordinates.

Art placements, material regions, architectural rendering and image loading have separate files under `src/environment`. Level JSON owns collision, actors, signs and interactive objects. All optional images/manifests fail independently. The original mechanics levels request none of this kit.

The [asset gallery](../public/docs/confluence-environment.html) is served at `/docs/confluence-environment.html`. Both generations preserve original image sources, exact prompts and alpha exports. Architecture packing uses `node scripts/pack-confluence-architecture.mjs`; the v1 packer is unchanged.

## Story and saved progress

The optional attendant, optional raised letter, physical ledger, route index and shutter use their existing stable IDs. Eleven enemies use all six existing types; no defeat count gates the route. Dialogue and Journey directions now describe the public stairs, balcony/freight entrance and upper gallery.

The ledger confirms a recorded S-17 transfer with redacted authorization. It does not establish coercion, consent, motive or a culprit. The letter belongs to somebody else's story. The optional attendant's reaction can supply the onward lead, so returning to the attendant remains useful.

Leaving a card grants nothing. Confirming a discovery or completing/skipping an exchange commits its validated effects. Discoveries and Keepsakes save immediately and survive death/restart/reload when storage succeeds. Enemies and the shutter reset each attempt. Knowing the destination alone cannot finish: the shutter must be physically operated, and the exit checks both conditions.

`CampaignStages.ts` owns stage completion and required exit objects; `StoryCatalog.ts` groups story IDs. Study progress remains independent and cannot pre-solve this demo. The save schema remains version 1; existing valid saves retain discoveries, arsenal fields and completion history while gaining access to the demo. Invalid/future saves remain protected.

Completion marks `last-platform-demo` and unlocks the catalog entry `outbound-line`. **The next line is outside this demo and has no clickable continuation.**

## Verification and limits

Simulation coverage includes the public route and balcony/freight entrance with normal health/combat, the optional letter, reverse archive/departure stairs, skyline overlook, full lower return to arrivals, and canal recovery. Camera tests verify more than 800 pixels of vertical travel on the public route and more than 1,100 via the optional overlook. Save compatibility, independent evidence and explicit shutter gating remain covered.

Chromium and Firefox playthroughs use ordinary keyboard input, reading only the existing F2 debug drawing to steer. They confirm ledger/index/shutter cards, immediate saved completion, preview isolation and the alternate entrance. Asset checks cover transparent exports, bounded atlas manifests, missing decorative layers and isolation from mechanics fixtures.

This is a first art-led playable district, ready for human movement, route and pacing feedback. Difficulty and duration are not established by automated reachability tests. Moving trains, water physics, checkpoints, harvesting, extra powers, bosses, animated machinery, gameplay music and final story canon remain open; this rebuild does not decide them.

