# Confluence architecture · v2

**Historical iteration:** the demo now uses the [v3 cyberpunk kit](../v3/README.md), following the user’s Untitled.png reference. This earlier artwork remains preserved, but does not define the current direction.

Twelve new transparent pixel-art modules for the revision-4 Last Platform district. Built-in imagegen generated a new atlas using the v1 props and landmarks as style references; the existing kit and actors are unchanged.

- [Packed atlas](architecture-v2.png): 1024 × 768, four columns by three rows.
- [Validated frame manifest](atlas-v2.json): tight alpha-trimmed frames. Use these bounds; cells contain padding.
- [Preserved original](sources/architecture-source-v2.png): unmodified generated source.
- [Exact prompt](PROMPTS.md) and twelve standalone exports under `sprites/`.
- [Live gallery](../../../../docs/confluence-environment.html) and [district notes](../../../../../docs/last-platform-demo.md).

Order: stationEntrance, inhabitedBalcony, stationCanopy, retainingPier; bridgeDeck, bridgeArch, freightCage, maintenanceStairs; registryShelves, registryCounter, registryGallery, archiveMachinery.

Repack with `node scripts/pack-confluence-architecture.mjs`. The Canvas packer crops authored cells, trims alpha bounds and scales with nearest-neighbor filtering. It does not redraw or synthesize pixels; the generated source remains preserved.

`ConfluenceArchitecture.ts` owns placements; `ConfluenceArchitectureRenderer.ts` handles camera culling and depth. The architecture atlas and its manifest load independently of v1 layers. Collision remains authored exclusively in the level JSON. The maintenance flight is exported for future use but not placed over mismatched collision steps.

The draft art is deliberately static. The freight cage is scenery, not a lift; machinery has no new gameplay behavior.

