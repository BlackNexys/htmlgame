# Cole · consistent gameplay proportions

The [v4 throwing pass](../canon-v4/README.md) builds on this anatomy export with stance-specific recovery drawings and a shared runtime palette. When rebuilding both kits, run the v3 exporter first and the v4 exporter last so the runtime metadata includes the recovery rows.

This pass reviews all 97 packed gameplay and aiming frames against Cole's standing anatomy. It replaces the oversized crouch drawings and the running-torso substitution during crouched firing.

Open [the runtime review](../../../../hero-review.html) to compare relaxed and firing poses, both facings, jump/wall states, hurt and defeat. Its “All 97 frames” panel shows the complete atlas at gameplay size. The [movement course](../../../../?level=movement-course) tests actual controls and collisions.

## Anatomy and registration

The stable reference is the face, excluding the changing flame silhouette. Reviewed landmarks in [source/anatomy-review-v3.json](source/anatomy-review-v3.json) cover every source frame. Whole drawings are scaled uniformly with nearest-neighbour sampling; no body part is resized independently. The exported face landmarks span 32–34 pixels, approximately 12–13 gameplay pixels at the existing 98/256 display scale. The [audit](anatomy-audit-v3.json) records each frame's source, face landmark, scale, pivot and output rectangle.

Grounded poses retain foot contact. Airborne poses and moving torsos retain hip registration. Boot and palm attachments undergo the exact same crop/scale transform as their drawing. `HeroPoseAtlas.ts` is generated alongside the atlases, so the weapon and renderer share the resulting palm positions.

The new crouch sheet supplies six relaxed poses and six complete held poses: right, up, up-right, down-right, down, and a spare right hold. Gameplay uses the first relaxed pose and the five directional holds. Left facing mirrors the complete drawing. Crouched firing no longer composites an upright or running torso onto crouched legs. The source poses preserve folded knees, lowered hips and ordinary head size.

The v1/v2 sources, menu art and portraits remain in their versioned folders. This kit concerns gameplay frames. `gameplay-v3.png` retains the seven-row layout, with eight run/sprint cells and six cells in the other rows. `aiming-v3.png` retains nine rows, with the first two replaced by complete crouch drawings.

## Review sheets

- [Every gameplay frame](review/gameplay-all-v3.png)
- [Every aiming/crouching frame](review/aiming-all-v3.png)
- [Runtime combinations, right](review/combinations-right-v3.png)
- [Runtime combinations, left](review/combinations-left-v3.png)
- [Live Flicker sequence](review/flicker-live-v3.png), rendered through the real world, combat and game screen

The first two sheets show the face landmarks; the last two use the actual production renderer, including its torso/leg masks. They compare relaxed poses and every firing direction at 2× gameplay size, with palm markers and firing guides.

## New drawing and provenance

The [crouch source](source/crouch-v3.png) was created with the **built-in imagegen tool** using the existing gameplay atlas and held-aiming sheet as identity/style references. Its [exact prompt](source/crouch-v3.prompt.txt) and [provenance](source/provenance-v3.json) are preserved. Original generated pixels remain unchanged; the exporter handles registration, alpha cleanup and uniform scaling.

Rebuild exports with `node scripts/pack-hero-consistency.mjs`, then render the combination proofs with `node scripts/render-hero-review.mjs`. The exporter reads the committed v2 atlas and the new crouch source. It updates v3 images, layouts, the anatomy audit, and all three TypeScript metadata files together. Review source landmarks and palm centres again if the authored drawings change.

Flicker's matching presentation pass adds directional ignition sparks, distance-spaced drifting flight motes and differentiated impact scatters. The cosmetic spark budget is 192; particles fade within 0.2 seconds, freeze with the game clock and require no sprite asset. The starting weapon's damage, projectile collision, cadence and ectoplasm cost remain governed by its existing definition.
