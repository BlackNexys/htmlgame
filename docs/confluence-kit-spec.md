# Confluence environment kit: construction specification

**Status:** Proposed production kit, 8 November 2026.  
**Purpose:** Support the [fresh level blueprint](level-design-research.md) with reusable pieces that join predictably. Counts below are working scope estimates, not a generation order for every asset at once.

## Visual and spatial contract

Use [Untitled.png](Worldbuilding/Untitled.png) and the live hero as visual authorities. Cold masonry, dark electronic infrastructure, blue glass, cyan rivers, magenta vegetation/signals and small warm inhabited spaces remain the palette. Nearby architectural fronts use a straight-on elevation. Depth belongs in recesses and background layers; diagonal receding fronts should not define playable edges.

Keep the 48px collision grid. Use 96px material repeats and 48/96/192px construction increments where appropriate. Establish one source pixel density with the hero visible in the proof room; these dimensions alone do not guarantee consistent pixel scale.

A component declares its role, footprint, layer, origin, attachment sockets, repeat direction, end condition, allowed mirroring and allowed scaling. Decorative supports and collision geometry remain separate. A repeatable span should tile; a window or clock should retain its proportions.

## Required families

| Family | Pieces required | Priority and current position |
| --- | --- | --- |
| Solid station masonry | Interior fill; top, bottom and side boundaries; convex and concave corners; isolated block; narrow column and single-row platform ends; alternate plain fills | **P0.** Current v4 is a useful surface reference, but its four-column selection is incomplete for general shapes. |
| Solid steel deck | Same tested boundary cases as masonry; a consistent walkable lip and darker underside | **P0.** Reuse the existing palette. Make one dependable deck family before adding several industrial skins. |
| Background wall fields | Plain, cracked and repaired station material; residential, Registry and archive treatments; explicit wall termination pieces | **P0 station, P1 regional.** Reuse v5 where repeats and corner transitions pass review. |
| Building shell trims | Outside corners, inside returns, foundation foot, roof cap, floor band; left/middle/right versions of each horizontal strip | **P0.** Existing trim art is a starting point; define shared endpoints and course heights. |
| Structural supports | Column head, repeatable shaft and foot; beam ends and middle; brackets; pier-to-deck joint; wall-to-bridge abutment | **P0.** Replace arbitrary stretched supports with bounded assemblies. |
| Station shelter | Roof left end, repeatable middle and right end; separate columns and feet; lamp hanger; wall-mounted version | **P0.** The v6 front canopy is the style/proportion reference. A complete fixed-width sprite is useful, but is not a modular shelter kit by itself. |
| Bridges and railings | Deck end/middle pieces, support joints, railing ends/posts, safe gap termination | **P0.** Rear railings must look different from walkable caps. |
| Insets and openings | Plain/warm station windows, service grille, archive panel, Registry window, door frame, reveal and sill | **P0 a small subset, P1 regional variants.** Reuse v6 inserts; ensure they fit a declared bay without covering a structural pier. |
| Mountable fixtures | Clock with root socket, lamp, signboard, conduit box, vent, hanging sign and chains | **P0 only what the proof room uses.** Reuse props; store mounting points rather than inferring them from image bounds. |
| Conduits | Straight horizontal/vertical runs, corners, T-junction, endpoint, wall connector | **P1.** Quiet enough to avoid resembling platforms or projectiles. |
| Interaction assemblies | Attendant pocket, ledger desk, route-index terminal, shutter frame/open/closed states, letter display location | **P0.** Preserve current interaction semantics and IDs when the playable stage is replaced. |
| Water scenery | Fall source, repeating column, termination/foam; river surface repeat, edge and basin transition | **P1.** Existing textures are reusable; joins and mounting are the missing work. Water remains cosmetic. |
| District landmarks | Station portal, Registry signal glass, freight gantry, departure portal | **P1.** Reuse current sprites where appropriate; each needs a deliberate place and support. |
| Distant world | Far skyline, middle city silhouettes, spectral formations; restrained parallax separation | **P1/P2.** Establish composition after the route works. Keep high-detail motion away from combat silhouettes. |
| Dressing | Sparse vines, cracks, cables, luggage, benches, worn signs, domestic details | **P2.** Add to communicate use and habitation after readability is established. |

P0 means needed to prove the first playable chunk. P1 completes the district vocabulary. P2 adds variety after the functional kit is reliable.

## Terrain coverage, not just a tile count

