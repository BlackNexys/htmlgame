# Underworld — Main Menu Art & Animation Plan

**Current character authority · 2026-11-09:** The user’s `public/docs/Underverdenens neon-skeletark__has_watermark____has_borders__.png` now governs every hero representation. The [canon v1 kit](../public/assets/hero/canon-v1/README.md) supplies complete standing, seated and leaning pixel-art frames, gameplay and dialogue portraits. Standing reuses the new gameplay idle; all menu poses face into the scene. Older character directions below are historical iterations. The station setting, motion policy, integrated seated cloak and independent prop animation remain applicable.

**Version:** 1.2

**Date:** 6 November 2026

**Status:** First illustrated production scene integrated; visual polish remains iterative.

**Scope:** A new menu scene built from purpose-made layered pixel artwork, following the approved illustrated studies. The low-resolution corner remains an animation study. Sections 11–12 record the progression and the first integrated production pass.

> A restless soul waits at a station where the departures are eternally delayed. The city feels enormous. The small things around them are still alive.

## Setting context — exploratory, 7 November 2026

The [Deadways atlas](Worldbuilding/Underworld_Deadways_World_Atlas_v0_1.md) proposes the Last Platform as this familiar station in or near the Confluence. The name and placement remain provisional. The station expresses the civilization built by the dead: ordinary waiting, maintenance, travel, and dry humour within an alien landscape. Its gothic masonry and cyan/magenta palette do not define every proposed region.

Keep the live hero reference and current composition requirements. The new railway-city painting is setting concept reference, not a replacement for the production scene or ready-made animation layers. Illustrated station names and timetable text do not settle rail operators, destinations, or campaign progression. Worldbuilding alignment does not call for a new menu-art pass.

## 1. The direction

Use the existing station artwork as **concept art**. Preserve its atmosphere, composition, character identity, and dry humour. Build a new scene whose assets are designed for animation from the beginning.

The visual target is the original artwork's richly illustrated pixel art: intricate gothic masonry, layered city depth, fine vegetation, detailed character drawing, atmospheric cyan light and magenta accents. Preserve that richness when designing the new artwork for animation.

The sprite work supplies animation craft: stable contacts and attachment points, deliberate frame timing, changing flame and cloth silhouettes, clean loop boundaries, and separate moving parts. Those lessons apply to detailed artwork at its own native resolution. They do not set the menu's figure size, palette limit or level of detail. Frame atlases remain an export option, rather than a visual style requirement. The current cutout/deformation pass is an interim experiment and is superseded as the production approach.

### Agreed

- Keep the underworld station: deep stone architecture, bridges, rails, strange machinery, cyan light, and magenta vegetation.
- Use the current playable sprites in `character-animations-v2.png` and `character-aim-v1.png` as the character reference. Preserve their proportions, compact glowing face, connected magenta flame, burgundy cloth and fitted dark clothing. Draw each hero frame as one complete character; the seated cloak rests under his weight. This latest correction supersedes the separate-skull, expanded-mane and biker-jacket interpretations recorded later as history.
- Build the menu as a cohesive scene, with animation considered while drawing each asset.
- Match the original's illustrated pixel-art finish, fine material detail and atmospheric depth. Keep the hero's established proportions and detail at the scale of that composition.
- Establish the quality with one platform corner containing the hero and lantern before producing the full scene.
- Keep the real menu controls separate from the artwork and preserve keyboard navigation.

### Proposed, to be tested in the first corner

The native resolution, palette, asset dimensions, number of frames, timing, exact placements, and light intensity in this document are production starting points. They are not locked merely because a number appears here.

This work concerns menu presentation. It does not redesign gameplay movement, Flicker, levels, or the separate level editor.

## 2. What the player sees

The menu opens onto a quiet station suspended above a vast underworld city. Cyan windows, distant bridges, and descending rails establish depth. A worn platform fills the lower right. The hero waits near a hanging lantern. A clock and departure board rise behind an old bench, where a skeletal cat sleeps beside a suitcase.

The left side gives the title and controls room to breathe. The main visual conversation is between the hero's magenta flame and the lantern's cyan light. Distant movement rewards watching without competing with Play or Continue.

