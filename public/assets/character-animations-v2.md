# Main character animations · v2

The current design references are the supplied [standing](mainmenu/stills/hero_standing.png) and [leaning](mainmenu/stills/hero_leaning.png) menu poses. The gameplay sheet carries over the skull, exposed ribs, magenta soul-flame, tattered burgundy scarf, fitted dark clothing, strapped boots, and small belt details at gameplay scale.

`character-animations-v2.png` was generated with the built-in imagegen tool from those two references and a transparent-background request. The exact prompt is saved in [character-animations-v2.prompt.txt](character-animations-v2.prompt.txt). The prompt requested 1536×1536; the returned file is a 1254×1254 RGBA PNG. The original generated pixels are used without recoloring, resizing, or background removal. The original references and v1 sheet are preserved.

| Row from top | Sequence | Frames |
| --- | --- | --- |
| 1 | Idle, flame and cloth | 6 |
| 2 | Run / sprint | 6 |
| 3 | Takeoff, ascent, tucked rise, apex, fall, landing | 6 |
| 4 | Palm-fire and recovery | 6 |
| 5 | Hurt and recovery | 6 |
| 6 | Defeat and collapsed hold | 6 |

Each source cell is 209×209 pixels, displayed in the same 80-pixel cell as before. The player's 32×52 collision bounds and movement tuning are unchanged. Flame and cloth extend outside the collision box as decoration. `playerShotOffsetY` places the projectile's top 9 pixels below the player bounds' top so the shot lines up with the new raised palm; shot speed, damage, and cadence are unchanged.

`src/game/CharacterAtlas.ts` records the source dimensions, render size, torso split, direction correction, and tuned per-frame anchors. Grounded poses use foot baselines; airborne poses retain a body root while the legs tuck. The generated idle row faces left, so the renderer mirrors it locally to normalize every clip to right-facing before applying the player's facing. Running and sprinting share a cycle at different rates. Wall slide/jump reuse falling/ascent poses.

Moving attacks retain the locomotion legs and overlay the palm-fire torso at the tuned hip line. Hurt overrides firing; defeat finishes and holds after simulation stops. Pause freezes presentation and restart resets animation state.

The [animation preview](../docs/character-animations.html) shows all six clips beside the current menu reference. This is a first gameplay pass of the settled design; further polish should preserve the silhouette and foot/body anchors, and be judged at actual gameplay size.

The later [crouch and aiming companion](character-aim-v1.md) adds a 32 px crouching collision height, low palm fire, and directional poses while preserving this base atlas. Its input and projectile rules supersede the original horizontal-only firing description above.
