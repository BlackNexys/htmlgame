# Underworld — Flicker

**Weapon specification:** v1.1 (design baseline; expanded visual and audio definition)  
**Category:** Starting weapon / free spectral projectile  
**Status:** Core identity agreed; numerical balance and modifiers provisional  

> *A tiny flame that refuses to go out.*

## 1. Core identity

**Flicker** is the protagonist's basic, inexhaustible attack: a small fragment of magenta soul-flame expelled from the hand in a sharp, instinctive motion. It is fragile in appearance but utterly dependable in use.

The name carries two complementary ideas:

- **Desperation:** a flicker is small, unstable, and seemingly close to extinction.
- **Defiance:** even without ectoplasm, the protagonist can always summon one more.

Flicker is **the simplest weapon, not a deliberately unpleasant or useless one**. It is a legitimate combat tool throughout the campaign, while more specialized weapons excel in situations it cannot handle efficiently.

## 2. Design rules

1. **Always available:** costs **0 ectoplasm**; never requires ammunition, charging, or reloading.
2. **Arcade responsive:** hold Fire for rapid repeat shots; weapon switching and normal movement remain uninterrupted.
3. **Mechanically reliable:** the projectile travels in the aimed direction with consistent speed, range, and damage. Its *appearance* flickers; its *behavior* does not become random.
4. **Intentionally simple:** no default bounce, homing, piercing, explosion, crowd control, or terrain traversal.
5. **Useful at zero resources:** allows players to defeat an enemy and restore ectoplasm through the ordinary kill-reward loop.
6. **Recognizably spectral:** visibly expelled from the protagonist's own magenta soul-fire, not a conventional firearm.

## 3. Base gameplay specification

| Property | Design | Initial tuning target |
|---|---|---|
| Ammunition cost | Free | **0 Ecto / shot** |
| Firing input | Hold Fire; fully automatic | — |
| Fire interval | Consistent and rapid | **0.20 s** (~5 shots/s) |
| Aim | Arcade directional shooting | **8 directions** |
| Trajectory | Straight | No spread/random drift |
| Projectile speed | Fast | **800 px/s** |
| Projectile lifetime | Short-to-medium | **0.9 s** maximum |
| Damage | Low, dependable | **1 base damage** for first test |
| Hit behavior | Hits first valid target | No piercing |
| Terrain | Blocked by normal solids | No wall penetration |
| Impact force | Minimal | No meaningful stagger by default |
| Movement cost | None | Fire while running, sprinting, jumping, falling, crouching, or wall-sliding |
| Reload / charge | None | — |

**Numerical values above are playtest targets, not immutable balance canon.** The projectile must not pass through solids or damage invulnerable/phased enemies in violation of the established combat rules.

### Input behavior

- When no vertical aim is held, shoot in the protagonist's facing direction.
- Up/down and diagonals follow the game's agreed arcade directional-aim convention; downward fire is primarily an aerial action.
- A held Fire input should continue working when switching back to Flicker, subject to weapon firing cadence.
- Failure to fire due to a missing animation or sound asset must never occur; combat state is authoritative.

## 4. Role in the arsenal

**Strengths**

- Infinitely available and inexpensive to use.
- Fast, legible, predictable firing.
- Effective against an isolated vulnerable enemy in a clear line of sight.
- Provides a recovery route when the ectoplasm reserve is empty.

**Limitations**

- No crowd coverage or special geometry.
- Cannot attack around corners, behind solid cover, or through specialized barriers.
- Lower burst potential against dense enemy groups or armored bosses.
- Less efficient than specialized weapons when their intended situation arises.

Examples: **Graveburst** solves clustered/close-range situations; **Gravehopper** exploits ricochet angles; **Wraith Needle** exploits alignment and penetration. They should be desirable because they do something Flicker cannot—not merely because Flicker feels miserable.

## 5. Ectoplasm recovery interaction

Flicker does **not** generate ectoplasm when merely fired or when a projectile hits.

Instead, it participates in the ordinary combat economy:

1. The player reaches zero ectoplasm, but Flicker remains available.
2. They dodge or reposition with the free baseline movement kit.
3. They defeat an eligible enemy using Flicker.
4. The enemy's defeat grants the normal **one-time** ectoplasm reward (provisional example: +1).
5. The player may approach the corpse for additional harvestable ectoplasm, if eligible (provisional example: +2).
6. Recovered ectoplasm enables more specialized attacks.

Resurrected enemies must not grant repeated kill rewards indefinitely. Bosses or encounters without ordinary enemies must remain completable with Flicker and should be tested for excessive time-to-kill.

## 6. Visual specification

### Silhouette and emotional intent

