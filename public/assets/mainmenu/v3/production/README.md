# Underworld · production menu artwork

**Current character · 2026-11-09:** All three hero presets follow the user's new canon sheet. The [canon v1 kit](../../../hero/canon-v1/README.md) preserves the source drawings, exact built-in imagegen prompts, provenance and export registration. Previous character versions remain historical sources.

Standing selects the six idle frames directly from [the live gameplay texture](../../../hero/canon-v1/gameplay-v1.png): 256 × 256 padded cells, shared root (128,240), 125 ms holds and 1.35× nearest-neighbour menu scale. Sitting and leaning use the matching complete-character strips in the same kit. Every pose includes the paired magenta eyes, black face, ivory framing, connected pink fire, burgundy scarf/cloak, dark studded jacket, strapped boots and cyan vial. The seated cloak is beneath the hips/thighs. Lower support pixels remain held during the loop. Whole-frame mirroring turns the actor into the scene.

[scene-v1.json](scene-v1.json) records paths, rectangles, holds, scale, mirroring, roots and placements. The production scene retains the approved 1672 × 941 station background, transparent platform, lantern, clock, cat, vines and souls. Complete hero frames share a local light and lantern-directed shadow. The absent-traveller preset omits all hero pixels, light and shadow. The four fallback posters are regenerated through the same renderer.

Automatic motion respects reduced-motion preferences; On overrides them and Off holds the time-zero pose. Hidden tabs and gameplay freeze the cosmetic clock. Missing art or a failed decorative context restores the matching poster while menu actions remain usable.

Open [/menu-production.html](../../../../../menu-production.html) for playback, pose selection, frame stepping and a time scrubber. Its gallery shows the current gameplay idle, seated and leaning frames.

## Reproduce

Run with stable Node and Playwright Chromium:

```sh
node scripts/pack-canon-hero.mjs
node scripts/pack-title-art.mjs
node scripts/render-title-art.mjs
npm run check
```

The canon packer prepares the hero kit. The title packer reads that metadata and packs existing station props. The render script exports all matching posters and closes its temporary server. Inspect native character scale, support contacts, flames and loop boundaries in the game and assembled scene.

## Historical v5 character sources

| Source | Provenance |
| --- | --- |
| [Gameplay atlas](../../../character-animations-v2.png) | Earlier gameplay artwork used for the historical v5 menu |
| [gameplay-idle-reference-v5.png](source/gameplay-idle-reference-v5.png) | Native strip exported from the gameplay idle row for the new-pose references and viewer |
| [gameplay-sitting-v5.png](source/gameplay-sitting-v5.png) | Built-in imagegen; [exact prompt](source/gameplay-sitting-v5.prompt.txt) |
| [gameplay-leaning-v5.png](source/gameplay-leaning-v5.png) | Built-in imagegen; [exact prompt](source/gameplay-leaning-v5.prompt.txt) |

[v5 provenance](source/revision-v5.json) records the reference and generated originals. Those historical pose sources remain unchanged. Export preparation registers their boot contacts, uses nearest-neighbour sampling into 209×209 native cells, and holds seated support/fold pixels and leaning boot pixels from the first drawing. It removes alpha below 32 from the generated exports while retaining their other source colours and transparency. It does not invent poses or warp parts of a still. Exact source bounds, roots, scales and support rectangles are in [source/export-v5.json](source/export-v5.json).

The stationary art and prop sources retain their [original prompts and provenance](source/provenance-v1.json). Previous character attempts and their prompts remain in `source/` and the earlier exported PNGs; they are historical drafts rather than references for new character work. The [approved station studies](../README.md) continue to guide the environment.
