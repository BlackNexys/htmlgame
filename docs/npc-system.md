# Neutral NPCs · first playable slice

Open `/?level=npc-study`, select Play, and approach the railway attendant. **F** starts the centered kinetic exchange. Gameplay freezes, then control returns after completion or skip. You can talk again or continue through the level. The attendant, dialogue and small study are prototype material, not established story canon.

## Behavior and interaction

The attendant is a stationary neutral actor with a four-frame idle, gravity/terrain support and facing toward nearby players. NPCs share `Actor` physics, not `Enemy` behavior. They have no health, attack, contact damage, defeat credit, corpse, resurrection, or ectoplasm reward. Players, enemies and projectiles pass through them; they are not cover. Missing artwork uses a labelled placeholder without preventing play or conversation.

The shared interaction system chooses among nearby NPCs and objects. NPC eligibility requires 88 horizontal world pixels, feet within 32 pixels, a grounded living player and clear terrain line of sight. Object reach uses its own bounds. Distance selects the target and stable IDs break ties. Only the chosen target gets the world-anchored accessible prompt.

F uses the input service's command edge handling. Holding it through a conversation cannot immediately reopen that conversation. The game refuses talk while another scene or menu is active. Entering dialogue clears held input and movement buffers; the existing kinetic scene owns the exchange and returns focus through the normal game lifecycle.

Completing or skipping increments that actor's per-run conversation count, changing the prompt to **Talk again**. Repeating is allowed; cancellation grants no conversation completion. Restart builds fresh actors and resets their counts. Campaign knowledge is separate: in `narrative-study`, `registry-attendant` resolves introduction, short directions, record reaction or farewell according to discoveries. The [narrative layer](narrative-system.md) owns persistent, idempotent effects; actors do not hold quest logic or grant combat rewards.

## Level and workshop contract

The optional `npcs` array extends level schema version 1. Old documents without it load with an empty array; normalized exports include it. Coordinates in JSON mark the bottom center of the feet, just like other authored actors.

```json
"npcs": [
  {"id": "platform-attendant", "kind": "rail-attendant",
   "x": 432, "y": 576, "scene": "station-exchange"}
]
```

The validator checks known kinds and scene IDs, bounds, terrain overlap, collection limits and globally unique object IDs. Scene IDs reference the local catalog, not URLs or executable code. The published JSON Schema lists the same supported IDs. The compiler converts the feet anchor to runtime top-left bounds.

In the workshop, choose **NPC**, select a type and scene, then click above solid ground. The inspector edits position, type and scene. Selection/dragging, object lists, delete, revision-checked patches, undo/redo, draft recovery, import/export and independent snapshot playtests use the same collection contract as other level objects. `npm run level -- validate`, `summary` and `patch` include NPCs.

## Ownership and extension

| File/class | Responsibility |
| --- | --- |
| `components/NPC.ts` | Neutral actor state, shared physics, conversation count and lifecycle |
| `components/RailAttendant.ts` | Stationary attendant behavior and nearby-player facing |
| `game/NPCCatalog.ts` | Pure dimensions, display name, image and atlas metadata |
| `game/NPCFactory.ts` | Type-to-constructor registration |
| `game/systems/InteractionSystem.ts` | Reachability and target selection; no UI or scene execution |
| `renderers/NPCRenderer.ts` | Idle sprite/fallback and neutral name label |
| `ui/InteractionPrompt.ts` | Accessible DOM prompt anchored through the camera |
| `dialogue/SceneCatalog.ts` | Stable IDs for available authored conversations |
| `Game` | F command, scene launch and completion handoff |
| `World` | Actor creation and fixed-step update coordination |

Add another NPC through its own class, metadata and factory entry, then update the kind contract and published schema. New dialogue data belongs in its own scene file and the scene catalog; add the ID to the schema. The workshop reads type and scene choices from the catalogs. Keep dialogue progression out of actor rendering and enemy behavior out of neutral actors.

Dynamic dialogue selection and saved discoveries now exist in the narrative study. Wandering, schedules, shops, quest trees, persistent relationship state, automatic environmental triggers, NPC damage reactions and factions remain unimplemented.

Simulation tests cover reachability, walls, neutral collision/combat behavior, anchors, validation and fresh state. Browser tests cover interaction, repeat prevention, airborne rejection, fallback art, workshop editing/export and an actual snapshot playtest in Chromium and Firefox.