### Composition

| Area | Contents | Visual purpose |
| --- | --- | --- |
| Left, roughly 0–40% | Underworld logo, main actions, quiet stone/shadow behind them | A clear and readable menu |
| Centre, roughly 35–70% | Bridges, rails, mist, distant city | Scale and a route for the eye into the scene |
| Right, roughly 60–100% | Hero, lantern, clock, board, bench and cat | The scene's character and small stories |
| Lower right | Platform edge, vegetation, boots and contact shadows | A believable place for the characters to stand |

These regions overlap to create depth; they are composition guides, not three visible panels. Spirits, fog, and bright effects should not travel across the menu labels.

```text
┌──────────────────────────────────────────────────────────┐
│ UNDERWORLD             distant city           clock      │
│                                            lantern       │
│ Play / Continue       bridges and rails       board      │
│ Options                                                  │
│ Controls                          hero        bench/cat  │
│                                      ───── platform ──── │
│ quieter shadow            depth          vines / void    │
└──────────────────────────────────────────────────────────┘
```

Retain the departure-board joke: **DEPARTURES: ETERNALLY DELAYED.** Draw the board as an asset with a clear face; compose its lettering deliberately so the words survive export. Generated lettering is not a dependable production source.

### Depth and drawing order

1. Distant void and city silhouette.
2. Far windows, bridges and rails.
3. Station architecture and restrained distant atmosphere.
4. Platform, rear bench structure, and rear vegetation.
5. Ground lighting and hero contact/cast shadow.
6. Hero, cat and individual props at their scene positions.
7. Foreground occluders: bench arms, selected leaves, platform lip and prop edges.
8. Small local effects, composed at the depth where they belong.
9. Logo, menu controls, focus indicators and dialogs in the DOM.

Do not put every effect above every object. An ember can pass behind a sign; a seated leg can be in front of a bench while the bench arm remains in front of the body. Plan those overlaps in the asset breakdown.

## 3. A shared visual foundation

### Pixel scale and detail

Establish the artwork at a resolution that preserves the original concept's detail. Start the next still study around **1600×900**, comparing it at normal browser sizes and against the original. This is a provisional art canvas, separate from the game's existing 960×576 simulation view. Approve the visible finish before fixing export dimensions.

Keep the hero's relative size close to the original composition: approximately a fifth to a quarter of the scene height including the flame, subject to the composition review. Preserve readable bone structure, cloth folds and equipment within that silhouette. Frame bounds follow the approved drawing and its full range of movement; a gameplay-sized character cell is not a constraint.

Review all layers together at native size and at their actual browser presentation size. Match edge treatment, pixel-cluster scale, material texture and perspective. Fine cracks, ironwork, leaves and distant windows should contribute to the original's richness while silhouettes and menu labels remain readable. Depth may simplify distant details naturally.

Create and clean up at the chosen art resolution. Check deliberate pixel edges and clusters rather than applying a coarse pixel filter to a smooth painting. The pilot's 640×360 canvas and small hero are study settings, not production targets. Reducing or enlarging those exports will not establish the intended finish.

### Palette and materials

Build shared colour ramps for stone, bone, iron, burgundy cloth, cyan emission and magenta flame, with enough tones for the original's material detail, atmospheric depth and subtle lighting. Select colours deliberately across the assembled scene. There is no fixed 24–32-colour production limit; the study's 32-colour export palette is a technical experiment. Transparency is separate from colour choices.

| Family | Direction |
| --- | --- |
| Background | Deep blue-black, cold desaturated stone, restrained distant cyan |
| Platform and machinery | Worn violet-grey masonry, dark iron, small aged brass details |
| Hero and cat | Readable ivory bone against charcoal; burgundy cloth for the hero |
| Hero energy | Magenta body, pink inner flame, small pale hot core |
| Station light | Cyan lantern and selected windows; warm lettering on the departure board |

The menu can share colour families with [Flicker](Underworld_Flicker_Weapon_Spec_v1_1.md), but it should not turn the hero's flame into a weapon projectile. Keep the identities related and the silhouettes appropriate to their purpose.

