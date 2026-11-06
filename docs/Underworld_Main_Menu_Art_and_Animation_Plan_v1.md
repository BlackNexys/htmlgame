# Underworld — Main Menu Art & Animation Plan

**Version:** 1.0  
**Date:** 6 November 2026  
**Status:** Agreed direction; production values below are proposed starting points.  
**Scope:** A new menu scene built from purpose-made pixel-art assets. The first platform-corner pilot is available for review; the full replacement scene remains in production. See section 11.

> A restless soul waits at a station where the departures are eternally delayed. The city feels enormous. The small things around them are still alive.

## 1. The direction

Use the existing station artwork as **concept art**. Preserve its atmosphere, composition, character identity, and dry humour. Build a new scene whose assets are designed for animation from the beginning.

The hero, scenery, props, light, and effects should share one pixel scale and one visual language. Movement should come from authored sprite sequences and deliberately separated moving parts. The current cutout/deformation pass is an interim experiment and is superseded as the production approach.

### Agreed

- Keep the underworld station: deep stone architecture, bridges, rails, strange machinery, cyan light, and magenta vegetation.
- Keep the lean skeletal protagonist, exposed skull and ribs, magenta soul-flame, burgundy scarf/cape, dark fitted clothing, and strapped boots.
- Build the menu as a cohesive scene, with animation considered while drawing each asset.
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

### Pixel scale

Start with a **640×360 logical scene**. At 1280×720 and 1920×1080 it can scale by exactly 2× and 3×. This is a menu-art proposal, separate from the game's existing 960×576 simulation view.

Target a hero approximately **96 logical pixels tall including the flame**, with enough space in the source cell for cloth and flame tips. Start tests with a 128×160 character cell. The visible figure size matters more than the amount of transparent padding.

All assets must be reviewed together at 1×. A highly detailed lantern and a broadly drawn hero will not become cohesive through scaling. Draw intentional pixel clusters, limit small texture marks, and preserve clear silhouettes.

Export at the chosen logical pixel scale. A large generated illustration reduced with nearest-neighbour filtering is a draft that needs inspection and cleanup, not an automatic pixel-art finish.

### Palette and materials

Build one small master palette, initially around **24–32 colours**, including shared ramps for stone, bone, iron, burgundy cloth, cyan emission, and magenta flame. Transparency is separate from the palette count.

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

Draw stable material shading into the sprites. Export small emission/light masks for the parts whose brightness changes. Animate those masks gently rather than pulsing the whole picture.

Boots and props need contact shadows. The hero's faint cast shadow extends away from the lantern along the platform plane. Each pose gets an explicit ground contact; a seated pose also needs a seat anchor. Flame flicker must not make the hero appear to float.

## 4. What is animated

The station should have several rhythms: quick flame motion, slower cloth and resting poses, very slow atmosphere, and occasional passing spirits. They should not all restart together or share an obvious beat.

The following frame counts and rates are starting targets. Use per-frame holds when they improve the movement. A longer sheet is useful only when its drawings describe better motion.

| Element | Movement | Proposed production approach | Timing and limits |
| --- | --- | --- | --- |
| Hero's body | A restrained idle: small settling of shoulders or posture | 4–6 authored poses with deliberate holds; planted boots | A quiet 3–5 s cycle, not constant bobbing |
| Soul-flame | Tongues stretch, separate and curl; the core remains attached to the skull | 8–12 drawn frames, initially about 12 fps; separate flame layer | Continuous; test the last-to-first transition |
| Scarf/cape | A breeze travels from the attachment toward the loose tips | 6–8 drawn frames with a stable neck/shoulder seam | Slower than the flame; never rotate the entire torso |
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
| Distant city | Sky/void, far city and selected light masks | 640×360 layers |
| Station depth | Bridges, rails and architecture, separated where depth requires | 640×360 layers; overscan only if movement requires it |
| Platform corner | Platform/rear structure and separate foreground occluders | Within the shared scene grid |
| Hero, standing | Body idle, attached flame, attached cape, shadow/light masks | Start with aligned 128×160 cells |
| Hero, other poses | Seated and leaning variants, each with its own loops and contacts | Same pixel density; pose-specific anchors |
| Lantern | Housing, hanger/pivot, emission mask and local light texture | Around 48×64, adjusted after the scale test |
| Clock and board | Clock face, hands, board face and lettering, supporting structure | Around 64×64 for the clock; board sized for readable text |
| Bench and cat | Bench rear/front pieces, cat rest clip, optional tail/ear clip, sleep glyphs | Around 64×32 for the cat |
| Vegetation | Attached hanging clusters with their own loops | Typically 32×64 cells |
| Souls | A small set of readable ghost silhouettes and loop frames | Typically 32×48 cells |
| Atmosphere | Tileable mist and a few ember sprites | Small effect cells or a shallow mist strip |
| Presentation | A grid-appropriate logo export and native menu states | Preserve the Underworld wordmark and established focus treatment |

These sizes are guides for the first layout, not permission to rescale mismatched assets independently. If a silhouette needs more room, expand its transparent cell while preserving its apparent scale.

### Pose variants

Keep the standing, sitting, leaning, and empty-platform scene ideas. Produce **standing first**. Add the other poses after the pilot establishes the art and animation quality.

A visit selects a complete compatible preset. It should not randomly switch the hero's pose while the player is reading the menu. The empty-platform version must work without hero pixels, hero emission, or a leftover hero shadow.

## 6. How we make it

### Step 1 — Lock the visual reference

Use the current artwork and the [Cyberundead style guide](../public/assets/STYLE.md) to produce a small shared reference sheet. Show the hero, lantern, platform materials and cat together on the proposed pixel grid, with the same lighting.

Compare the menu hero with the current gameplay hero for identity: proportions, skull/ribs, flame shape, cloth and boots. Menu presentation can have a different apparent size; it should still be recognisably the same character.

**Deliverable:** A palette and scale sheet, plus a simple composition layout. Record any changes to the proposed resolution or figure size before making animation sheets.

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

A seated pose needs a seat contact and a separate ground/shadow contact. A lantern needs its hanger pivot. Flame and cape layers need attachment coordinates in the same character space as the body. Keep these values in metadata rather than spreading unexplained offsets through drawing code.

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

- [ ] Hero, props, scenery and effects share a deliberate pixel scale and palette.
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

Make **one standing hero, one lantern, one small platform corner, their light/shadow treatment, and the flame/cape/lantern animation**.

Leave the city expansion, cat, clock, additional poses and rare events until this corner establishes a convincing shared style. Its source assets, frame contact sheets, still composition and running preview become the reference for the rest of the menu.

## 11. Production progress · first corner

The [standalone pilot](../menu-pilot.html) now assembles newly generated hero body, flame, cape, lantern, hanger and platform assets. The original concept paintings are references only. [Asset notes](../public/assets/mainmenu/v2/README.md) include unchanged source generations, exact prompts, frame contact sheets and repeatable exports.

Working choices in this pass are a 640×360 scene, a shared 32-colour palette, a 72 px body with a complete flame silhouette of roughly 100 px, six upper-body idle drawings, eight flame drawings, and eight cloth drawings. The boots use a held lower-body component so the new idle drawings do not change the stance. The flame and cape have registered attachments; the lantern has an exported hanger pivot. Local light/shadow and still/motion modes are available in the preview.

This is the first candidate for visual review, not a declaration that the art style or every loop is final. Review its native-size composition, material consistency and attachments before expanding into the city, other props or alternate poses. The existing title menu remains the interim implementation.
