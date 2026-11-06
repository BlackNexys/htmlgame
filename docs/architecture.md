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
| `src/maps` | Synchronous level fixture for tests and the original map reference |
| `src/levels` | Shared JSON authoring contract, validation, compilation, loading, and revision-checked changes |
| `src/editor` | Independent authoring application, canvas, inspector, history, file handling, and snapshot preview |
| `public/levels` | Individual level JSON files and the published JSON Schema |

Each runtime class has its own file. Small stateless geometry operations remain shared functions in `physics.ts`; level definitions and tuning remain data.

## Session and timing

`app.ts` chooses the JSON level source and starts `Game`. `Game` coordinates loading, the current `World`, input, sound, screen presentation, and menu transitions. `GameMenu` presents pause/outcome menus and the toolbar; `MainMenu` owns title navigation and options/control dialogs. `MenuNavigation` supplements native keyboard interaction with arrows, Home, and End. `GamePreferences` persists sound and hint preferences. `Hud` owns the readouts and encounter hint.

The game canvas retains its 960×576 simulation view and scales uniformly inside the browser window. HUD placement and letterboxing live in game-only CSS. Native menu dialogs pause input access to the canvas. Returning to the title menu preserves a paused world for Continue; starting a new game or restarting creates a fresh world from the loaded definition. Options and controls do not resume the simulation when closed.

`GameLoop` owns one animation-frame chain and can pause simulation while continuing to draw. `FixedClock` bounds simulation catch-up and advances a fixed step. Resuming clears old accumulated time. Disposing the game stops the loop and removes its input, menu, focus, and audio resources.

`AssetLoader`, `Input`, and `Sound` encapsulate image loading, keyboard state, and audio respectively. They are browser services; entity constructors do not load images, query the DOM, or register listeners.

`MenuMusic` owns the title-screen audio element, loops Mechanical Heartbeat, retries blocked playback after user interaction, and pauses when muted, unfocused, hidden, or outside the title screen. `Game` supplies title visibility and the existing sound preference; music never enters the simulation or blocks asset loading. Disposing releases playback and its browser listeners.

`MainMenu` owns `TitleScene` and its visibility. `MenuScene.ts` supplies four preset identities and their matching still posters. A visit selects one preset; dialogs and loading completion preserve it. Later visits avoid the immediately previous choice, with session storage preserving that exclusion across reloads. A valid `menuScene` query parameter explicitly selects a preset for repeatable previews.

`TitleScene` loads and validates the production scene, owns motion policy and one cosmetic frame chain, and switches to the matching poster if decoration fails. `src/ui/title/TitleArt.ts` defines the metadata contract; `TitleArtRenderer` plays complete hero frames plus authored cat, foliage and spirit clips. Standing reuses the live `character-animations-v2.png` idle row with its gameplay timing and per-frame roots. New seated/leaning sequences use that same hero as their only visual reference; the seated cloak is integrated beneath the hips/thighs. Metadata supplies uniform display scale and optional per-frame anchors. There are no separate hero head/fire or cloak layers. The lantern turns around its hanging link; clock hands, light, shadows and sleep marks use independent timing. The background and transparent platform are stationary image layers. All layers share a fitted 1672×941 coordinate space, with at most 30 presentation paints per second.

Automatic follows the device's reduced-motion setting. A visible footer control explains when reduced motion has paused it and lets the user explicitly enable animation; On and Off persist through the existing preference. Off draws the composed time-zero pose and stops the frame chain. Hidden documents and menu exit freeze the cosmetic clock; resume has no catch-up. Missing art, invalid metadata or unavailable decorative canvas restores the matching still poster without blocking menu controls or gameplay. Disposal cancels the frame chain and listeners; no animation work enters `World` or `GameLoop`. The independent `menu-production.html` viewer uses the same drawing code for frame inspection.

`Input` produces held, pressed, and released logical actions. Physical aliases share one action edge; browser key repeat cannot queue another jump. `Game` clears input and buffered movement actions when pausing, returning to a menu, or resuming. Restart constructs a fresh world.

## Entities

`GameElement` owns position and bounds. `Actor` adds velocity, gravity, and physical movement. `Character` and `Enemy` build on it. Ground enemies share their attack cycle and ledge safety through `GroundEnemy`, with a separate class for every concrete enemy. Their special behavior, damage reactions, tell labels, and hints remain in those classes.