### Lighting

The lantern is the local cyan key light. It lights the nearby iron, bench edges, pale bones, and a limited patch of platform. The hero's flame adds a smaller magenta light near the skull, scarf, and shoulder. Distant city light provides a quiet cool fill.

Draw stable material shading into the artwork. Export local emission/light masks for the parts whose brightness changes. Animate those masks gently rather than pulsing the whole picture.

Boots and props need contact shadows. The hero's faint cast shadow extends away from the lantern along the platform plane. Each pose gets an explicit ground contact; a seated pose also needs a seat anchor. Flame flicker must not make the hero appear to float.

## 4. What is animated

The station should have several rhythms: quick flame motion, slower cloth and resting poses, very slow atmosphere, and occasional passing spirits. They should not all restart together or share an obvious beat.

The following frame counts and rates are starting targets. Use per-frame holds when they improve the movement. A longer sheet is useful only when its drawings describe better motion.

| Element | Movement | Proposed production approach | Timing and limits |
| --- | --- | --- | --- |
| Hero's body | A restrained idle: small settling of shoulders or posture | 4–6 authored poses with deliberate holds; planted boots | A quiet 3–5 s cycle, not constant bobbing |
| Soul-flame | Modest tongue and highlight changes growing directly from the skull | Unified skull/neck/fire clip; hold skull pixels and register the neck; current eight-frame loop lasts one second | Restrained length/volume changes; test every join and the last-to-first transition |
| Scarf/cape | A breeze travels from the attachment toward loose tips when standing or leaning | 6–8 drawn frames with a stable shoulder seam; seated cloth is drawn into the body, beneath hips/thighs | Slower than the flame; seated fabric rests on the bench under the hero's weight |
| Embers | A few specks separate, drift and fade | Tiny sprite sequence plus bounded scene-space movement | Sparse; no shower of particles |
| Lantern | A slight swing around its actual hanger; gentle light variation | Separate rigid housing with exported pivot; authored light mask | Slow 5–8 s sway, initially within about 1°; smooth, low-contrast light variation |
| Clock | A fine second hand makes a readable circuit | Separate face and hand assets with a shared pivot | One 60 s revolution; independent of gameplay time; painted markings stay fixed |
| Sleeping cat | Small resting motion, with an occasional ear or tail movement | 4–6 authored rest frames; short optional secondary clip | Long holds; larger actions are later polish |
| Cat's sleep marks | Small z/Z marks rise and disappear above its head | Separate pixel glyph sprites; staggered position and opacity | Two or three at most; a few seconds per pass |
| Hanging vines | Tips respond to the same breeze as the cape | 4–6 authored frames; fixed attachment edge | Gentle 2–4 s loops with different phase offsets |
| Wandering souls | A ghost changes shape slightly while drifting through a depth lane | 6–8 frame sprite loop plus scene movement | Occasional passes, roughly 20–45 s apart; at most a few visible |
| Mist | A thin layer drifts through the lower depth | Tileable transparent texture, slowly translated and faded | Roughly 20–40 s movement; low opacity and no obvious wrap seam |
| Distant lights | A few windows or machinery lights vary | Small emission-mask groups | Slow, restrained variation; no random flashing across the city |

Architecture, masonry, bench structure, luggage, sign lettering, clock face, logo and menu labels stay still in the first production pass.

Flame, cloth, cat and vines need drawings of their changing shapes. Rigid lantern parts and clock hands can use pivoted transforms because their construction supports that movement. Those pivots should be exported with the assets.

No camera shake, mandatory pointer parallax, full-screen brightness pulses, rapid flashes, or animation tied to the music beat in the first version. Mechanical Heartbeat remains the menu soundtrack. Extra ambient sound is outside this first art pass.

## 5. Asset breakdown

Every moving piece should have clean transparency, deliberate overlap at its attachment, and sufficient padding for every frame. Do not bake a second copy of a moving object into the background underneath it.

