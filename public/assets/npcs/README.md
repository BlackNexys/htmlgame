# Neutral NPC art · attendant v1

`rail-attendant-v1.png` is a generated full-body idle strip based on the lower-row railway attendant in [the dialogue portraits](../dialogue/portraits-v1.png). It preserves the cap, brass spectacles, dark uniform, burgundy tie and cyan collar light. The exact generation prompt is saved in [rail-attendant-v1.prompt.txt](rail-attendant-v1.prompt.txt).

The returned image is **2172×724 RGBA**, with four **543×724** frames in one row. The prompt requested square cells; the output uses portrait cells. Runtime and workshop rendering preserve their actual aspect ratio, rather than stretching them to squares. The generated PNG was copied without cropping, resizing or changing alpha.

Frames face right, with feet rooted near 94% cell height. Runtime uses an 88-pixel display height and a three-frame-per-second idle cycle, mirroring the whole sprite when facing left. Render scale/padding are independent of the 32×64 physical bounds. The workshop previews the first frame with the same aspect ratio and root.

This is noncanonical prototype character art. It does not replace the protagonist, enemy sheets, or portrait atlas. Missing/invalid optional NPC art falls back to a simple neutral figure; interaction does not depend on the PNG loading.
