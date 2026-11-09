# Underworld · Confluence menu production plan

**Date:** 9 November 2026  
**Status:** First production scene implemented. The planning estimates below remain as design history; actual exports and timing are recorded in the [production asset notes](../assets/mainmenu/confluence-v1/README.md).

**Latest visual revision:** The user requested removal of the Eternally Delayed sign. The production plate and fallback poster now omit the sign assembly and its attached small lamp; the lettering/refresh pass and preview marker are removed. Sign references below belong to the preserved original plan and concept.

**Implemented:** The default menu now runs the assembled canal-side scene. Cole uses eight complete frames at 175 ms (1.4 s), the cat eight at 350 ms (2.8 s), canal material eight at 190 ms (1.52 s), and the combined authored outfall/impact eight at 80 ms (0.64 s). Shared support pixels, traced masks, phase-linked reflected light, sparse train visits and the real menu controls are connected. The [production viewer](../../menu-production.html) provides layer solo/hide, contacts/masks, frame stepping and a 90-second timeline. Original proposed sixteen-frame counts and asset boundaries below were refined against the actual drawings.

The menu is a quiet corner of Confluence. Cole waits beneath the blue-glass canopy, the cat sleeps beside him, and water and railways carry on around them. Keep the intimate foreground and immense city from the [approved study](../assets/mainmenu/confluence-study-v1/menu-concept-v1.png).

The first production scene has one seated composition. Its moving parts are authored separately from the start. The concept remains an untouched visual reference; it contains characters, effects and menu lettering that must be absent from the clean environment plates.

Use the [interactive breakdown](confluence-menu-breakdown.html) to inspect the proposed regions. Its [JSON inventory](../assets/mainmenu/confluence-study-v1/production-plan-v1.json) is shared with that viewer. Regions describe where elements appear in the concept, **not final crop rectangles or existing separated assets**.

## 1. Preserve the approved composition

Work in the concept's **1672 × 941** scene coordinates. Keep the fine pixel clusters, wet dark masonry, gunmetal, electronic fittings, blue glass, cyan water, small amber lamps and magenta accents. Reuse current Confluence materials where perspective and detail match; draw dedicated matching pieces where they do not. Avoid stretching a front-facing gameplay module into an oblique foreground structure.

The left third stays quiet and supports the real logo and menu controls. Cole remains large enough to carry the right foreground: the approved study shows roughly **410–440 scene pixels of apparent height including the flame**. Preserve that scale when drawing the new seated sequence. A small gameplay cell enlarged to fill this space is a reference for identity, not an automatic production export.

Keep the camera fixed in the first version. Depth comes from the composition, occlusion, water and distant traffic. The title and controls remain DOM elements with their existing focus, keyboard, saved-game and option behavior. The study's generated labels do not define new application behavior.

## 2. What we need to draw

The assembly follows this order. Light and reflection passes belong with their receiving surfaces, rather than all being placed over the finished picture.

| Order | Asset group | Contents and boundaries |
| --- | --- | --- |
| 1 | City plate | Complete sky, distant buildings, bridges, banks and fixed windows. Empty train track; no foreground actors, water shimmer, text or moving mist baked in. |
| 2 | Distant train | Small complete train on transparent pixels. Bridge parapets and station columns supply separate occlusion masks. |
| 3 | Atmosphere | Restrained mist patches behind the station and above the canal. Their masks keep the menu and Cole's face clear. |
| 4 | Station architecture | Left wall/arch, canopy, columns, pipes and fixed lamp/board housings. Exposed surfaces are complete behind removed actors and effects. |
| 5 | Canal surface | Dark water bed, authored current/highlight material and a shoreline mask. The diagonal bank defines the water boundary. |
| 6 | Outfall and impact | Water ribbon below the pipe mouth, plus a separately registered splash at the surface. The fixed mouth rim covers the stream's top edge. |
| 7 | Quay | Complete paving, bench supports and ground beneath the actors. Keep wet material texture, but reserve animated reflection patches. The bank lip covers the water edge. |
| 8 | Wet-ground reflections | Masked cyan, amber and magenta highlight patches. Cole's magenta response follows his flame; paving and dry areas occlude it. |
| 9 | Rear furniture | Bench back and seat, rear railings and terminal housing. The seat must continue beneath Cole and the cat. |
| 10 | Contact and local light | Tight seated, boot and cat contact shadows; restrained lamp and flame light on the relevant surfaces. |
| 11 | Cole | Complete seated character in every frame: face, connected fire, scarf, jacket, hands, legs, boots and cloak beneath his weight. |
| 12 | Cat | Complete sleeping cat frames. Bench contact and planted paws stay registered. |
| 13 | Foreground furniture | Only bench arms, rails and small edges that genuinely pass in front of the actors. Cut openings preserve legs, hands and faces. |
| 14 | Small local details | Terminal display, board lettering, selected foliage tips and sleep marks at their proper depth. |
| 15 | Interface | Real logo, menu actions, focus treatment and dialogs. No decorative effect crosses the labels. |