| Asset group | Deliverables | Initial size guide |
| --- | --- | --- |
| Style reference | Palette, scale comparison, material/light studies, hero silhouette | One review sheet at actual scene scale |
| Distant city | Sky/void, far city and selected light masks | Full approved art canvas |
| Station depth | Bridges, rails and architecture, separated where depth requires | Full approved art canvas; overscan only if movement requires it |
| Platform corner | Platform/rear structure and separate foreground occluders | Within the shared scene grid |
| Hero, standing | Body below the neck, unified skull/fire clip, attached cape, shadow/light masks | Bounds measured from the approved detailed figure and motion range |
| Hero, other poses | Seated and leaning variants, each with its own loops and contacts | Same pixel density; pose-specific anchors |
| Lantern | Housing, hanger/pivot, emission mask and local light texture | Preserve the concept's glass, ironwork and local highlights at scene scale |
| Clock and board | Clock face, hands, board face and lettering, supporting structure | Match the composition; retain readable markings and lettering |
| Bench and cat | Bench rear/front pieces, cat rest clip, optional tail/ear clip, sleep glyphs | Preserve bench construction and the cat's skeletal detail |
| Vegetation | Attached hanging clusters with their own loops | Match the architecture's pixel density; pad for moving tips |
| Souls | A small set of readable ghost silhouettes and loop frames | Size by depth lane and composition |
| Atmosphere | Tileable mist and a few ember sprites | Small effect cells or a shallow mist strip |
| Presentation | A grid-appropriate logo export and native menu states | Preserve the Underworld wordmark and established focus treatment |

These sizes are guides for the first layout, not permission to rescale mismatched assets independently. If a silhouette needs more room, expand its transparent cell while preserving its apparent scale.

### Pose variants

Keep the standing, sitting, leaning, and empty-platform scene ideas. Produce **standing first**. Add the other poses after the pilot establishes the art and animation quality.

A visit selects a complete compatible preset. It should not randomly switch the hero's pose while the player is reading the menu. The empty-platform version must work without hero pixels, hero emission, or a leftover hero shadow.

## 6. How we make it

### Step 1 — Lock the visual reference

Use the current artwork and the [Cyberundead style guide](../public/assets/STYLE.md) to produce a new still study in the original's richly illustrated pixel-art finish. Include a full-scene composition sketch and a detailed hero/lantern/platform crop at the proposed art resolution. Use the same lighting across the parts.

Compare the menu hero with the current gameplay hero for identity: proportions, skull/ribs, flame shape, cloth and boots. Menu presentation can have a different apparent size; it should still be recognisably the same character.

**Deliverable:** A still composition and detailed corner, with a layer breakdown and shared colour ramps. Compare directly with the original for texture, character detail, depth and light. Establish the visual finish before making animation sheets; record the chosen resolution and figure size.

### Step 2 — Build the still platform corner

Draw the standing hero, lantern, platform patch and contact shadow as separate assets. Assemble them in a small preview at 1× and at common browser sizes.

This is the first quality test. The parts must already look as if they belong together before animation is added. Check anatomy, material treatment, light direction, attachment points and the hero's contact with the ground.

**Deliverable:** A cohesive still corner with a labelled layer breakdown.

### Step 3 — Animate that corner

Produce the hero's flame and cape clips, restrained body idle, lantern movement/light, and a few embers. Export a stable still poster from the same approved assets.

Review multiple complete loops, including their boundaries. Check the flame and cloth together, then independently. Test a few playback rates instead of assuming the first rate is correct. Fix drift in the drawings or frame placement rather than moving the character's world position to conceal it.

**Deliverable:** A running pilot and contact sheets of its frames. The hero's ground contact and lantern's hanger remain fixed.

### Step 4 — Build the surrounding station

Expand the approved style into the city, bridges, platform, clock, board, bench, cat and vegetation. Add each group to the assembled preview as it is made. Keep checking the shared scale and light direction.

Introduce atmosphere last. Mist, bloom and particles should support finished shapes; they should not hide inconsistent drawing.

**Deliverable:** The complete standing menu scene with independent animation clips and a matching still mode.

### Step 5 — Add variants and integrate

