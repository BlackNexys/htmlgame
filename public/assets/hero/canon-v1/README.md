# The Traveller · canon v1

The user's [canon sheet](../../../docs/Underverdenens%20neon-skeletark__has_watermark____has_borders__.png) is the character authority as of 2026-11-09. Its borders, title and watermark remain in the untouched reference; they are excluded from runtime assets. Earlier gameplay and menu interpretations are historical sources.

Preserve the rounded black face with **two magenta eyes**, ivory cheek/jaw framing, connected pink/magenta fire, burgundy wrapped scarf and cloak, fitted dark studded jacket with visible ribs, slim strapped trousers, brown/red buckles and boots, and cyan hip vial. Draw complete pixel-art characters, with the flame and clothing included in every pose. The seated cloak supports the hips and thighs and hangs with gravity.

| Export | Layout and use |
| --- | --- |
| [gameplay-v1.png](gameplay-v1.png) | 6 × 7 cells, 256 px; idle, run, air, palm fire, hurt, defeat, sprint |
| [idle-v1.png](idle-v1.png) | Unchanged first idle cell for static character references |
| [aiming-v1.png](aiming-v1.png) | 6 × 6 cells, 256 px; crouch, crouched fire, up, diagonal up, diagonal down, down |
| [sitting-v1.png](sitting-v1.png), [leaning-v1.png](leaning-v1.png) | Six complete menu poses each; 125 ms holds, stable support pixels |
| [portraits-v1.png](portraits-v1.png) | Four 256 px expressions in row zero: neutral, amused, worried, fierce; row one transparent |
| [bootfire-v1.png](bootfire-v1.png) | Six 32 × 24 px flames; root (30,22), tongues trailing left |
| [atlas-v1.json](atlas-v1.json) | Runtime layout, display size, shared root, per-frame boot attachments and menu clips |
| [export-v1.json](export-v1.json) | Exact source bounds, registration roots, scales and held support rows |

All body frames face right. Gameplay mirrors the entire actor for left facing. Menu metadata mirrors the right-facing drawings toward the scene. Native body cells render at 98 px, with root (128,240); the transparent padding allows room for fire and extended arms. The standing collider remains 32 × 52 px, crouching 32 px high. Airborne poses register the cyan vial to preserve the torso height when legs tuck. Moving shots retain the active legs and composite the authored firing torso at the hip.

The dedicated sprint row plays at a gradually increasing stride rate. Movement earns a smooth 330 → 480 px/s cap over 0.6 seconds of grounded sprinting. Stop, reversal, crouch, wall impact and action clearing reset buildup; jumps carry earned momentum. Cosmetic boot fire follows the reviewed sole coordinates, grows with charge and requires actual grounded motion above run speed. It stops in the air, at walls, when crouching and on death. Missing flame artwork leaves gameplay usable.

## Sources and exact prompts

Made with the **built-in imagegen tool**. The unmodified generated originals and exact generation prompts are preserved together in [source/](source/). The first sheet used the user's canon image; later sheets also used that new locomotion drawing to retain a consistent pixel treatment. [provenance-v1.json](source/provenance-v1.json) records the original output paths and reference roles.

| Drawing | Original generated pixels | Exact prompt |
| --- | --- | --- |
| Locomotion | [locomotion-v1.png](source/locomotion-v1.png) | [prompt](source/locomotion-v1.prompt.txt) |
| Actions | [actions-v1.png](source/actions-v1.png) | [prompt](source/actions-v1.prompt.txt) |
| Crouch and aiming | [aiming-v1.png](source/aiming-v1.png) | [prompt](source/aiming-v1.prompt.txt) |
| Seated | [sitting-v1.png](source/sitting-v1.png) | [prompt](source/sitting-v1.prompt.txt) |
| Leaning | [leaning-v1.png](source/leaning-v1.png) | [prompt](source/leaning-v1.prompt.txt) |
| Portrait expressions | [portraits-v1.png](source/portraits-v1.png) | [prompt](source/portraits-v1.prompt.txt) |
| Boot flame | [bootfire-v1.png](source/bootfire-v1.png) | [prompt](source/bootfire-v1.prompt.txt) |

Export preparation uses Chromium canvas and nearest-neighbour sampling. It crops, registers and packs authored frames, clears detached neighbouring crop debris from the action/aim sources, and makes alpha binary at threshold 160 to remove generated haze. It preserves source RGB. Menu support pixels are held from the first frame beneath the seated folds and leaning boots. The packer contains reviewed boot attachment overrides for run/sprint; the [review sheets](review/) show the markers. No runtime deformation or detached hero head/fire layer is used.

```sh
node scripts/pack-canon-hero.mjs
node scripts/pack-title-art.mjs
node scripts/render-title-art.mjs
npm run check
```

Use a supported stable Node release with Playwright Chromium installed. Inspect [/docs/character-animations.html](../../../docs/character-animations.html), [/menu-production.html](../../../../menu-production.html), the game and workshop at native scale. Dialogue uses this hero portrait row while the attendant retains the earlier dialogue atlas. Original story, NPC and environment authority is unaffected by the character update.
