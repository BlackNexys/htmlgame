# Confluence environment · generation prompts

Generated with the built-in image_gen tool. The user’s railway-city painting supplied atmosphere/material reference; the live gameplay hero atlas supplied pixel-cluster reference. Neither reference was replaced. The first tile request produced larger architectural motifs, retained as facade panels; the refined terrain request supplies collision tiles.

## Architectural panels (first generated pass)

```text
Use case: stylized-concept
Asset type: production 2D side-view pixel-art TERRAIN TILE ATLAS for the browser action-platformer Underworld, first world The Confluence.
Input images: image 1 is a PALETTE / MATERIAL / WORLD reference only (the railway-city painting); image 2 is the live CHARACTER PIXEL-DENSITY reference only. Do not draw either composition or any character.
Create a new clean square 1024x1024 opaque sprite atlas, STRICT 4 columns by 4 rows of equal 256x256 cells. No gutters, no labels, no margin, no decorative frame. All sixteen cells completely filled to their edges with usable rectangular tile art. Pure orthographic side elevation: straight horizontal walkable tops, no isometric or perspective ground.
Row 1: worn charcoal railway-station masonry. Cells left to right: exposed top-left corner, exposed horizontal top middle, exposed top-right corner, repeatable interior masonry fill.
Row 2: aged dark iron viaduct/freight structure with rivets and restrained bronze fastening. Same top-left / top-middle / top-right / interior fill order.
Row 3: Registry stonework, pale desaturated bone-gray limestone set into ink-blue dark masonry, old municipal architecture. Same order.
Row 4: archive-underworks black-green industrial masonry, inset quiet conduit and oxidized metal. Same order.
Top edges must be crisp and flat at the top of each cell, with a narrow readable worn cap. The body extends all the way down and fills the cell. Side corner variants have subtle exposed left/right edge shading, not empty cutouts. Interior cells are quiet seamlessly repeating textures, no bright cap. Match adjacent top cells' edges horizontally.
Style: hand-placed chunky PIXEL CLUSTERS, deliberate sharp stair-stepped pixels, compact shaded ramps, late-90s richly drawn action platformer sprites adapted to the supplied hero; not smooth vector art, not a photograph, not blurry painting. At final 48x48 gameplay size these tiles must read as solid geometry. Keep mortar dark, contrast restrained, small wear only; avoid bright outlines on every brick. Surface planes approximately charcoal #1a232b, slate #27343e, graphite #39454a, muted stone #68777c. Little desaturated bronze. NO neon strips, emissive tiles, skull symbols, spikes, text, characters, water, grass, props, cast shadows outside cells, outlines around the atlas, or checkerboard. The city's warm/cyan lights belong to separate scenery, not every solid tile.
```

## Collision terrain tiles

```text
Use case: stylized-concept. Production raster pixel-art assets for a side-view browser action-platformer, Underworld / The Confluence. References: first image is world palette and architectural atmosphere ONLY; second is live hero's chunky pixel-cluster density ONLY. Keep quiet environmental contrast under the hero's bright magenta identity. Late-90s richly shaded hand-placed pixel sprites, crisp angular clusters, compact ramps, no blur, no smooth vector drawing, no isometric projection, no text or watermarks.
Create a square 1024x1024 OPAQUE MATERIAL TEXTURE atlas. Exactly 4x4 equal square cells, no gaps, gutters, labels or outer border. Every cell is a CLOSE-UP OF A FLAT SOLID MATERIAL PATCH. NOT a building, archway, room, facade, window, column or panel.
Think individual 48x48 gameplay tiles enlarged with nearest-neighbor pixels, with just 2 or 3 courses of chunky stone or simple metal plates per cell.
Four rows of material families: row1 charcoal station stone blocks; row2 dark rail-steel plates and small aged bronze rivets; row3 desaturated gray limestone blocks set in ink-dark mortar; row4 black-green masonry with a sparse horizontal oxidized conduit.
Within EVERY row: cell1 top-left platform surface, cell2 repeatable top surface, cell3 top-right platform surface, cell4 completely filled repeatable interior material (NO top cap). For cells1-3 the perfectly flat horizontal worn walkable edge is at y=0 of the cell. The rest of the square is entirely solid material down to bottom; cells1 and3 have subtle side-edge shading but zero empty padding. All cells share matching texture scale, so adjacent tiles connect.
Draw ONLY material texture: quiet chunky bricks or broad plate shapes, a few chips, 4 to 6 shade levels per material. Mortar remains dark. No arches, architectural molding, columns, recesses, frames, screws larger than a tiny dot, letters, decorative icons, emissive lines, lights, outlines around every brick, horizon, perspective, transparency, black empty gaps, characters, buildings or scenery. The brightest cap is muted #68777c, bulk charcoal #27343e. Avoid a repeated vignette inside cells.
```

