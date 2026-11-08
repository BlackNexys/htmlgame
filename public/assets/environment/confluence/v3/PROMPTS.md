# Confluence v3 · exact generation prompts

Built-in imagegen tool. Every generation uses `docs/Worldbuilding/Untitled.png` as the primary environment style reference. The landmark alpha edit uses the first generated landmark sheet as its edit target. Original generated sources are preserved under `sources/`; earlier v1/v2 art remains unchanged.

## architecture

```text
Use case: stylized-concept. Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match its charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, and small amber habitation lights. Technology is ELECTRONIC/cybernetic: power strips, cable trunks, terminals, capacitors and digital indicators. No steampunk, brass scrollwork, gears, piston boilers, brown leather/wood domination, or ornate gold Victorian props. Gothic shapes are allowed as inherited city architecture retrofitted with electronic infrastructure. Crisp compact pixel clusters, consistent detail scale, clear silhouette, no smooth rendering. No captions, letters, labels, grid lines, watermark or baked checkerboard. Create a TRANSPARENT regular 4-column 3-row atlas of twelve separate architectural sprites, equal square cells, 12px transparent gutters, objects contained in their cells. Left-to-right top-to-bottom:
1 station entrance: blue-glass vaulted canopy over dark stone open arch, electronic magenta edge strips, small skull-shaped plaque, cyan access console.
2 inhabited balcony: dark urban windows with amber life inside, cool-blue glass, angular steel balcony, cables, magenta trailing plants.
3 station canopy: shallow long curved blue-glass roof on slender black-steel supports, hanging amber lamps and cyan wiring.
4 retaining pier: narrow blue-black stone/steel column with vertical magenta conduit and cyan electrical junctions, flat top and base.
5 bridge deck: straight horizontal gunmetal walkway girder with perforated steel rail and cyan edge power strip; transparent below.
6 bridge arch: broad open stone arch with thin skeletal steel ribs and magenta utility cable, transparent center.
7 freight cage: static rectangular open steel cargo lift cage with vertical magenta electrical rails, cyan control screen, no clockwork pulley ornament.
8 maintenance stair flight: right-rising three broad metal steps and spare black-steel handrail, flat tops, cyan edge markers, cables below.
9 Registry shelves: dark Gothic recess filled with small old ledgers and cyan-lit archive cartridges, angular terminals embedded in frame, no golden trim.
10 Registry counter: low gunmetal public desk, papers and open ledger, small cyan terminal, magenta cable, amber task lamp.
11 Registry gallery: thin black-metal gallery railing and pointed arch frame, magenta vertical light strips and cyan glass, transparent center.
12 archive machinery: compact electrical transformer/pump bank, heavy dark cable loops, cyan energy chamber, magenta indicators, no giant decorative gear.
Architecture feels like the reference's dense cyberundead city at gameplay scale, not a cathedral illustration. Genuine alpha transparency.
```

## props

```text
Use case: stylized-concept. Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match its charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, and small amber habitation lights. Technology is ELECTRONIC/cybernetic: power strips, cable trunks, terminals, capacitors and digital indicators. No steampunk, brass scrollwork, gears, piston boilers, brown leather/wood domination, or ornate gold Victorian props. Gothic shapes are allowed as inherited city architecture retrofitted with electronic infrastructure. Crisp compact pixel clusters, consistent detail scale, clear silhouette, no smooth rendering. No captions, letters, labels, grid lines, watermark or baked checkerboard. Create a TRANSPARENT regular 4-column 3-row atlas of twelve isolated game props, equal square cells, generous gutters. Left-to-right top-to-bottom:
1 dark steel station bench with small hard-shell electronic suitcase and pink plants.
2 thin black urban lamp post with a small amber rectangular light, cyan cable clips, no ornate brass.
3 stack of steel freight containers, sparse magenta electronic tags, dark blue-gray surfaces.
4 wall-mounted electrical junction with heavy cable bundle, three cyan indicator strips, magenta conduit.
5 automated ticket kiosk beneath a modest Gothic arch, cyan screen and magenta header light, gunmetal.
6 rectangular electronic departures display in dark steel frame, blank dark screen, cyan/magenta tiny indicators, no text.
7 physical open transfer ledger on a narrow dark public pedestal with small cyan side screen, magenta underlight, papers readable as pale pixels.
8 route-index terminal: angular upright cyan screen, dark steel housing, magenta socket, standing base.
9 tiny folded ivory letter with one magenta seal, simple silhouette.
10 closed vertical station shutter: dark segmented steel slab with two magenta powered side rails and tiny cyan access panel, entire frame.
11 matching OPEN shutter: same powered side rails and top cassette, fully transparent opening.
12 long industrial steel railing with thin uprights, cyan cable underneath, absolutely no gold scrollwork.
Genuinely transparent background and isolated complete silhouettes, no UI, no ground shadow planes.
```

## terrain

```text
Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, small amber habitation lights. Technology is ELECTRONIC: cable trunks, terminals, digital indicators, power strips. No steampunk, brass scrollwork, decorative gears, boilers or ornate gold Victorian fixtures. Gothic architecture is retrofitted with cybernetic infrastructure. Crisp compact pixel clusters, no painterly blur. No captions, text, labels, grid lines, watermark or checkerboard. Create a precisely regular 4 columns by 4 rows grid of SIXTEEN square TERRAIN TILES (large clean source cells, cropped to 48px in game). Tiles fill their whole cells, no gaps. NOT separate buildings. These are solid repeating platform collision tiles, flat orthographic front faces. Top edges perfectly straight and level, restrained thin cyan/magenta power strips never hide the stone/steel edge.
Each row is one material family: row 1 dark blue-black station masonry with electronic cable inset; row 2 dark gunmetal/perforated steel rail deck with cool light edge; row 3 cool-gray Registry masonry with black electronic seams and a restrained magenta inset; row 4 deep teal industrial maintenance panels with cyan conduits.
Within EACH row columns 1,2,3 are TOP-LEFT CAP, REPEATING TOP-MIDDLE, TOP-RIGHT CAP. Column 4 is interior FILL with no bright top edge. All solid faces opaque, no windows, no arches or holes, no perspective. Repeatable compact pixel texture, moderately low contrast face, upper cap brighter and readable. No decorative gold, medieval embossed patterns or large skulls.
```

