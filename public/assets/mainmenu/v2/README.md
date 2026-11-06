# Main menu v2 · first production corner

**Status:** First art and animation pass, ready for visual review. The wider station and the remaining pose presets are not produced yet.

Open [the running pilot](../../../../menu-pilot.html). The standalone app assembles new assets at 640×360, with native/2× views, playback and frame stepping, light/shadow controls, and attachment markers. The existing game menu remains the interim scene until the replacement is ready.

## Art direction

The existing station/hero paintings were used as concept references for a newly generated [style study](source/style-study-v1.png). The actual pilot uses separate new body, flame, cloth, lantern, hanger and platform exports. It does not cut moving parts out of the old paintings or deform the new sprite drawings at runtime.

The native exports share [one 32-colour palette](palette-v1.json). Bone/brass have warmer highlights, masonry uses violet-grey clusters, cloth is burgundy, and cyan/magenta emission stays focused. Source generations have been retained unchanged; the generated swatch row is a visual study, not the exact export palette. Inspect the real palette and assembled native-size scene before calling this style final.

## Exports

| File | Native cells | Contents |
| --- | --- | --- |
| [body-v1.png](body-v1.png) | 128×160 × 6 | Authored upper-body idle drawings with held planted legs |
| [flame-v1.png](flame-v1.png) | 64×48 × 8 | Soul-flame drawings with a registered pale root |
| [cape-v1.png](cape-v1.png) | 64×48 × 8 | Cloth drawings with a registered attachment |
| [lamp-v1.png](lamp-v1.png) | 32×56 | Detached lantern housing and hanging link |
| [post-v1.png](post-v1.png) | 112×192 | Station post, mounting foot and empty hook |
| [platform-v1.png](platform-v1.png) | 320×128 | Separate violet stone corner |
| [lamp-emission-v1.png](lamp-emission-v1.png) | 32×56 | Cyan glass mask; separate from the housing |
| [pilot-poster-v1.png](pilot-poster-v1.png) | 640×360 | Still assembled from the same assets |

[pilot-v1.json](pilot-v1.json) records exact frame rectangles/durations, dimensions, anchors, placement, palette, source bounds, and export preparation. The hero body is 72 logical pixels high; flame tips bring the complete silhouette to approximately 100 px. Body, flame and cape have different loop durations. The lamp turns gently around its link; its post stays stationary. Contact/cast shadows follow the local light direction. There is no game simulation in the preview.

Generated idle drawings had small stance differences. Export preparation explicitly reuses frame 1's lower-body component below y=113 for all six poses, while preserving the new authored upper-body drawings. The rendered sprite keeps the same boots instead of moving the actor to conceal drift. Flame roots are registered from their pale core; cape roots use their drawn attachment. This is component assembly and fixed frame alignment, not geometric animation of a still image.

## Source images and exact prompts

All creative raster assets were made with the **built-in imagegen tool**, using the new study as their common style reference. The original concept files are preserved in the parent menu asset folders.

| Generation | Unchanged source | Exact prompt |
| --- | --- | --- |
| Style/material study | [style-study-v1.png](source/style-study-v1.png) | [prompt](source/style-study-v1.prompt.txt) |
| Body idle | [hero-body-v1.png](source/hero-body-v1.png) | [prompt](source/body-v1.prompt.txt) |
| Platform | [platform-v1.png](source/platform-v1.png) | [prompt](source/platform-v1.prompt.txt) |
| Lantern kit | [lantern-kit-v1.png](source/lantern-kit-v1.png) | [prompt](source/lantern-v1.prompt.txt) |
| Soul-flame loop | [hero-flame-v1.png](source/hero-flame-v1.png) | [prompt](source/flame-v1.prompt.txt) |
| Cape loop | [hero-cape-v1.png](source/hero-cape-v1.png) | [prompt](source/cape-v1.prompt.txt) |

## Reproduce the native exports

From the project root, with the project's stable Node version and Playwright Chromium available:

```sh
node scripts/pack-menu-pilot.mjs
node scripts/render-menu-pilot.mjs
npm run build
```

The packer measures the chosen source frames, aligns components, rasterizes with nearest-neighbour sampling and maps opaque pixels to the shared palette. Alpha below 200 is removed so translucent generation haze does not turn into a background matte; sprite exports use clean binary alpha. The separate light mask intentionally retains graded alpha. Fixed kit attachment measurements belong to these source versions and must be remeasured when replacing them.

The render script owns a temporary Vite server and closes it afterwards; it does not interrupt the user's dev server. It exports the still poster plus native-size [body](review/body-contact-v1.png), [flame](review/flame-contact-v1.png) and [cape](review/cape-contact-v1.png) contact sheets. These contact sheets add review guides without changing the sprite textures.

## What still needs review

Judge the silhouette, relative prop scale, flame/cloth attachment, loop boundaries and lighting at 1× and in the enlarged assembled scene. Pixel export checks and stable anchors do not replace that judgement. The generated source is not treated as automatically finished pixel art merely because it has been reduced and palette-mapped.

After this corner establishes the shared style, the next work is the surrounding station, cat/clock/vegetation, and seated/leaning/empty presets. The new menu has not replaced the game's current title screen.