Produce sitting, leaning and empty-platform presets using the established scene and art rules. Connect the replacement assets to menu selection and lifecycle handling. Replace the interim deformation renderer once the new scene is complete enough to take its place.

Preserve working Play/Continue, Options, Controls, keyboard focus, editor links, sound preferences, and menu music behaviour. Check returning from a paused run as well as initial loading.

**Deliverable:** The replacement menu in the app, with a standalone animation preview and verified motion settings.

### Human and AI collaboration

AI can help produce style candidates, asset drafts and animation drawings. Use the approved reference sheet for every asset batch. Request one asset or compatible clip at a time, rather than asking for a finished flattened scene and attempting to separate it afterwards.

Human review decides whether the character, atmosphere and movement feel right. Pixel cleanup and export preparation must preserve consistent shapes, colours, perspective and anchors. Programmatic packing can arrange frames and validate dimensions; it should not invent missing poses or treat a numbered grid as proof of a usable animation.

Save prompts, references, selected versions and review notes. Review actual source pixels on both dark and contrasting backgrounds to verify transparency and edges. Compare an asset in the assembled scene before marking it ready.

## 7. Export and implementation contract

Use a versioned replacement folder, proposed as `public/assets/mainmenu/v2/`, with frame/atlas metadata alongside the PNGs. Keep editable sources or source frames, generated originals where used, and reproduction instructions. Existing concept art remains available as reference.

Each exported clip needs:

- A stable asset/clip ID, version, image path, sheet dimensions and exact frame rectangles.
- Per-frame duration and loop/hold behaviour; do not infer timing from file names.
- A fixed root anchor for that clip and named attachment points where needed.
- A full-frame transparent RGBA export, including enough space for moving edges.
- Light-mask and occlusion references where those are part of the asset.
- A compatible still/poster frame and provenance notes.

A seated pose needs a seat contact and a separate ground/shadow contact. A lantern needs its hanger pivot. The unified skull/fire clip needs a neck attachment in the body's coordinate space. Standing and leaning cape layers need a shoulder attachment; seated cloth stays in the body drawing beneath the pelvis and thighs. Keep these values in metadata rather than spreading unexplained offsets through drawing code.

This is a proposed data contract; it is not an existing loader API or a requirement to build a general animation framework.

### Runtime behaviour

The menu renderer reads scene and clip metadata. It advances cosmetic animation time independently of gameplay and draws in the planned depth order. Main controls and dialogs stay in the existing DOM/Lit menu.

Different sprite clips can run at different frame rates while scene movement and rigid-part transforms use display-frame timing. On a slow frame, select the pose for the elapsed time without replaying every missed drawing. Cap ambient object counts and avoid allocating textures or decoding assets in the frame loop.

Cache stationary layers. Redraw moving sprites and small effects where practical, and profile the assembled scene before adding more. Decorative asset failures must leave the menu usable with its still presentation.

## 8. Window size, motion settings and lifecycle

Scale the scene uniformly with nearest-neighbour presentation, preferring integer scale factors when they fit. Keep the complete important composition visible; use a matching dark surround when the window's shape leaves extra space. Do not stretch pixels or crop the hero, cat, or controls to fill a window.

Menu text remains responsive DOM content. At narrow/portrait sizes, stack the logo and actions in a readable upper area and show the fitted scene below or behind the quieter part of the layout. The text must not shrink to the art's pixel scale. Check wide, tall and short windows explicitly.

| Setting/state | Behaviour |
| --- | --- |
| Automatic | Follow the system's reduced-motion preference, including Windows animation settings |
| On | Explicitly enable the menu animation even when the system asks for reduced motion |
| Off / reduced Automatic | Show the composed still poster, with immediate focus and hover feedback retained |
| Reduced Automatic detected | Explain why the scene is still and offer a clear Enable animation control |
| Hidden tab or gameplay | Stop decorative updates; no catch-up animation when the menu returns |
| Visible menu beside another window | Keep ambient animation running while the menu remains visible |

Preserve the selected preset while opening dialogs or resuming a menu visit. Dispose of frame scheduling and listeners cleanly. The menu must never advance the player's level, consume resources, or introduce another game simulation.