Some groups need several exports. They are drawing responsibilities, not a requirement for fifteen full-resolution PNGs. Crop local assets tightly with room for their complete motion. Keep shared masks and anchors in scene coordinates.

### Contacts to establish before animation

| Contact | Starting estimate in the concept | Requirement |
| --- | --- | --- |
| Cole's seated hips | (1300, 646) | Stable seat root through every complete-character frame |
| Boots on paving | Around (1205, 775) and (1305, 780) | Soles and contact shadows remain planted |
| Cat on bench | Around (1510, 638) | Lower body and bench contact remain stable |
| Outfall mouth | Around (543, 568) | Water begins behind the fixed pipe lip |
| Outfall impact | Around (573, 698) | Falling water and splash share the same surface contact |
| Terminal screen | Around (1114, 562) | Display fits inside the physical screen |
| Departure board face | Around (1464, 274) | Text stays within the panel and follows its perspective |

These are layout estimates to refine in the still assembly. Mark roots in source files and export metadata; do not discover them by guessing offsets in the renderer.

## 3. How each part moves

| Element | First production motion | Starting timing |
| --- | --- | --- |
| Cole's fire and loose scarf | Authored changes within complete-character frames; flame continuously engulfs the crown/back of the head. Two flame cycles across one slower cloth cycle. | 16 whole frames × 100 ms = **1.6 s** |
| Cole's body and lower cloak | Resting hands, hips, boots and compressed cloak folds held steady during that loop. | Stable throughout the loop |
| Cat breathing | Small authored expansion of ribs/upper body; paws and lower contact held. | 8 frames × 350 ms = **2.8 s** |
| Sleep marks | Small pixel z/Z marks rise and fade from the cat; never enlarge into a speech bubble. | **4–5 s**, offset marks |
| Canal currents | Slowly advancing pixel highlights, interrupted by dark gaps and bank masks. Current direction remains coherent. | 8-frame material loop around **1.2–1.6 s**, with slow masked travel |
| Outfall ribbon | Narrow downward flow with a stable source and width; no swaying pipe or stretching scenery. | 8 frames × 80 ms = **0.64 s** |
| Splash | Small irregular impacts at the waterline, offset from the ribbon loop. | 6 frames × 100 ms = **0.6 s** |
| Reflections | Broken horizontal bands on water; smaller masked patches on wet paving. Drive flame-related brightness from Cole's current frame. | Water-led motion; restrained brightness variation |
| Mist | Very slow movement of a few authored patches, clipped to the canal/distance. | **18–30 s** |
| Lamps and terminal | Steady light with occasional tiny changes in intensity or a screen indicator. Housings remain fixed. | Gentle **6–10 s** variation; screen detail less often |
| Departure board | Stable, deliberately rendered lettering: **ETERNALLY DELAYED.** A brief refresh redraws the same message. | Refresh around **25–40 s**, no flashing/strobing |
| Distant train | Crosses one bridge, disappears behind structures, then leaves the shot. | **12–18 s** crossing; **25–45 s** quiet gap after exit |
| Foliage | A few loose tips move slightly; roots, stems and heavy hanging masses remain supported. | **3–5 s**, small phase offsets |

Most of the picture stays still. Water is the continuous environmental motion; Cole's fire is the main character motion. The train and display reward waiting. They should not all announce themselves together.

Use independent channels and explicit frame holds, rather than one long movie or a global loop that synchronizes every object. Event schedules are seeded once per menu visit and are reproducible while scrubbing. Their quiet gaps use decorative elapsed time, not wall-clock timers.

### Cole stays one element

Draw Cole at the new scene's apparent scale, using the canon sheet and current character kit for identity. Keep the black face, paired magenta eyes, ivory bone framing, connected flame, studded jacket, burgundy cloth, strapped boots and cyan vial. The approved seated silhouette is the pose reference.

Use whole-character frames even when only fire and a loose cloth edge change. A cell up to **512 × 512** is a starting envelope, subject to the actual drawing and generous motion margins. Register by the seat and boots. Preserve the lower cloak/support pixels while allowing its loose edges to move above those contacts. The fire can change shape without appearing detached from the head.

Inspect a small set of authored keyframes before expanding to sixteen. Match held anatomy and costume precisely between them. Small body breathing, a blink or a change of gaze can be added later as an authored whole-character variation with compatible entry/exit poses. They are outside the first loop, avoiding a large combination of independent head, cloth and body states.

### Reflections must have a source

Separate wet paving from its changing light. Cyan canal light, warm lamps and Cole's magenta flame have different locations and strengths. Keep Cole's feet and seat shadows steady while his fire's reflected brightness changes subtly.

Use the same animation phase and emitter metadata for Cole and his local reflection. Clip water reflections to the canal and ground reflections to wet paving. A flat vertical mirror of the entire character pasted onto an angled floor will not match this perspective; author the appropriate ground-plane patch. Remove the concept's baked bright moving reflections from clean plates before adding these passes.

## 4. How we make the assets

