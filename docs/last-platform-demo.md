# The Last Platform · cyberundead district demo

**New comparison build:** play `/?level=last-platform-rebuild`. See [rebuilt preview notes](last-platform-rebuild.md) for its forward route, roof loop, recovery path and save isolation. The older district described below retains its route layout; the [level audit](level-audit.md) records its schema migration and corrected viaduct marksman footing.

**Revision 5, 8 November 2026.** The [runtime level](../public/levels/last-platform-demo.json) is rebuilt as a **7,200 × 3,840** cyberpunk railway district, using the user's [Untitled.png](Worldbuilding/Untitled.png) as the primary environment reference. This supersedes the brass-heavy revision-4 art direction and layout. The supplied design pack and earlier maps remain preserved as historical iterations.

Play `/?level=last-platform-demo`. **F** interacts, **K** opens Journey. Existing running, sprinting, variable jumps, wall movement, aiming and firing remain unchanged. `preview=1` keeps progress in memory.

## Direction and routes

The theme is **cyberpunk with undead**: electronic infrastructure, cables, terminals, dark industrial metal, blue glass, cyan spectral rivers and magenta light/vegetation. Gothic buildings remain part of the inherited city. Small amber lights suggest inhabited places. Brass ornament, steam technology and clockwork do not define the environment. Magenta is shared with the world; character readability depends on silhouette, value and motion.

The station starts high in the district. The upper viaduct leads east, over a raised maintenance hatch, then down to the Registry's reading gallery. From its eastern desk, descend the east stair to the public hall, head west down to freight, turn east beneath the public stair, cross the archive approaches, inspect the route index and descend to departure.

| Place | Floor Y | Role |
| --- | --- | --- |
| Station roof | 288 | Optional letter and city view; rejoins arrivals |
| Arrival / upper viaduct | 864, hatch 768 | Safe attendant area, first encounters, open crossing |
| Registry reading gallery | 1248 | Physical transfer ledger at the east desk |
| Lower station / Registry public hall | 1632 | Overlapping indoor routes and vertical return connections |
| Freight exchange | 2400 | Cargo, electronic gantries, combat lane; connects station, Registry and canal |
| Western service room / tenants' balcony | 2592 / 3168 | Optional inhabited side loop, with separate room stairs back into the canal spine |
| Archive workshop | 2880 | Necromancer encounter and physical route-index terminal |
| Departure | 3360 | Powered shutter, quiet final platform, explicit demo completion |
| Canal towpath | 3648 | Safe catch route above the scenic river; climbs west to freight or east toward departure |

The canal spine climbs back to freight, then the station service stairs reach the lower hall, and the upper maintenance stair exits through the viaduct hatch. Departure and archive approaches also work in reverse. A player who finds a locked clue or shutter early can return to the evidence. The roof letter and western inhabited rooms are optional.

See the [revision-5 schematic](The_Last_Platform_Demo_v0_1/Implemented_District_v0_5.svg), served at `/docs/last-platform-map.svg`, and the [actual renderer overview](../public/docs/last-platform-overview-v5.png). Regenerate them with `node scripts/map-last-platform.cjs` and, with Vite running, `node scripts/capture-confluence-overview.mjs`. The overview draws current terrain, scenery, objects, hero and enemies at world scale with a fitted city backdrop; normal play uses parallax. The earlier generated alternate concept is not a runtime screenshot.

## Art and architecture

The [v4 material/support polish](../public/assets/environment/confluence/v4/README.md) fixes wall/surface cutouts, cap alignment, prop grounding and water textures. Review the [white-background check](../public/docs/confluence-material-check.html). The runtime combines v4 terrain/props/water, v5 wall materials/trims, v6 architecture/canopy/window inserts and frame metadata, and the v3 city/landmark images. Facade tinting preserves alpha; rear steel frames connect the existing landings, bridge columns reach bearing floors, and drain pipes anchor the textured cascades. Geometry and progression are unchanged.

The replacement [v3 kit](../public/assets/environment/confluence/v3/README.md) provides new materials, facades, transparent props/modules/landmarks and a city backdrop. Original generated sources and [exact prompts](../public/assets/environment/confluence/v3/PROMPTS.md) are preserved. Earlier v1/v2 files remain archived; the runtime selects the current components from v3-v6. The [asset gallery](../public/docs/confluence-environment.html) is served at `/docs/confluence-environment.html`.

