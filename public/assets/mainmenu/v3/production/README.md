# Underworld · production menu artwork

**Current character direction · v5:** Rebuild the menu hero from the sprites actually used in gameplay. The rejected separate-skull, expanded-mane and biker-jacket interpretations are preserved as earlier sources and excluded from the active scene.

Open the [main menu](../../../../../index.html?menuScene=watcher) or [scene viewer](../../../../../menu-production.html). The viewer has pose selection, playback, frame stepping and a time scrubber. Its reference gallery shows the gameplay idle strip beside the new seated and leaning frame sheets.

## The character comes from gameplay

The live game loads [character-animations-v2.png](../../../character-animations-v2.png), with its [crouch/aiming companion](../../../character-aim-v1.png). The base sheet establishes the compact glowing black face, magenta flowing flame, burgundy scarf/cloak, ribs within fitted dark clothing, lean limbs, belt details/cyan vial and buckled boots.

**Standing uses the original gameplay texture directly.** It selects all six frames of row zero with their original 209×209 source rectangles, per-frame foot anchors from `CharacterAtlas.ts`, and 125 ms holds matching the game's 8 fps idle. There is no generated replacement, recolouring, head/body composite or intermediate image conversion in this path. Presentation uses nearest-neighbour scaling at 1.35× within the menu scene.

Seated and leaning are new whole-character frame sequences made with the **built-in imagegen tool**, using only the native gameplay idle strip as their visual reference. Each frame includes the complete face, fire, torso, clothing and cloak. These poses preserve the familiar rounded face and proportions. The seated cloak is drawn under the hips/thighs, with settled folds and a gravity-hung edge. Both sequences have six frames at 125 ms per frame.

No separate hero head/fire or cape clip is loaded. The renderer draws each complete actor frame at its ground contact, with a small local light and a faint lantern-directed shadow. The empty-platform preset draws no hero, hero light or hero shadow. Gameplay artwork and gameplay behavior remain unchanged.

## Active scene assets

The shared canvas is **1672×941**. Stationary background and foreground images retain the approved illustrated station. The transparent presentation canvas draws complete hero frames, other authored clips and local effects.

| Asset | Contents |
| --- | --- |
| [Gameplay atlas](../../../character-animations-v2.png), row zero | Actual standing idle, selected directly by `scene-v1.json` |
| [sitting-v5.png](sitting-v5.png) | Six seated whole-character frames with folded cloak beneath the pelvis/thighs |
| [leaning-v5.png](leaning-v5.png) | Six leaning whole-character frames matching the gameplay reference |
| [background-v1.png](background-v1.png) | Clean station/city backing |
| [foreground-v1.png](foreground-v1.png) | Transparent platform, empty bench, clock dial without hands, blank board, empty lantern hook and fixed details |
| [lamp-v1.png](lamp-v1.png) | Separate housing with hanging pivot and local cyan light |
| [cat-v1.png](cat-v1.png) | Four resting drawings with long holds |
| [vines-v1.png](vines-v1.png), [soul-v1.png](soul-v1.png) | Four-frame foliage and distant spirit clips |
| `poster-*-v1.png` | Four matching complete stills regenerated from the current renderer/assets |

[scene-v1.json](scene-v1.json) records image paths, source rectangles, frame holds, scale, optional per-frame roots, pose placements, ground contacts, light positions and prop pivots. Clock hands, departure lettering and cat sleep marks are separate small drawing passes. Stationary scenery is cached as image layers; presentation paints at most 30 times per second.

Automatic respects reduced motion; On explicitly overrides Windows reduced motion. Off shows the composed time-zero pose and stops updates. Hidden tabs and gameplay freeze the cosmetic clock, with no catch-up on resume. Missing artwork, invalid metadata or unavailable decorative canvas restores the selected preset's matching still poster while menu actions remain usable.

## Current sources and exact prompts

| Source | Provenance |
| --- | --- |
| [Gameplay atlas](../../../character-animations-v2.png) | Existing playable artwork, reused directly for standing |
| [gameplay-idle-reference-v5.png](source/gameplay-idle-reference-v5.png) | Native strip exported from the gameplay idle row for the new-pose references and viewer |
| [gameplay-sitting-v5.png](source/gameplay-sitting-v5.png) | Built-in imagegen; [exact prompt](source/gameplay-sitting-v5.prompt.txt) |
| [gameplay-leaning-v5.png](source/gameplay-leaning-v5.png) | Built-in imagegen; [exact prompt](source/gameplay-leaning-v5.prompt.txt) |

[v5 provenance](source/revision-v5.json) records the reference and generated originals. The new pose sources remain unchanged. Export preparation registers their boot contacts, uses nearest-neighbour sampling into 209×209 native cells, and holds seated support/fold pixels and leaning boot pixels from the first drawing. It removes alpha below 32 from the generated exports while retaining their other source colours and transparency. It does not invent poses or warp parts of a still. Exact source bounds, roots, scales and support rectangles are in [source/export-v1.json](source/export-v1.json).

The stationary art and prop sources retain their [original prompts and provenance](source/provenance-v1.json). Previous character attempts and their prompts remain in `source/` and the earlier exported PNGs; they are historical drafts rather than references for new character work. The [approved station studies](../README.md) continue to guide the environment.

## Reproduce and review

With Node 26 and Playwright Chromium installed, run from the project root:

```sh
node scripts/pack-title-art.mjs
node scripts/render-title-art.mjs
npm run check
```

The packer reads the live gameplay atlas and anchors, packs the generated poses and props, and exports native contact sheets. The render script regenerates all four fallback posters through the same production renderer and closes its own temporary server.

Compare the seated and leaning drawings with the gameplay strip at native scale and in the assembled menu. Review face identity, flame volume, clothing, grounded contacts, seated folds and loop boundaries. Browser tests cover the exact shared gameplay texture, frame timing, support stability, all presets, reduced-motion override, hidden/gameplay suspension, missing-art fallback and common window ratios in Chromium and Firefox. These checks protect implementation; visual approval remains a human judgement.