Flicker is a **small, irregular tongue of living magenta flame**, torn from the protagonist’s fingertips with a fast, instinctive flick. It must not resemble a sphere, laser, or metallic bullet. The weapon looks precarious, as though a gust could extinguish it, while the underlying movement and damage remain perfectly dependable.

### Animation beats

1. **Ignition:** an almost instantaneous pink-white concentration at the fingertips; a tendril stretches from the hand and snaps free. This is visual only, **not a charge-up**.
2. **Flight:** the pale core advances in a straight line, wrapped in an uneven magenta flame that stretches, shrinks, and changes its outline. A few tiny embers fade behind it; the bright core remains in the same relative position.
3. **Impact:** the flame pinches inward, flashes once, and scatters a few fading particles. Enemy contact gets a brighter burst; terrain gets a weaker sputter. Armored contact communicates resistance.

### Palette and readability

| Role | Suggested color |
|---|---|
| Hot core | `#FFF0F8` |
| Inner flame | `#FFABDC` |
| Magenta body | `#FF4EAE` |
| Deep outer edge | `#B51B78` |
| Fading ember | `#52204D` |

At the existing 48-pixel tile scale, the visible projectile should read as approximately **12–18 pixels long**, though the transparent animation cell may be larger. Keep glow tight: the weapon is fired approximately five times per second and must not create a wall of pink light. The protagonist’s hand/forearm may flash subtly, and their main soul-flame may briefly contract, but **it must never appear depleted by sustained firing**.

Cole throws Flicker with effort: an immediate directional release, short follow-through, elbow recovery, and a gathered pose before the next throw. Do not keep his hand extended between shots. His attached head flame and cloak continue animating through the gesture. Standing, running, sprinting and crouching use their own recovery drawings, while the moving legs retain their stride. The release pose remains aligned with the weapon's palm socket; animation adds no wind-up delay or gameplay cost. The [v4 hero kit](../public/assets/hero/canon-v4/README.md) documents the current drawings and shared material palette.

### Sprite deliverables (prototype v1.1)

The playable companion sprite pack in `public/assets/weapons/flicker/` contains transparent **32 x 32 RGBA** cells, a six-frame projectile loop with eight pre-rotated directions, ignition, enemy, terrain and armored impacts, and fading embers. The [interactive preview](../public/docs/flicker.html) shows these sequences and lets you audition the sound variations. See `flicker_atlas.json` in the pack for exact rows and timing. These are art/animation prototypes; gameplay hitboxes and attack timing stay authoritative and independent of the visible silhouette.

## 7. Audio specification

### Sonic identity

**Style:** Cyberundead spectral ignition: a crisp, brief electronic-organic sound that suggests a fragile flame being *created*, not a gunshot or laser beam. The feeling is desperate but stubborn, light but immediately responsive.

### Primary firing sound (approximately 120–150 ms)

- **Snap (15–25 ms):** a sharp, dry high-frequency *“tchk”*, between a tiny electrical discharge and a finger snap. This gives each shot a clear rhythmic transient.
- **Release (60–90 ms):** a tightly filtered airy *“fss”*, suggesting spectral energy escaping from the hand. A slight downward motion in pitch implies expulsion without sounding like a laser sweep.
- **Resonance (100–140 ms):** a quiet, hollow synthetic harmonic that quickly vanishes. It makes the sound supernatural rather than purely mechanical.

These elements **overlap**, not play one after another at full length. The combined sound should be **bright, dry, snappy, subtly unstable, and ethereal**. Avoid gun-mechanism clicks, sub-bass impacts, explosive booms, and long reverb tails.

### Automatic-fire behavior

At the initial **five shots per second**, the repetition should sound like a pleasing *“tchk–fss, tchk–fss”* rhythm. Prepare **four or five subtle variations** in pitch, brightness, and noise texture; retain a consistent attack transient so the weapon feels reliable. Limit voices and overlap so repeated fire cannot obscure enemy tells or the soundtrack. Keep most of Flicker’s energy in the upper-mid frequencies.

### Impact and reward cues

| Event | Sound character |
|---|---|
| Enemy hit | Short spectral crackle ending in a tiny, satisfying pop |
| Stone / terrain | Dry sputter and brief extinguishing hiss, clearly weaker than a damaging hit |
| Armored / blocked hit | Harder metallic tick, followed by an unsuccessful spectral fizz |
| Enemy defeat | Normal hit layered with **the enemy’s own** defeat cue |
| Ectoplasm recovered | **Separate** warm, inward-sweeping crystalline chime, contrasting the outward attack |

Flicker itself should not play an arbitrary power-up sound on kill: resource recovery, damage confirmation, and defeat are independent game events. Audio playback is cosmetic and must never hold up projectile spawning, collision, or resource updates.

