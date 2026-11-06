# Flicker · prototype v1

The design authority is [Flicker v1.1](../../../../docs/Underworld_Flicker_Weapon_Spec_v1_1.md). This is its first playable art/audio pass, recreated from the user's preview with the built-in imagegen tool. The exact [prompt](flicker-v1.prompt.txt) and unchanged [generated source](flicker-source-v1.png) are preserved.

`flicker-v1.png` is a 192×416 RGBA atlas of 32×32 cells. `flicker_atlas.json` records all rows, frame durations, source anchors and scale. The first eight rows are the six-frame flight loop baked clockwise: right, down-right, down, down-left, left, up-left, up, up-right. Rows 8–12 contain ignition, enemy impact, terrain sputter, shield resistance and fading embers. Each row has six cells. The pale flight core is aligned before rotations; the visible body is at most about 18 px long. The hitbox stays independent of animation.

Run `node scripts/pack-flicker.mjs` to deterministically repack the generated source with browser canvas. This scales and bakes directions without repainting the source. Runtime uses the pre-rotated flight rows and a tight glow. Missing/invalid imagery falls back to a small procedural flame, preserving combat.

`FlickerSound` synthesizes a dry noise snap, filtered airy release and quiet harmonic at runtime. Five variations change noise texture and brightness/pitch subtly. Fire, damaging hit, terrain sputter, shield tick and ectoplasm recovery have separate bounded voice groups. Defeat keeps its existing cue; recovery is never triggered merely by a hit. Firing sounds end by 140 ms. The `audio/` WAVs are deterministic 44.1 kHz mono audition renders of that same Web Audio implementation; rebuild with `node scripts/export-flicker-audio.mjs`. Playback failure remains cosmetic.

Use the [interactive preview](../../../docs/flicker.html) to inspect all directions/effects and hear the samples. Judge final feel in-game against the soundtrack and enemy tells. These assets and numerical balance remain provisional; modifiers are not implemented.