1. **Lock the still assembly.** Establish the world without UI lettering, actors, train or moving effects. Draw complete surfaces behind every removable element. Assemble clean environment groups, bench, masks and one canon Cole/cat pose at the approved scale. Check their contacts and perspective together.
2. **Prove the seated corner.** Create a few complete Cole keyframes and the cat's breathing keys. Inspect at native scale, on white and dark backgrounds, and with bench-front occluders enabled. Expand the loops only after the contacts and identity hold.
3. **Build water and its masks.** Add current material, outfall ribbon, splash and reflection patches. Test them with the actors hidden, then restore Cole and ensure the magenta reflection follows his actual phase.
4. **Add quiet city life.** Introduce the distant train, localized mist, foliage, indicator and board-refresh channels. Check that they remain secondary to Cole and menu readability.
5. **Export through the production renderer.** Pack registered frames, save source bounds/anchors/holds/masks, and generate the matching time-zero fallback poster from the assembled scene. That poster excludes the DOM logo and menu labels.
6. **Integrate the new scene.** Connect the scene to the title lifecycle, persistent motion preference and menu controls. Keep one seated preset until this composition is cohesive.

Use the built-in image generator for new pixel-art drawings and creative revisions. Preserve every selected source and exact prompt in a versioned production folder. Deterministic export scripts may crop, register, prepare transparency and pack authored pixels. They do not supply missing scenery, invent poses, bend a still image, or detach Cole's fire.

Production assets now live in `public/assets/mainmenu/confluence-v1/`, with sources, exact prompts, exported plates/clips, embedded mask geometry, validated scene metadata, review sheets and a matching poster. This study and the previous menu's sources remain preserved as history.

## 5. Renderer changes and reuse

The current `TitleScene` already owns visibility, a cosmetic clock, the user's Automatic/On/Off motion preference and still-image fallback. Retain those behaviors, including **On overriding Windows reduced motion**, the issue we previously encountered. The existing `artFrame` logic provides explicit per-frame holds and can be reused.

The current `TitleArt` contract is specific to the old composition: it requires three hero poses, a clock and fixed prop fields. Introduce a versioned ordered-layer contract for Confluence instead of filling those old fields with placeholders. It needs static plates, authored clips, masks/occluders, anchors, per-frame emitters and sparse event tracks. The planning inventory is not that runtime manifest.

Use one decorative canvas, inserting cached static groups between moving passes in the required order, with a matching poster beneath it. Keep controls and dialogs above the scene in the DOM. The current single foreground image below every moving element cannot express all the new water/bench overlaps on its own.

The menu owns its time, event seed and placements. Reuse pure texture/frame helpers where suitable. `ConfluenceWaterRenderer` is useful reference for masked flowing textures, but its current camera and world geometry assumptions must not be imported as a live level dependency. The menu must not create a `World`, load level JSON, run collisions, instantiate enemies or write campaign saves.

Aim for at most **30 decorative paints per second**; clips keep their individual rates. Cache stationary groups and crop local atlases. Start with an art-memory target of **64 MiB decoded**, measuring actual dimensions and performance before adjusting quality. Rendering should allocate no new full-scene surfaces per frame.

Hidden tabs and gameplay freeze all decorative time, including train gaps. Resuming drops elapsed wall time. Off/reduced motion presents the composed time-zero scene, including stable water and light. Missing optional mist/train/light art may omit that detail; missing essential art or a failed decorative context uses the matching poster. Menu actions remain usable in every case.

The existing cover-style scene fit should be checked against this composition. Preserve its shared aspect ratio and transform. On narrow screens keep the DOM controls readable first and deliberately frame Cole; do not independently stretch scene layers or assume both full city and full foreground will remain visible.

## 6. Preview and acceptance

Use the same renderer for the production menu, its asset viewer and poster export. The viewer needs pause, frame stepping, per-layer solo/hide, mask and anchor overlays, a motion-preference override and a **0–90 second** scrubber with train/board event markers. The current 10-second preview is too short to inspect sparse events.

Before switching the active menu, review:

- The assembled time-zero scene retains the approved composition and fine pixel-art treatment, with one real logo/menu and no baked duplicate labels, actors, water or shadows.
- Cole's face, flame attachment and clothing remain consistent through every frame. Hips, boots, seat folds, cat paws and pipe contacts do not slide. Loop boundaries have no flash or sudden pose jump.
- Bench and railing overlaps are correct. Removing an actor exposes finished scenery. Water/reflections remain inside their masks and continue behind physical lips.
- Brightness remains localized; the whole scene does not pulse. Menu labels stay readable at desktop, ultrawide, portrait and short landscape sizes.
- Automatic, explicit On and Off work, including Windows reduced motion. Gameplay/hidden tabs freeze the scene and resume without train or animation catch-up.
- Missing optional art, failed canvas and matching-poster fallback preserve Play/Continue, keyboard focus, dialogs and sound preferences. Verify fresh and saved-game menu states.
- Export metadata rejects invalid rectangles, anchors, masks and timing. Chromium and Firefox checks cover the assembled menu and actual preference/failure paths; human review covers animation quality.

**First concrete production milestone:** a correctly assembled still with the seated Cole/cat corner animating over masked canal water. Train, mist and display events follow once that small scene holds together.