**Audio north star:** *Not the sound of something dying. The sound of something still burning.*

## 8. Weapon-specific modifier directions (not yet locked)

Flicker can be specialized between levels, but must remain **free to fire** and **recognizably Flicker**. Initially, use at most one active modifier at a time.

| Candidate modifier | Focus | Tradeoff | Visual identity |
|---|---|---|---|
| **Kindling** | Larger, heavier individual flame | Lower firing rate or projectile speed | Broad, hot, bright flicker with a stronger impact bloom |
| **Stuttering Flame** | Two quick pulses rather than regular single shots | Longer pause between bursts; tune sustained damage | Pair of visibly distinct, uneven flame tongues |
| **Last Ember** | Briefly lingering impact flame | Lower immediate damage or shorter range | A tiny glowing remnant that fades at the impact point |

These are **candidate specializations**, not confirmed abilities. Each must be tested for tactical usefulness, clarity, and resource-free balance. Avoid accidentally making a modifier the obvious universal best choice.

## 9. Implementation notes

Build Flicker as the first concrete weapon in the game's weapon architecture, rather than inventing a universal behavior-composition framework up front.

Recommended responsibilities:

- **Weapon definition:** `id`, display name, zero cost, fire cadence, projectile behavior, visual/audio references, selected modifier.
- **Player/weapon controller:** checks firing intent and cadence and spawns a projectile; never subtracts ectoplasm for Flicker.
- **Projectile/collision:** straight swept movement, first impact, correct behavior against solids, enemy defenses, and invulnerability.
- **Combat:** applies damage and emits the one-time defeat reward; it does not embed ectoplasm generation in the projectile itself.
- **VFX and audio:** consume fire/hit/block events separately from authoritative damage and resource state.
- **Arsenal:** modifier choice changes only between levels, never interrupts live gameplay.

The concrete `Flicker` weapon definition/controller and `FlickerProjectile` replace the earlier unnamed test attack. `Projectile` and `CollisionSystem` retain straight swept collision. Structured weapon events carry ignition and impact positions into presentation; audio consumes separate fire, hit, terrain, block, defeat and ectoplasm cues. Modifiers remain unequipped and no other weapons or switching controls are exposed yet.

The presentation pass now emits a short directional fan at the reviewed palm, tiny drifting motes spaced along actual projectile travel, and distinct impact scatters: brighter magenta for enemies, a weaker stone sputter, and cyan-white resistance sparks for armor. These are cosmetic world-space particles, capped at 192 and driven by the simulation clock. Ignition and enemy contact get a brief tight white core flash. This adds visual snap while preserving the small flame silhouette and existing combat values.

**Playable implementation:** `src/weapons/Flicker.ts` owns the weapon tuning and zero cost; `WeaponController` owns cadence. `Combat` awards +1 ectoplasm on the first original defeat, capped at 12; a new run starts at 6. Resurrections preserve the original reward flag. Neither firing nor nonlethal hits grant ectoplasm. Harvesting, caches, other weapons, switching and modifiers remain future work. Dash has been removed from the movement design.

## 10. Acceptance criteria for the first playable slice

- [x] Flicker fires at **0 Ecto** and at zero reserve without any special-case failure.
- [x] Holding Fire produces a stable, frame-rate-independent firing cadence.
- [x] Aim and travel are deterministic in all supported firing directions.
- [x] Firing does not interrupt baseline movement.
- [ ] Weapon switching preserves held fire and individual weapon cadence (switching is not implemented).
- [x] Shots terminate correctly on solids and the first valid target.
- [x] Blocking, phasing, and other existing enemy defenses remain effective.
- [x] Normal one-time enemy defeat rewards restore ectoplasm; hit spam and resurrected enemies cannot be farmed indefinitely.
- [x] Visual animation conveys a small, unstable living flame without obscuring the hitbox or the player.
- [ ] Repeated shot sounds remain intelligible and non-fatiguing in music-heavy scenes.
- [ ] Basic encounters remain enjoyable with Flicker alone, but specialized weapons meaningfully outperform it in their intended situations.

## 11. Open tuning questions

- Is **five shots per second** the most satisfying cadence after the movement upgrade?
- Does one damage per shot make the zero-ectoplasm recovery loop too slow, especially in boss fights?
- Should it have a tiny amount of hit feedback/stagger, or stay entirely neutral?
- Which of the three modifier candidates actually creates the most interesting playstyle?

These should be answered through a movement-and-combat vertical slice rather than by specification alone.

---

**One-line design north star:** *Flicker looks like a flame on the verge of going out, but plays like the one thing the protagonist can always depend on.*
