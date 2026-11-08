# Confluence material polish · v4

Built-in imagegen tool. The three edits use the preserved v3 source sheets as edit targets. Water is a new material atlas using `docs/Worldbuilding/Untitled.png` as style reference. Every generated output is preserved under `sources/` and all v3 originals remain unchanged.

## terrain

```text
Edit target: the supplied 4x4 terrain tile sheet. Background extraction / pixel-art asset repair ONLY. Keep all sixteen cells, exact layout, material families, masonry, cables, pink plants, cyan/magenta lights and shapes. Remove the BLACK/near-black empty backdrop ABOVE the three top-cap tiles in each row and outside hanging plant silhouettes, and remove the opaque black empty gutters between cells. Those empty areas must be genuinely ALPHA TRANSPARENT so the tiles work on WHITE or any background. Keep dark mortar INSIDE stone walls and dark industrial metal opaque; the fourth-column interior fill tiles should remain filled wall materials, not perforated. Preserve straight horizontal walk edges, do not add shadows, borders, scenery, text, checkerboards or repaint the objects. The entire point is real alpha outside the existing solid tile silhouettes; no black rectangular backing.
```

## facades

```text
Edit target: this 4x4 Gothic cyberpunk facade sheet. Background extraction / sprite alpha repair ONLY. Preserve sixteen equal cells, all columns/rows, pixel-art structures, lights, glass, plants, archives, cables and opaque interior wall panels. Remove the solid black/near-black EMPTY BACKGROUND around each architectural silhouette, including top gaps around roofline/vegetation, gutters between cells, empty external corners, and genuinely OPEN arches/rail gaps. Make these external/empty pixels truly ALPHA TRANSPARENT, verified conceptually against a WHITE background. Preserve dark masonry mortar, shaded physical walls, window glass and shelving interiors as solid materials; do not erase every dark detail. No solid black rectangle behind the structure, no replacement white backdrop, no checkerboard, no redraw, no text. Same regular 4x4 grid.
```

## props

```text
Edit target: this 4-column 3-row prop sprite sheet. Keep all twelve props and their cells, proportions, dark steel, cyan/magenta lights and compact pixel style. Clean transparency and remove EVERY stray cropped fragment from an adjacent cell. In particular the lamp cell must contain ONLY the lamp, with no piece of the bench at its left; all neighboring cells must have clear transparent gutters. Empty space between/around the props and inside the open shutter and railing must be true alpha transparency, not black fill. Remove diffuse shadow/bloom remnants outside the silhouettes. Keep the dark screen of the timetable and solid metal opaque. Keep the bottom of each stand/foot visually grounded, no detached pixels or floating debris. Do not add or replace any prop, no captions, checkerboard or ground plane.
```

## water

```text
Use case: stylized-concept. Production pixel-art WATER TEXTURE ATLAS for a cyberpunk underworld platformer. Style reference is the supplied city image: cyan spectral waterways, black-blue depths, small pale turquoise highlights. Create a precisely regular TWO-COLUMN ONE-ROW atlas of TWO square seamless material textures, no gutters, frames, labels or scenery. LEFT SQUARE: vertically flowing spectral waterfall, fine irregular cyan stream ribbons, darker blue translucent-looking depths, small broken pale foam flecks, pixel-cluster turbulence, bright narrow strands through shaded water. It must repeat vertically top-to-bottom. RIGHT SQUARE: horizontal river surface, intricate irregular horizontal ripples, overlapping cyan reflections, darker teal-blue channels, sparse pale foam, a few hints of magenta city reflections. It must repeat horizontally left-to-right. Both are actual textured water, not solid cyan rectangles, not a gradient, not straight barcode stripes. Match the crisp pixel density of a 48px-tile game, no painterly blur or overly large detail. Opaque material images fill both square cells edge-to-edge, no black external backdrop, no banks, stones, pipes, buildings or text. Landscape 2:1 composition.
```