## 9. Review checklist

### Visual coherence

- [ ] The scene retains the original's rich illustrated pixel art, material detail and atmospheric depth.
- [ ] Hero, props, scenery and effects share deliberate pixel treatment and colour ramps.
- [ ] The hero matches the established skeletal identity at actual display size.
- [ ] The left-side menu is readable without a heavy overlay hiding the scene.
- [ ] Cyan and magenta lighting agree with the scene's light sources and ground contacts.
- [ ] The complete still composition works before effects are enabled.

### Animation quality

- [ ] Flame, cloth and resting poses have clear drawings and clean loop boundaries.
- [ ] Feet, cloth attachments, clock pivot, lantern hanger and vine roots stay correctly registered.
- [ ] No duplicated moving objects, exposed holes, clipping, matte edges or moving texture seams.
- [ ] Motions have different rhythms and do not all pulse or restart together.
- [ ] Cat sleep marks and distant souls are readable without distracting from the main actions.
- [ ] The scene remains comfortable to watch for at least a minute with the soundtrack playing.

### Integration

- [ ] Standing, sitting, leaning and empty presets all compose correctly.
- [ ] Automatic, On and Off behave clearly under both reduced-motion states.
- [ ] Hidden/gameplay states stop decorative work and return without a time jump.
- [ ] Keyboard focus, dialogs, Continue, New game and music retain their existing behaviour.
- [ ] Sprite bounds, metadata, timing and transparency pass export checks.
- [ ] Common browser sizes and both Chromium and Firefox are reviewed.
- [ ] The assembled scene has been profiled; additional atmosphere fits its measured budget.

## 10. First production deliverable

First make **a new still corner with one detailed standing hero, one lantern, a platform patch and their light/shadow treatment**, alongside a composition sketch. Use the original concept's illustrated pixel-art richness as the visual reference. Review that finish before producing the flame/cape/lantern animation.

Leave the city expansion, cat, clock, additional poses and rare events until this corner establishes a convincing shared style. Its source assets, frame contact sheets, still composition and running preview become the reference for the rest of the menu.

## 11. Existing animation study and corrected next step

The [standalone pilot](../menu-pilot.html) assembles newly generated hero body, flame, cape, lantern, hanger and platform assets. Its coarse sprite treatment does not establish the intended menu art direction. Preserve it as an animation study for attachments, planted feet, authored flame/cloth timing, local lighting and motion controls. [Asset notes](../public/assets/mainmenu/v2/README.md) include unchanged source generations, exact prompts, frame contact sheets and repeatable exports.

Working choices in this pass are a 640×360 scene, a shared 32-colour palette, a 72 px body with a complete flame silhouette of roughly 100 px, six upper-body idle drawings, eight flame drawings, and eight cloth drawings. The boots use a held lower-body component so the new idle drawings do not change the stance. The flame and cape have registered attachments; the lantern has an exported hanger pivot. Local light/shadow and still/motion modes are available in the preview.

These dimensions and palette describe the study only. The next visual reference returns to the original's detailed illustrated pixel art, using section 10's still deliverable. Reuse sound animation methods where they fit the new artwork; do not expand the study's coarse visual style into the full city. Preserve existing assets and prompts as provenance. The existing title menu remains the interim implementation.

### Illustrated studies · v3

The [new still-study viewer](../public/docs/main-menu-art-study.html) presents a full composition and a closer hero/lantern/platform corner in the richer illustrated direction. [Artwork and exact prompts](../public/assets/mainmenu/v3/README.md) are preserved in a separate versioned folder. The viewer includes the original station reference and a planned animation-layer breakdown.

These are flattened visual references, ready for review of detail, proportions, material treatment and lighting. The close corner is a detail study rather than the final figure scale. Separate production layers, authored animation frames and integration remain subsequent work; the studies do not establish art approval by their presence.

## 12. First integrated illustrated scene

Following approval of the illustrated studies, the [main menu](../index.html?menuScene=watcher) now uses new production layers. The [production viewer](../menu-production.html) shares its drawing code and provides pose selection, pause/reset, frame stepping and a time scrubber. [Assets, exact prompts and export instructions](../public/assets/mainmenu/v3/production/README.md) are saved alongside the originals.

