# Cyberundead art style

Pixel art for an action platformer set in the underworld. Dead bodies, spirits, and old stone share the world with strange technology and vivid energy. The characters should feel restless, a little sinister, and capable of moving fast.

The current protagonist is defined by the sprites actually used in gameplay: [character-animations-v2.png](character-animations-v2.png) and its [aiming companion](character-aim-v1.png). Match their proportions, compact glowing black face, connected magenta flame, burgundy scarf/cloak, pale ribs within fitted dark clothing, lean limbs, belt details and buckled boots. The latest user correction explicitly makes these live sprites the reference for the menu rebuild. This guide does not establish power types, factions, or other game mechanics.

## Current environment authority

The user's [Untitled.png](../../docs/Worldbuilding/Untitled.png) is the primary visual reference for the Confluence demo. The theme is **cyberpunk with undead**, not steampunk. Build electronic terminals, powered conduits, cables, dark gunmetal, industrial urban layers and blue-glass canopies into inherited Gothic/railway architecture. Use cyan spectral rivers and magenta lights/plants throughout the world, with smaller amber signs of habitation. Gothic shape alone does not make the technology Victorian. Brass ornament, steam boilers and clockwork are the wrong default.

The [v3 environment kit](environment/confluence/v3/README.md) replaces v1/v2 for this level. Their sources remain historical iterations, not current style authority. Match the new environment reference while retaining the live hero/enemy/NPC identities and readable collision edges.

## The visual idea

**Dark remains animated by vivid energy.**

Keep the undead anatomy visible in the silhouette: a skull, a skeletal torso, thin limbs, or an unnatural posture. Express the cyber element through deliberate details such as patterned gauntlets, mechanical joints, inset lights, or circuitry worked into the body. A few readable details should carry the idea at gameplay size.

Energy can behave like flame, spirit matter, or an electrical disturbance. Use sharp, irregular shapes that feel alive. The connection between technology and the supernatural can remain strange and unexplained.

## Wider world direction — exploratory

The [Deadways atlas](../../docs/Worldbuilding/Underworld_Deadways_World_Atlas_v0_1.md) proposes **cyber-gothic afterlife meets alien natural history**. Familiar stations, homes, markets, and industry belong to the civilization of the dead; spectral rivers, impossible rib-like formations, strange organisms, and unusual spaces belong to the environment. Show inhabited places with ordinary purposes as well as room for action.

Regional colour and mood can vary substantially: furnace amber and oxidized metal, translucent pearl growths, pale expanses, or black mirror coasts. Keep the protagonist's established magenta identity and clear combat silhouettes without making every environment the same neon-gothic city. Cyan scenery is not inherently hostile, and an undead body does not imply an enemy. Warm habitation and alien wilderness can each be peaceful or dangerous.

The atlas and supplied railway-city painting are exploratory concepts. They do not supersede the live character reference, establish factions or metaphysics, or supply production-ready level layers. Preserve regional atmosphere when adapting concepts, then author separate readable terrain, backgrounds, and effects. See [alignment and asset status](../../docs/Worldbuilding/README.md).

## Original references

| Asset | What to preserve |
| --- | --- |
| [Live gameplay atlas](character-animations-v2.png) and [aiming companion](character-aim-v1.png) | Authoritative current character: preserve the face, connected flame, proportions, clothing, colours and pixel-cluster treatment. The menu standing preset reuses the live atlas directly. |
| [character.png](character.png) | Historical original. It does not authorize another costume or anatomy redesign of the current playable hero. |
| [Earlier menu standing](mainmenu/stills/hero_standing.png) and [leaning](mainmenu/stills/hero_leaning.png) | Historical menu references that informed the gameplay sheet. New menu character poses now use the gameplay idle strip as their direct visual reference. |
| [char-sprite.png](char-sprite.png) | Pale skeletal structure, rounded head, and oversized cyan hands. The bright patterned hands give a useful reference for the meeting of technology and spirit energy. |
| [Spirithand-idel.png](Spirithand-idel.png) and [original idle frames](ghostman%20idel/) | Restrained character motion and small changes in the head and face. Useful references for personality through small movements. |
| [wall.png](wall.png) | Uneven masonry and worn stone. The irregular shapes establish an older, physical underworld beneath the technological additions. |

