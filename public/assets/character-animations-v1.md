# Main character animations

This is the historical v1 sheet. The active gameplay artwork is described in [v2 notes](character-animations-v2.md).

The canonical design reference is the original `character.png`, which is preserved. The old cyan skeleton frames are also preserved but are no longer loaded for the main character.

`character-animations-v1.png` was generated with the built-in image generation tool using `character.png` as its visual reference and a transparent-background request. The full final prompt is saved in `character-animations-v1.prompt.txt`.

The result is a 1254 by 1254 RGBA PNG containing six columns and six rows. Each source cell is 209 by 209 pixels. No resizing, recoloring, or background removal was applied to the generated file.

| Row from top | Sequence | Frames |
| --- | --- | --- |
| 1 | Idle and flame flicker | 6 |
| 2 | Run | 6 |
| 3 | Takeoff ascent apex descent landing | 6 |
| 4 | Attack | 6 |
| 5 | Hurt | 6 |
| 6 | Defeat | 6 |

All frames face right; the renderer mirrors them when facing left. `src/game/CharacterAnimation.ts` specifies frame selection and per-frame anchors, and `src/renderers/CharacterRenderer.ts` draws the character. It displays an 80 pixel cell with its body rooted at the player's collision box; the visible silhouette is smaller than the padded cell. The flame extends above the collision box and is decorative.

Jump poses follow vertical velocity rather than a looping timer. Landing briefly shows a crouch. Attack overlays preserve moving legs. Hurt temporarily overrides other animations, and defeat finishes after simulation stops and holds its final frame. Pause freezes the presentation, and restart creates fresh animation state.

Open `/docs/character-animations.html` through the local server for a live preview of all six sequences beside the original design. These are first-pass generated animations and can be refined after playtesting.