## Transparent props and interaction sprites

```text
Use case: stylized-concept. Production raster pixel-art assets for a side-view browser action-platformer, Underworld / The Confluence. References: first image is world palette and architectural atmosphere ONLY; second is live hero's chunky pixel-cluster density ONLY. Keep quiet environmental contrast under the hero's bright magenta identity. Late-90s richly shaded hand-placed pixel sprites, crisp angular clusters, compact ramps, no blur, no smooth vector drawing, no isometric projection, no text or watermarks.
Create ONE transparent production sprite sheet, requested canvas 1536x1152, strict 4 columns x 3 rows of equal square cells. Twelve fully separated upright side-view scenery sprites. Each sprite centered horizontally, bottom anchored 24px above its cell's bottom, with at least 24px transparent padding on every side. NO sprite may cross a cell boundary. Background must be actual transparent alpha, not a painted checkerboard. Flat side elevation, visible fronts, no isometric top-down floor. No shadows outside the sprite silhouette. Draw each as a separate game object, not a scene.
Row1, left to right: 1) worn dark railway bench with one old suitcase resting beside it; 2) elegant slender black-iron station lamp with small warm amber glass light; 3) stack of two rectangular worn freight crates with bronze straps; 4) wall-mounted junction box and short bundled cables.
Row2: 5) small gothic ticket booth/window with warm interior, no person; 6) old brass timetable board on short posts, blank dark face, no writing; 7) a municipal ledger lectern with open ivory pages and a tiny cyan reading light; 8) a narrow dark route-index terminal with a cyan display, no writing.
Row3: 9) one small carefully folded ivory letter; 10) a VERY NARROW tall closed vertical railway shutter/grille, width about 42px and height about 320px inside the 384px cell, nearly 1:8 silhouette, straight upright, restrained cyan lock light and bronze hinges; 11) the MATCHING raised/open shutter, same anchor, its grille rolled at the top, transparent empty passage below, matching narrow side tracks; 12) a straight horizontal dark iron station railing segment with a little aged bronze ornament.
These are physical municipal objects used by the dead: chipped graphite iron, worn stone, tarnished bronze, warm amber habitation, tiny restrained cyan technology; not a neon nightclub, not skull-covered horror props. Keep the light pools tight and pixel-shaped. Magenta only in an occasional tiny fabric accent. Strong clean silhouettes, readable when reduced to game scale.
```

## Distant city, rivers and alien formations

