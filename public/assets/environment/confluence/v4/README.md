# Confluence material and support polish · v4

This is a targeted visual correction to the revision-5 district, using the v3 cyberundead art direction. Collision, movement, routes and narrative are unchanged.

## Corrected artwork

Built-in imagegen repaired the terrain/facade/prop source sheets and generated new water materials. [Exact prompts](PROMPTS.md) and all four original outputs are preserved under `sources/`; v3 originals remain unchanged.

- `terrain-v4.png`: sixteen 48px tiles with transparent external padding and plant margins. Interior fill tiles remain solid.
- `terrain-v4.json`: validated cap baselines and source-row crops. Painted walk lips align to collider tops; decorative overhangs remain above them.
- `facades-v4.png`: sixteen 192px room panels with external cutouts.
- `props-v4.png` / `atlas-v4.json`: grounded prop crops; the lamp frame excludes the neighboring bench fragment. Twelve standalone exports are under `sprites/`.
- `water-v4.png`: 512 × 256, two material cells: vertical cascade and horizontal river surface.

The live loader uses v4 materials/props/water and retains v3 architecture, landmarks and distant city. A missing decorative layer remains nonfatal.

Repack with `node scripts/pack-confluence-polish.mjs`. The packer locates the edited sheet's row gutters, crops the authored cells, normalizes opaque fill tiles and packs with nearest-neighbor scaling. It measures the existing cap lip; it does not repaint sprites. The lamp's dominant connected silhouette selects its source crop without erasing pixels within that crop. Bottom padding is excluded from prop frames to keep feet/stands grounded.

## Rendering corrections

`ConfluenceFacadeRenderer` shades an isolated atlas using source-atop, preserving alpha. Filling a dark rectangle over the destination panel would restore the unwanted backing and must not be reintroduced. The exit renderer also no longer fills an opaque black rectangle behind the open frame.

`ConfluenceStructuresRenderer` uses repeating steel material for piers, headers, rear brackets and mounted drains. It follows the actual exposed terrain landings. `ConfluenceStructures.ts` defines architectural frames and bearings; tests check that every small landing is supported and every pier ends on terrain or an attached header. Open shaft structures replace the former opaque rectangular backplates. Short bridge arches sit on repeating columns instead of being stretched vertically into floating towers.

`ConfluenceWaterways.ts` defines cosmetic flows and their architectural source points. `ConfluenceWaterRenderer` scrolls actual textured materials with alternating mirrored repeats to avoid hard seams, fading waterfall ends into mist. These effects use simulation time and freeze with gameplay. Missing water art omits the extra water layer; it does not revert to flat cyan rectangles.

## Inspect on white

Open [the material check](../../../../docs/confluence-material-check.html) at `/docs/confluence-material-check.html`. It defaults to white and also offers checker/dark backings. The old sheets are available for comparison. Browser tests also draw the game against white and check the tinted facade's alpha.

The [whole-level overview](../../../../docs/last-platform-overview-v5.png) has been refreshed with these corrections.

