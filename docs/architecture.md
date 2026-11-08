# Project structure and responsibilities

The project uses a class for each entity or system with a distinct responsibility. Entities share spatial and movement behavior through inheritance. Systems, renderers, and views are composed by the game controller. Simulation can run without a browser.

## Folders

| Folder | Responsibility |
| --- | --- |
| `src/components` | Game entities and their behavior |
| `src/game` | Session and loop control, loading, input, factories, and tuning |
| `src/game/systems` | Combat, collision queries, corpses, effects, ectoplasm and interaction target selection |
| `src/game/movement` | Player locomotion, aim, and stateless physics |
| `src/game/animation` | Pose selection and atlas metadata |
| `src/game/audio` | Gameplay sound synthesis and menu music |
| `src/renderers` | Canvas drawing and the `GameScreen` drawing coordinator |
| `src/ui` | DOM menu, toolbar, status, counters, progress, and encounter hints |
| `src/dialogue` | Browser-free dialogue/scene controllers, authored scene data, modal UI and browser session lifetime |
| `src/narrative` | Campaign knowledge, conditional scene selection, typed completion effects, current lead, saving and separate narrative UI |
| `src/interfaces` | Shared contracts with no runtime behavior |
| `src/maps` | Synchronous level fixture for tests and the original map reference |
| `src/levels` | Shared JSON authoring contract, validation, compilation, loading, and revision-checked changes |
| `src/editor` | Independent authoring application, canvas, inspector, history, file handling, and snapshot preview |
| `public/levels` | Individual level JSON files and the published JSON Schema |

Entities depend on capability contracts in `src/interfaces/Simulation.ts`, rather than on the concrete `World`. `EnemyContext` exposes target/terrain queries and corpse/projectile services; `CharacterContext`, `WeaponContext`, and `ProjectileContext` expose the capabilities needed for movement and attacks. Readonly properties prevent consumers from replacing world-owned collections, while shot/event queues remain appendable. Service capabilities expose selected methods, not their internal bookkeeping. `World` implements these contracts structurally, without adapters or a second simulation model. These are compile-time boundaries, not immutable runtime snapshots.

`components` consistently means gameplay entities; screen composition lives under `renderers`. Keep shared base classes limited to behavior their descendants actually share, and prefer composition for independent abilities.

Each runtime class has its own file. Small stateless geometry operations remain shared functions in `physics.ts`; level definitions and tuning remain data.

## Session and timing

`app.ts` chooses the JSON level source and starts `Game`. `Game` coordinates loading, the current `World`, input, sound, screen presentation, and menu transitions. `GameMenu` presents pause/outcome menus and the toolbar; `MainMenu` owns title navigation and options/control dialogs. `MenuNavigation` supplements native keyboard interaction with arrows, Home, and End. `GamePreferences` persists sound and hint preferences. `Hud` owns the readouts and encounter hint.

The title layout fits a centered scene frame to the viewport height on wide windows. Navigation scales against that frame rather than the full viewport width; artwork layers keep a common aspect ratio. Portrait windows crop the decorative scene, and a flowing footer reserves room for wrapped text and the extra Continue action. Very short landscape windows use a two-column title layout.

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

`src/environment` owns the Confluence art kit, independently of collision and narrative. `EnvironmentLoader` optionally loads validated images/frames for The Last Platform. `ConfluenceEnvironment` composes background, terrain, scenery, architecture, object and exit renderers. `ConfluenceScene.ts` holds props/facades/landmarks, `ConfluenceArchitecture.ts` holds architectural modules, and `ConfluenceMaterials.ts` defines material regions. The distant city uses X/Y parallax, and local sprites follow world coordinates. Each decorative atlas can fail independently. `MapRenderer` culls tiles in both axes. The runtime JSON remains the collision authority, including for the revision-5 cyberundead district. `ConfluenceWaterRenderer` adds cosmetic spectral waterways, using simulation elapsed time so they freeze with gameplay. See the [current v3 asset notes](../public/assets/environment/confluence/v3/README.md) for sources, exact prompts and reproducible packing.

`NarrativeSession` coordinates a separate fact-driven layer. `CampaignStages.ts` declares entry/completion effects, exit conditions, required objects, destinations and optional completion copy; `StoryCatalog.ts` groups each story's discoveries and journal visibility. `InteractionSystem` selects NPCs or physical `Interactable` entities; the session resolves scenes/cards, commits complete effect batches, and reconciles permanent discoveries with a fresh world. `World` owns geometry and enabled exits, without story-specific conditions. `EffectApplier` validates a batch before mutation; `SaveStore` writes important discoveries immediately. Temporary gate state and NPC counts reset with each world. Workshop previews never read or write the campaign. See [narrative systems](narrative-system.md) for ownership, evidence provenance and save failure policy.

`GameScreen` configures the canvas and composes renderers in the established draw order. It does not move actors, apply damage, or implement attacks. Each renderer reads model state and owns its canvas drawing. `CharacterAnimation` and `EnemyAnimation` choose poses independently of image loading and world rules.