The useful deliverable is a kit that survives all intended map shapes. [Tiled's terrain documentation](https://doc.mapeditor.org/en/stable/manual/terrain/) distinguishes corner, edge and mixed sets; its examples include 16-tile two-terrain corner/edge sets and a reduced 47-tile blob set. Those are different connection schemes, not interchangeable promises.

For our blockout, list the required boundary cases first. Select a simple explicit lookup or a complete adjacency scheme, then make every intended case representable. If an eight-neighbor blob approach is chosen, budget its 47 output configurations per terrain family; that need not mean 47 unrelated paintings. No renderer or editor migration is implied by this specification.

Do not count cosmetic fill variants as new topology coverage. A second cracked tile cannot replace a missing inner corner.

The proof map must contain: a rectangle, L and U shapes, an enclosed opening, a ceiling, a freestanding column, an isolated block, a single-cell-thick platform, two different widths of bridge, a stepped ledge and a wall-to-deck junction.

## Scale and attachment examples

Starting proportions to test with the 52px hero:

| Component | Starting footprint | Attachment rule |
| --- | --- | --- |
| Small window insert | 96 x 144px | Inset origin and sill remain inside one wall bay |
| Ordinary door opening | 96 x 192px | Threshold coincides with its intended floor |
| Monumental entrance | 192 x 288px or a deliberate larger landmark | Use sparingly; do not enlarge every doorway |
| Repeatable bay | 192px wide, height chosen for the tested room | Neighboring bays share floor, roof and trim sockets |
| Rear support | 24 or 48px visual width | Head meets a beam; foot meets a visible bearing surface |
| Clock or sign | Native aspect ratio within a declared box | Root attaches to a wall, column or ceiling socket |
| Shelter span | Repeated 96/192px sections | Finished outer ends; columns align with support sockets |

These are proposed art dimensions, not new colliders. A decorative staircase or diagonal brace must not imply a traversable ramp if the underlying geometry does not provide one.

Example assembly: a station bay owns its wall area, a window socket, beam endpoints, a floor line and optional clock socket. A shelter attaches to that bay's beam/floor sockets. Windows stay within the usable opening. The clock travels with the bay when it moves. Avoid separate hand-maintained coordinates for each part of that assembly.

Keep this concern separate from physics: level terrain owns collision; a scenery assembly supplies artwork and attachment relationships. Future assembly data should live with level authoring or a per-level art manifest, not in a growing collection of unrelated renderer constants.

## Layer and readability rules

1. Far city and spectral silhouettes establish scale.
2. Rear walls and infrastructure establish the building.
3. Insets, attached fixtures and furniture establish use.
4. Playable surfaces, interaction targets, actors and attacks carry immediate information.
5. Foreground framing is sparse and cannot obscure takeoff edges, landing zones or attack tells.

In the current renderer, some relative draw order is more specific than this list; it is a design hierarchy, not an instruction to draw all objects in one new pass.

Keep one clear visual treatment per bay. A full balcony already contains a wall/window assembly and should not be laid over a competing window frontage. Distinguish opaque glass from an actual open arch. Preserve alpha when shading solid surfaces. All exposed outer ends must look finished, and cropped sprites must exclude neighboring artwork.

Use strong walkable lips consistently. Background cornices, cables and shelving need quieter edges so they do not advertise false footholds. Keep the hero, shots and enemy tells readable through value, silhouette and motion; magenta and cyan can still belong to the environment.

## Asset production order

1. Assemble the greybox's required shape list and record missing roles.
2. Make a plain masonry/deck proof kit at the chosen pixel density.
3. Test repeated fields and every required junction at native gameplay scale.
4. Dress one station room and one bridge connection with the same kit.
5. Build modular shelter and mounted-fixture proofs.
6. Add regional wall skins and a small number of distinct landmarks.
7. Add dressing and optional animation only where they improve the scene.

Use image generation for style exploration, material studies and bounded individual components. A generated atlas is source art until its cells, alpha, dimensions and joints have been checked and packed. Judge the assembled result against the live hero. Requesting a more elaborate full building is not a substitute for a missing beam endpoint.

## Acceptance before expanding the kit

- Every required topology case and chosen material transition assembles cleanly.
- End caps are complete; no adjacent sprite fragment enters a frame.
- A clock, bracket, beam or drain has a visible attachment.
- Texture phase and brick courses agree across neighboring bays.
- Tiling is inspected in both axes; mirrored pieces preserve intended lighting.
- White, dark and checker backgrounds reveal the intended transparency.
- Solid materials occlude the layers behind them after tinting.
- All useful geometry remains readable at normal camera scale and in grayscale.
- A test player can distinguish playable surfaces from background architecture.
- The greybox route still plays correctly after art is applied.

The first delivery should be a **small proof kit that builds several convincing spaces**, followed by regional expansion. Existing v3-v6 assets remain useful source/reference material; this is not a proposal to discard everything and commission a giant atlas in one pass.