```text
Use case: stylized-concept
Asset type: production distant PARALLAX BACKGROUND for a side-view action platformer, Underworld first world, The Confluence / The Last Platform.
Input images: image 1 is the first-world worldbuilding PALETTE/ATMOSPHERE reference only; image 2 is the game's live hero atlas, a PIXEL-CLUSTER STYLE reference only. Do NOT draw the hero or copy the source composition.
Create a new wide landscape PNG, requested 2048x1536, opaque. A distant layered cyber-gothic railway city built by the dead across an enormous alien cavern. Black stone station towers, inhabited terraces and tiny warm amber windows, several monumental far viaducts, faint charcoal hanging structures in the upper distance. Cyan spectral rivers wind and fall through the lower third. Huge translucent rib-LIKE arcs rise behind the inhabited city as ambiguous alien geology, not literal skeletons or skulls. Familiar human-scale civic architecture against incomprehensible natural scale. No villains, no combat, no characters, no readable signs, no logos.
This is a BACKGROUND LAYER, not a finished gameplay scene: no foreground ground, floor, walkway, platform, rails at the bottom edge, UI or hero. Keep the middle and upper half spacious and low-contrast enough for readable gameplay in front. City silhouettes and river extend naturally off both left and right edges; make those edges horizontally repeatable without a framed composition, dark vignette or cutoff tower. No giant focal doorway or central hero monument.
Handcrafted rich PIXEL ART with clearly visible deliberate stepped clusters and a restrained desaturated palette, matching the supplied hero when seen behind them at gameplay scale. NOT photorealistic, NOT smooth digital painting, NOT a vector illustration. Charcoal #0b1620, blue-green #163139, muted slate #34464d; warm amber tiny habitation lights, desaturated turquoise spectral rivers with only a few bright cyan highlights. Keep large areas dark; no broad white glow or bloom. Very little magenta in scenery, reserved for the hero. Distant river light should never resemble an enemy projectile. Painted architectural depth is welcome, but no near-camera isometric floor. Crisp native pixel contours, compact color ramps. The result must function behind an entire scrolling 2D level, not just a title screen.
```

## Location-defining landmarks

```text
Use case: stylized-concept
Asset type: transparent modular environment LANDMARK SPRITE ATLAS for Underworld, a side-view cyberundead action-platformer, first world The Confluence.
Reference image 1 is WORLD ATMOSPHERE/MATERIAL only: ancient railway civilization against cyan rivers and alien geology. Reference image 2 is PIXEL ART STYLE / production prop palette only. Create new scenery matching this asset kit, no characters.
Requested canvas 1536x1024, STRICT 3 columns x 2 rows, six equally sized SQUARE cells of 512x512. Every item entirely inside its own cell with at least 24px transparent padding. Actual transparent alpha background, no checkerboard, no flat colored fill, no vignettes or scene backdrop, no captions, no labels. Crisp hand-placed pixel clusters, dark outlines, shaded dark stone and tarnished bronze, small amber/cyan light accents. No smooth painting or vector shapes. Strict FRONT / SIDE ELEVATION appropriate for a 2D side-scroller, no isometric floor, no near-camera perspective.
Row1:
Cell1: a grand Registry ROSE WINDOW in an elaborate square municipal gothic stone frame, circular amber and subdued cyan stained glass, bone-gray stone and dark slate tracery; luminous but not white or neon. No religious logo or readable lettering.
Cell2: a FREIGHT GANTRY BAY: dark iron uprights and horizontal overhead beam, bronze fittings, pulley and bundled cables. Open middle fully transparent. No floor or collision platform, decorative background machinery.
Cell3: one monumental weathered STONE VIADUCT ARCH BAY with two tall piers and a narrow iron railing above; empty arch interior transparent. Graphite stone, muted moss, worn bronze details, not a complete landscape.
Row2:
Cell4: a huge curved translucent blue-green ALIEN GEOLOGICAL ARC fragment, a branching rib-LIKE mineral formation with irregular facets. Ambiguous ancient landscape, NOT an actual skeleton/bone, no skulls, no creature anatomy, no threatening face. Quiet desaturated cyan, mostly translucent. Isolated silhouette.
Cell5: a round STATION CLOCK hanging from an ornate wrought-iron wall bracket, old ivory face with subtle tick marks and hands, tarnished bronze rim, dark supports; no numerals or words.
Cell6: a small cluster of LIVED-IN TENEMENT WINDOWS and their dark stone surrounds, warm amber interiors, modest awnings and a little burgundy creeping vine. No person. Ordinary habitation in the afterlife.
Keep materials and pixel density cohesive with the supplied prop atlas. The hero's magenta flame must remain visually stronger than scenery. No magenta glowing details, no giant bloom, no text, no extra props between cells, no ground shadows, no border around the sheet.
```