`MapRenderer` composes wall, sign, and exit drawing. Background, character, enemy, corpse, projectile, particle, and debug drawing each have a dedicated renderer. Camera translation is applied once around the world drawing passes. Menu and HUD rendering use the DOM rather than the canvas renderers.

## Extending the game

The Confluence visual layer additionally separates facade tinting (`ConfluenceFacadeRenderer`), cap alignment (`TerrainManifest` and `ConfluenceAtlas.surface`), rear structural supports (`ConfluenceStructuresRenderer` / `ConfluenceStructures`), and cosmetic water placement (`ConfluenceWaterways`). Tinting occurs in an isolated atlas so transparent margins remain transparent. Supports follow the actual exposed terrain runs but never alter collision. Water uses optional scrolling bitmap materials. The [v4 polish notes](../public/assets/environment/confluence/v4/README.md) document white-background verification, bearing checks and reproducible packing alongside the retained v3 architecture/city.

For a new enemy, add its class under `components`, add tuning and its level identifier, register the constructor in `EnemyFactory`, and supply its sprite sheet. Keep decisions in the new class and expose any needed presentation state for the renderer.

For a new projectile, extend `Projectile` with its targets and appearance. For a new level, supply level data. Put new visual effects in a renderer and their lifetime behavior in an entity or effect system. Add a new simulation system when a rule spans multiple entities and has a clear responsibility of its own.

Use the simulation and lifecycle tests to protect behavior, and the browser playthroughs to protect loading, controls, screen flow, and replay. The full-source TypeScript check also covers modules that are not currently imported by the entry point.

## Dialogue and scene presentation

`src/dialogue` implements the first narrative slice. `DialogueController` reveals one line; `CutsceneDirector` sequences lines, captions/focus cues, waits, history, and explicit completion effects. `DialogueSession` owns browser timing, pause/log behavior, focus-loss handling and disposal. `ui/DialoguePresentation` defines the view/actions contract. `ui/KineticDialogueView` supplies the preferred centered exchange with directional portrait/text entry and managed animation lifetimes. `ui/ActionDialogueView` retains the compact nonmodal comparison; `ui/DialogueView` retains the earlier cinematic modal. Both own safe DOM text, portraits and Blacklight controls. The controllers have no browser or `World` dependency. Each runtime class has its own file.

`Game` can supply an optional scene whose `presentation` selects kinetic, cinematic or overlay. Kinetic and cinematic scenes enter `dialogue` mode, suspend simulation, and hide the gameplay HUD. Overlays stay in `playing` mode with movement/combat active, and preserve held input on normal completion. Explicit log/focus holds notify the game to suspend simulation and clear input; game pause/title transitions suspend and hide the overlay. Terminal world states cancel unfinished scenes without effects; restart constructs a fresh run. The director uses a host-owned set for once-only per-run callbacks. Narrative completion uses a separate validated, idempotent campaign batch through `NarrativeSession`.

`dialogue.html` is a separate Vite entry point hosting the preferred kinetic station exchange and linking to `/?dialogueDemo=kinetic` over paused gameplay. It retains the earlier noncanonical cinematic and travelling-overlay studies for comparison. It also links to the neutral NPC study, where actors placed through level data launch the same session by interaction. See [the dialogue system](dialogue-system.md) for authoring, lifecycle, supported cues, and current limitations.

## Neutral NPCs and interaction

`NPC` is an `Actor` sibling of `Enemy`, with its own concrete `RailAttendant` class. It has no enemy health, damage, defeat or corpse lifecycle. `World` creates NPCs through `NPCFactory` and updates their physics/behavior; `NPCRenderer` draws them, and `InteractionPrompt` presents a world-anchored DOM prompt. `InteractionSystem` selects one grounded, living player's reachable NPC using distance, feet height, line of sight and stable ID tie-breaking. It does not launch UI.

`Game` handles the one-shot F command, looks up the actor's scene through `SceneCatalog`, and starts the existing kinetic dialogue session. Completing/skipping marks the actor's per-run conversation count; cancellation does not. Restart creates fresh actors. Level validation/compiler and the workshop share optional NPC placement data, known kind/scene references and anchor conversion. Old level files normalize missing `npcs` to an empty collection. See [NPC system notes](npc-system.md).

### Continuous building shells

The v5 background kit separates continuous wall material from selected fa?ade bays. Station, residential, Registry and industrial buildings use world-aligned 96px textures, shared floor bands, exposed corners and rooflines; service conduits follow each shell. Station piers connect the stories while retaining open arcade views. The Registry has fewer repeated shelf bays and keeps its magenta landmark distinct.

`ConfluenceBuildings.ts` owns decorative footprints and material families; `ConfluenceBuildingRenderer.ts` owns clipping and connected trim drawing. `EnvironmentLoader` validates optional wall/trim images and their manifest independently. The pass runs between water and rear support structures, before windows and props. Terrain collision, narrative anchors and save behavior are unchanged. Original generated assets and exact prompts live in `public/assets/environment/confluence/v5/`; the gallery and white-background checker include them.
