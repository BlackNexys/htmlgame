Oh, now we're getting somewhere, my friend. ^^

I think this is the point where Underworld needs a distinction between the game remembering what happened and the protagonist learning something about his world.

Those sound similar, but they lead to rather different systems.

A game flag might say that an NPC has been spoken to. A narrative fact might say that the protagonist discovered a transfer record linking his girlfriend to an unknown destination.

The second is much more useful. It can change conversations, justify new objectives, and make an earlier location worth revisiting.

And I think we can build all of that without turning Underworld into an RPG.

# Underworld — Narrative & Interaction Systems

Architecture sketch v0.1 · Proposed additions to the current TypeScript engine

## 1. The overall architecture

I'd introduce five complementary systems, each with a relatively narrow responsibility.

World entities

NPCs · Records · Objects · Corpses · Secrets

InteractionSystem

What can the player interact with?

SceneResolver

Which dialogue or inspection scene plays?

EffectApplier

What changes because of the interaction?

NarrativeState

Facts · Discoveries · Milestones · Collectibles

SaveStore + ObjectiveTracker

Persist important progress and communicate the next lead

The important architectural principle is that the `World` doesn't need to know the entire story.

It needs to know where characters and objects exist, how they behave, and which interactions are available.

The narrative layer interprets their significance.

## 2. NarrativeState — What does the protagonist know?

This would be the foundation.

Rather than building a conventional quest log with dozens of active objectives, I'd maintain a collection of explicit narrative facts.

For example:

```
interface NarrativeState {
  facts: Set<string>;
  milestones: Set<string>;
  keepsakes: Set<string>;
  completedStages: Set<string>;
}
```

For our first level, possible facts might look like this:

| Fact                       | Meaning                                    |
| -------------------------- | ------------------------------------------ |
| `arrived-at-last-platform` | The protagonist has entered the underworld |
| `met-rail-attendant`       | He has spoken with the attendant           |
| `learned-about-registry`   | He knows where arrival records are kept    |
| `found-transfer-record`    | He has discovered evidence of a transfer   |
| `learned-next-destination` | He has a meaningful lead to follow         |

I would distinguish knowledge from assumptions here.

For example, discovering a transfer record should not automatically set `girlfriend-was-abducted`.

A record establishes that a transfer was recorded. Whether that transfer was authorized, coercive, or fraudulent is a separate discovery.

That's important for the kind of mystery we're building.

And it gives us a remarkably straightforward programming model: scenes and interactions read facts; discoveries add facts.

No enormous quest dependency graph required.

## 3. Interactable objects — The world becomes investigable

Currently, the engine lets us talk to neutral NPCs.

I'd extend that concept to objects that the protagonist can inspect, collect, or operate.

Inspect

Documents, memorials, signs, terminals, strange artifacts, and environmental details.

An inspection reveals information, possibly granting a narrative fact. It doesn't necessarily remove anything from the world.

Collect

Keepsakes, keys, evidence objects, and eventually weapon modifiers.

Collecting an object records its discovery and may remove its visible representation.

Operate

Railway switches, doors, terminals, lifts, and machinery.

These cause bounded changes in the level. Some could require a particular discovery or condition.

I'd use a simple typed object definition:

```
interface InteractableDefinition {
  id: string;
  kind: "inspect" | "collect" | "operate";
  x: number;
  y: number;
  sceneId?: string;
  effectId?: string;
  conditionId?: string;
}
```

The `effectId` references a validated effect definition. It does not allow level JSON to execute arbitrary code.

And I'd add `interactables` to the shared level-authoring format, so we can place them in the workshop just as we place NPCs.

One important distinction: not every interaction should launch a full cinematic dialogue.

Inspecting a timetable might show a small readable card. Discovering a crucial record might justify a portrait-based scene or a dramatic moment of silence.

That keeps investigation from constantly interrupting the arcade flow.

## 4. One interaction button for everything

We've already encountered our first control conflict.

F is currently used for NPC dialogue, but we originally reserved it for corpse harvesting.

I wouldn't introduce a separate key for every interaction type.

I'd generalize the existing `InteractionSystem`.

It gathers eligible nearby targets and selects one based on reachability, distance, visibility, and a deterministic tie-breaking rule.