The cyan skeleton is a supporting visual reference. Different reference colours do not imply a new gameplay distinction. Current menu assets and their exact prompts are documented in [production notes](mainmenu/v3/production/README.md).

## Shape and proportion

- Favor angular silhouettes, wiry limbs, uneven edges, and slightly unnatural poses.
- Give each character one strong identifying feature, such as a flame, distinctive hands, or a head shape.
- Keep the main character lean. Preserve the original stance and proportions when adding poses or equipment.
- Keep the familiar rounded face and connected flowing flame from the gameplay sprites. Preserve the source head/body ratio and fitted costume when adding poses; draw the whole character together.
- In seated menu poses, the cloak compresses under the hips and thighs and hangs with gravity. It does not stream sideways from beneath the seated body.
- Separate arms, torso, and legs clearly enough to read during movement.
- Use broader shapes for important features and small pixel clusters for supporting detail.

The current gameplay atlas has 209×209 source cells rendered at gameplay scale. New pose exports use the same native cell scale, with apparent size and pixel density reviewed against that atlas. Transparent padding may be larger when an action needs room; it should not make the character larger or more detailed.

## Color and light

Build bodies from black, charcoal, and cool grays. Use enough separation between those values to keep the limbs visible against a dark environment. Place the brightest colors where the character's identity or action needs attention.

Magenta is the protagonist’s established flame accent and also belongs to city infrastructure, vegetation and spectral light. Cyan belongs to rivers, technology and existing actor references. Neither color is reserved for a gameplay faction. Keep attacks and actors readable through shape, motion and value separation; do not remove the reference’s environmental magenta.

Emissive effects should have a readable pixel shape before any glow is applied. Use a bright core and a small number of darker edge colors. Keep soft bloom restrained so it does not hide the underlying drawing.

## Pixel treatment

Check environment cutouts against **white** as well as dark/checker backgrounds. Transparent atlas margins alone are not sufficient: inspect each cap, plant silhouette, roof edge and open frame. Preserve dark physical materials while clearing their external backing. Align the painted platform lip with its collider, and keep prop feet at their anchor. Facade shading must preserve source alpha. See the [v4 material check notes](environment/confluence/v4/README.md).

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

Enemies should share the protagonist's pixel density and shading approach while having distinct silhouettes. The generated sheets in `enemies/` are the current first playable art pass. The [v3 Confluence kit](environment/confluence/v3/README.md) follows the user’s cyberpunk reference with electronic station modules, powered catwalks, cold city layers and inhabited rooms. The v1/v2 brass-heavy direction is superseded. Other mechanics fixtures retain their simpler backgrounds. Setting images guide atmosphere and layout; collision is still authored separately.

## Generated animation sheet

[character-animations-v1.png](character-animations-v1.png) is a first animation pass based on `character.png`. It provides usable pose sequences, but adds rounder shapes, a fuller flame, and more costume detail than the original. It also makes the cyber details less explicit.

The active [v2 gameplay sheet](character-animations-v2.png) is generated from the established menu poses. Preserve that identity when refining the animations: readable skull and ribs, lean proportions, burgundy cloth, and a narrower streaming flame. The engine normalizes the authored idle direction and uses per-frame anchors to keep the character rooted. See [v2 notes](character-animations-v2.md).

## Brief for a new asset

> Create a cyberundead pixel-art asset for a fast underworld platformer. Match the relevant original PNG reference in silhouette, proportions, pixel density, and palette. Combine recognizable undead forms with a few readable technological details. Use dark charcoal and cool gray forms with a focused vivid energy accent. Keep shapes angular, shading compact, and actions readable at gameplay size. For character sprites, use a genuinely transparent background and consistent frame anchors. Preserve the protagonist's magenta flame and wiry build when depicting them.

Before accepting a new asset, compare it with the original reference at gameplay size, check its silhouette on dark scenery, and play its animation in context.

### Architectural assembly checks

Use a straight-on elevation for nearby wall fronts and canopy fascias. Show complete end caps, brackets and grounded column feet; attach clock rails and service boxes to a visible support. Give each facade bay one primary window, balcony or arcade treatment. Inspect at gameplay scale for conflicting rooflines, intersecting columns and neighboring sprite fragments. Dim solid material by tinting its RGB, preserving alpha; global opacity is reserved for intentionally spectral or distant scenery.
