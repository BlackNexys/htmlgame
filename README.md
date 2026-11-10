# Underworld action prototype

A browser platformer built with TypeScript and Canvas. Run through the lower passage, fight the undead, and reach the gate at the east end. This is the action foundation for the wider game concept; combat values and enemy behavior are temporary.

## World and story direction

The undead protagonist is searching for their soulmate. The new [Deadways atlas](docs/Worldbuilding/Underworld_Deadways_World_Atlas_v0_1.md) proposes familiar societies built by the dead within an immense alien world, linked by spectral rivers and railways. Undead inhabitants can be neighbours, travellers, or opponents with their own motives. Its eight regions, station geography, ecological interactions, and possible Blacklight continuity remain exploratory rather than established canon or implemented features.

See [worldbuilding and design alignment](docs/Worldbuilding/README.md) for document responsibilities, open decisions, and the available concept art. The Lower Passage remains a mechanics test level. The playable [Last Platform district demo](docs/last-platform-demo.md) now explores the supplied station brief; its setting and writing remain provisional.

## Run locally

Use Node.js 26 LTS (also recorded in `.nvmrc`) and npm. Node.js 22.12 or newer is supported. npm is the package manager for this project; commit `package-lock.json` when changing dependencies.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000 and select **Play** from the title menu. The server listens only on this computer. If port 3000 is occupied, use `npm run dev -- --port 3001`. `npm start` is an alias for the development server.

The game fills the browser window while preserving its 960×576 (5:3) view. Wider or taller windows use letterboxing; the picture is never stretched or cropped. The HUD sits over the play area, and the game page has no document scrolling. The title menu provides Play, Options, Controls, Movement course, and the separate Level workshop. Arrow keys or Tab navigate menus; Enter activates an item.

The default title scene is now the **Confluence canal-side station**, following the approved new composition. Cole sits beneath a blue-glass electronic canopy beside the sleeping skeletal cat. Complete-character frames animate his connected fire and loose scarf while seated contacts remain steady. Masked canal currents, an authored outfall/impact, wet-ground reflections, foliage, small local lights, sleep marks and a sparse distant train give the scene independent motion. The actual logo and keyboard-accessible menu controls sit above the artwork.

