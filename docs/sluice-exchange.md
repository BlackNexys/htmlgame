> Historical record: all authored levels were removed on 10 November 2026. Play URLs and old test totals below describe the retired layouts. See the [reset decisions](level-authoring-reset.md) and [current source workflow](level-source-authoring.md).

# The Sluice Exchange

A new standalone level authored 9-10 November 2026 from an empty document. Play **`/?level=sluice-exchange`**. The existing Last Platform levels remain available unchanged by this layout.

The experiment pushes the current authoring system through a folded route, dense multi-floor scenery, compound openings, connected water cascades and recovery routes. It uses the approved cyberundead kit and existing movement/combat. It is not a registered campaign chapter or an expansion of story canon.

See the [live friction record](sluice-exchange-friction.md) for observed difficulties, changes made and remaining tool limits. The [full-world overview](../public/docs/sluice-exchange-overview.png) is drawn with the actual game renderers; it uses a uniformly fitted/repeated backdrop, while normal play uses parallax.

## What is in it

| Property | Authored content |
| --- | --- |
| World | 8,640 by 4,096 pixels; 8-pixel placement aid |
| Structures | 54 solid structures plus three decorative structures |
| Props | 891 catalog placements, within the existing 1,000-prop cap |
| Water | 31 connected elements; soul-river at Y=3040 |
| Enemies | Ten placed opponents across all six existing types |
| Neutral actors | Two attendants using the existing noncanonical exchange scene |
| Inspections | Three optional local cards; no campaign effects |
| Routes | Folded main route, roof loop, crouched culvert and two missed-jump recoveries |

Geometry, furniture and local inspection art belong to `public/levels/sluice-exchange.json`. The initial bounded construction helpers expanded repeated wall/trim patterns during authoring; there is no second generator required by the game. Editing the JSON/workshop is the continuing workflow.

## Route

| Beat | Movement and encounter intent |
| --- | --- |
| Arrival | Safe station shelter, attendant and a view of local drainage |
| Promenade and viaduct | Broad first fight, three bridge decks, ranged threat and visible lower recovery |
| Cargo apron and manifold | Ghoul on a fighting floor, short purposeful climb and quiet optional diagram |
| Eastern turn | Visible descending landings establish the westward return |
| Middle return gallery | Travel west across terraces and separated threats, with several water circuits visible through the architecture |
| Pump chamber | Second reversal; optional culvert goes west, main route turns east into the lower district |
| Lower crossing | Another bridge sequence; a lower towpath catches mistakes and rejoins the same works approach |
| Lower works and exit | Zombie/necromancer setup, then the wight's existing shield-opening counterplay on a broad final floor |

The optional roof climbs to the signal room at Y=416 and rejoins the eastern viaduct before cargo. Its ascent was moved away from the main takeoff after both browsers exposed an overhead-clearance problem. The landing extends to the existing return stairs; moved piers were reseated against their receiving floors.

The culvert has 40 pixels of physical clearance: the 32-pixel crouched body fits, the 52-pixel standing body does not. Hold S/Down to enter. The compound doorway's opening remains traversable. The optional slate and attendant are in the room beyond; return east through the same passage.

Both recovery tests deliberately walk into a real gap instead of teleporting to the lower route. Their towpaths lead forward to a usable stair connection. They offer another way through the level, not a dead-end punishment.

## Water, art and readability

Mounted gutters feed the station canal, roof header and manifold canal. Receiving basins form western, roof, cargo and eastern circuits before discharging into the full-width river. Source and receiving surfaces determine fall positions/heights; cascades are not independent coordinate lists. Deliberate crossings behind walkways are declared explicitly and draw beneath terrain. All water remains cosmetic.

Dark masonry, signal glass and electrical hardware support the cyan/magenta palette, with warm lamps marking inhabited spaces. Foundations, insets, trims, railings and furniture are mounted data. Foreground railings are separate nonsolid constructions. No new generated image is being used as a substitute for traversable geometry.

Signs mark both route reversals. Shared HUD copy now says to follow the signs rather than always head east. The bar is labelled horizontal position; it is not a route-completion meter. That distinction matters in a folded level and remains in the friction record.

## Story and persistence

F opens local inspection cards or attendant dialogue. The cards describe the exchange's water circuit and maintenance spaces; none awards a discovery, Keepsake or destination. A bare level URL is inactive in campaign terms, so it neither loads nor writes the campaign save. The exit is a normal level exit, with no invented evidence/shutter requirement.

## Verification and measurements

Simulation tests traverse the main route, roof, culvert and both recoveries with normal health/combat, and repeat main/roof routes with deliberate stops. The input pilot brakes before reversing, uses crouched fire against ghouls and fires during the wight's existing opening. No invulnerability, enemy removal in completion checks, teleportation or direct damage calls are used.

The continuous main pilot takes about 74 seconds with four health remaining; the roof variant takes about 75 seconds with three remaining. A cautious main pass with brief landing stops takes about 85 seconds. Main camera travel is about 2,000 pixels vertically; the roof variant exceeds 2,300. These are automated reachability measurements, not a claim about human first-visit pacing or final balance.

Browser tests use real keyboard inputs for main, roof and a combined culvert/recovery route, physically read local cards, check that inspections freeze gameplay, preserve a campaign-save sentinel, and import/export the large workshop document. The ten-map inventory includes this level automatically. Final verification: 187 unit/simulation checks, TypeScript and production build, and all 214 Chromium/Firefox browser checks passed.

The first warmed static-view profile measured compile median 2.4 ms and p95 2.8 ms on this host, with some draw-call wall-time spikes around 22-29 ms. This is not an FPS/GPU/memory benchmark or a performance guarantee. No existing object or canvas budget was raised. The large editor canvas and flat prop list expose real navigation/grouping limitations.

Reproduce review artifacts with the development server running:

```sh
npm run level:audit
npm run check
node scripts/capture-confluence-overview.mjs http://127.0.0.1:3012 sluice-exchange arrival,signal-roof,manifold-gallery,east-turn,pressure-slate,lower-works,lower-catch,departure
node scripts/profile-level.mjs http://127.0.0.1:3012 sluice-exchange
```

Human playtest questions: are the reversals obvious at speed; can the catches be recognized before falling; does the culvert look optional; can the shield opening be read without absorbing damage; and do the dense foundations leave enough separation between playable floors and background? Those remain open even after every automated route passes.
