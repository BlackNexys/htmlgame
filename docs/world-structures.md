# World structures and free geometry

Implemented 9 November 2026. Play `/?level=construction-study` to inspect the construction proof; `/?level=last-platform-rebuild` uses the new system in the demo. The workshop reads legacy maps and exports normalized schema v2 JSON.

## Ownership

World constructions follow the same concrete-class pattern as actors. `Structure` extends the shared `GameElement` for identity and placed bounds. Each construction has its own file under `src/world/structures` and is instantiated through `StructureFactory`.

| Class | Construction contract |
| --- | --- |
| `WallSection` | One filled rectangle, at any authored position and dimensions |
| `Platform` | A deck whose thickness is explicit, independent of texture size |
| `Bridge` | A deck collider within a potentially taller open envelope, plus support sockets |
| `Doorway` | Three visual frame pieces; rear jambs leave a traversable passage, and the overhead lintel is physical |
| `Outfall` | A decorative outlet with inlet/mouth sockets and its own sprite appearance |
| `Railing` | Open bars and posts, usable on a decorative foreground layer |

Classes define local parts and sockets. They do not load images, draw pixels, resolve actor motion or implement narrative rules. Static constructions have no per-frame update. A world gets fresh structure instances when it loads; editing a document or changing mounts produces a newly validated compilation for playtesting.

`ColliderDefinition` and `SurfaceDefinition` are separate typed records. Bounds used for editor selection, visible parts and physical collision may differ deliberately. For example, a bridge can occupy a 317-by-150 construction envelope while supplying only a 317-by-14 physical deck. A doorway's rear frame never becomes an invisible wall just because it is inside the selected object's bounds.

## Collision lifecycle

`CollisionWorld` registers concrete `ColliderHandle` instances with stable IDs and owners. Its active collection is read-only to TypeScript callers. Registration, update and removal are explicit operations. Opening an interactive shutter removes its own handle; no renderer or narrative effect searches and splices anonymous rectangles. Removing a handle twice is harmless, and updates to removed handles are rejected.

`CollisionQueries` exposes contacts, actor sweeps, ordinary actor movement, overlaps and casts. The player controller, ground enemies, NPCs, ghost materialization, projectiles and line-of-sight checks use this common geometry service. Existing movement solvers retain their tested behavior. `Map` is a runtime scene container rather than an implementation of the serialized `Level` interface.

The former `components/Wall.ts` wrapper and compiler expansion into 48-square physics tiles have been removed. The lower-passage map now supplies its eleven authored collision rectangles directly, instead of 254 separate physics tiles.

## Schema v2

`terrain` and `decorations` remain recognizable authoring collections, but now contain typed construction definitions. Terrain contributes physical parts; decorations contribute visual parts only. Supported fields are:

```json
{
  "id": "small-bridge",
  "kind": "bridge",
  "x": 137,
  "y": 622,
  "width": 317,
  "height": 150,
  "thickness": 14,
  "material": 1
}
```

`material` selects the existing station/steel/Registry/archive texture family. Omitting it preserves the legacy material selection. Decorative objects may choose `layer: "rear"` or `"foreground"`; `depth` orders objects within each draw layer. Drawing order is rear surfaces, physical surfaces, actors/effects, then foreground surfaces. Depth never adds collision.

`gridSize` is an editing preference, not geometry. Free placement uses 1 pixel; the workshop also offers 4, 8, 16 and 48-pixel snapping. Structure dimensions and level dimensions are independent of the snap. The current format uses whole-pixel authored coordinates; local socket transforms can resolve to fractional world positions, and simulation remains floating point.

Schema v1 imports retain their original validation rules, then normalize to v2 without rounding or tile expansion. The compiler, CLI, JSON editor, undo/redo, local draft storage and exported files share this normalized format. Unsupported future schemas or construction types are rejected. Actor anchor conventions, story IDs and campaign data are preserved.

## Mounting

A decorative outlet can be attached to a bridge:

```json
{
  "id": "mounted-outlet",
  "kind": "outfall",
  "x": -48,
  "y": 24,
  "width": 96,
  "height": 64,
  "mount": {"parent": "small-bridge", "socket": "supportRight"}
}
```

For a mounted object, X/Y are local offsets from the parent socket. `AttachmentResolver` resolves parents first and rejects unknown parents, sockets, cycles or resolved bounds outside the level. Editing the parent's position or dimensions updates the child in the editor and compiled preview while preserving the stored local offset. Deleting a referenced parent is rejected until its dependent objects are removed or remounted.

The rebuilt demo's freight outfall is now a mounted structure. Its water source follows the resolved structure; the basin is positioned relative to that source. The other Confluence scene passes still include existing district-specific art composition, which can be converted into more authored structure types as needed.

Water has the same concrete-element treatment: [authored water elements](water-elements.md) describes the level-owned bodies, drains, falls, connection validation, shared renderers and workshop authoring.

## Rendering

`SurfaceRenderer` composes default material rendering, the Confluence terrain renderer and outlet sprite drawing. It consumes visual surfaces, never the list of colliders. Materials repeat at native texture scale and clip to arbitrary dimensions. The existing 48-pixel terrain artwork remains an art choice; it does not constrain physical dimensions. Rear material shading preserves alpha, and large surfaces are culled to the viewport before texture repeats are drawn.

`ExposedSurfaces` finds exposed horizontal boundaries from actual rectangles, replacing scenery's previous requirement to reconstruct floors from 48-square physics tiles. This keeps supports and existing water assemblies working with the direct geometry.

## Verification and limits

The construction study contains a 317-by-14 ledge, a deck inside a taller open bridge envelope, a 37-pixel-wide wall, an open doorway, a mounted outlet, a background wall and a foreground railing, in a 2737-by-1301 world. Browser tests traverse the structures and finish with real keyboard inputs. Workshop tests edit odd dimensions and preserve mounts through undo/redo/export. Unit tests exercise fast landings, blocked underside jumps, doorway passage and projectile casts, rejected mounts, handle lifecycle and legacy imports.

Supported physical geometry is currently axis-aligned rectangles and compounds of rectangles. One-way platforms, slopes, polygon collision, rotating structures and moving-platform behavior remain explicit later features from the [research plan](flexible-world-geometry.md). They are not silently approximated or exposed as working authoring options.
