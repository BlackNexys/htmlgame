# Underworld action prototype

A browser platformer built with TypeScript and Canvas. Run through the lower passage, fight the undead, and reach the gate at the east end. This is the action foundation for the wider game concept; combat values and enemy behavior are temporary.

## Run locally

Use Node.js 26 LTS (also recorded in `.nvmrc`) and npm. Node.js 22.12 or newer is supported. npm is the package manager for this project; commit `package-lock.json` when changing dependencies.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000 and select **Play** from the title menu. The server listens only on this computer. If port 3000 is occupied, use `npm run dev -- --port 3001`. `npm start` is an alias for the development server.

The game fills the browser window while preserving its 960×576 (5:3) view. Wider or taller windows use letterboxing; the picture is never stretched or cropped. The HUD sits over the play area, and the game page has no document scrolling. The title menu provides Play, Options, Controls, Movement course, and the separate Level workshop. Arrow keys or Tab navigate menus; Enter activates an item.

The title screen uses the supplied GIFs under `public/assets/mainmenu`: an ambient station background, a clean foreground platform, three interchangeable hero poses, and wandering souls. The logo and menu controls sit above these layers. One scene is selected per menu visit—standing, sitting, leaning, or an empty platform—and remains fixed until leaving. Normal selection avoids the immediately previous scene, including across reloads in the same browser tab.

