# Cole · throwing and material palette

Flicker releases on the input frame at the existing directional palm socket. The next 0.2 seconds show follow-through, elbow recovery and gathering the next throw. Sustained fire repeats that gesture at the existing five shots per second. Stopping fire finishes recovery; directional aiming rests with the hand drawn back. Movement legs keep their distance-driven cycle.

The new atlas appends 24 recovery drawings to the v3 aiming atlas: standing (row 9), running/airborne (10), sprinting (11), and crouching (12). Release poses and all weapon sockets remain unchanged. The runtime uses the recovery, gathering and cocked-arm columns; the full authored six-frame sequences remain available in the source. Crouch recovery uses its own folded-body torso over stable crouched legs. No runtime rotation or scaling is applied to the skull.

The shared material palette in `src/renderers/HeroPalette.ts` maps every gameplay pose to dark blue-black leather, burgundy cloth, warm ivory bone, muted brown straps, cyan vial and raspberry/pink fire. Face landmarks distinguish flame colors from similar cloth colors. Mapping happens once per loaded atlas, is cached, and preserves every source alpha value and pixel position. The archived PNGs retain their original colors.

## Review

Open [the live review](../../../../hero-review.html). Toggle **Refined palette** to compare colors; use quarter speed and frame stepping to inspect the throw. The white guide marks the release socket, rather than following the recovering hand. The actual game uses the same renderer and palette.

- [Palette comparison](review/palette.png)
- [Standing throw](review/idle.png)
- [Running throw](review/running.png)
- [Sprinting throw](review/sprinting.png) and [left facing](review/sprinting-left.png)
- [Crouching throw](review/crouching.png) and [left facing](review/crouching-left.png)
- [Airborne throw](review/airborne.png)
- [All new recovery frames](review/recovery-frames.png)

The sequence sheets show five directions at release, follow-through, recovery, gathering and preparation for the next throw. They use the production renderer at 2× size. In the live game, the new frames and preserved release drawings animate the flame and cloth along with the arm.

## Source and rebuild

Created with **built-in imagegen**, using [the four existing stances](source/stance-reference.png) as the identity and proportion reference. The [unchanged generated original](source/throw-recovery.png), [exact prompt](source/throw-recovery.prompt.txt), and [provenance](source/provenance.json) are included. The generated source has soft glow in its alpha; export removes that glow with a hard alpha threshold and nearest-neighbour sampling.

[Reviewed face landmarks](source/face-review.json) determine one uniform scale for each stance. Automatic dark-region measurements were unsuitable because the lit forehead and scarf sometimes joined or split the detected face. All six drawings in a stance use the same scale. The [export audit](recovery-audit.json) records registration and the resulting landmarks; the [layout](atlas-v4.json) includes the preserved release sockets.

Run `node scripts/pack-hero-throws.mjs`, then `node scripts/render-hero-throw-review.mjs`. If rebuilding v3 as well, run its exporter first and this exporter afterward; both write runtime atlas metadata. The v4 exporter reads the saved v3 images and appends the new drawings without modifying those original assets.

Validation covers immediate palm-aligned release in every stance/direction/facing, unchanged projectile cadence and collision, changing recovery phases, preserved moving legs, silhouette-preserving palette comparison, hard alpha edges, pause, combat and replay in Chromium and Firefox.