The prompt tells the player exactly what will happen.

POSSIBLE CONTEXTUAL PROMPTS

F

Talk to Attendant

F

Inspect Records

F

Harvest Remains

F

Operate Switch

There is one interaction dispatcher. The target determines the action.

We should also allow object-specific interaction bounds. The current NPC check requires fairly similar foot heights; that wouldn't work for a terminal mounted on a wall or an object placed on a pedestal.

The interaction logic must understand reachability, not merely proximity.

If multiple objects overlap, the selected target should be obvious, with a way to change targets if ambiguity becomes common.

## 5. Conditional dialogue — People remember what you've discovered

This may be the most immediately rewarding extension.

We already have the `SceneCatalog`, expressive portraits, and the `CutsceneDirector`.

What we lack is a way to select a different scene based on narrative state.

I would introduce a `SceneResolver`.

It evaluates authored conditions in a predictable priority order and returns the appropriate scene ID.

For example, the railway attendant could respond differently depending on what the protagonist knows.

| Player knowledge              | Conversation                 |
| ----------------------------- | ---------------------------- |
| Has never spoken to attendant | Initial introduction         |
| Knows about the Registry      | Gives practical directions   |
| Found the transfer record     | Reacts to the record         |
| Learned the next destination  | Offers a farewell or warning |

A rough definition might look like:

```
const attendantScenes = [
  {
    when: ["found-transfer-record"],
    scene: "attendant-transfer"
  },
  {
    when: ["learned-about-registry"],
    scene: "attendant-registry"
  },
  {
    scene: "attendant-first"
  }
];
```

The resolver selects the first satisfied entry.

This is not a branching conversation tree.

The player isn't choosing between six dialogue responses or increasing relationship scores.

The world responds to what they've actually experienced.

And that means returning to a familiar NPC can be meaningful.

There's a subtle requirement here: conversations should also respond sensibly to being repeated.

We don't want a character introducing themselves for the fifth time just because a fact hasn't changed. A simple already spoken condition can select a short repeat conversation.

## 6. EffectApplier — How narrative events change the game

We already have `completionEffects` on dialogue scenes, with once-per-run bookkeeping.

I would retain that mechanism but connect it to a dedicated narrative effect handler.

It should recognize a small, explicit set of actions.

| Effect              | Example                                     |
| ------------------- | ------------------------------------------- |
| Discover fact       | `learned-about-registry`                    |
| Acquire evidence    | `found-transfer-record`                     |
| Collect Keepsake    | `keepsake-lost-letter`                      |
| Change world object | Unlock a railway gate                       |
| Complete milestone  | `registry-investigated`                     |
| Unlock stage        | Make the next railway destination available |

Effects should be idempotent.

If the player speaks to the attendant three times, they should not receive the same reward three times.

If a cinematic scene is skipped, required narrative progress must still be applied when appropriate.

And if the player cancels a scene because the session ends, nothing should be partially awarded accidentally.

However, I'd separate two kinds of completion.

Hearing a conversation and discovering physical evidence aren't the same thing.

Skipping the attendant's explanation can still give the player the information they would have heard. But skipping an unrelated scene should never award a transfer record they haven't investigated.

That distinction prevents some particularly awkward story-state bugs.

## 7. Saving the journey

This is the system I'd keep deliberately small for the first implementation.

We don't need a sophisticated save-game manager, multiple character profiles, cloud synchronization, or midair checkpoints.

Initially, I'd introduce a versioned campaign save with one slot.

```
interface CampaignSave {
  version: 1;
  unlockedStages: string[];
  completedStages: string[];
  facts: string[];
  keepsakes: string[];
  unlockedWeapons: string[];
  discoveredModifiers: string[];
}
```

The initial backing store can simply be browser `localStorage`, with validation when loading and a clear warning if persistence fails.

There are two lifetimes worth distinguishing:

Stage-local state includes enemy deaths, NPC conversation counts, temporary switch positions, and the current attempt's state. Restarting the stage resets these.

Campaign state includes important discoveries, collected Keepsakes, unlocked weapons, completed stages, and future story milestones. These persist across sessions.

I'd recommend saving major discoveries immediately and keeping stage completion separate. That way, a player who finds a secret and then dies doesn't necessarily lose the collectible—but that rule remains a design choice we should settle explicitly.

