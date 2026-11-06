# Cyberundead art style

Pixel art for an action platformer set in the underworld. Dead bodies, spirits, and old stone share the world with strange technology and vivid energy. The characters should feel restless, a little sinister, and capable of moving fast.

The current protagonist design is established by the menu poses in `mainmenu`: a lean skeleton with an exposed skull and ribs, magenta soul-flame, burgundy scarf, dark fitted clothing, and strapped boots. The original PNGs remain historical references. This guide does not establish power types, factions, or other game mechanics.

## The visual idea

**Dark remains animated by vivid energy.**

Keep the undead anatomy visible in the silhouette: a skull, a skeletal torso, thin limbs, or an unnatural posture. Express the cyber element through deliberate details such as patterned gauntlets, mechanical joints, inset lights, or circuitry worked into the body. A few readable details should carry the idea at gameplay size.

Energy can behave like flame, spirit matter, or an electrical disturbance. Use sharp, irregular shapes that feel alive. The connection between technology and the supernatural can remain strange and unexplained.

## Original references

| Asset | What to preserve |
| --- | --- |
| [Menu standing pose](mainmenu/stills/hero_standing.png) and [leaning pose](mainmenu/stills/hero_leaning.png) | Current protagonist identity. Preserve the visible skull and ribs, lean proportions, magenta flame, tattered burgundy cloth, strapped boots and restrained belt details. Simplify these details at gameplay scale. |
| [character.png](character.png) | Original character reference. Preserve its history and use it to understand the early wiry silhouette and magenta accent. |
| [char-sprite.png](char-sprite.png) | Pale skeletal structure, rounded head, and oversized cyan hands. The bright patterned hands give a useful reference for the meeting of technology and spirit energy. |
| [Spirithand-idel.png](Spirithand-idel.png) and [original idle frames](ghostman%20idel/) | Restrained character motion and small changes in the head and face. Useful references for personality through small movements. |
| [wall.png](wall.png) | Uneven masonry and worn stone. The irregular shapes establish an older, physical underworld beneath the technological additions. |

The cyan skeleton is a supporting visual reference. The menu poses define the current protagonist. Their different colors do not imply a new gameplay distinction.

## Shape and proportion

- Favor angular silhouettes, wiry limbs, uneven edges, and slightly unnatural poses.
- Give each character one strong identifying feature, such as a flame, distinctive hands, or a head shape.
- Keep the main character lean. Preserve the original stance and proportions when adding poses or equipment.
- Separate arms, torso, and legs clearly enough to read during movement.
- Use broader shapes for important features and small pixel clusters for supporting detail.

The original main character uses a 64 by 64 pixel canvas. New frames should match its apparent scale and pixel density. Transparent padding may be larger when an action needs room; it should not make the character larger or more detailed.

## Color and light

Build bodies from black, charcoal, and cool grays. Use enough separation between those values to keep the limbs visible against a dark environment. Place the brightest colors where the character's identity or action needs attention.

Magenta is the protagonist's established flame accent. Cyan is established in the skeleton and hand artwork. Preserve those reference colors when extending the corresponding assets. Keep supporting palettes compact and chosen for the subject.

Emissive effects should have a readable pixel shape before any glow is applied. Use a bright core and a small number of darker edge colors. Keep soft bloom restrained so it does not hide the underlying drawing.

## Pixel treatment

Use crisp, intentional pixel clusters and a consistent scale of detail. Shade forms with a few clear steps. Let silhouettes, posture, and light placement do most of the work.

Check every asset at its actual gameplay size against a dark background. Tiny markings that disappear at that size should not be responsible for identifying the character or explaining an action. Small highlights or an edge light can separate a dark limb from the scenery.

## Animation

Preserve the character's proportions, palette, and identifying feature across every frame. Give the flame its own flicker and follow-through while keeping the body readable.

- Idle motion can be subtle: a small shift of weight, a head movement, and changing energy shapes.
- Running needs distinct contact, passing, and airborne poses, with clear separation between the legs.
- Jumping, attacking, taking a hit, and falling should each have a recognizable silhouette.
- Keep the body rooted consistently between frames. Any intentional bounce should come from the pose.
- Leave transparent space around extended limbs and effects so they are not clipped by cell boundaries.

Sprites should remain readable facing either direction. Mirror frames where suitable, and retain consistent anchors when an animation changes.

## Environments and other characters

Carry the same combination of age, death, and technology into future assets. Worn masonry can sit alongside embedded cables, mechanical fixtures, or small luminous markings. These are options for extending the theme, rather than required additions to every tile.

Keep scenery quieter in contrast and saturation than active characters and attacks. The existing wall's bright mortar is a useful detail to review when tiling large areas, since repetition can make it compete with the action.

Enemies should share the protagonist's pixel density and shading approach while having distinct silhouettes. The generated sheets in `enemies/` are the current first playable art pass. The simple background architecture remains a placeholder. Use the original PNGs as the visual references when refining either.

## Generated animation sheet

[character-animations-v1.png](character-animations-v1.png) is a first animation pass based on `character.png`. It provides usable pose sequences, but adds rounder shapes, a fuller flame, and more costume detail than the original. It also makes the cyber details less explicit.

The active [v2 gameplay sheet](character-animations-v2.png) is generated from the established menu poses. Preserve that identity when refining the animations: readable skull and ribs, lean proportions, burgundy cloth, and a narrower streaming flame. The engine normalizes the authored idle direction and uses per-frame anchors to keep the character rooted. See [v2 notes](character-animations-v2.md).

## Brief for a new asset

> Create a cyberundead pixel-art asset for a fast underworld platformer. Match the relevant original PNG reference in silhouette, proportions, pixel density, and palette. Combine recognizable undead forms with a few readable technological details. Use dark charcoal and cool gray forms with a focused vivid energy accent. Keep shapes angular, shading compact, and actions readable at gameplay size. For character sprites, use a genuinely transparent background and consistent frame anchors. Preserve the protagonist's magenta flame and wiry build when depicting them.

Before accepting a new asset, compare it with the original reference at gameplay size, check its silhouette on dark scenery, and play its animation in context.
