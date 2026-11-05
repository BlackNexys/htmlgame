# Project structure and responsibilities

The project uses a class for each entity or system with a distinct responsibility. Entities share spatial and movement behavior through inheritance. Systems, renderers, and views are composed by the game controller. Simulation can run without a browser.

## Folders

| Folder | Responsibility |
| --- | --- |
| `src/components` | Game entities and their behavior, plus the `GameScreen` canvas coordinator retained from the original structure |
| `src/game` | Session and loop control, simulation systems, browser services, animation selection, factories, physics utilities, and tuning |
| `src/renderers` | Canvas drawing for each entity or scene layer |
| `src/ui` | DOM menu, toolbar, status, counters, progress, and encounter hints |
| `src/interfaces` | Shared contracts with no runtime behavior |
| `src/maps` | Level definitions, including terrain, spawns, signs, and exit placement |

Each runtime class has its own file. Small stateless geometry operations remain shared functions in `physics.ts`; level definitions and tuning remain data.

## Session and timing

`app.ts` only creates and starts `Game`. `Game` coordinates loading, the current `World`, input, sound, screen presentation, and menu transitions. `GameMenu` owns menu text and toolbar handlers; `Hud` owns the readouts and encounter hint.

`GameLoop` owns one animation-frame chain and can pause simulation while continuing to draw. `FixedClock` bounds simulation catch-up and advances a fixed step. Resuming clears old accumulated time. Disposing the game stops the loop and removes its input, menu, focus, and audio resources.

`AssetLoader`, `Input`, and `Sound` encapsulate image loading, keyboard state, and audio respectively. They are browser services; entity constructors do not load images, query the DOM, or register listeners.

## Entities

`GameElement` owns position and bounds. `Actor` adds velocity, gravity, and physical movement. `Character` and `Enemy` build on it. Ground enemies share their attack cycle and ledge safety through `GroundEnemy`, with a separate class for every concrete enemy. Their special behavior, damage reactions, tell labels, and hints remain in those classes.

`Projectile` owns flight and expiry. `PlayerProjectile` and `EnemyProjectile` select their valid targets and appearance. This keeps projectile teams and colors out of the world update and drawing code. `Particle` owns its short-lived movement. `Corpse` owns elapsed death-animation time, eligibility, and claim state while retaining the concrete defeated enemy instance.

`Map` creates `Wall`, `Sign`, and `Exit` instances from level definitions. `Exit` tests whether the player has reached it. `Camera` follows an actor and clamps its view to the map.

## Simulation systems

`World` constructs the scene and coordinates the update sequence:

1. Update the player.
2. Advance corpse animation time and update living enemies.
3. Advance projectiles and resolve their impacts.
4. Remove defeated enemies and check contact damage.
5. Check defeat or completion, advance effects, and follow the player with the camera.

`CollisionSystem` owns line-of-sight queries and earliest projectile impacts, with terrain winning equal-time impacts. `Combat` owns damage feedback, defeat credit, and handing defeated actors to `Graveyard`. `Graveyard` owns corpse lookup, claim release, and reactivation membership. The necromancer still owns its channel decision and finite budget. `ParticleSystem` spawns and expires particles.

These systems are fresh for every new world. Reactivation preserves the original concrete enemy instance and its methods, without duplicating its defeat credit or active membership.

## Presentation

`GameScreen` configures the canvas and composes renderers in the established draw order. It does not move actors, apply damage, or implement attacks. Each renderer reads model state and owns its canvas drawing. `CharacterAnimation` and `EnemyAnimation` choose poses independently of image loading and world rules.

`MapRenderer` composes wall, sign, and exit drawing. Background, character, enemy, corpse, projectile, particle, and debug drawing each have a dedicated renderer. Camera translation is applied once around the world drawing passes. Menu and HUD rendering use the DOM rather than the canvas renderers.

## Extending the game

For a new enemy, add its class under `components`, add tuning and its level identifier, register the constructor in `EnemyFactory`, and supply its sprite sheet. Keep decisions in the new class and expose any needed presentation state for the renderer.

For a new projectile, extend `Projectile` with its targets and appearance. For a new level, supply level data. Put new visual effects in a renderer and their lifetime behavior in an entity or effect system. Add a new simulation system when a rule spans multiple entities and has a clear responsibility of its own.

Use the simulation and lifecycle tests to protect behavior, and the browser playthroughs to protect loading, controls, screen flow, and replay. The full-source TypeScript check also covers modules that are not currently imported by the entry point.