The [production viewer](http://127.0.0.1:3000/menu-production.html) uses the same renderer, with pause, reset, frame stepping, layer solo/hide, masks/anchors, a 90-second timeline and a Next train control. [Production artwork, exact prompts and export instructions](public/assets/mainmenu/confluence-v1/README.md) are saved with the assets. The [production plan](public/docs/Underworld_Confluence_Menu_Production_Plan_v1.md), [approved study](public/docs/confluence-menu-study.html) and [planning breakdown](public/docs/confluence-menu-breakdown.html) remain available.

The scene has a fixed 1672 × 941 coordinate space, cached stationary groups and at most 30 decorative paints per second. It fits the existing menu frame and deliberately crops on tall windows; a dark local backdrop preserves control readability. Presentation never advances gameplay. Returning to the menu keeps the existing Continue/New game behavior.

**Options → Menu animation** offers Automatic (the device's reduced-motion preference), On, and Off, remembered on this browser. When Windows/system reduced motion pauses Automatic, **Enable animation** selects On explicitly. Off shows time zero; hidden tabs and gameplay freeze the decorative clock with no catch-up on return. Essential art or decorative canvas failure uses the matching still poster while real menu controls remain usable. Optional train, foliage and reflected-light failures omit that detail.

The earlier illustrated station remains an explicit historical preview at `/?menuScene=watcher`, `/?menuScene=patient-traveller`, `/?menuScene=restless-flame` and `/?menuScene=absent-traveller`, with its [viewer](http://127.0.0.1:3000/menu-production.html?legacy=1). The [earlier animated corner](http://127.0.0.1:3000/menu-pilot.html), [illustrated studies](http://127.0.0.1:3000/docs/main-menu-art-study.html) and their original source assets remain preserved.

**Mechanical Heartbeat** (`public/assets/music/Mechanical Heartbeat.mp3`) loops on the title screen at a moderate volume. If the browser blocks autoplay, a click or key press starts it. It pauses during gameplay and while the window is inactive, resumes when returning to the menu, and follows the remembered **Music and sound** option. Missing music does not prevent play.

Pause offers Resume, Restart level, Options, Controls, and Main menu. Returning to the main menu preserves the current run for **Continue**; **New game** starts a fresh run. Options remember sound and encounter-hint preferences on this browser. Leaving the window still pauses play automatically.

Vite serves TypeScript directly during development and reloads the browser when source files change. CSS updates apply without restarting the game. Run `npm run typecheck` separately for full-source type checking while developing. All game artwork is loaded locally from `public/assets`.

Build and preview the production version with:

```sh
npm run build
npm run preview
```

The build checks TypeScript before bundling. Deploy the contents of `dist/` to any static host; it contains the HTML, compiled JavaScript and CSS, source maps, artwork, and animation preview pages. Relative asset paths support hosting the game in a subdirectory. `npm run preview` serves the built files locally at the same address; it is a local verification server. Generated output is ignored by Git.

Menus and toolbar controls use Blacklight Lit components with a game-owned Cyberundead theme: charcoal surfaces, bone text, magenta player actions, cyan details, and crisp edges. See [UI theme tokens](docs/ui-theme.md) to adjust the palette and [vendor notes](vendor/README.md) to update the local library snapshot.

## Sluice Exchange experiment

Play `/?level=sluice-exchange` for the new standalone stress level: a folded multi-height route, roof loop, crouched culvert, two recovery paths, 891 mounted props and 31 water elements. It uses existing combat and does not modify campaign progress. See the [level guide and whole-world overview](docs/sluice-exchange.md) and the [friction record](docs/sluice-exchange-friction.md).

## Create levels

[Authored scene art](docs/authored-scene-art.md) adds catalog props, structure mounts and separate story-art bounds to the workshop. A scene's environment is explicit and portable across level IDs. The [friction log](docs/level-authoring-friction.md) records the six completed authoring fixes and the remaining assembly-grouping follow-up.

Water is authored through the same workshop and level files. [Water elements](docs/water-elements.md) documents rivers, canals, catch basins, mounted drains and source-to-receiver waterfall connections. Their classes and renderers are independent of level names; effects use simulation time and remain cosmetic.

The [world structure system](docs/world-structures.md) supports free placement, arbitrary rectangle dimensions, concrete structure classes, independent collision/art, socket mounts and foreground layers. Play `/?level=construction-study` for the construction proof. The workshop offers free placement and adjustable snapping, imports legacy maps, and exports schema v2. [Research and later shape stages](docs/flexible-world-geometry.md) remain documented.

Open the separate [Level workshop](http://127.0.0.1:3000/editor.html) to place terrain, decoration, enemies, signs, the player, and the exit. It has an object inspector, undo/redo, direct JSON editing, import/export, local draft recovery, and independent snapshot playtests.

Levels are versioned JSON files under `public/levels`. Export a level there and open `/?level=<id>` to play it. The game loads the requested file when needed; restarting keeps the chosen level. The editor has its own application entry point and does not edit a live game.

All ten shipped maps use schema v2. Run `npm run level:audit` to check their entries, workshop documents and complete playable routes. The [level audit](docs/level-audit.md) lists each map's purpose, preview URL and verification scope.

Humans and agents share the same schema, stable object IDs, and revision checks. Agents can edit files, use `npm run level -- validate <file>` and `npm run level -- patch <file> <changes.json>`, or apply structured changes through the editor's browser API. See [level authoring and collaboration](docs/level-authoring.md) for the format and workflow.

## Controls

| Action | Keys |
| --- | --- |
| Move | A and D or left and right arrows |
| Jump | Space; hold for more height |
| Sprint | Hold Shift while moving |
| Aim up / diagonally | W or Up; combine with left/right |
| Crouch / aim down | S or Down; downward aim while airborne |
| Attack | Hold J or X |
| Interact with nearby NPC/object | F |
| Journey / current lead (narrative study) | K |
| Pause or resume | P or Escape |
| Restart | R |
| Toggle sound | M |
| Collision and movement debug view | F2 |

Jumping includes a short coyote window and input buffer. Push toward a wall while falling to slide; press Space to jump away. Space is the jump key. You can fire while sprinting, jumping, and falling. Direction keys aim in eight directions; with no direction held, shots follow facing. Opposing keys cancel on their axis. Down on the ground crouches and fires horizontally from a lower palm position; crouched movement is a slow creep, including with Shift held. Release Down to stand, or press Jump to stand and jump when there is room. Low ceilings keep the collision body crouched until clear. Up and Down together cancel both the crouch request and vertical aim. Diagonal bolts travel at the same speed as horizontal and vertical bolts, and the muzzle path is checked against terrain.

The game receives keyboard input while its canvas has focus. Switching tabs, leaving the window, or moving focus away pauses it and clears held input and queued actions. Use Resume to continue. Mouse and keyboard controls for pause, restart, and sound are also above the game. The page fits smaller windows; gameplay currently requires a keyboard.

## What is playable

**The Last Platform:** open `/?level=last-platform-demo`. Revision 5 rebuilds the demo around the user’s cyberpunk-with-undead image: a 7,200 × 3,840 district with an upper station/viaduct, Registry gallery and public hall, lower freight exchange, inhabited side rooms, archive works and departure. Roof and canal routes reconnect vertically and horizontally. **F** interacts; **K** opens Journey. Existing movement/combat, immediate saved discoveries and separate study progress remain. The [v3 art kit](public/assets/environment/confluence/v3/README.md) replaces the earlier steampunk-leaning art. The [v5 building kit](public/assets/environment/confluence/v5/README.md) adds continuous background walls, joined corners and floor bands with selected window bays. See `/docs/confluence-environment.html`, `/docs/last-platform-map.svg`, the [rendered whole-level view](public/docs/last-platform-overview-v5.png) and [demo notes](docs/last-platform-demo.md). Pacing, difficulty, audio and final canon still need review.

The [rebuilt preview](docs/last-platform-rebuild.md) is playable at `/?level=last-platform-rebuild`: a new forward route, optional roof loop, lower recovery path and floor-attached construction. It always isolates progress from campaign saves. The previous district remains available for comparison. See the [research blueprint](docs/level-design-research.md), [kit specification](docs/confluence-kit-spec.md) and [rendered rebuilt level](public/docs/last-platform-overview-rebuild.png).

- A scrolling level with low obstacles, raised platforms, eight opponents across six enemy types, and an exit.
- Sprint, variable-height jumps, coyote time, jump buffering, wall slides/jumps, and camera look-ahead.
- A separate [movement course](http://127.0.0.1:3000/?level=movement-course) for practising these mechanics, authored as ordinary level JSON.
- Projectile and terrain collisions, enemy health, player damage, and a brief recovery period after being hit.
- Hit effects, animated character artwork, simple generated sound, and mute.
- Start, pause, defeat, completion, and fresh restart flows.

The movement foundation and the first weapon slice are playable. [Flicker v1.1](docs/Underworld_Flicker_Weapon_Spec_v1_1.md) defines the free standard attack: five shots per second, eight-direction aim, 800 px/s, a maximum 0.9 s flight, and one damage to the first valid target. It works at zero ectoplasm and never interrupts movement. A small animated magenta flame replaces the old test bolt, with separate ignition, enemy, terrain, and shield effects and five short firing sound variations. Ectoplasm starts at 6/12 and recovers +1 on each original enemy's first defeat; revived enemies cannot repeat that reward. Harvesting, caches, other weapons, switching, modifiers, progression, and bosses remain later work. See [the implementation plan](docs/Underworld_Game_Design_and_Implementation_Plan_v1.md) and [movement notes](docs/phase-1-movement.md).

The [Flicker preview](http://127.0.0.1:3000/docs/flicker.html) shows all eight flight directions and the effect sequences, with sound samples. [Atlas metadata](public/assets/weapons/flicker/flicker_atlas.json) describes the 32×32 cells and timing. Missing Flicker artwork falls back to a small procedural flame; unavailable audio remains silent without affecting combat. The original generated source and exact prompt are preserved in the asset folder. Rebuild the packed atlas with `node scripts/pack-flicker.mjs` and audition exports with `node scripts/export-flicker-audio.mjs`.

The hero follows the user’s [canon sheet](public/docs/Underverdenens%20neon-skeletark__has_watermark____has_borders__.png): paired magenta eyes in a black face, ivory bone framing, connected flame, burgundy scarf/cloak, studded fitted jacket, strapped boots and cyan vial. The [v2 gameplay kit](public/assets/hero/canon-v2/README.md) adds eight-pose movement cycles driven by distance, held directional aiming, and shared palm positions for firing. The [original canon kit](public/assets/hero/canon-v1/README.md) retains menu poses and portraits. Shift builds smoothly from 330 to 480 px/s over 0.6 seconds; boot flames grow with speed and leave brief world-space trails. Stopping, reversal, crouch, wall impact and pause clear buildup; jumps carry earned speed. Inspect the [runtime motion review](http://127.0.0.1:3000/hero-review.html) at gameplay size, in slow motion, or frame by frame. Earlier artwork remains preserved.

The [enemy art pack](public/assets/enemies/README.md) provides the six sheets used by the playable roster. Zombies lunge, skeletons charge horizontal shots, ghouls leap, ghosts phase and materialize, wights protect their front, and necromancers reactivate nearby corpses. The level introduces them individually before a small mixed encounter. See [enemy behavior](docs/enemy-behavior.md) for tells, counters, and limits. The [enemy roster preview](http://127.0.0.1:3000/docs/enemy-sprites.html) remains available to compare their animations.

## Neutral NPCs

The new [narrative study](http://127.0.0.1:3000/?level=narrative-study) extends this foundation: inspect a physical transfer ledger, collect an optional Keepsake, hear the attendant react to discoveries, and open the departure route. **F** interacts; **K** opens Journey. Discoveries save immediately and survive death/restart/reload when browser storage succeeds. Stage completion separately unlocks the next destination. The workshop supports interactive objects and conditional NPC scene references; playtests leave campaign saves untouched. Story and layout remain noncanonical. See [narrative architecture, saving and authoring](docs/narrative-system.md).

Open [the NPC study](http://127.0.0.1:3000/?level=npc-study) or choose **Meet the attendant** from the dialogue demo page. Approach the neutral railway attendant and press **F** to start the kinetic exchange. The attendant idles and faces nearby players, takes no combat damage, and can be walked or fired through. Conversations can be repeated; restart resets their per-run state. The workshop now places NPCs with validated scene references, including undo/redo, JSON export and snapshot playtests. See [NPC behavior and architecture](docs/npc-system.md) and [asset notes](public/assets/npcs/README.md).

## Dialogue prototype

Open [Dialogue demo](http://127.0.0.1:3000/dialogue.html), also linked from the title footer, and choose **Play kinetic exchange**. The current direction puts the exchange at center stage: gameplay freezes, the HUD disappears, and one large expressive portrait trades sides with the next speaker. Short replies enter with directional movement, emphatic typography and authored pauses; a faint echo of the previous line connects the handoff. Enter/Space reveals/advances, L opens the log, and Hold, Skip, speed and autoplay controls remain available. Reduced motion removes the animated handoffs.

**Try with gameplay paused** (`/?dialogueDemo=kinetic`) runs it over the frozen Lower Passage and returns focus/control cleanly afterward. The older cinematic (`/?dialogueDemo=1`) and travelling overlay (`/?dialogueDemo=action`) remain comparison tools. Presentation/pacing are scene-level choices; ordinary game URLs have no intro. All study dialogue, the attendant and the traversal fixture remain noncanonical test material, separate from the later demo level. See [dialogue architecture and authoring](docs/dialogue-system.md) and [portrait asset notes](public/assets/dialogue/README.md).

## Code layout

`src/app.ts` creates and starts `Game`. The `Game` controller owns the session, `GameLoop` owns animation-frame scheduling, and `FixedClock` owns simulation timing. `Hud` and `GameMenu` own DOM presentation. `World` coordinates simulation updates while focused classes own collision queries, combat, corpses, and effects. Entities and weapons use capability contracts from `src/interfaces/Simulation.ts` instead of depending on the entire world.

`public/levels/lower-passage.json` defines terrain, spawn points, patrol ranges, and the exit. `src/levels` validates, loads, and compiles level documents. `src/maps/actionLevel.ts` is a synchronous wrapper for simulation tests. `src/editor` owns the separate workshop application. `src/game/config.ts` holds temporary movement and combat settings. Physics uses world coordinates; the renderer applies the camera and scales the canvas through CSS.

The active entities follow the original class structure in `src/components`:

```text
GameElement
├── Wall, Exit, Sign, Camera, Particle, Interactable
├── Projectile
│   ├── FlickerProjectile
│   └── EnemyProjectile
└── Actor
    ├── Character
    ├── NPC
    │   └── RailAttendant
    └── Enemy
        ├── Ghost
        └── GroundEnemy
            ├── Zombie
            ├── Skeleton
            ├── Ghoul
            ├── Wight
            └── Necromancer
```

Each class has its own file. `GameElement` owns bounds and placement, `Actor` supplies shared physical movement, and `Character` composes `PlayerMovement`, `WeaponController`, and damage state. `PlayerMovement` owns fixed-step locomotion, contact state, and jump buffers. `src/weapons/Flicker.ts` owns the starting weapon's definition and manifestation. `Enemy` supplies shared lifecycle and damage hooks. `GroundEnemy` shares the grounded attack cycle and ledge safety. Each concrete enemy owns its special behavior, defenses, tells, and encounter hint. Only `Necromancer` owns a revive budget and corpse-channel state.

`Map` builds terrain, signs, and the exit from level data. `Camera` follows the character and clamps its own view. Projectiles own their movement, lifetime, appearance, and valid targets. `CollisionSystem` resolves their nearest impact; `Combat` applies damage and defeat bookkeeping; `Graveyard` manages `Corpse` instances and reactivation; `ParticleSystem` manages `Particle` lifetimes.

`src/game` groups audio, animation, movement, and simulation systems into focused subfolders. `GameScreen` lives in `src/renderers` and composes its drawing passes. Character, enemy, corpse, projectile, particle, terrain, sign, exit, background, and debug drawing each have a focused renderer. `CharacterAnimation` and `EnemyAnimation` select poses. `EnemyFactory` registers level identifiers with their concrete classes; adding behavior belongs in the class rather than the factory or world update loop.

`AssetLoader`, `Input`, and `Sound` each own one browser service. Stopping a game releases its animation loop, input listeners, menu handlers, and audio context. Starting or resuming a session does not install another loop or another set of handlers.

Corpse reactivation retains the concrete enemy instance and its methods. Only original enemy defeats contribute to the HUD count; reactivated enemies do not award duplicate credit.

`src/interfaces` contains shared geometry, runtime level, input, event, asset, weapon, and scheduling contracts. The obsolete coordinate classes have been replaced by these shared interfaces. The original `src/maps/level0.ts` remains as a level reference. Type checking covers every TypeScript file under `src`. Vite builds the game (`index.html`) and workshop (`editor.html`) as separate entry points into `dist`. Static artwork, JSON levels, the schema, and the HTML preview pages live in `public` and are copied into each build without changing their public URLs.

See [the architecture guide](docs/architecture.md) for responsibility boundaries and where to add a new feature.

## Verify changes

```sh
npm run check
npx playwright install chromium firefox
npm run test:browser
```

`npm run check` runs the simulation tests, full-source type checking, and production build. Simulation tests use Node's test runner with `tsx` to load TypeScript. Browser tests build and serve the production output automatically, exercise both Chromium and Firefox through gameplay and authoring, and save ignored screenshots under `artifacts`. Stop any development or preview server using port 3000 before running them, or set `PLAYWRIGHT_PORT` to an unused port.

Simulation tests cover frame-rate independence, bounded catch-up, fast collisions, jumping, attacks in both directions, wall occlusion, damage timing, cleanup, reset, camera bounds, and completing the real level.

GitHub Actions runs the checks on Node.js 22 and 26, including the Chromium and Firefox browser suite on Node.js 26.

Enemy tests cover committed attacks, horizontal shot locking, line of sight, ghost vulnerability, directional shields, aimed bolt collisions, interrupted reactivation, corpse ownership, finite revive budgets, ledge safety, and fresh world state.

Lifecycle tests cover duplicate loop starts, paused rendering, resume without backlog, stopping during an update, input aliases, one-shot actions, and listener disposal.

For a manual playtest, run and shoot in both directions, jump into a ceiling and against a wall, let an opponent hit you, pause while moving, switch tabs, resize the window, and finish the level. Try another run after both defeat and completion. Check that controls remain responsive and that each hit is clear.

The development sequence and completion criteria are in [the action game roadmap](docs/action-game-roadmap.md).
