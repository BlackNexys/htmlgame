# Dialogue portraits · prototype v1

`portraits-v1.png` is the expression atlas for the noncanonical station conversation. It was generated from the live `character-animations-v2.png` reference using the built-in image generator. The exact prompt is in [portraits-v1.prompt.txt](portraits-v1.prompt.txt). The generated PNG was copied without cropping, resizing, recolouring, or changing alpha; gameplay artwork remains unchanged.

The source is 1774×887 RGBA, arranged as four columns and two rows. CSS displays one quarter-width by half-height cell using a 400% × 200% background size, preserving the generated sheet's fractional cell boundaries. Review expressions at actual dialogue size.

| Row | Character | Columns, left to right |
| --- | --- | --- |
| 0 | Traveller, based on the live hero | Neutral, amused, worried, fierce |
| 1 | Prototype skeletal railway attendant | Neutral, amused, worried, stern (`fierce` key) |

The attendant, dialogue, and expressive face interpretations are interface test material, not approved character designs or canon. The hero's expressions are portrait studies; they do not replace the established live gameplay reference. Further portrait sets can use the same eight-cell contract; alternate layouts need an explicit metadata/renderer change.

Portraits are decorative alongside the full accessible speaker/text announcement. Missing images leave a letter silhouette and do not block the conversation.
