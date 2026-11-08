# UNDERWORLD
## Game Design & Implementation Plan — v1.0

**Status:** Working design baseline, November 2026  
**Movement revision (November 2026):** Dash was removed by design decision. Traversal uses running, sprinting, variable jumps, and wall movement.

**Starting weapon revision:** [Flicker v1.1](Underworld_Flicker_Weapon_Spec_v1_1.md) is the authoritative design for the free starting attack, including its visuals, sound, tuning, and candidate modifiers. The earlier starting-weapon name and modifier brief are superseded.

**Menu art revision:** The [Main Menu Art & Animation Plan](Underworld_Main_Menu_Art_and_Animation_Plan_v1.md) defines a replacement menu scene built from purpose-made pixel-art assets. The existing menu artwork is concept reference; production begins with a hero, lantern and platform corner.
**Project:** [BlackNexys/htmlgame](https://github.com/BlackNexys/htmlgame)  
**Genre:** Level-based, fast-paced cyberundead action-platformer  
**Primary references:** *Jazz Jackrabbit* (structure and arcade combat), *Metroid* (distinctive weapon behaviors and boss rewards), *Celeste* (responsive movement and wall-jump feel)

> **Design promise:** Move quickly, fight creatively, reclaim ectoplasm from the dead, and keep going. Complexity belongs in the interactions between mechanics—not in menus that interrupt the action.

**Worldbuilding review (7 November 2026):** The [Deadways atlas v0.1](Worldbuilding/Underworld_Deadways_World_Atlas_v0_1.md) is an exploratory setting source, not established canon. [Alignment notes](Worldbuilding/README.md) distinguish its proposals from agreed mechanics and the playable build. This review does not start demo-level production or expand the delivery roadmap.

**Narrative systems revision:** The [fact-driven narrative slice](narrative-system.md), based on the [supplied proposal](Worldbuilding/Underworld_Narrative_Interaction_Proposal_v0_1.md), now implements physical inspect/collect/operate interactions, conditional attendant scenes, a current lead, optional Keepsakes, versioned single-slot saving and next-stage unlocking. Important discoveries save immediately and survive death/restart, as explicitly chosen. `narrative-study` and `departure-study` are noncanonical systems fixtures, not the final demo. Weapon/modifier progression and bosses remain separate work.

### Status key

**Environment art pass (8 November 2026):** The [Confluence kit](../public/assets/environment/confluence/v1/README.md) supplies terrain, facade, prop, landmark and city/river layers. [Twelve v2 architectural modules](../public/assets/environment/confluence/v2/README.md) now frame station entrances, inhabited balconies, freight/viaduct crossings, Registry interiors and archive machinery. The live actor art is preserved; decorative layers fail independently. Animation and gameplay audio remain later passes.

**District rebuild (8 November 2026):** [The Last Platform](last-platform-demo.md), revision 4, replaces the shelf/shaft blockout with an architectural 9,408 × 2,496 district: arrivals, inhabited frontage, two crossings, public/freight Registry entrances, upper gallery, lower records return, reversible archive and departure. Existing movement/combat, draft dialogue, physical clues, optional persistent Keepsake, explicit shutter and demo completion remain. Story IDs stay separate from studies and old saves remain compatible. Duration, balance, audio and final canon remain open.

- **Agreed:** Established by our design discussion.
- **Provisional:** Recommended implementation or tuning baseline; requires playtesting.
- **Open:** Intentionally unresolved, not to be silently decided during implementation.
- **Exploratory setting proposal:** Material under consideration in the Deadways atlas; not an agreed feature, campaign commitment, or claim of implementation.

---

## 1. Vision and boundaries

The player is a cyberundead protagonist searching the underworld for their soulmate. The protagonist **speaks** in scripted dialogue, but their personality, voice, history, and specific story beats remain **open**.

The game consists of distinct, replayable stages rather than an interconnected Metroidvania map. Movement is expressive from the start. New weapons are primarily obtained by defeating bosses; optional discoveries yield **weapon-specific modifiers**. The game's combat economy is based on ectoplasm, used as ammunition for distinct attacks and replenished through fighting and harvesting remains.

### Setting relationship — exploratory

The atlas proposes a world whose alien geography and ecology contrast with the familiar civilization built by the dead. Primordial spectral rivers and historical Deadway railways connect inhabited and remote regions. The eight named regions are environmental proposals, with no fixed stage count or order. The existing menu station could be the Last Platform in or near the Confluence; that placement remains provisional.

Use this direction to evaluate future setting and level briefs. Undeath alone should not be used to infer hostility: the current zombie, skeleton, and other enemy classes describe combat actors, not every member of a population. Opponents can have duties, homes, or competing aims. The soulmate's identity and agency, the separation, and the ending still need their own discussion.

The setting's possible relationship to Blacklight / a Live Mausoleum is nonbinding. The use of Blacklight UI components is a technical dependency and establishes no fictional connection.

### Core pillars — agreed

1. **Arcade flow:** Running, jumping, shooting, and switching weapons should chain without unnecessary pauses.
2. **Movement mastery:** Sprint, variable jump, and wall slide/jump form the starting kit—not a skill-tree reward.
3. **A differentiated arsenal:** Each weapon introduces a new attack geometry or tactical problem; it is not a recolored damage tier.
4. **Positive combat economy:** Enemy defeats and corpse/graveyard interactions restore ammunition and encourage continued movement.
5. **Readable personality:** Scripted dialogue and expressive portraits let characters converse without RPG dialogue choices.

### Explicit exclusions — agreed

- No general character skill tree, XP grind, or Soul Forge progression system.
- No mandatory backtracking or ability-gated Metroidvania world.
- No ectoplasm/stamina cost for ordinary movement.
- No weapon-modifier allocation during a stage.
- No RPG dialogue choices or branching conversation interface in the initial design.

**Scope discipline:** Do not build all six weapons, campaign systems, and bosses at once. Validate one small slice of the loop first.

---

## 2. Player experience and game loop

### Minute-to-minute loop

**Traverse → position → attack → defeat → recover ectoplasm → change position → continue.**

Running and jumping create angles of attack. Ammunition-consuming weapons exploit these angles. Successful combat immediately returns some ectoplasm; approaching a corpse offers extra recovery and can deny a necromancer its resurrection target. The free default weapon remains available when ectoplasm is empty.

The player should be able to play cautiously; aggressive play is **rewarded**, not required for basic completion.

### Stage-to-stage loop

1. Enter a discrete stage with the unlocked arsenal and previously selected modifiers.
2. Navigate platforming challenges, enemies, secrets, and occasional scripted conversations.
3. Earn ectoplasm during play; collect persistent modifier discoveries when found.
4. Reach the exit, or defeat a boss where the stage calls for one.
5. A major boss's first defeat unlocks a new permanent weapon/power.
6. Between stages, optionally configure discovered modifiers in a simple **Arsenal** screen; continue directly if no changes are wanted.
7. Replay earlier stages for secrets, mastery, or enjoyment.

**Design constraint:** A standard stage should be beatable with baseline movement and Flicker, unless a future stage deliberately communicates a different explicit requirement.

---

## 3. Movement — agreed v1.0

### Controls and abilities

- **Run:** Fast directional travel; existing movement forms the baseline.
- **Sprint:** Hold to increase speed and acceleration, with no stamina/ectoplasm drain.
- **Variable jump:** Tap for a short hop; hold for the full height.
- **Coyote time:** Brief grace window after running off a ledge.
- **Jump buffer:** A slightly early jump triggers on the next valid landing/wall-jump opportunity.
- **Wall slide:** Holding toward a wall while falling caps descent speed.
- **Wall jump:** Jump outward with a brief protected push before air steering returns.
- **Combat compatibility:** Ordinary shots do not arbitrarily zero momentum, freeze the player, or cancel jumps; a specific weapon may introduce intentional recoil later.

### Provisional first-pass numbers

| Parameter | Initial target |
|---|---:|
| Simulation timestep (already in engine) | 1/120 s |
| Run speed | 330 px/s |
| Sprint speed | 440 px/s |
| Ground acceleration / deceleration | 2,600 / 2,200 px/s² |
| Air acceleration | 80% of ground acceleration |
| Jump impulse / gravity | 700 px/s / 1,800 px/s² |
| Terminal falling speed | 850 px/s |
| Coyote time / jump buffer | 100 / 120 ms |
| Wall-slide fall cap | 160 px/s |
| Wall-jump horizontal / vertical impulse | 340 / 650 px/s |
| Wall-jump input commitment | 100–120 ms |

These are **test inputs, not balance canon**. Tune against 48-px tiles, actual enemy attacks, camera behavior, and keyboard/controller ergonomics.

### Movement and collision rules

- Resolve movement against floors, walls, corners, and ceilings without clipping or embedding the player.
- Running, sprinting, jumping, and wall movement grant no immunity to enemy bodies, shots, or hazards.
- Pause, death, restart, and cutscene entry clear buffered actions and prevent inherited velocity/input bugs.

### Camera

Add forward look-ahead during fast horizontal travel, controlled vertical follow for shafts and wall jumps, clamping to stage bounds, and no abrupt camera snap on small direction changes. Keep world-coordinate physics independent of camera-space drawing.

---

## 4. Arcade controls — agreed philosophy, provisional mapping

**Keyboard proposal:**

| Action | Default |
|---|---|
| Move / horizontal direction | A/D or Left/Right |
| Aim / vertical direction | W/S or Up/Down |
| Jump | Space |
| Sprint | Left Shift (held) |
| Fire selected weapon | J (held where supported) |
| Harvest / interact | F |
| Previous / next weapon | Q/E |
| Direct selection | Number keys |
| Pause | P / Escape |

**Aiming:** Arcade-style directional fire rather than mouse aim. Facing determines the horizontal default. Holding Up or Down changes aim; combinations allow diagonals. Downward fire applies in midair; while grounded, prevent unhelpful shots directly into the floor. Preserve a coherent facing direction independently of short vertical aim inputs.

**Weapons:** Switch instantly during movement. If Fire remains held, the new weapon observes its own firing cadence; switching must not bypass cooldown or repeat-cost rules. Expensive weapons should not unintentionally empty the reservoir through an overly fast repeat rate.

**Input implementation:** Distinguish *pressed this frame*, *released*, and *held* actions. Jump is a one-shot input; firing may be held. Clear held inputs and buffered actions on blur, pause, cutscene entry, and restart. Controller support and rebinding are desirable later, but do not block the first playable slice.

**Open usability question:** Exact aim semantics when holding opposing inputs or aiming vertically while sprinting. Set deterministic priority and confirm in playtest.

---

## 5. Ectoplasm economy — agreed rules, provisional balance

Ectoplasm is **shared ammunition**, not a permanent skill currency. It is not consumed by normal run, jump, sprint, or wall jump. Each weapon fires at its own cost; **Flicker is always free**.

### Starting experiment

| Event | Candidate value |
|---|---:|
| Maximum ectoplasm | 12 |
| Starting ectoplasm | 6 |
| First legitimate enemy defeat | +1 |
| Harvest eligible corpse | +2 |
| Graveyard cache | +4 |

**Never treat these as final.** Tune against encounter density, weapon cost, difficulty, and the desire to use special attacks regularly.

### Ectoplasm guarantees

1. A shot checks the complete cost **before** spawning an attack; insufficient reserve does not partially spend or misfire.
2. Resource is always clamped to `[0, capacity]`.
3. Each originally spawned enemy contributes its normal defeat reward at most once—even if later reactivated.
4. A corpse is harvested at most once. Harvesting removes or marks it unavailable for necromancer reactivation.
5. Defeat rewards are immediate and need no pickup chase; harvesting requires proximity and a fast action, without forcing a stationary animation.
6. Graveyards have explicit stock or recharge rules; the first prototype uses finite, easily understood caches.
7. Boss encounters supply intentional ectoplasm recovery opportunities or are balanced to remain engaging with the free weapon; no resource softlocks.
8. Player death/restart must restore the appropriate stage-start ammunition state, not inherit the previous attempt's depleted reserve.

**Provisional interaction rule:** Harvesting a corpse already claimed by a channeling necromancer interrupts the claim if completed before resurrection. Test whether that provides a satisfying contest rather than an overly easy counter.

**Open economy choice:** Whether ectoplasm enters each new stage at a fixed reserve or refills to capacity. For prototype consistency, use a fixed stage-start amount.

---

## 6. Soul Arsenal — six baseline weapons

All six are **agreed as a revisable baseline**, not committed numerical balance. Boss defeats unlock new weapons permanently; Flicker is available from the beginning. Weapons are instantly switchable within stages.

| Weapon | Cost (test) | Defining attack pattern | Intended advantage | Principal weakness |
|---|---:|---|---|---|
| **Flicker** | **0** | Straight, rapid projectile | Reliable fallback, finishing, baseline play | Modest damage; limited geometry |
| **Gravehopper** | 1 | Projectile ricochets from terrain | Angled attacks and corridors | Harder to predict in open areas |
| **Graveburst** | 2 | Short-range spread/cone of fragments | Close-range crowd control | Weak at distance |
| **Wraith Needle** | 2 | Thin piercing shot, with specially defined pass-through interactions | Lined-up targets and specific barriers | Narrow hitbox; deliberate aim |
| **Deathmark** | 3 | Attached charge; delayed or triggered detonation | Trap-setting and timing | Setup time; less immediate |
| **Revenant Swarm** | 4 | Multiple seeking spirit projectiles | Aerial and dispersed enemies | High cost; target-selection constraints |

### Weapon behavior requirements

- Each weapon has distinct trajectory/impact behavior, cadence, telegraph, audio, and readable sprite/effect silhouette.
- Every weapon can be fired while running, sprinting, jumping, and falling.
- Spawn attacks from a consistent muzzle/manifestation point that respects facing and all eight aim directions.
- Use swept or equivalent collision checks to avoid fast projectiles tunneling through walls or targets.
- Ricochet counts, penetration limits, delayed explosives, seeking range, and friendly-fire ownership require explicit caps.
- Targets shielded, phased, invulnerable, or defeated should retain their established interaction contracts unless a weapon explicitly overrides them.
- Maintain magenta as the player soul-energy accent and cyan as the usual enemy-tech/hostile projectile cue; secondary effects may vary without confusing ownership.

### Weapon acquisition and replay

The first defeat of a **major boss** grants a persistent weapon unlock. Repeat victories must not duplicate the unlock. On replay, previously acquired weapons stay available. Boss-to-weapon pairings, bosses' identities, and unlock pacing remain **open**.

---

## 7. Modifiers — agreed specialization system

**No Soul Forge, no general skill tree.** Use a lightweight **Arsenal** selection screen between levels. Discover modifiers through secrets, optional challenges, or other deliberate stage rewards. A discovered modifier remains permanently unlocked and can be selected on later stage entries.

### Rules

1. Modifiers are **specific to one parent weapon**, never generic global upgrades.
2. Each must sharpen or redirect that weapon's signature property and change player tactics.
3. Each has an observable **visual effect** in action: silhouette, particles, arc, impact animation, or weapon manifestation.
4. Prefer meaningful tradeoffs (speed, range, coverage, bounce count, cadence) over unconditional damage bonuses.
5. A modifier need not increase ectoplasm cost; adjust cost only when the altered behavior warrants it.
6. **Initial system:** one active modifier per weapon; the unmodified configuration remains selectable and viable.
7. Equip/change modifiers **between stages only**. No menu interruptions during play.
8. The player can ignore the Arsenal screen and continue with the previous selections.

### Illustrative specializations (not a finalized modifier catalog)

| Weapon | Candidate modifier | Tactical change | Readable visual difference |
|---|---|---|---|
| Flicker | See [Flicker v1.1](Underworld_Flicker_Weapon_Spec_v1_1.md#8-weapon-specific-modifier-directions-not-yet-locked) | Candidate directions only; not equipped in this slice | Defined in the weapon spec |
| Gravehopper | Echo Chamber | More ricochets at reduced speed | Bright circular bounce rings |
| Gravehopper | Haunting | Steers toward a target after first bounce | Curved spectral tail |
| Graveburst | Focused Rupture | Narrower, longer-reaching spread | Tighter bundle of shards |
| Wraith Needle | Soul Lance | More penetration at reduced cadence | Long needle and trailing filaments |
| Deathmark | Chain Reaction | Charges can trigger neighboring charges | Connecting arcs between marks |
| Revenant Swarm | Pack Instinct | Spirits concentrate on one target | Coordinated spiraling formation |

### Compatibility / future scaling

Do **not** introduce stackable modifiers until a real test proves the value. If we eventually permit two slots, define compatibility and cost rules per weapon; avoid a universal modifier graph with uncontrollable combinations.

---

## 8. Level structure, encounter design, and rewards

Stages are **linear or branching discrete levels** with entrances, exits, secrets, checkpoints where appropriate, and strong replay value. They should support both quick completion and optional exploration.

### Regional context and discoveries — exploratory

The Deadways could connect discrete stages through main lines, branches, and lost stations. A rail network is world geography, not a requirement for a continuous map, mandatory backtracking, or train sequences at every entrance and exit. No region is assigned to the demo or to the existing Lower Passage fixture.

The atlas proposes separate purposes for run resources, permanent mechanical discoveries, and world keepsakes. Ectoplasm and modifier design retain their existing status here; keepsakes, environmental stories, and optional encounters are candidate additions, with no new currency or completion requirement agreed. Secrets can reward curiosity as well as combat and movement mastery.

Flooding, moving trains, sound-responsive growths, inverted traversal, and reflected routes are regional ideas requiring design and implementation review. They must preserve readable rules and reliable controls. Their appearance in concept art or the atlas does not make them part of the current vertical slice.

### Stage design grammar

- **Arrival:** A readable starting area, movement teaching or introduction, and immediate orientation.
- **Traversal:** Horizontal speed sections, vertical shafts, wall jumps, environmental hazards.
- **Combat:** Encounters that reward different weapon geometries and movement choices.
- **Optional routes:** Secrets and challenge pockets that reward modifier discovery, not compulsory progression.
- **Recovery opportunities:** Ectoplasm flow through combat, corpses, and placed graveyard caches.
- **Climax:** A hard traversal section, special encounter, or boss (not every stage needs a boss).
- **Exit and recap:** Clear finish, optional rewards summary, and onward stage selection.

### Encounter principles

- Telegraph enemy attacks and retain their current distinct counterplay.
- Leave room for high-speed approaches, evasive movement, and weapon experiments.
- Keep threats legible while the player is firing and moving.
- Avoid designs that require one secret modifier to advance.
- A well-modified weapon may open a shortcut or provide tactical convenience without becoming the only solution.
- Corpse placement should generate interesting harvest-versus-threat decisions, particularly near necromancers.

### Proposed vertical-slice arena

Adapt one section of **The Lower Passage** or add a short dedicated test stage containing: a sprint lane, two wall-jump surfaces, a sprint-jump gap, a ricochet opportunity, a zombie/skeleton encounter, a necromancer with a recoverable corpse, and a finite graveyard cache. Include a secret containing one Gravehopper modifier, plus a simple stage exit.

**Checkpoints:** Required as a campaign feature eventually, but exact spacing, respawn behavior, and scoring rules are open. The vertical slice can start with full-stage restart for test clarity.

---

## 9. Bosses and campaign progression

**Agreed:** Major bosses unlock new weapons/powers when defeated. The boss should demonstrate or thematically foreshadow the rewarded power so learning, victory, and acquisition connect.

### Boss encounter contract

1. Trigger a brief skippable introduction; suspend player physics while scene control is active.
2. Establish the boss's readable combat mechanic and arena hazards.
3. Run a deterministic encounter with clear health, attack telegraphs, transitions, and defeat criteria.
4. On victory, commit the campaign's boss-defeat/unlock state **once**, independently of cutscene playback.
5. Play an optional defeat conversation and a clear weapon-unlock presentation.
6. Transition to stage completion or a safe post-boss area.

Bosses may be defeated without necessarily dying in the fiction. Their identities, personalities, number, episode cadence, and story outcomes remain **open**.

### Replay guarantees

- Replaying a boss retains the unlocked weapon and does not duplicate rewards.
- Skipping intro/outro does not skip the unlock, clear flags, or other required campaign effects.
- Losing the fight or restarting does not accidentally set completion flags.
- Boss arenas do not create an unavoidable ammunition starvation loop.

---

## 10. Dialogue and cutscenes

**Agreed:** The protagonist talks. Personality and specific script are deliberately not defined yet. Characters communicate through scripted text and expressive portraits. No RPG choice tree is required.

**Prototype implemented (7 November 2026):** The [dialogue system notes](dialogue-system.md) describe the preferred centered kinetic exchange at `/?dialogueDemo=kinetic`, hosted directly by `/dialogue.html` too. The earlier travelling overlay (`/?dialogueDemo=action`) and cinematic scene (`/?dialogueDemo=1`) remain for comparison. Expression portraits, styled text beats, pauses, transcript, pacing, skip, focus handling and Blacklight controls are implemented. Neutral NPCs support F interaction and workshop placement. The [narrative study](narrative-system.md) now adds persistent discoveries, physical evidence and fact-driven scene selection. Scene completion/skip commits validated idempotent narrative batches; cancellation grants nothing. The attendant and dialogue remain noncanonical test material. Arbitrary environmental triggers, boss rewards and full world choreography remain later work.

### Dialogue presentation

- One active line at a time, with speaker name, portrait, expression, and dialogue text.
- Portrait expressions switch on authored lines; idle/flame variations may add life.
- Text can reveal progressively; first advance completes the current line, next advance moves forward.
- Entire conversations can be skipped, especially on replay.
- Presentation revision (7 November 2026): the preferred direction is a centered kinetic exchange with gameplay frozen and the HUD hidden. One large expressive portrait and prominent text trade sides with quick turn handoffs and authored pauses. The earlier small travelling overlay is retained only as a comparison option. Modal kinetic/cinematic scenes hold gameplay for the whole exchange; the optional overlay retains its read/focus holds.
- Conversations support accessibility: adjustable text speed (including instant), readable contrast, keyboard/controller advance, and minimal flashing.

### Lightweight cutscene events

The full future command set should include `dialogue`, `setExpression`, `cameraFocus`, `playAnimation`, `wait`, `spawnOrEnableBoss`, `startBoss`, `unlockWeapon`, `completeStage`, and `endCutscene`. Keep narrative text/data separate from gameplay state mutations. The current prototype supports the smaller `line`, `cue`, and `wait` contract; cue focus drives the standalone backdrop, not the gameplay camera.

**Critical invariant:** Skipping a scene resolves all *required* state changes exactly once. Optional presentation actions can be skipped; gameplay rewards and progression cannot.

### Narrative scope

Use dialogue for boss intros/outros, NPC encounters, scene transitions, and occasional quiet moments. Do not require NPCs to have elaborate dialogue trees. Avoid defining the protagonist's personality before the separate characterization discussion.

---

## 11. Technical integration with the existing repository

This plan extends the existing **TypeScript + Canvas + Vite** project. Prefer incremental refactoring over rebuilding the engine.

### Existing code and recommended ownership

| Current file/system | Planned responsibility or extension |
|---|---|
| `src/game/FixedClock.ts`, `GameLoop.ts` | Keep fixed simulation timing and bounded catch-up. Preserve lifecycle guarantees. |
| `src/components/Actor.ts`, `src/game/movement/physics.ts` | Preserve shared motion and collision; expose robust wall-contact/landing information for player movement. |
| `src/components/Character.ts` | Compose player movement with ectoplasm and weapon selection. Keep logic from becoming one giant method. |
| `src/game/Input.ts`, `src/interfaces/Game.ts` | Expand action map; expose held/pressed/released commands and directional vectors; preserve focus handling. |
| `src/components/Projectile.ts`, `FlickerProjectile.ts`, `src/weapons/Flicker.ts` | Keep common projectile ownership and lifetime and the concrete Flicker weapon; later add explicit ricochet, spread, pierce, and seeking/sticky weapons. |
| `src/game/systems/CollisionSystem.ts` | Return enough impact context (normal/solid/target) for ricochet and penetration; preserve earliest-hit behavior. |
| `src/game/systems/Combat.ts` | Award per-enemy ectoplasm on original defeat; maintain damage and defeat-credit invariants. |
| `src/components/Corpse.ts`, `src/game/systems/Graveyard.ts` | Add harvest eligibility, single-use harvest, necromancer claim resolution, and reactivation prevention. |
| `src/game/World.ts` | Orchestrate update order and gameplay events; do not bury weapon/harvest rules in the loop. |
| `src/game/Camera.ts` | Speed-aware horizontal look-ahead and vertical traversal support. |
| `src/ui/Hud.ts`, `GameMenu.ts` | Show ectoplasm, selected weapon/modifier, and transitions to stage selection/Arsenal. |
| `src/game/AssetLoader.ts`, renderers | Load weapon/portrait assets, render distinctive projectile and movement effects. |
| `src/maps/actionLevel.ts` | Preserve existing regression level; add a deliberate test stage or focused encounter fixtures. |

### New modules (suggested, not mandated filenames)

- `PlayerMovement` or movement-mode helper: timing, sprint/jump/wall rules, coyote/buffer windows.
- `WeaponDefinition`, `WeaponController`, weapon-specific attack implementations: firing rules and cost ownership.
- `WeaponModifier`/typed modifier definitions: **per-weapon** configuration and visual parameter set.
- `EctoplasmReserve`: bounded atomic spending/recovery.
- `InteractionSystem`: proximity-based harvest and other simple interactions.
- `CampaignProgress` / `SaveService`: persistent weapon unlocks, discovered modifiers, selection, and stage completion.
- `DialogueController`, `DialogueView`, `CutsceneDirector`, and `DialogueSession`: implemented under `src/dialogue` for the first authored-scene slice; extend without merging simulation and presentation concerns.
- `BossController` or per-boss subclasses: explicit encounter lifecycle and reward handoff.

**Architecture recommendation:** Define a small stable data contract for weapons and modifiers, but use concrete behavior classes/functions for truly different projectile interactions. Don't build an elaborate generic ability framework before two or three weapons prove the abstraction.

### Illustrative state model

```ts
interface CampaignProgress {
  completedStages: string[];
  defeatedBosses: string[];
  unlockedWeapons: string[];
  discoveredModifiers: string[];
  activeModifierByWeapon: Record<string, string | null>;
}

interface StageLoadout {
  availableWeapons: string[];
  activeModifierByWeapon: Record<string, string | null>;
}

interface PlayerCombatState {
  ectoplasm: number;
  maxEctoplasm: number;
  selectedWeapon: string;
}
```

This is a **concept sketch**, not the final TypeScript API. Prefer typed IDs/unions instead of loose strings once the catalog is defined. Validate loaded save data and handle missing/obsolete modifier IDs.

### Simulation and UI separation

- All physics, ammunition spending, projectile collisions, and enemy death bookkeeping belong to deterministic simulation updates.
- DOM/Lit components present menus, Arsenal configuration, dialogue, and HUD; they do not decide combat results.
- Rendering reads state and emits visual effects without mutating core simulation state.
- Avoid duplicate event handlers or animation loops after restart, pause, or cutscene transitions.
- Use idempotent campaign reward operations; never couple permanent unlocks to a portrait's last text line.

---

## 12. Delivery roadmap and acceptance gates

Implement in vertical slices, preserving a playable main branch. Each phase ends with tests and a hands-on playtest.

### Phase 0 — Stabilize baseline

**Work:** Confirm current `npm run check` and browser tests; record movement feel, input behavior, and existing enemies; preserve original level as a regression fixture.

**Done when:** Current game still builds, loads, plays, pauses, restarts, and passes existing verification.

### Phase 1 — Movement v1.0

**Work:** Sprint, variable jump, coyote time, buffering, wall slide/jump, movement animation/state, camera updates.

**Done when:** The complete movement kit works consistently at multiple render rates; movement does not tunnel through solids; wall jumping and restart/pause behavior are predictable; firing while moving remains responsive.

### Phase 2 — Combat economy + first two weapons

**Work:** Flicker as the free weapon, Gravehopper ricochets, ectoplasm reserve/HUD, instant switching, defeat recovery, corpse harvest, one graveyard cache.

**Done when:** Ectoplasm never goes negative, spending is atomic, harvested corpses cannot revive, resurrection cannot duplicate rewards, and the player can switch attacks fluidly in a mixed encounter.

### Phase 3 — Modifiers + simple Arsenal

**Work:** Add at least **two mutually exclusive Gravehopper specializations** (e.g. Echo Chamber and Haunting), unlock flags, visual effects, and between-stage selection. No skill tree.

**Done when:** Each selected modifier changes tactics and is identifiable on screen; switching is unavailable mid-stage; unlocked discoveries persist through restart and browser refresh.

### Phase 4 — Narrative slice

**Current progress:** Dialogue presentation/lifecycle is implemented. The additional [narrative study](narrative-system.md) covers interactions, saved facts/Keepsakes, changed conversations, independent discovery order, current leads, a temporary gate and stage unlocking. Boss progression, final demo content and full world choreography remain later work.

**Work:** One short two-character conversation, multiple portrait expressions, line reveal/advance, skip, camera/animation cue, correct simulation pause behavior.

**Done when:** Dialogue plays and can be skipped without input leaks, stuck pause states, or missed required events; keyboard focus returns to gameplay.

### Phase 5 — First boss + permanent weapon reward

**Work:** A small boss with telegraphed attacks; intro/outro cutscenes; a new weapon reward; persistent boss-defeat state and replay handling.

**Done when:** Winning unlocks exactly once; skipping all cutscenes still grants the reward; losing/retrying never grants it; replay keeps the reward and remains fun.

### Phase 6 — Expand the game

**Work:** Additional four weapon behaviors, their bespoke modifiers, new bosses and stages, secrets, checkpoint/save improvements, controller support, asset polish, accessibility, balance and performance.

**Done when:** Each added weapon has a distinct tactical niche and visual identity; optional modifiers remain optional; level completion never depends on an undisclosed build.

**Ordering constraint:** Do not design the full campaign or build all six weapons before the first movement/combat/harvest slice has been played and assessed.

---

## 13. Verification plan

### Automated simulation tests

- Frame-rate independence of movement, projectile trajectories, and cooldowns.
- Coyote time, jump buffering, variable jump heights, wall contact, and wall-jump push-off.
- Movement collision against floors, thin walls, corners, and ceilings; no embedded player.
- Focus loss, pause, restart, cutscene transitions, and held-key clearing.
- Ectoplasm boundary cases: exact cost, insufficient ammo, cap overflow, free Flicker.
- Original-defeat-only reward, single-use harvest, corpse-claim conflicts, and reactivation eligibility.
- Projectile collision: earliest impact, terrain occlusion, bounce normal, multi-hit protection, and lifetime termination.
- Modifier selection remains fixed within a run; invalid modifier/weapon pairs cannot load.
- Boss rewards and progression commits are idempotent and survive reload.
- Cutscene skip and normal completion produce identical required campaign state.

### Browser and presentation checks

- Chromium and Firefox end-to-end playthrough and restart.
- Keyboard navigation and game focus after UI/Arsenal/dialogue interactions.
- Animation frame correctness and readable effects at actual gameplay scale.
- Text readability, portrait expressions, typewriter skip, and reduced-motion behavior.
- Narrow display behavior without requiring touch controls in the initial release.
- Asset failure handling and graceful fallback.

### Human playtest questions

1. Does movement feel immediately responsive, including after direction changes and wall jumps?
2. Do sprinting, jump height, and wall movement offer useful choices when navigating obstacles and enemies?
3. Can players use Gravehopper effectively without fighting the controls?
4. Does harvesting add momentum and risk/reward, or force unwanted stopping?
5. Do players naturally use special ammunition, or hoard it?
6. Is the changed behavior of a modifier obvious without reading its tooltip?
7. Do scripted conversations add character while respecting replay pace?
8. Does beating a boss and receiving its weapon feel like a meaningful milestone?

Record observations separately from hypotheses, then revise values. A passing test suite does not establish that the game feels good.

---

## 14. Decisions still intentionally open

- Protagonist's personality, dialogue voice, backstory, and soulmate's characterization.
- Underworld metaphysics and the exact relationship of technology, soul, and ectoplasm; whether rivers bring in newly dead people; and what body defeat or reactivation means for a person.
- Which Deadways regions become part of the setting, their stage mapping/order, rail governance, and the Last Platform's location.
- Regional environmental laws and traversal interactions; how world keepsakes or other nonmechanical discoveries would work.
- Any Blacklight / Live Mausoleum continuity, which remains optional and nonbinding.
- Boss identities, number, order, and final weapon-to-boss mapping.
- Campaign episode count and length, checkpoints, death consequences, and scoring.
- Final aiming edge cases, controller mapping, and rebinding UX.
- Final weapon timings/damage, Ecto costs, recovery values, and refill-on-stage-start rule.
- How strongly graveyard caches are guarded/limited; whether harvesting a claimed corpse directly interrupts a channel.
- Exact modifier catalog and whether multiple active modifier slots ever become worthwhile.
- The presentation style of the Arsenal UI, portraits, and cutscene transitions.

**Do not silently turn any of these into settled canon during implementation.** Choose a minimal temporary behavior, document it, and test it.

---

## 15. Definition of the first successful vertical slice

A player can start a short *Underworld* stage, move fluidly using sprint, variable jumps, and wall jumps, fire a free Flicker or spend ectoplasm on Gravehopper, defeat enemies, collect ectoplasm from kills and corpses, choose a discovered Gravehopper modifier **between attempts**, watch/skip a brief character exchange, and reach the exit without an RPG menu interrupting the action.

The implementation remains compatible with the existing TypeScript/Canvas architecture, passes simulation and browser checks, and exposes enough tuning for a productive playtest.

**If that is fun, expand it. If it isn't, fix the loop before adding breadth.**

---

*Document intent: a working plan for development, not a claim that these future features are already implemented. Agreed design principles are distinguished from provisional mechanics and intentionally open story decisions.*
