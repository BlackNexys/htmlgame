# Confluence · production menu v1

The default main menu now uses the approved [canal-side composition](../confluence-study-v1/menu-concept-v1.png): Cole and the sleeping skeletal cat beneath an electronic blue-glass shelter, dark Confluence masonry, spectral water, wet paving and a distant railway.

Open [the game](../../../../index.html) or [production viewer](../../../../menu-production.html). The viewer uses the same renderer as the game, with play/pause, reset, selected-frame stepping, layer solo/hide, masks and anchors, a 90-second scrubber and a **Next train** control. Play explicitly enables preview motion even when the device requests reduced motion.

## Assets and animation

| Export | Contents |
| --- | --- |
| [plate-v2.png](plate-v2.png) | Clean 1672 × 941 opaque environment, completed bench/paving and dark water bed. The departure sign, its mounts and attached small lamp have been removed. No baked Cole, cat, logo, menu lettering, train, foreground stream or bright moving reflections. |
| [cole-v1.png](cole-v1.png) | Eight complete 512 × 512 padded character frames. Connected fire and loose scarf change; support pixels below native Y=310 remain held. Shared root (200,488), scene contact (1255,780). |
| [cat-v1.png](cat-v1.png) | Eight 256 × 160 padded breathing frames. Lower contact pixels below Y=130 remain held. Root (128,145), scene contact (1520,646). |
| [water-v1.png](water-v1.png) | Eight 256 × 128 current-material frames, drawn only inside the traced canal mask. Neighbouring tiles mirror at their shared edges. |
| [outfall-v1.png](outfall-v1.png) | Eight 160 × 192 padded drawings containing the authored falling ribbon and its surface impact. Shared impact contact; source registration preserves the small falling lean. |
| [reflections-v1.png](reflections-v1.png) | Eight localized reflected-light patches, masked to wet paving and screen-composited. Brightness follows Cole's current frame intensity. |
| [train-v1.png](train-v1.png) | Complete electronic passenger train. Travels along the masked bridge for 16 seconds, beginning at 18 seconds; visit-seeded quiet gaps are 25–45 seconds. |
| [vines-v1.png](vines-v1.png) | The earlier authored magenta foliage strip, reused unchanged at the bench edge. |
| [bench-front-v1.png](bench-front-v1.png) | Physical foreground bench supports cropped from the clean plate. The central seat lip remains behind Cole's draped cloak. |
| [poster-v2.png](poster-v2.png) | Matching sign-free time-zero composition exported through the production renderer, without DOM logo/menu text. |
| [scene-v2.json](scene-v2.json) | Validated images, complete clips, explicit holds, roots, flame emitters/intensities, masks, contacts and ordered drawing passes. |

The production timing was refined from the planning estimates after inspecting the authored source: **Cole uses eight complete frames at 175 ms (1.4 seconds)**, instead of sixteen proposed drawings. The cat uses eight at 350 ms (2.8 seconds), and the combined outfall/impact uses eight at 80 ms (0.64 seconds). The waterfall and its impact share one authored effect so their physical contact stays together. Anatomy, boots, seated cloak and cat paws remain registered. No detached hero head, fire or cloak layer is animated.

Terminal lettering, sleep marks, localized light and restrained mist are separate drawing passes. Fixed fixtures and architecture stay still. The departure board and its text/refresh pass were removed at the user's request. Existing music and menu-control behavior continue through their existing owners.

## Sources and exact prompts

New raster artwork was made with the **built-in imagegen tool**. [source/provenance-v1.json](source/provenance-v1.json) records original output paths, reference roles and reused artwork. Generated originals are copied unchanged into `source/`. The concept and the user's canon sheet remain unchanged.

| Drawing | Original | Exact prompt |
| --- | --- | --- |
| Clean environment edit | [plate](source/plate-v1.png) | [prompt](source/plate-v1.prompt.txt) |
| Complete seated Cole loop | [Cole](source/cole-v1.png) | [prompt](source/cole-v1.prompt.txt) |
| Cat breathing | [cat](source/cat-v1.png) | [prompt](source/cat-v1.prompt.txt) |
| Canal material | [water](source/water-v1.png) | [prompt](source/water-v1.prompt.txt) |
| Outfall and impact | [outfall](source/outfall-v1.png) | [prompt](source/outfall-v1.prompt.txt) |
| Wet-ground light | [reflections](source/reflections-v1.png) | [prompt](source/reflections-v1.prompt.txt) |
| Distant train | [train](source/train-v1.png) | [prompt](source/train-v1.prompt.txt) |
| Sign-removal edit | [edited source](source/sign-removal-v2.png) | [prompt](source/sign-removal-v2.prompt.txt) |

The sign-removal revision was made with built-in imagegen, then composited only over the sign area of the original plate. [Sign-removal export metadata](source/sign-removal-export-v2.json) records the bounded region and edge blend; all pixels outside it remain unchanged. The edit output is one column shorter at the far right, so its patch is copied at native scale onto the original full-size canvas. Earlier plates and posters remain historical files. The renderer uses the new filenames to avoid stale image caches.

Export preparation uses Chromium canvas with nearest-neighbour sampling. It crops source cells, applies a common scale per actor, registers bottom contacts, holds authored lower support pixels, prepares transparency and packs the frames. Main cutouts use binary alpha at 160 to remove generated haze; reflection exports retain their intentional partial alpha above 32. Source RGB remains unchanged by palette mapping or recolouring. The clean environment PNG is copied directly. Exact bounds, roots, scales and support rows are saved in [source/export-v1.json](source/export-v1.json); [review sheets](review/) show the packed actor and effect drawings.

```sh
node scripts/prepare-confluence-sign-removal.mjs
node scripts/pack-confluence-menu.mjs
node scripts/render-confluence-menu.mjs
npm run check
```

Run with stable Node and Playwright Chromium. The render script uses its own temporary Vite server, exports the matching poster and several scene proofs, then closes the server. It never generates new poses or paints missing background art.

## Runtime and fallback

`ConfluenceArt.ts` validates the version-2 manifest and loads optional images independently. `ConfluenceRenderer.ts` draws ordered masked passes and caches consecutive static layers. Native scene size stays 1672 × 941, independently of the game's 960 × 576 view. Presentation paints at most 30 times per second. The current source images plus renderer caches are about **31.7 MiB** decoded, within the 64 MiB starting target.

`TitleScene` owns decorative time, visibility and motion preferences. **Automatic** follows reduced motion; **On** explicitly overrides Windows/device settings; **Off** holds the composed time-zero scene. Hidden tabs and gameplay freeze time, including the train's quiet gaps. Resume has no elapsed-wall-time catch-up. Essential image, metadata or canvas failure displays the matching poster while menu controls remain usable. Missing optional train, reflected-light or foliage artwork omits only that detail.

The menu does not create a World, fetch a level, run physics or modify campaign saves. The actual game retains its own normal startup/load path. The standalone production viewer imports only the menu presentation. Earlier station presets remain explicit historical previews through `?menuScene=watcher`, `patient-traveller`, `restless-flame` and `absent-traveller`; their viewer is `menu-production.html?legacy=1`.
