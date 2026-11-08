# Continuous building shells

The active background layer separates quiet building material from windows, signs, canopies and furniture. Station, residential, Registry and industrial families share aligned 96px wall courses, restrained electronic service routes, transparent outer corners, roof cornices and floor bands.

- `walls-v5.png`: four rows of four opaque 96px material variants.
- `trims-v5.png` / `trims-v5.json`: sixteen tightly cropped transparent trims in 192px atlas cells.
- `sources/`: unmodified image generation outputs. See [exact prompts](PROMPTS.md).
- Rebuild: `node scripts/pack-confluence-buildings.mjs`.

Building footprints, material selection and connectivity live in `ConfluenceBuildings.ts`; drawing and clipping live in `ConfluenceBuildingRenderer.ts`. World-aligned tiles continue across adjoining wings. Shared edges omit exterior corners; open station arcades retain views of the distant city. Selected façade bays remain in `ConfluenceScene.ts`; the Registry signal-glass landmark stays distinct.

Bodies are intentionally opaque only inside explicit shells. Trims and window cutouts preserve alpha; inspect them on white in [the material checker](../../../../docs/confluence-material-check.html). This layer adds no collision or interaction behavior. Missing v5 art leaves the existing terrain, props and gameplay usable.

Canopy placement: the v3 station canopy includes its own columns and plinths. It is drawn at its original aspect ratio with its base on the relevant platform (arrival 864, rooftop 288, lower hall 1632, west service room 2592). Arrival window bays stay on the upper story to avoid a competing glass roof beneath the canopy.
