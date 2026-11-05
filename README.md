# Underworld action prototype

A browser platformer built with TypeScript and Canvas. Run through the lower passage, fight the undead, and reach the gate at the east end. This is the action foundation for the wider game concept; combat values and enemy behavior are temporary.

## Run locally

Use Node.js 26 LTS (also recorded in `.nvmrc`) and npm. Node.js 22.12 or newer is supported. npm is the package manager for this project; commit `package-lock.json` when changing dependencies.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000 and select **Enter the underworld**. The server listens only on this computer. If port 3000 is occupied, use `npm run dev -- --port 3001`. `npm start` is an alias for the development server.

Vite serves TypeScript directly during development and reloads the browser when source files change. CSS updates apply without restarting the game. Run `npm run typecheck` separately for full-source type checking while developing. All game artwork is loaded locally from `public/assets`.

Build and preview the production version with:

```sh
npm run build
npm run preview
```

The build checks TypeScript before bundling. Deploy the contents of `dist/` to any static host; it contains the HTML, compiled JavaScript and CSS, source maps, artwork, and animation preview pages. Relative asset paths support hosting the game in a subdirectory. `npm run preview` serves the built files locally at the same address; it is a local verification server. Generated output is ignored by Git.

Menus and toolbar controls use Blacklight Lit components with a game-owned Cyberundead theme: charcoal surfaces, bone text, magenta player actions, cyan details, and crisp edges. See [UI theme tokens](docs/ui-theme.md) to adjust the palette and [vendor notes](vendor/README.md) to update the local library snapshot.

## Controls

| Action | Keys |
| --- | --- |
| Move | A and D or left and right arrows |
| Jump | Space, W, or up arrow |
| Attack | Hold J or X |
| Pause or resume | P or Escape |
| Restart | R |
| Toggle sound | M |
| Collision and movement debug view | F2 |

The game receives keyboard input while its canvas has focus. Switching tabs, leaving the window, or moving focus away pauses it and clears held input. Use Resume to continue. Mouse and keyboard controls for pause, restart, and sound are also above the game. The page fits smaller windows; gameplay currently requires a keyboard.

## What is playable

- A scrolling level with low obstacles, raised platforms, eight opponents across six enemy types, and an exit.
- Movement, jumping, facing, and attacks that work together.
- Projectile and terrain collisions, enemy health, player damage, and a brief recovery period after being hit.
- Hit effects, animated character artwork, simple generated sound, and mute.
- Start, pause, defeat, completion, and fresh restart flows.

Ectoplasm, final powers, progression, and bosses are reserved for the next design discussion. The test attack does not consume a resource or define a final power.

The main character now uses a generated animation sheet based on the original `public/assets/character.png`: idle, running, airborne, attack, hurt, and defeat. The original artwork is preserved. See the [live animation preview](http://127.0.0.1:3000/docs/character-animations.html) and [asset notes](public/assets/character-animations-v1.md) for the frame layout and saved generation prompt.

The [enemy art pack](public/assets/enemies/README.md) provides the six sheets used by the playable roster. Zombies lunge, skeletons charge horizontal shots, ghouls leap, ghosts phase and materialize, wights protect their front, and necromancers reactivate nearby corpses. The level introduces them individually before a small mixed encounter. See [enemy behavior](docs/enemy-behavior.md) for tells, counters, and limits. The [enemy roster preview](http://127.0.0.1:3000/docs/enemy-sprites.html) remains available to compare their animations.

## Code layout

`src/app.ts` creates and starts `Game`. The `Game` controller owns the session, `GameLoop` owns animation-frame scheduling, and `FixedClock` owns simulation timing. `Hud` and `GameMenu` own DOM presentation. `World` coordinates simulation updates while focused classes own collision queries, combat, corpses, and effects.

`src/maps/actionLevel.ts` defines terrain, spawn points, patrol ranges, and the exit. `src/game/config.ts` holds temporary movement and combat settings. Physics uses world coordinates; the renderer applies the camera and scales the canvas through CSS.

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

Each class has its own file. `GameElement` owns bounds and placement, `Actor` supplies shared physical movement, and `Character` owns player movement, firing, and damage state. `Enemy` supplies shared lifecycle and damage hooks. `GroundEnemy` shares the grounded attack cycle and ledge safety. Each concrete enemy owns its special behavior, defenses, tells, and encounter hint. Only `Necromancer` owns a revive budget and corpse-channel state.

`Map` builds terrain, signs, and the exit from level data. `Camera` follows the character and clamps its own view. Projectiles own their movement, lifetime, appearance, and valid targets. `CollisionSystem` resolves their nearest impact; `Combat` applies damage and defeat bookkeeping; `Graveyard` manages `Corpse` instances and reactivation; `ParticleSystem` manages `Particle` lifetimes.

`GameScreen` composes the drawing passes under `src/renderers`. Character, enemy, corpse, projectile, particle, terrain, sign, exit, background, and debug drawing each have a focused renderer. `CharacterAnimation` and `EnemyAnimation` select poses. `EnemyFactory` registers level identifiers with their concrete classes; adding behavior belongs in the class rather than the factory or world update loop.

`AssetLoader`, `Input`, and `Sound` each own one browser service. Stopping a game releases its animation loop, input listeners, menu handlers, and audio context. Starting or resuming a session does not install another loop or another set of handlers.

Corpse reactivation retains the concrete enemy instance and its methods. Only original enemy defeats contribute to the HUD count; reactivated enemies do not award duplicate credit.

`src/interfaces` contains shared geometry, level, input, event, asset, and scheduling contracts. The obsolete coordinate classes have been replaced by these shared interfaces. The original `src/maps/level0.ts` remains as a level reference. Type checking covers every TypeScript file under `src`. Vite uses `index.html` and `src/app.ts` as the application entry points and builds into `dist`. Static artwork and the two HTML preview pages live in `public` and are copied into each build without changing their public URLs.

See [the architecture guide](docs/architecture.md) for responsibility boundaries and where to add a new feature.

## Verify changes

```sh
npm run check
npx playwright install chromium firefox
npm run test:browser
```

`npm run check` runs the simulation tests, full-source type checking, and production build. Simulation tests use Node's test runner with `tsx` to load TypeScript. Browser tests build and serve the production output automatically, exercise both Chromium and Firefox through movement, fighting, pause and focus loss, resizing, defeat, completion, replay, and asset loading failure, and save ignored screenshots under `artifacts`. Stop any development or preview server using port 3000 before running them.

Simulation tests cover frame-rate independence, bounded catch-up, fast collisions, jumping, attacks in both directions, wall occlusion, damage timing, cleanup, reset, camera bounds, and completing the real level.

GitHub Actions runs the checks on Node.js 22 and 26, including the Chromium and Firefox browser suite on Node.js 26.

Enemy tests cover committed attacks, horizontal shot locking, line of sight, ghost vulnerability, directional shields, aimed bolt collisions, interrupted reactivation, corpse ownership, finite revive budgets, ledge safety, and fresh world state.

Lifecycle tests cover duplicate loop starts, paused rendering, resume without backlog, stopping during an update, input aliases, one-shot actions, and listener disposal.

For a manual playtest, run and shoot in both directions, jump into a ceiling and against a wall, let an opponent hit you, pause while moving, switch tabs, resize the window, and finish the level. Try another run after both defeat and completion. Check that controls remain responsive and that each hit is clear.

The development sequence and completion criteria are in [the action game roadmap](docs/action-game-roadmap.md).