`Character` delegates locomotion to `PlayerMovement`, which owns sprint, crouch with safe standing clearance, variable jump, coyote time, jump buffering, and wall slide/jump. Swept collision resolves terrain impacts, including diagonal corner impacts, and lets movement slide along a surface. Enemy movement retains its existing axis collision. `PlayerAim` resolves the eight keyboard directions after movement, treating Down as crouch on the ground and downward aim in the air. `WeaponController` owns held-fire cadence; the concrete `Flicker` weapon owns its definition, normalized aim and safe muzzle sweep. `Character` retains health and damage recovery.

`Projectile` owns flight and expiry. `FlickerProjectile` and `EnemyProjectile` select their valid targets and impact behavior. Flicker emits positional weapon events; `ParticleSystem` consumes them into short-lived cosmetic effects. `FlickerRenderer` uses the packed 32×32 atlas and falls back to a procedural flame if it is unavailable. `FlickerSound` synthesizes bounded spectral voices independently of combat; missing/failed audio cannot stop a shot. `Particle` owns its short-lived movement. `Corpse` owns elapsed death-animation time, eligibility, and claim state while retaining the concrete defeated enemy instance. `Ectoplasm` clamps shared ammunition; only `Combat` grants the original enemy's one-time defeat reward, tracked across resurrection.

`Map` creates `Wall`, `Sign`, and `Exit` instances from level definitions. `Exit` tests whether the player has reached it. `Camera` follows an actor and clamps its view to the map.

The runtime takes an explicit `Level`; it does not choose or author one. `LevelLoader` fetches a selected JSON document, validates it, and compiles it before `Game` constructs `World`. Restarting reuses the loaded definition with fresh entities. `LevelCompiler` converts bottom-center actor anchors and compact terrain rectangles into the runtime's existing coordinates and tiles. Decoration is drawn separately and never enters the collision set.

`editor.html` and `src/editor/app.ts` form a separate application entry point. Editor history and gestures operate on JSON documents, not `World` instances. A playtest launches the normal game in a separate browsing context from a frozen JSON Blob URL. Only the shared level contract and validation cross that boundary. See [level authoring](level-authoring.md) for human and agent workflows.

## Simulation systems

`World` constructs the scene and coordinates the update sequence:

1. Update the player.
2. Advance corpse animation time and update living enemies.
3. Advance projectiles and resolve their impacts.
4. Remove defeated enemies and check contact damage.
5. Check defeat or completion, advance effects, and follow the player with the camera.

`CollisionSystem` owns line-of-sight queries and earliest projectile impacts, with terrain winning equal-time impacts. `Combat` owns damage feedback, defeat credit, and handing defeated actors to `Graveyard`. `Graveyard` owns corpse lookup, claim release, and reactivation membership. The necromancer still owns its channel decision and finite budget. `ParticleSystem` spawns and expires particles.

Movement grants no damage immunity; enemy contact and projectile hits use the normal damage and recovery rules. Camera following uses fixed-step exponential damping, horizontal velocity look-ahead, a vertical dead zone, and level bounds. The movement course uses the same JSON contract and runtime as other levels, with no editor dependency.

These systems are fresh for every new world. Reactivation preserves the original concrete enemy instance and its methods, without duplicating its defeat credit or active membership.

## Presentation

`GameScreen` configures the canvas and composes renderers in the established draw order. It does not move actors, apply damage, or implement attacks. Each renderer reads model state and owns its canvas drawing. `CharacterAnimation` and `EnemyAnimation` choose poses independently of image loading and world rules.

`MapRenderer` composes wall, sign, and exit drawing. Background, character, enemy, corpse, projectile, particle, and debug drawing each have a dedicated renderer. Camera translation is applied once around the world drawing passes. Menu and HUD rendering use the DOM rather than the canvas renderers.

## Extending the game

For a new enemy, add its class under `components`, add tuning and its level identifier, register the constructor in `EnemyFactory`, and supply its sprite sheet. Keep decisions in the new class and expose any needed presentation state for the renderer.

For a new projectile, extend `Projectile` with its targets and appearance. For a new level, supply level data. Put new visual effects in a renderer and their lifetime behavior in an entity or effect system. Add a new simulation system when a rule spans multiple entities and has a clear responsibility of its own.

Use the simulation and lifecycle tests to protect behavior, and the browser playthroughs to protect loading, controls, screen flow, and replay. The full-source TypeScript check also covers modules that are not currently imported by the entry point.
