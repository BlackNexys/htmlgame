# Cyberundead enemy sprites

First-pass sprite designs for the zombie, skeleton, ghoul, ghost, wight, and necromancer. The user's original `../character.png` and `../char-sprite.png` were supplied as visual references, following `../STYLE.md`. Existing assets are preserved.

Open the [animated roster preview](http://localhost:3000/docs/enemy-sprites.html) while `npm start` is running. It includes animation selection, mirroring, pause, replay, enlarged views, and a lineup near the game's display scale.

## Files

| Enemy | Transparent atlas | Full prompt |
| --- | --- | --- |
| Zombie | [zombie-v1.png](zombie-v1.png) | [Prompt](zombie-v1.prompt.txt) |
| Skeleton | [skeleton-v1.png](skeleton-v1.png) | [Prompt](skeleton-v1.prompt.txt) |
| Ghoul | [ghoul-v1.png](ghoul-v1.png) | [Prompt](ghoul-v1.prompt.txt) |
| Ghost | [ghost-v1.png](ghost-v1.png) | [Prompt and refinement](ghost-v1.prompt.txt) |
| Wight | [wight-v1.png](wight-v1.png) | [Prompt](wight-v1.prompt.txt) |
| Necromancer | [necromancer-v1.png](necromancer-v1.png) | [Prompt](necromancer-v1.prompt.txt) |

Each PNG was generated separately with the built-in image generator and a transparent-background request. The ghost received an additional image-tool refinement to remove surrounding fog and isolate the sprites. Final generated PNGs were copied without resizing, recoloring, or changing alpha.

## Layout

Every sheet is 1254 by 1254 RGBA pixels, with four equal columns and four equal rows, sixteen frames per enemy and 96 frames in total. All sprites face right; left-facing previews mirror the drawing.

| Row from top | Sequence | Frame order |
| --- | --- | --- |
| 1 | Idle | Four subtle stance or energy variations |
| 2 | Movement | Four walking, scampering, or hovering poses |
| 3 | Attack | Anticipation, windup, action, recovery |
| 4 | Defeat | Impact, buckling, falling, final collapsed pose |

The generated dimensions give a proportional cell size of 313.5 pixels. For integer source rectangles, round each boundary independently using `round(column * width / 4)` and `round(row * height / 4)`, then subtract consecutive boundaries. The preview uses this approach. These are source sheets rather than native 64 pixel exports.

`manifest.json` records the files, grid, animation rows, provisional preview speeds, and a shared preview anchor. The game loads all six sheets, uses per-type collision bounds and display sizes, and uses a lower sprite anchor for the ghoul. The ghoul is intentionally lower and wider; the ghost floats. Continue reviewing the fit during playtesting.

## Review and integration

Use the enlarged preview to judge shapes and the small lineup to check readability. The cyber identifiers are the zombie's spine, skeleton's emitter, ghoul's jaw and limbs, ghost's projection harness, wight's security shield, and necromancer's antenna rig.

The sheets are now connected to the [playable enemy behaviors](../../docs/enemy-behavior.md). Anticipation and windup poses follow charge timing, the action pose follows the active attack, and recovery remains visible afterward. Defeated enemies play the collapse row and persist as corpses. Sprite timing and combat values are a first playable pass, so continue checking equipment consistency and body anchors during playtesting.