`ConfluenceScene.ts` places inset panels and props; `ConfluenceLandmarks.ts` owns mounted and distant landmarks. `ConfluenceArchitecture.ts` places canopies, bays, catwalk covers, terminals and static equipment. `ConfluenceStructuresRenderer.ts` owns rear bearing piers, frames and brackets; `ConfluenceMaterials.ts` defines visual regions. The level file now declares its drains, falls and lower river through [authored water elements](water-elements.md); shared water renderers add no collision, damage or resource rules. The existing hero and actors retain their artwork.

The level JSON alone owns collision, actors, signs and interactive objects. Native rendering remains camera-culled. Optional art atlases load and fail independently; mechanics fixtures request none of this environment kit.

## Narrative and saves

Eleven enemies use all six existing types. Neither an enemy count nor the optional attendant/letter gates completion. The stable ledger, route index, Keepsake, attendant and shutter IDs are retained, so valid existing saves keep their discoveries. Study progress remains independent.

The transfer entry is evidence of a recorded S-17 transfer with redacted authorization. It does not settle consent, coercion, motive or a culprit. Dialogue and Journey directions now describe the upper viaduct, east desk, public hall and freight connections. The writing remains draft material.

Leaving an inspection grants nothing. Confirming a discovery saves it immediately; discoveries and Keepsakes survive death/restart/reload if storage succeeds. Enemies and the shutter reset each attempt. The exit requires both the destination fact and physical shutter operation. Climbing around the closed gate cannot finish.

Completion marks `last-platform-demo` and unlocks the catalog-only `outbound-line`. The continuation is outside this demo and has no clickable stage link. Save shape remains version 1; malformed/future saves remain protected.

## Verification and limits

Simulation coverage checks the full main route and roof branch with normal combat/health, reverse archive/departure approaches, canal-to-arrival return, western inhabited loop, and east canal recovery. The main route moves the camera through over 2,200 pixels vertically. Browser tests use ordinary keyboard controls and the existing F2 debug drawing to steer, confirming physical clues, card cancellation, shutter operation, saved completion, dialogue and preview isolation.

The art checks validate wall/surface margins against white, alpha-preserving runtime shading, grounded cap metadata, bounded sprite crops, textured water draws, missing-layer fallbacks and current versioned asset requests. Structural checks cover each small landing, pier bearing and waterfall source. Build/type checks and original mechanics/narrative regressions remain part of verification.

This is a playable interpretation of the reference, not a pixel-for-pixel reproduction or a final balance pass. Human feedback is still needed on navigation, combat pressure and pacing. Water simulation, moving trains/lifts, checkpoints, new powers, bosses, gameplay music and final world/story canon remain unresolved.


### Continuous building shells

The v5 background kit separates continuous wall material from selected fa?ade bays. Station, residential, Registry and industrial buildings use world-aligned 96px textures, shared floor bands, exposed corners and rooflines; service conduits follow each shell. Station piers connect the stories while retaining open arcade views. The Registry has fewer repeated shelf bays and keeps its magenta landmark distinct.

`ConfluenceBuildings.ts` owns decorative footprints and material families; `ConfluenceBuildingRenderer.ts` owns clipping and connected trim drawing. `EnvironmentLoader` validates optional wall/trim images and their manifest independently. The pass runs between water and rear support structures, before windows and props. Terrain collision, narrative anchors and save behavior are unchanged. Original generated assets and exact prompts live in `public/assets/environment/confluence/v5/`; the gallery and white-background checker include them.

### Architecture sweep and lighting

The v6 canopy uses a complete front elevation. Windows are inset details on the v5 building shells, with duplicate full-frontage layers removed. Arrival windows sit between the roof-stair piers; the Registry arcade and archive furniture use distinct bays. Clock brackets mount on building corners, and tight landmark bounds exclude neighboring atlas fragments.

`ConfluenceImageLighting` shades source RGB while retaining alpha. Architecture, rear supports, trims, props and near landmarks draw at full opacity. `ConfluenceLandmarksRenderer` separates distant spectral scenery (before walls) from mounted or grounded landmarks. The v6 packing script preserves generated sources and emits validated frame metadata; the high-resolution canopy remains a separate optional image. Terrain, interactions and save data are unchanged. The screenshot utility captures eleven district details alongside the full-level image.

## Research for a fresh layout

The [level-design research and rebuild blueprint](level-design-research.md), [kit specification](confluence-kit-spec.md) and [route sketch](last-platform-route-proposal.svg) propose the next design experiment. They recover the original quiet Registry and forward critical route while keeping meaningful upper/lower branches. The proposed first step is a three-beat greybox and a kit proof room; those changes are not yet part of this playable level.
