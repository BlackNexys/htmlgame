# Confluence environment · v3 / cyberpunk with undead

The live level now applies the [v4 material/support correction](../v4/README.md): alpha-corrected terrain/facades/props, aligned walk edges, grounded frames and textured waterways. V3 architecture, landmarks and city remain active; these original material sheets are preserved for comparison.

The current Last Platform environment follows the user's [Untitled.png](../../../../../docs/Worldbuilding/Untitled.png) reference. The earlier brass-heavy v1/v2 direction is superseded for this level; those files remain preserved and are not loaded by the demo.

Dark stone and gunmetal are retrofitted with electronic terminals, power conduits and cyan/magenta light. Gothic shapes belong to a cyberpunk city inhabited by undead people. Blue-glass canopies, pink vegetation and small amber habitation lights match the reference. Magenta belongs to the environment as well as the protagonist. The hero/enemy/NPC sprite identities remain unchanged.

## Files and generation

All raster artwork was generated with the built-in imagegen tool. [Exact prompts](PROMPTS.md) record the six generation requests and one landmark-alpha edit. All generated source images, including the original landmark variant, are preserved under `sources/`.

| File | Contents |
| --- | --- |
| terrain-v3.png | 192 × 192; sixteen 48px material tiles, four materials and four edge/fill variants |
| facades-v3.png | 768 × 768; sixteen quiet 192px facade/room panels |
| props-v3.png / atlas-v3.json | 768 × 576; twelve trimmed prop frames, including physical evidence and powered shutters |
| architecture-v3.png / architecture-atlas-v3.json | 1024 × 768; twelve trimmed structural modules |
| landmarks-v3.png | 768 × 512; six 256px landmark cells with transparent margins and tight glow |
| city-v3.png | Original generated opaque parallax city background |
| sprites/ | Thirty standalone alpha exports: twelve props, twelve modules, six landmarks |

Props keep the existing catalog order: bench, lamp, cargo, junction, ticketBooth, timetable, ledger, routeIndex, letter, shutterClosed, shutterOpen, railing. Architectural modules retain the v2 semantic names so art replacement does not change game mechanics.

The landmark sheet contains magenta Registry glass, an electronic freight gantry, wired viaduct arch, cyan mineral rib, black-steel station clock/display and blue-glass inhabited frontage. Electronic timekeeping is compatible with the direction; clockwork ornament is not its technology.

## Repacking and verification

Run `node scripts/pack-confluence.mjs v3` and `node scripts/pack-confluence-architecture.mjs v3`. Defaults still rebuild the historical v1 and v2 packs respectively. Packing crops the authored cells, trims alpha bounds and uses nearest-neighbor scaling; it does not repaint assets. Keep new variants in a sibling version directory.

The live gallery is `/docs/confluence-environment.html`. The demo loader requests only v3 and validates atlas frames. Images fail independently, preserving gameplay if a decorative layer is unavailable.

Collision and interaction come from level JSON. Waterfalls are cosmetic renderer effects; freight cages and background trains are static scenery. The rendered [whole-level overview](../../../../docs/last-platform-overview-v5.png) uses actual game assets and renderers, with a fitted city backdrop for the overview. It is not the earlier generated concept illustration.

