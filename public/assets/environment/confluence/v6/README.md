# Architecture and compositing sweep

This pass replaces the angled, open-ended canopy with a complete front elevation and replaces full facade panels with window/service inserts. Existing v3 architecture remains the source for the other eleven modules. Originals and exact built-in image-generation prompts are preserved in [PROMPTS.md](PROMPTS.md) and `sources/`.

- `canopy-v6.png`: complete 480 x 198 front-facing canopy, including four column feet and two finished end caps. Draw with its original aspect ratio and feet on the platform.
- `insets-v6.png`: sixteen inserts in 192px cells. Station windows, service panels, Registry windows, archive equipment. They contribute no independent roof or balcony.
- `architecture-v6.png` / `architecture-v6.json`: twelve modules with tight frame bounds. The separate canopy export supplies its larger runtime image.
- `landmarks-v6.json`: tight frames for the existing v3 landmark sheet. The clock uses its connected silhouette's bounding rectangle, excluding a detached fragment from the neighboring frontage.
- `sprites/`: individual architecture exports.
- Rebuild with `node scripts/pack-confluence-sweep.mjs`. This crops and packs generated artwork; it does not paint new art or erase pixels within the selected rectangles.

The arrival clock's mounting rail meets the masonry corner at x=744. The departure clock mounts on its building's left corner. Near landmarks, architecture, piers, trims and props draw at full opacity; lighting darkens source RGB while preserving alpha. Only distant spectral ribs and water use intentional translucent compositing. Distant ribs render behind building shells.

Each bay has one primary facade treatment. Arrival windows fit between the roof-stair piers; full balconies are reserved for the tenants' terrace. The Registry gallery uses three larger arcade modules and a separate signal-glass landmark. The archive leaves room around its shelf, machine and route-index terminal.

Review at gameplay scale and on white in the [asset gallery](../../../../docs/confluence-environment.html) and [material checker](../../../../docs/confluence-material-check.html). `node scripts/capture-confluence-overview.mjs` refreshes the public whole-level view plus eleven district crops under `artifacts/confluence-details/`.