The working native canvas is 1672×941. A clean city backing and transparent platform/prop layer preserve the original's detailed illustrated finish. The hero has separate standing, seated and leaning body drawings, plus an empty-platform preset. Eight flame drawings, eight cloth drawings, four cat drawings, four foliage drawings and four spirit drawings provide changing shapes with registered roots and individual holds. The lantern housing hangs from an exported pivot. Clock hands, departure lettering, contact/cast shadows, local light, embers and sleep marks are separate presentation passes. Four matching still posters provide fallback when artwork or decorative rendering fails.

The old painting-deformation renderer is removed. Native sources retain their colour detail; there is no 32-colour conversion. Export preparation crops, registers and packs drawings, preserving unchanged generated originals. A one-row-short foreground is padded with transparency to match the common canvas. Static scenery remains in image layers and the cosmetic renderer paints at most 30 times per second. Hidden/gameplay states freeze its clock, and Automatic/On/Off retain the existing reduced-motion behaviour and explicit override.

Body poses are held in this pass; additional body-idle drawings remain polish work. Distant mist and city light are painted into the stationary backing; animated atmosphere/window masks remain later additions. The full composition, grounded contacts, all four presets, source transparency, loop transitions and browser layouts have received implementation review. Continue evaluating comfort and drawing continuity through human review rather than treating export checks as an art-quality verdict.

### Head and seated-cloak revision

Review found the independent fire layer too erratic and visually detached from the skull. It is superseded by a unified skull/neck/fire atlas: eight connected drawings with a held skull/neck rectangle and modest upper-tip changes across a one-second loop. The old bare skull is excluded from torso exports, the collar covers the new neck join, and free embers are removed. New source art, exact prompts and packing measurements are preserved with the production assets.

The seated hero now has a purpose-drawn cloak falling from the shoulders onto the bench, compressed beneath his hips/thighs and hanging along the bench front. Its body and settled cloth are one held component. Only standing and leaning retain the separate breeze clip. These decisions supersede the earlier independent-flame and shared-cloak proposals for the active production scene.

### Punk wardrobe and engulfing mane · v3/v4

The user reaffirmed `character.png` as the authority for the protagonist's punk identity. New neck-down drawings for all three poses restore a studded black leather biker jacket, metal lapels/shoulder spikes, zips, chain and heavy boots. The seated drawing integrates the cloak beneath his hips/thighs. Shared body scale, collar sockets and boot contacts preserve placement.

The user further clarified that a large wild mane of flames consumes the whole head. The active v4 head replaces the compact v3 crest with broad upward/backward tongues wrapping the skull, brow, temples and jaw. Face, neck and flame remain one pixel-art component. The face/root is held; upper tongues and internal highlights flow gently while preserving the large mane's volume. Exact prompts and all original versions remain with the production assets. These character assets supersede the later adventurer costume while retaining the approved station's illustrated pixel-art finish.

## 13. Gameplay-reference rebuild · v5 · current

The user rejected the character reinterpretations and directed the menu rebuild to the sprites currently used in gameplay. `AssetLoader` loads `character-animations-v2.png` with the `character-aim-v1.png` companion. These live assets now govern the face, flame, costume, proportions and pixel treatment.

The standing preset reads the live gameplay atlas directly: all six idle frames at 125 ms each, using the source rectangles and foot anchors from `CharacterAtlas.ts`. No replacement standing image or separate skull/fire/cloak assembly is used. Seated and leaning are complete six-frame character drawings generated using only the gameplay idle strip as reference. The seated cloak remains beneath the pelvis and thighs; settled support pixels are held through the loop. The scene viewer shows the actual gameplay strip beside the new pose sheets.

The renderer now draws the whole character at once, with metadata for frame timing, source roots and a shared display scale. It retains existing station layers, prop animations, motion settings, shadows, all four presets and fallback posters. Earlier v1–v4 character attempts remain preserved as historical sources and are excluded from the active scene. Their original prompts/provenance are retained; they do not guide further character work.
