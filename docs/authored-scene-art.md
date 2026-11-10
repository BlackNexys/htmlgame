# Authored scene art

Implemented 9 November 2026 from the [authoring improvement plan](level-authoring-improvement-plan.md). Props, story artwork and environment selection are now part of the shared level document. Loading, editing and rendering use the same catalog keys and placement contract.

## Props and presentation

`props` is a schema-v2 collection, normalizing to an empty array when omitted. A `SceneryProp` is a placed cosmetic element with no collision, interaction, rewards or per-frame simulation. It shares structure sockets without becoming a structure or water source.

```json
{
  "id": "waiting-bench",
  "asset": "confluence-bench",
  "x": 320,
  "y": -104,
  "width": 176,
  "height": 104,
  "mount": {"parent": "arrivals", "socket": "topLeft"},
  "layer": "rear"
}
```

Unmounted X/Y are world coordinates at the visual rectangle's top-left. Mounted X/Y are local offsets from a structure socket. The rectangle is a display envelope: ordinary artwork preserves aspect ratio, sits at its bottom and is centered horizontally. Catalog entries identify tight frame bounds, asset packs and default sizing. Supported structural wall/beam materials repeat their texture; shutter/trim entries have explicit stretch behavior.

Optional placement fields are `depth`, `light` and `opacity` (integer percentages from 1 to 100), `flip` and `stretch`. Layer is `rear` or `foreground`; depth orders placements within that layer. Rear props draw before water, terrain and actors; foreground props draw after actors. Tinting darkens image pixels while preserving their original transparency. Missing images use a visible placeholder without blocking play.

The catalog includes furniture, canopy, inset windows, architectural modules, landmarks, wall families, trims and support beams. Unknown asset keys fail validation. Arbitrary image URLs are not part of the document contract.

An optional presentation selects a complete environment independently of level identity:

```json
"presentation": {"environment": "confluence", "scenery": "assemblies"}
```

`assemblies` derives supporting masonry/piers from the owning structure and its explicit material. `authored` uses the level's explicit scene placements. `construction` also suppresses automatic assemblies and remains the construction-study preset. Without presentation metadata the simple game backdrop remains, while referenced props load only the packs they need. Water can still load its minimal water/drainage kit independently.

Both Confluence levels have been migrated. The rebuilt preview's furniture is mounted to its floors; the older district has 774 explicit prop records, including its architecture and building shells. Its scene can be renamed without loader changes. Former placement/rendering classes have been removed. Historical source tables remain available for reference and bounded v1 conversion, rather than driving normal scene rendering.

## Workshop

Choose **Prop**, select a catalog asset and click to place it. The placement preview follows the pointer drag. Select the prop to edit its display size, parent/socket, local offsets, layer, depth, tint, opacity and sizing override. Moving or resizing a parent updates resolved placements; it does not overwrite the stored offsets.

The level properties include environment selection. Simple fixtures need not become city scenes to use a bench or canopy. The editor loads art through the same catalog/loader and uses the same prop renderer without constructing `Game` or `World`.

Props participate in global ID validation, atomic patches, CLI summaries, selection, undo/redo, JSON editing, local drafts, import/export and snapshot playtests. A referenced parent's deletion, an invalid socket, unknown art or off-level resolved placement rejects the complete edit.

## Story artwork

An interactable can mount to a structure and carry separate visual bounds:

```json
{
  "mount": {"parent": "registry", "socket": "topLeft"},
  "visual": {
    "asset": "confluence-ledger",
    "x": -9,
    "y": -26,
    "width": 66,
    "height": 92
  }
}
```

This is a fragment of the normal interactable record. Its existing X/Y, width, height and reach still define physical interaction, and its existing `solid` flag controls its own blocker. With a mount, interaction X/Y are local to that structure's socket. Visual X/Y are local to the resolved interaction rectangle. The renderer applies no object-ID-based placement offsets.

`visual.openAsset` optionally selects the operated appearance, used by shutters. The renderer reads state; catalog entries do not grant discoveries or open gates. Collected art disappears under the existing collection rules.

The workshop labels interaction bounds in cyan and art bounds in pink. Either rectangle can be selected; the inspector edits them separately. A visual-only edit preserves reach and solidity. Moving the common parent carries both rectangles. Stable narrative IDs, effects and save behavior are unchanged.

## Railings

`Railing` retains its independent construction contract. It now supplies one visual envelope with a railing appearance, rendered as repeated kit bays and end posts, with a transparent metal-bar fallback. Narrow bar parts no longer sample platform textures. Decorative railings remain nonblocking; explicitly solid railings retain their authored collider parts. A simple complete railing sprite is also available as a prop.

## Read-only observations and route tooling

Open a game URL with `observe=1` to opt into `window.gameObservation()`. Ordinary sessions do not expose it. The function returns detached JSON-compatible observations: loaded ID/revision, mode, simulation time/state, player/enemy geometry and movement, camera, actual collision parts, interaction state/visual bounds and the exit. It exposes no gameplay commands or live entities.

Static prop placements are included only with `window.gameObservation({includeProps:true})`, so route pilots do not repeatedly serialize a large district's entire furniture list. Mutating any returned object cannot affect the game.

The rebuilt, comparison and construction browser routes use a shared keyboard driver and these observations. F2 drawing and debug text are no longer a test protocol. Rebuilt footholds use structure-local positions; evidence stops follow mounted object IDs. Overview crops use structure, water or object IDs for all three maps. Missing anchors produce explicit errors.

## Compatibility and verification

The parser, compiler, published schema, editor and CLI share the extended v2 contract. Older readers that reject new fields must be updated. V1 files still import; a bounded conversion preserves the historical comparison district's presentation/materials and emits explicit v2 records. New documents use a documented material default of station material 0, rather than positional inference.

Run `npm run check`, `npm run level:audit` and `npm run test:browser`. Focused tests cover invalid/foreign mounts, parent resizing, detached observations, visual-only edits, railing fallback openings and legacy conversion. Browser acceptance tests build mounted bench/lamp/canopy placements through the workshop, move their floor, undo/redo, export/reload, play a newly named file and verify actual resolved bounds and minimal asset requests. Renamed Confluence scenes retain their full environment.

The remaining measured workflow issue is grouping/reusing large assemblies: migrating the older district produces a long prop list. See F07 in the [friction log](level-authoring-friction.md). This is separate from the six implemented fixes; no automatic prefab expansion is implied by the current prop contract.
