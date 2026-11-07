# Narrative and interaction systems

The first three slices of the [supplied architecture proposal](Worldbuilding/Underworld_Narrative_Interaction_Proposal_v0_1.md) are implemented: physical interactions, fact-driven narrative logic, and a versioned campaign save. This is a systems study, not production of the final demo level. Dialogue, route S-17, the letter, and the station layout are noncanonical fixtures.

## Try the complete loop

Open `/?level=narrative-study`, select Play, and use **F** to interact and **K** to open Journey. Arrival immediately returns control; no introduction is required.

1. The attendant introduces the Registry. A repeat conversation gives short directions.
2. An optional letter can be kept beneath the raised platform.
3. Inspect the transfer ledger to record the evidence. Merely opening its card does not grant it: **Record discovery** commits; **Leave** or Escape cancels.
4. Return to the attendant for a changed kinetic exchange, or inspect the route index independently. Either identifies the next destination.
5. Operate the departure gate and reach the exit. Completion unlocks `departure-study`; the outcome menu and Journey offer a link to it.

The ledger can be found before any conversation. The attendant then responds to the record immediately, without forcing an introduction. The optional letter never gates a lead or stage completion. A record establishes a recorded transfer; it does not establish abduction, consent, authorization, or motive.

`npc-study` remains the simple neutral-actor demonstration. `lower-passage`, `movement-course`, and the old dialogue fixtures retain their existing behavior and do not read/write the prototype campaign. The title's New game/Restart start a fresh attempt; **Reset prototype journey** in Journey explicitly clears campaign progress separately.

## Responsibilities

| Class/data | Owns |
| --- | --- |
| `components/Interactable` | Bounds, authored definition, local collected/operated state and optional physical blocker |
| `InteractionSystem` | One eligible target selected by reach, line of sight, distance and stable ID |
| `SceneResolver` | Priority-ordered conditions selecting registered scene IDs |
| `NarrativeState` | Cloned campaign data and knowledge/Keepsake queries |
| `EffectApplier` | Validated, typed, idempotent completion batches |
| `ObjectiveTracker` | One current lead derived from knowledge and stage completion |
| `SaveStore` | One validated versioned storage value, error reporting and explicit reset |
| `NarrativeSession` | Resolving an interaction, applying its consequences, reconciling saved discoveries with a fresh world |
| `InspectionView`, `JourneyPanel`, `NarrativeHud` | Cards, journal, short lead notification and save warning |
| `InteractableRenderer` | Simple prototype object drawing; no story mutation |
| `Game` | Input dispatch, presentation lifetime, pausing and completion handoffs |

Each runtime class has its own file. `World` creates physical entities and checks an enabled exit; it does not branch on story facts. The narrative coordinator interprets definitions and sets exit availability. Browser-free narrative modules can be tested with the simulation independently of their DOM views.

## Interaction and authoring

F handles NPC talk, inspect, collect and operate through the same selector. NPCs retain grounded/feet-height checks. Objects use their own rectangle and authored reach, including airborne reach, with terrain line of sight; a gate ignores its own blocker for interaction. Only the chosen target has a prompt. Dead players cannot interact. Equal distances use stable IDs; target cycling is not implemented.

Level schema version 1 accepts optional `interactables`; old levels normalize to an empty array. Coordinates are top-left world pixels, unlike actor feet anchors. Example:

```json
{
  "id": "transfer-ledger", "kind": "inspect",
  "x": 1104, "y": 520, "width": 40, "height": 40,
  "label": "Transfer ledger", "reach": 80,
  "sceneId": "transfer-record-card", "effectId": "inspect-transfer-record"
}
```

`kind` is inspect/collect/operate. `sceneId` references a registered card or direct dialogue scene. Optional `effectId` and `conditionId` reference compiled catalogs, never executable JSON. `solid: true` is available for operated objects such as the gate. Validation checks source/scene/effect compatibility, known IDs, bounds, reach, terrain/spawn overlap for solid objects, and global ID uniqueness. Geometric validation does not establish puzzle solvability.

The workshop's **Object** tool offers ledger, letter, route-index and gate presets. Inspector fields, object lists, move/delete, revision-checked patches, undo/redo, drafts, JSON export and independent playtests support the new collection. NPC scene choices include `registry-attendant`, a resolver ID, and direct scene IDs. See [level authoring](level-authoring.md).

## Completion and evidence

The attendant resolver selects farewell → record reaction → repeat directions → introduction, using the first satisfied condition. Conversation counts still belong to individual actors and reset with an attempt. Persistent knowledge is separate from those counts.

Narrative scene completion and skip apply the same complete effect batch. Cancellation/disposal applies none. Cards commit only through their primary action. The host defers narrative effects until successful completion instead of committing individual director callbacks. Before mutation, `EffectApplier` validates every effect, its source, its prerequisites, its physical card binding where required, and the resulting save. Invalid batches leave both campaign and object state untouched.

Facts, Keepsakes, milestones and stage IDs are typed catalogs. Additions deduplicate; repeated interactions never duplicate a reward. Physical evidence requires the matching inspected object; skipping an NPC exchange cannot award a ledger. Opening the gate changes only that world's object and collision list. Stage completion is committed independently when the player reaches the enabled exit.

## Persistence policy

**Confirmed design decision:** important discoveries and Keepsakes save immediately and survive death, restart and browser reload when storage succeeds.

| Lifetime | State |
| --- | --- |
| Campaign | Facts, milestones, Keepsakes, unlocked/completed stages |
| Attempt | Enemies, health, projectiles, corpses, conversation counts, temporary gate operation |

`underworld-campaign:v1` is one localStorage slot containing version, facts, milestones, keepsakes, unlockedStages, completedStages, unlockedWeapons and discoveredModifiers. The latter two reserve a future integration boundary; Flicker is the initial weapon ID, and additional weapon/modifier acquisition is not implemented. No player position, enemy state, midair checkpoint or arbitrary object snapshot is saved.

A new world restores collected Keepsakes from campaign ownership, while its gate starts closed and can be opened again using retained knowledge. Finding the destination enables departure; it does not itself complete the stage or unlock the next one. Opening another stage currently navigates to a new page and requires a successful save; onward links are withheld while a storage warning is active.

Load validation rejects malformed JSON, oversized/unsupported saves, unknown fields/discoveries, duplicate IDs and invalid stage progress. Unreadable or future saves remain untouched. Play proceeds with fresh in-memory state and a visible warning; only explicit Journey reset permits replacing that slot. Storage write failures also warn and retain in-memory progress, which survives an attempt restart but cannot be promised across reload. Reset asks for confirmation and leaves game preferences alone. There is no cloud backup, migration from a future version, cross-tab merge or save-slot manager.

Campaign saving is currently enabled only for `narrative-study` and `departure-study`. All `levelUrl` workshop playtests and `preview=1` runs use isolated in-memory state, including onward links and reset. Editing/testing a level cannot overwrite the real journey.

## Verification and boundaries

`tests/narrative.test.cjs` covers atomic effects, physical evidence, discovery order, scene priority, idempotence, local/campaign lifetimes, gate collision reconciliation, saves/failures, preview isolation and authoring. Browser tests exercise both routes through the loop, cancellation, skip, reload, failure warnings, explicit reset, next-stage navigation and workshop export in Chromium and Firefox.

Still deferred: harvesting as an F target, target cycling, dialogue choices, relationships, shops/inventories, schedules, arbitrary scripting, automatic environmental triggers, real boss rewards, expanded arsenal, localization and final level/art/story design. Future production stages must register their campaign identities and completion policy explicitly.
