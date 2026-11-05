# Cyberundead enemy behavior

All six enemy types are playable in the lower passage. The level starts with individual encounters, then puts a zombie and wight near a necromancer so we can test corpse reactivation in a small group. There are eight original opponents. Reaching the exit completes the run; defeating everyone is optional.

This is the first combat pass. Timings, movement speeds, health, and ranges live in `src/game/config.ts` for adjustment after playtesting.

## Enemies and counters

| Enemy | Behavior and tell | How to respond |
| --- | --- | --- |
| Zombie | Shuffles, stops for a 0.55 second spinal charge, then lunges in its locked direction. It stands still for 0.8 seconds afterward. | Bait the lunge, move past it, and attack during recovery. |
| Skeleton | Plants its feet and charges for 0.75 seconds. A dotted line shows the horizontal firing lane. It fires a cyan bolt in the direction it chose when charging began. | Jump the bolt or move behind it during the charge. It cannot turn that shot to follow you. |
| Ghoul | Crouches for 0.55 seconds, then makes a fast forward leap. It cannot steer during the attack and pauses for 0.95 seconds after it. | React to the crouch and avoid the committed path. Shoot during the recovery. |
| Ghost | Drifts while visibly phased. Shots pass through it and it cannot hurt the player by contact in that state. It becomes solid to charge an aimed bolt and stays vulnerable through recovery. | Track its movement, then fire during the solid charge and recovery window. Dodge after its aim locks. |
| Wight | A raised shield blocks frontal shots, with visible and audible block feedback. It opens its shield during the 0.7 second bash windup and during recovery. | Shoot from behind, or attack during the exposed windup and recovery. The shield is raised again during the forward bash. |
| Necromancer | Retreats when crowded. It claims a nearby eligible corpse and channels a visible cyan link for 1.6 seconds before reactivating it. | Follow the link to the caster. Any damaging hit interrupts the channel, and defeating the caster releases its claim. |

Charge bars fill before attacks. Enemy names and state labels appear above their health bars. A nearby-enemy hint below the game explains the current counter. Player shots are magenta; enemy bolts are cyan.

## Shared rules

Ground enemies collide with terrain. Walking enemies turn at unsupported edges, while committed lunges and leaps retain their direction. Ranged enemies need line of sight to begin an attack; bolts collide with stone along their complete travel, including diagonal ghost shots. Enemy bolts hit the player and terrain, while player shots hit enemies and terrain.

One hit removes one player health point and starts the existing one second recovery grace period. Enemy health varies by type: zombies, skeletons, ghouls, and ghosts have three; wights have five; necromancers have four.

## Corpse reactivation limits

- Each necromancer can complete at most two reactivations per run.
- Each individual corpse can return only once. Ghosts and necromancers are ineligible.
- A caster can claim only an unclaimed eligible corpse within range and line of sight. Two casters cannot channel the same corpse.
- Damage interrupts a channel and releases the corpse without consuming a completed reactivation from the budget.
- Reactivated enemies return with reduced health and a brief stationary wake-up grace period.
- A corpse's cyan marker shows that it can return. After its final defeat it becomes dim, with a small spent marker.
- The HUD credits each original enemy only once, including enemies defeated again after reactivation.

Restarting reconstructs the world, restoring budgets and clearing corpses, claims, attacks, and effects. Pause freezes simulation and combat timing.

## Implementation and checks

Each concrete enemy has its own class under `src/components`: `Zombie.ts`, `Skeleton.ts`, `Ghoul.ts`, `Ghost.ts`, `Wight.ts`, and `Necromancer.ts`. They inherit shared lifecycle and damage handling from `Enemy`, physical movement from `Actor`, and spatial bounds from `GameElement`. Ground enemies share attack timing and ledge safety through `GroundEnemy`. Each concrete class owns its decisions and special rules: leaps, horizontal shots, phasing, shielding, or corpse channels.

`EnemyFactory.ts` only maps level identifiers to constructors. `World` coordinates updates, while `CollisionSystem` resolves visibility and projectile impacts, `Combat` handles damage bookkeeping, and `Graveyard` manages corpses and membership during reactivation. Defenses and damage reactions remain on the entity. Necromancer interruption and budgets stay inside `Necromancer.ts`. Reactivation retains the concrete instance so its behavior survives death and revival.

`GameScreen` composes the drawing passes. `EnemyRenderer` draws living opponents, `CorpseRenderer` draws their remains, and `EnemyAnimation` maps common states to sprite poses. The existing PNG sheets are used without changing the source images.

Run `npm test` for behavior and physics checks and `npm run test:browser` for the two-browser traversal and restart checks. For a hands-on review, try baiting a zombie without shooting, crossing a skeleton's aim during its charge, dodging a ghoul, waiting out a ghost's phase, shooting both sides of a wight, and interrupting a necromancer before its link completes.