We can later add checkpoints, manual slots, or cloud saves without replacing the underlying campaign model.

## 8. A minimal objective system

I'm deliberately calling this an ObjectiveTracker, not a quest engine.

Underworld is an arcade action-platformer. We shouldn't force the player into managing a journal full of tasks.

Instead, I imagine a small current lead that updates at important moments.

EXAMPLE — OPENING STAGE

CURRENT LEAD

1 / 4

Find someone who knows where you are.

The protagonist has just arrived at the Last Platform.

&#x20;PreviousNext&#x20;

Illustrative progression through the proposed first stage, not a functioning quest implementation.

I wouldn't necessarily display this permanently.

Perhaps a short notification appears when the lead changes, and the player can open a compact journey panel if they've forgotten what they were doing.

We should also distinguish required leads from optional discoveries.

A secret letter might provide more context without becoming a mandatory objective.

That preserves the sense of exploration we want.

## 9. How this works in The Last Platform

Now let's put the systems together.

PROPOSED FIRST NARRATIVE SLICE

1. Arrival

   The protagonist appears at the Last Platform. A narrative milestone records his arrival, but control is given to the player immediately.
2. First conversation

   The attendant introduces the Registry. The scene applies `learned-about-registry` whether the player reads or skips the conversation.

   The objective changes.
3. Exploration

   The player traverses the station outskirts, encounters enemies, and may discover a hidden Keepsake.

   Optional discoveries remain optional.
4. The Registry

   The player inspects a record. The inspection reveals that the girlfriend passed through a particular route or transfer process.

   The system records `found-transfer-record`.
5. Changed conversation

   Returning to the attendant now selects a different scene. The NPC recognizes the information and may provide context that wasn't available earlier.
6. Departure

   The protagonist follows the next lead. Stage completion is saved, and the next stage becomes available.

Notice that we don't actually need a traditional quest system to make this work.

We need interactive objects, narrative facts, conditional dialogue, persistent discoveries, and one clear objective.

There's also a design choice I'd protect: the player shouldn't be forced to talk to the attendant if they independently find the Registry.

The attendant can provide the obvious route. Exploration can provide another.

The level can still guarantee that the necessary information is available without dictating the precise order in which the player discovers it.

That makes the protagonist feel capable rather than dependent on the game's instructions.

## 10. Implementation order

I'd split this into three small development slices.

| Slice              | Deliverable                                                                           | Acceptance condition                                                               |
| ------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A. Interactions    | Generalized F interaction, inspectable records, collectible objects, workshop support | Can inspect a document and collect one object without breaking NPC dialogue        |
| B. Narrative logic | NarrativeState, conditional scene resolver, typed effects, objective updates          | The attendant responds differently after the transfer record is found              |
| C. Persistence     | Versioned save, stage unlocking, collectible tracking                                 | Important discoveries survive reloads; repeated interactions do not duplicate them |

After that, we should be able to make a convincing first narrative vertical slice using the current engine.

I'd hold off on dialogue choices, faction reputation, relationship scores, large inventories, dynamic NPC schedules, and a general scripting language.

None of those is necessary to tell our opening story.

## One final design consideration

I think we should be quite deliberate about how the game treats evidence and certainty.

Our protagonist begins with an emotional conviction: something has happened to his girlfriend, and someone will answer for it.

But the world doesn't necessarily owe him immediate confirmation of his interpretation.

The player might discover that she arrived, that her passage was redirected, and that an authority was involved.

Those are facts.

Whether she was kidnapped, imprisoned, protected, betrayed, or involved in something more complicated remains a question for the story to answer.

That creates room for genuinely interesting characters and revelations without undermining his motivation.

It also means the systems we build should be able to represent what he knows, not merely which story chapter he has reached.

My preferred architecture is therefore a small, fact-driven narrative system integrated with the existing NPC and level framework.

It will let the world remember, react, and gradually reveal itself while preserving Underworld's fast arcade identity.

And once that's in place, we'll finally be able to do something rather lovely: make our little skeletal traveller investigate a mystery by physically exploring the underworld, rather than by advancing through a sequence of exposition screens.

That feels exactly right for the game we're building. ^^