## facades

```text
Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, small amber habitation lights. Technology is ELECTRONIC: cable trunks, terminals, digital indicators, power strips. No steampunk, brass scrollwork, decorative gears, boilers or ornate gold Victorian fixtures. Gothic architecture is retrofitted with cybernetic infrastructure. Crisp compact pixel clusters, no painterly blur. No captions, text, labels, grid lines, watermark or checkerboard. Create a regular 4 columns by 4 rows grid of SIXTEEN square BACKGROUND facade tiles. Fill square cells with opaque building surfaces, no gutters, no labels, no separate free-standing buildings. Quiet modular room backgrounds, not collision tiles.
Row 1: charcoal station walls, slim pointed window recesses with tiny amber rooms, hanging blue-glass canopy details, cyan wiring.
Row 2: freight service walls of riveted gunmetal, electrical cable trunks, magenta and cyan control strips, dark inset grilles.
Row 3: Registry archive interior, cool-gray narrow Gothic ribs, dark shelves and small electronic access panels, magenta vertical light seams.
Row 4: lower industrial maintenance panels, large dark electrical cables, teal-gray pipes and restrained cyan transformer glow.
Four related variants in each row, seams dark and easy to repeat. Flattened orthographic front elevation, much lower contrast than foreground objects. No perspective, steam gauges or gold ornamental scrollwork.
```

## city

```text
Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, small amber habitation lights. Technology is ELECTRONIC: cable trunks, terminals, digital indicators, power strips. No steampunk, brass scrollwork, decorative gears, boilers or ornate gold Victorian fixtures. Gothic architecture is retrofitted with cybernetic infrastructure. Crisp compact pixel clusters, no painterly blur. No captions, text, labels, grid lines, watermark or checkerboard. Create a wide 2:1 landscape BACKGROUND layer only for parallax behind a 2D platform game. No foreground playable platforms, no UI, no characters or close objects.
A vast cavernous cyberundead metropolis: tiers of extremely slender dark Gothic towers, thin black-steel transit bridges and railway terraces; scattered small amber apartment windows; magenta electric spires and sparse digital light bands; cyan spectral rivers winding through the bottom third and waterfalls dropping between deep city layers. Huge translucent cyan rib-like mineral arcs sweep across upper left; hanging cavern formations, magenta/cyan sparse bioluminescent growth, distant spectral blue tree forms upper right. Dense civilization embedded in an immense alien underworld. Deep misty blue-black depths and open visual breathing room. Match the user's reference mood and palette directly. Skyline is lower contrast and lower brightness than foreground gameplay, not a neon poster. Crisp intentional pixel art. Opaque image fills entire canvas.
```

## landmarks

```text
Production pixel art for a strict orthographic SIDE-VIEW 2D platformer. Reference image is the user's authoritative CYBERPUNK WITH UNDEAD railway city. Match charcoal/blue-black masonry, slender iron structure, blue glass, electric cyan spectral energy, magenta lights and hanging pink plants, small amber habitation lights. Technology is ELECTRONIC: cable trunks, terminals, digital indicators, power strips. No steampunk, brass scrollwork, decorative gears, boilers or ornate gold Victorian fixtures. Gothic architecture is retrofitted with cybernetic infrastructure. Crisp compact pixel clusters, no painterly blur. No captions, text, labels, grid lines, watermark or checkerboard. Create a TRANSPARENT regular 3-column 2-row atlas of six separated architectural/natural landmarks. Equal square cells, generous transparent margins. Left-to-right top-to-bottom:
1 tall dark Registry pointed arch window with bright MAGENTA electronic/spirit-glass center and small cyan circuitry, angular steel frame, no gold.
2 skeletal black-steel freight gantry with cyan controls, hanging cable and small suspended dark cargo, magenta warning strip, no brass.
3 dark stone/steel viaduct arch with thin skeletal support ribs, cyan edge cable and dark magenta banner, entirely transparent open center.
4 enormous curved translucent CYAN rib/mineral formation, tapered and segmented, pixelated inner light, on small dark rock foot.
5 slim station clock and electronic departures bracket: modest round pale clock, BLACK steel housing, cyan small indicator screen below, magenta electrical cable, no gold curlicues.
6 inhabited station frontage with blue glass canopy, warm tiny windows, black steel ribs, trailing magenta plants, electronic access panel.
Orthographic front elevation. No labels, grid or ground plane. Genuine alpha transparency.
```

## landmarks_alpha_edit

```text
Edit target: the supplied six-cell landmark atlas. Change ONLY the background/transparency. Remove the entire dark blue/black gradient backdrop and diffuse outer bloom between and behind all six objects. Make all space outside the actual six sprite silhouettes genuinely alpha transparent, including the open middles of the bridge arches and gantry. Preserve all six objects, exact 3-column 2-row layout, dimensions, pixel-art shapes, internal cyan/magenta light, details and colors. Do not add any background, ground, checkerboard or shadow planes. Transparent cutouts with tight colored edge glow only; no large diffuse glow outside their silhouettes. Output a genuinely transparent PNG.
```

