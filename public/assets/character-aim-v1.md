# Crouch and directional combat poses · v1

Generated with the built-in imagegen tool using the v2 gameplay atlas and canonical menu standing pose as references. The exact prompt is in [character-aim-v1.prompt.txt](character-aim-v1.prompt.txt). The returned 1254×1254 RGBA image is preserved without pixel edits; existing sheets remain intact.

Six columns per row: crouch idle/shuffle, crouched horizontal fire, vertical up fire, diagonal up fire, airborne diagonal down fire, airborne vertical down fire. All authored poses face right. `src/game/CharacterAimAtlas.ts` defines the per-frame foot/body anchors and source windows, including an expanded last-row window to include its flame tips. Render scale remains 80/209. These poses supplement `character-animations-v2.png`.

Upward aiming overlays the existing locomotion legs. Downward aiming uses its full tucked airborne pose. Crouched attacks retain the lowered body instead of switching to standing. Facing normalization is separate for the aiming torso, so a shot aimed against a committed wall jump still points correctly. Hurt preserves crouch height; defeat retains the existing sequence. Flame and cloth are decorative outside collision bounds.

The hero's standing/crouch collision heights are 52/32 px, with the feet preserved during stance changes. Horizontal crouched fire is 20 px lower than standing fire. The same normalized eight-direction aim drives both projectile flight and pose selection; terrain is swept from shoulder to palm before a bolt becomes active.
