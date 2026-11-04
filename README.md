# Underworld action prototype

A browser platformer built with TypeScript and Canvas. Run through the lower passage, fight the undead, and reach the gate at the east end. This is the action foundation for the wider game concept; combat values and enemy behavior are temporary.

## Run locally

Use Node.js 20 or newer and npm.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000 and select **Enter the underworld**. The server listens only on this computer. If port 3000 is occupied, set the `PORT` environment variable before starting it.

For development, leave `npm start` running and run `npm run watch` in another terminal. Refresh the browser after changes have compiled. All game artwork is loaded locally.

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

The main character now uses a generated animation sheet based on the original `assets/character.png`: idle, running, airborne, attack, hurt, and defeat. The original artwork is preserved. See the [live animation preview](http://localhost:3000/docs/character-animations.html) and [asset notes](assets/character-animations-v1.md) for the frame layout and saved generation prompt.

The [enemy art pack](assets/enemies/README.md) provides the six sheets used by the playable roster. Zombies lunge, skeletons charge horizontal shots, ghouls leap, ghosts phase and materialize, wights protect their front, and necromancers reactivate nearby corpses. The level introduces them individually before a small mixed encounter. See [enemy behavior](docs/enemy-behavior.md) for tells, counters, and limits. The [enemy roster preview](http://localhost:3000/docs/enemy-sprites.html) remains available to compare their animations.

## Code layout

`src/app.ts` owns browser startup, screen flow, and the HUD. The active simulation lives in `src/game/World.ts`; it has no DOM dependency and can run directly in tests. `physics.ts` contains axis collision sweeps and the fixed update clock. Drawing, assets, sound, and input each have a separate module in `src/game`.

`src/maps/actionLevel.ts` defines terrain, spawn points, patrol ranges, and the exit. `src/game/config.ts` holds temporary movement and combat settings. Physics uses world coordinates; the renderer applies the camera and scales the canvas through CSS.

`src/game/Enemy.ts` owns enemy state transitions and movement. `EnemyVisual.ts` selects the sprite poses and supplies the encounter hints. `World.ts` handles projectile teams, damage, shield blocking, corpse claims, and bounded reactivation. Only original enemy defeats contribute to the HUD count; reactivated enemies do not award duplicate credit.

The older `src/components`, `src/interfaces`, and `src/maps/level0.ts` files are retained from the original experiment. They are not used by the active entry point. Webpack builds the active game into `dist`; rebuild it after editing source.

## Verify changes

```sh
npm run typecheck
npm run build
npm test
npx playwright install chromium firefox
npm run test:browser
```

Simulation tests cover frame-rate independence, bounded catch-up, fast collisions, jumping, attacks in both directions, wall occlusion, damage timing, cleanup, reset, camera bounds, and completing the real level. Browser tests exercise both Chromium and Firefox through movement, fighting, pause and focus loss, resizing, defeat, completion, replay, and asset loading failure. Browser tests start a local server automatically and save ignored screenshots under `artifacts`.

Enemy tests cover committed attacks, horizontal shot locking, line of sight, ghost vulnerability, directional shields, aimed bolt collisions, interrupted reactivation, corpse ownership, finite revive budgets, ledge safety, and fresh world state.

For a manual playtest, run and shoot in both directions, jump into a ceiling and against a wall, let an opponent hit you, pause while moving, switch tabs, resize the window, and finish the level. Try another run after both defeat and completion. Check that controls remain responsive and that each hit is clear.

The development sequence and completion criteria are in [the action game roadmap](docs/action-game-roadmap.md).
