# Cole · gameplay motion v2

The canon design remains the same. This pass updates gameplay locomotion and held aiming; the original v1 sources, menu poses and portraits remain available.

Open [the runtime review](../../../../hero-review.html) for slow motion, stepping, both facings, all aiming directions, collision/palm guides and gameplay-scale inspection. It uses the real renderer and Flicker with posed scenarios. The linked movement course exercises actual controls and movement physics. The older character-animation page is now labelled as a v1 source preview.

## Assets and registration

- `gameplay-v2.png`: eight columns, seven rows. Run and sprint use eight poses; the other five rows retain their six v1 drawings. The oversized legacy jump drawings are normalized to 80% in export, around the hip during flight and the ground anchor for takeoff/landing. Rendering remains 98 px per 256 px cell.
- `aiming-v2.png`: the original six rows followed by three held-pose rows: standing, running/crouching/airborne, and sprinting. Each new row has five directions: right, up, up-right, down-right, down. Left directions mirror the same drawings.
- `atlas-v2.json` and `export-v2.json`: image layouts, registered roots, reviewed sole attachments, source crops and export scales. `review/` includes coordinate grids and sole markers.
- [HeroPose.ts](../../../../src/game/animation/HeroPose.ts) holds reviewed palm coordinates shared by rendering and firing.

The exporter registers the cyan hip vial against the original idle pose, preserves lifted flight poses, limits contact poses to the ground line, uses nearest-neighbour sampling, and thresholds alpha to hard pixel edges. Foot markers were reviewed manually because dark-cluster detection could identify the same broad boot twice. No new body poses are painted by the exporter.

Stride advances with distance travelled, one eight-frame cycle per 144 world pixels. Run/sprint share the same phase; stopping does not advance it. Held firing uses a fully extended pose immediately, followed by one pixel of recoil, and stays held between shots. Downward arms are allowed below the torso mask without bringing the aiming sheet's standing legs into the moving pose.

Flicker sweeps from inside the collider to the reviewed palm before ignition, so a hand extending across a wall cannot launch through it. Its speed, damage, cost, cadence and flight lifetime are unchanged. Launch positions now follow the art rather than a fixed body offset; crouching consequently lowers a horizontal shot by approximately 14 px with these poses.

Boot flames reuse the authored v1 flame strip, grow with actual speed and charge to a 58 × 22 px envelope, and add a compact additive core. A bounded cosmetic trail (at most 64 sprites) lives in world coordinates for up to 0.3 s. Stopping, reversing, crouching or jumping stops emission; existing trails fade. Death/reset clears trails, and pause stops their clock. Missing optional flame art remains supported.

## Sources and prompts

Created with the **built-in imagegen tool**, using the existing v1 gameplay sheet as the identity reference. Generated originals are preserved unchanged in `source/`; packed assets are versioned siblings.

- [Movement source](source/motion-v2.png) · [exact prompt](source/motion-v2.prompt.txt)
- [Held aiming source](source/aim-v2.png) · [exact prompt](source/aim-v2.prompt.txt)
- [Provenance](source/provenance-v2.json)

Rebuild with `node scripts/pack-hero-motion.mjs`. This updates the v2 images, metadata, coordinate reviews and TypeScript atlas definitions together. Palm coordinates live separately in `HeroPose.ts` and must be reviewed if the held-pose source or export registration changes.

Validation includes stride phase, held-fire continuity, all stance/direction/facing palm launches, wall occlusion, existing combat/aiming tests, trail lifecycle, atlas transparency/bounds and Chromium/Firefox gameplay and review-page checks.
