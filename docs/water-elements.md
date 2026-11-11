# Authored water elements

Implemented 9 November 2026. Water uses concrete element classes, level-owned definitions and separate renderers, following the world structure architecture. The rebuilt demo, comparison district and construction study all use the same system.

## Classes and ownership

`src/world/water` contains browser-free domain classes:

| Class | Responsibility |
| --- | --- |
| `WaterBody` | Shared placed volume, receiving surface and sockets |
| `River` | A larger water body with its default visual current |
| `Canal` | A contained water body with a spill socket |
| `CatchBasin` | Receiving water, an inset surface and a rim-overflow socket |
| `Drain` | Mounted gutter/downpipe or collector infrastructure, with inlet and mouth sockets |
| `Waterfall` | A resolved vertical connection from a source socket to a receiving water surface |
| `WaterNetwork` | Dependency resolution, placed instances, bounds and connection validation |

The existing `Outfall` structure owns its architectural sprite and inlet/mouth sockets. It does not own its falling stream or receiving basin. `Map.water` owns the fresh network for one runtime scene. Loading/restarting a world constructs new water instances from definitions; there are no shared mutable water objects between runs.

There is no water layout selected by level name and no fall height copied into another coordinate list. The previous Confluence-specific layout and water renderer classes have been removed.

## Authoring

Schema v2 has an optional `water` collection that normalizes to an empty array. Entries share the level's global object-ID namespace. Rivers, canals, basins and drains have X/Y, width and height; optional `mount` references make X/Y local offsets from a structure or another water element. Unmounted coordinates are world pixels.

Example receiving basin and fall, attached to an existing outlet:

```json
[
  {
    "id": "freight-basin",
    "kind": "basin",
    "x": -192,
    "y": 320,
    "width": 384,
    "height": 112,
    "mount": {"parent": "freight-outfall", "socket": "mouth"}
  },
  {
    "id": "freight-fall",
    "kind": "waterfall",
    "x": 0,
    "y": 0,
    "width": 96,
    "from": {"parent": "freight-outfall", "socket": "mouth"},
    "to": "freight-basin"
  }
]
```

For a fall, X/Y are offsets from its source socket and default to zero. The receiving body's surface determines the end height. Moving the outlet carries the mounted basin, collector and source stream together. Raising a canal's water surface lengthens its incoming falls and shortens its outgoing spill to a lower river.

Bodies accept `current`, a signed visual speed; it does not push actors. `depth` orders elements inside their relevant water drawing stage. A fall marked `overRim: true` draws in front of basin trim. A deliberate stream behind a bridge or other physical surface must declare `behindTerrain: true`; otherwise crossing a solid rectangle is rejected.

Drains have `gutter` and `collector` profiles. `outletX` optionally specifies their mouth's local horizontal position. The source pipe, gutter and grate remain dry architectural drawing, separate from the stream itself.

### Validation

`WaterValidation` checks supported fields, finite integer authoring values, socket-reference syntax and the 1000-element budget. `WaterNetwork` resolves references and rejects missing objects, missing sockets, dependency cycles, non-water receivers, upward/zero-height falls, streams outside their receiving body's width, off-level geometry and undeclared crossings of solid terrain.

Structure mounts resolve first. Water can attach to structures and other water elements; structural parents do not depend on water objects. Deleting an element that is still referenced fails atomically until its connections are removed or remounted. Unknown fields do not silently become unimplemented mechanics.

## Workshop and files

Choose **Water** and a water-element type, then drag a rectangle to place a river, canal, basin or drain. Select **Flow source** and **Receiving water**, then use **Connect water** to create a fall. Body sources default to their spill socket; drains/outfalls default to their mouth. The inspector lets you edit the source socket, receiver, source offsets, width, mounts, current and rim/background settings.

Water participates in selection, dragging, exact property edits, undo/redo, local draft storage, JSON editing, export/import, CLI summaries and atomic revision-checked patches. Source offsets and references remain authored data; resolved heights and positions are not written back as duplicate coordinates. Invalid edits retain the previous valid document.

**Load construction study** in the workshop provides a mounted outfall, receiving basin, overflow and lower river to experiment with. `/?level=construction-study` plays the same definitions. Newly named levels load only the optional water/drainage kit when needed, without loading the district's buildings or city art.

## Drawing and time

`src/renderers/water` contains `WaterRenderer`, `WaterSurfaceRenderer`, `WaterfallRenderer`, `WaterImpactRenderer` and `DrainRenderer`. `GameScreen` draws the water network after environment foundations and before foreground terrain/actors. Within that pass, dry sources precede surfaces and falls; basin rims precede explicitly marked overflows. No draw-order rule depends on a fall being the final array item.

Surfaces reuse the approved dark water material, horizontal currents, broken reflections and local impact effects. Falling texture moves downward. Every animated effect uses simulation elapsed time, so gameplay pause and modal dialogue freeze water. Missing optional artwork preserves play, with procedural surface/stream fallbacks.

The title menu remains a separately authored presentation scene. Its decorative animation does not require a gameplay `Map` or water network.

## Checks and current scope

Tests cover concrete class creation, fresh instance ownership, outlet/receiver movement, receiver-level changes, history/export, invalid graphs, explicit background crossings, optional assets, newly named levels and pause behavior. `node scripts/check-water-motion.mjs` compares actual rendered pixels across time and writes a motion strip; downward displacement matches while frozen simulation time produces identical pixels.

Water remains cosmetic. These elements do not register solid colliders, implement swimming or buoyancy, deal damage, grant resources, simulate volume/conservation or automatically change flow when a gate operates. Such behavior can be designed separately without placing it inside the renderers.
