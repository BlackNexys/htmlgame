# The Confluence · environment kit v1

**Historical iteration:** the demo now uses the [v3 cyberpunk kit](../v3/README.md), following the user’s Untitled.png reference. This earlier artwork remains preserved, but does not define the current direction.

The revision-4 district also uses the [v2 architectural extension](../v2/README.md). This v1 kit and its generated sources are preserved unchanged.

First integrated gameplay environment art for **The Last Platform**. Generated with the built-in **image_gen** tool using the supplied railway-city painting for setting/material reference and the live gameplay character atlas for pixel-cluster treatment. The original artwork and character sprites are preserved.

The palette combines charcoal station stone, rail steel, tarnished bronze, warm inhabited windows and restrained cyan rivers/technology. The huge curved formations remain ambiguous alien geology. Magenta remains concentrated around the traveller.

## Delivered art

| File | Content / layout |
| --- | --- |
| [terrain-v1.png](terrain-v1.png) | 16 native 48×48 tiles in a 192×192 atlas; four rows: station stone, rail steel, Registry limestone, archive masonry |
| [facades-v1.png](facades-v1.png) | 16 larger architectural panels, 4×4 cells of 192×192; background arches and structural bays |
| [props-v1.png](props-v1.png) | 12 transparent props in a 768×576 atlas; exact trimmed frames in [atlas-v1.json](atlas-v1.json) |
| [landmarks-v1.png](landmarks-v1.png) | Six transparent landmarks, 3×2 cells of 256×256: rose window, freight gantry, viaduct arch, mineral arc, station clock, inhabited windows |
| [city-v1.png](city-v1.png) | Newly authored distant city/river backdrop, 1448×1086; a gameplay parallax layer, not the title-screen painting |

Terrain columns are **left top cap / middle top cap / right top cap / interior fill**. The renderer chooses caps from physical terrain neighbours. Bright mortar does not outline every brick. Exposed walkable edges remain clearer than background stonework.

Individual transparent PNGs are also exported under `sprites/`:

- [Bench and luggage](sprites/bench-v1.png), [station lamp](sprites/lamp-v1.png), [freight cargo](sprites/cargo-v1.png), [conduit junction](sprites/junction-v1.png).
- [Ticket window](sprites/ticketBooth-v1.png), [timetable](sprites/timetable-v1.png), [ledger lectern](sprites/ledger-v1.png), [route-index terminal](sprites/routeIndex-v1.png).
- [Unfinished letter](sprites/letter-v1.png), [closed shutter](sprites/shutterClosed-v1.png), [open shutter](sprites/shutterOpen-v1.png), [railing](sprites/railing-v1.png).
- [Registry rose window](sprites/roseWindow-v1.png), [freight gantry](sprites/freightGantry-v1.png), [viaduct arch](sprites/viaductArch-v1.png), [mineral arc](sprites/mineralArc-v1.png), [station clock](sprites/stationClock-v1.png), [inhabited windows](sprites/tenementWindows-v1.png).

## Review and integration

Open `/docs/confluence-environment.html` for the kit gallery, or `/?level=last-platform-demo` to see it at gameplay scale. Original study/mechanics levels retain their artwork.

`src/environment/ConfluenceScene.ts` owns decorative placements and interaction-sprite anchors in world coordinates. The camera moves the city slowly in both axes; alternating mirrored horizontal repeats keep the background join continuous. Local facade panels, lamps and props remain anchored to the level. Stone, iron, Registry and archive materials vary by district/height.

The ledger, index, letter, shutter and departure portal now have artwork. The shutter uses its closed/open sprite states over the existing collision bounds; its narrow mechanical frame stretches vertically to the authored 432-pixel barrier. Other props preserve their aspect ratio. Large-object prompts anchor near the player, keeping the tall shutter's action visible.

Art does not add collision, moving trains, water simulation, shops or new interaction rules. Background props and arches are decorative; actual platforms retain their original bounds and readable cap. This is a first environment art pass; the clock/window scenes are static sprites, and regional audio remains separate work.

Each image layer fails independently. Missing/invalid decorative art restores the existing terrain/background/object rendering where needed and never prevents play. `World` and narrative effects do not load or interpret art. The level workshop still edits geometry and interaction definitions; decorative art placements are currently maintained in the typed scene file.

## Sources, prompts and rebuild

All five untouched generated source PNGs are retained under `sources/`. [PROMPTS.md](PROMPTS.md) records every exact generation prompt, reference role and the built-in tool used. The first generation's larger architectural motifs were retained as facades; the refined tile prompt supplied the separate flat collision materials.

Rebuild from the repository root:

```sh
node scripts/pack-confluence.mjs
```

The packer crops fixed authored cells, trims prop alpha bounds without replacing their pixels, and uses nearest-neighbour scaling. It preserves source alpha, exports standalone sprites and writes the runtime frame metadata. No extra image-processing dependency is required beyond the project's existing Playwright/Chromium setup.