Mist drifts slowly and individual souls pass on independent schedules. The character, platform, and foreground details share one responsive coordinate space. Animated GIFs play directly in the browser; static first-frame PNGs under `mainmenu/stills` are used when motion is off, the tab is hidden, gameplay is active, or a GIF fails. **Options → Menu animation** offers Automatic (the device's reduced-motion preference), On, and Off, remembered on this browser.

For repeatable scene previews, use `/?menuScene=watcher`, `/?menuScene=patient-traveller`, `/?menuScene=restless-flame`, or `/?menuScene=absent-traveller`. Scene assets, character anchors, and positions live in `src/ui/MenuScene.ts`.

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

## Create levels

Open the separate [Level workshop](http://127.0.0.1:3000/editor.html) to place terrain, decoration, enemies, signs, the player, and the exit. It has an object inspector, undo/redo, direct JSON editing, import/export, local draft recovery, and independent snapshot playtests.

Levels are versioned JSON files under `public/levels`. Export a level there and open `/?level=<id>` to play it. The game loads the requested file when needed; restarting keeps the chosen level. The editor has its own application entry point and does not edit a live game.

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
| Pause or resume | P or Escape |
| Restart | R |
| Toggle sound | M |
| Collision and movement debug view | F2 |

Jumping includes a short coyote window and input buffer. Push toward a wall while falling to slide; press Space to jump away. Space is the jump key. You can fire while sprinting, jumping, and falling. Direction keys aim in eight directions; with no direction held, shots follow facing. Opposing keys cancel on their axis. Down on the ground crouches and fires horizontally from a lower palm position; crouched movement is a slow creep, including with Shift held. Release Down to stand, or press Jump to stand and jump when there is room. Low ceilings keep the collision body crouched until clear. Up and Down together cancel both the crouch request and vertical aim. Diagonal bolts travel at the same speed as horizontal and vertical bolts, and the muzzle path is checked against terrain.

The game receives keyboard input while its canvas has focus. Switching tabs, leaving the window, or moving focus away pauses it and clears held input and queued actions. Use Resume to continue. Mouse and keyboard controls for pause, restart, and sound are also above the game. The page fits smaller windows; gameplay currently requires a keyboard.

## What is playable

- A scrolling level with low obstacles, raised platforms, eight opponents across six enemy types, and an exit.
- Sprint, variable-height jumps, coyote time, jump buffering, wall slides/jumps, and camera look-ahead.
- A separate [movement course](http://127.0.0.1:3000/?level=movement-course) for practising these mechanics, authored as ordinary level JSON.
- Projectile and terrain collisions, enemy health, player damage, and a brief recovery period after being hit.
- Hit effects, animated character artwork, simple generated sound, and mute.
- Start, pause, defeat, completion, and fresh restart flows.

This implements the movement foundation in Phase 1 of the [design and implementation plan](docs/Underworld_Game_Design_and_Implementation_Plan_v1.md). Ectoplasm, Soul Spark, Grave Hopper, progression, and bosses remain for later phases. The existing test attack remains available during movement and does not consume a resource. See [Phase 1 implementation notes](docs/phase-1-movement.md) for provisional rules, tuning, and playtest priorities.

The playable hero uses `character-animations-v2.png`, adapted from the established menu design: a lean skeleton, visible skull and ribs, magenta soul-flame, burgundy scarf, dark clothing, and strapped boots. Its 36 frames cover idle, running, airborne movement, palm-fire, hurt, and defeat. The original artwork and v1 sheet remain available. See the [live animation preview](http://127.0.0.1:3000/docs/character-animations.html) and [v2 asset notes](public/assets/character-animations-v2.md) for the layout, anchors, and generation prompt.

The [enemy art pack](public/assets/enemies/README.md) provides the six sheets used by the playable roster. Zombies lunge, skeletons charge horizontal shots, ghouls leap, ghosts phase and materialize, wights protect their front, and necromancers reactivate nearby corpses. The level introduces them individually before a small mixed encounter. See [enemy behavior](docs/enemy-behavior.md) for tells, counters, and limits. The [enemy roster preview](http://127.0.0.1:3000/docs/enemy-sprites.html) remains available to compare their animations.

## Code layout

`src/app.ts` creates and starts `Game`. The `Game` controller owns the session, `GameLoop` owns animation-frame scheduling, and `FixedClock` owns simulation timing. `Hud` and `GameMenu` own DOM presentation. `World` coordinates simulation updates while focused classes own collision queries, combat, corpses, and effects.

`public/levels/lower-passage.json` defines terrain, spawn points, patrol ranges, and the exit. `src/levels` validates, loads, and compiles level documents. `src/maps/actionLevel.ts` is a synchronous wrapper for simulation tests. `src/editor` owns the separate workshop application. `src/game/config.ts` holds temporary movement and combat settings. Physics uses world coordinates; the renderer applies the camera and scales the canvas through CSS.

The active entities follow the original class structure in `src/components`:

```text
GameElement
├── Wall, Exit, Sign, Camera, Particle
├── Projectile
│   ├── PlayerProjectile
│   └── EnemyProjectile
└── Actor
    ├── Character
    └── Enemy
        ├── Ghost
        └── GroundEnemy
            ├── Zombie
            ├── Skeleton
            ├── Ghoul
            ├── Wight
            └── Necromancer
```

Each class has its own file. `GameElement` owns bounds and placement, `Actor` supplies shared physical movement, and `Character` composes `PlayerMovement` with firing and damage state. `PlayerMovement` owns fixed-step locomotion, contact state, and jump buffers. `Enemy` supplies shared lifecycle and damage hooks. `GroundEnemy` shares the grounded attack cycle and ledge safety. Each concrete enemy owns its special behavior, defenses, tells, and encounter hint. Only `Necromancer` owns a revive budget and corpse-channel state.

`Map` builds terrain, signs, and the exit from level data. `Camera` follows the character and clamps its own view. Projectiles own their movement, lifetime, appearance, and valid targets. `CollisionSystem` resolves their nearest impact; `Combat` applies damage and defeat bookkeeping; `Graveyard` manages `Corpse` instances and reactivation; `ParticleSystem` manages `Particle` lifetimes.

`GameScreen` composes the drawing passes under `src/renderers`. Character, enemy, corpse, projectile, particle, terrain, sign, exit, background, and debug drawing each have a focused renderer. `CharacterAnimation` and `EnemyAnimation` select poses. `EnemyFactory` registers level identifiers with their concrete classes; adding behavior belongs in the class rather than the factory or world update loop.

`AssetLoader`, `Input`, and `Sound` each own one browser service. Stopping a game releases its animation loop, input listeners, menu handlers, and audio context. Starting or resuming a session does not install another loop or another set of handlers.

Corpse reactivation retains the concrete enemy instance and its methods. Only original enemy defeats contribute to the HUD count; reactivated enemies do not award duplicate credit.

`src/interfaces` contains shared geometry, runtime level, input, event, asset, and scheduling contracts. The obsolete coordinate classes have been replaced by these shared interfaces. The original `src/maps/level0.ts` remains as a level reference. Type checking covers every TypeScript file under `src`. Vite builds the game (`index.html`) and workshop (`editor.html`) as separate entry points into `dist`. Static artwork, JSON levels, the schema, and the two HTML preview pages live in `public` and are copied into each build without changing their public URLs.

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
