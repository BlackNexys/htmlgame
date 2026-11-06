# Roadmap to a playable action platformer

**Historical foundation roadmap.** The current movement and arsenal direction lives in the [design plan](Underworld_Game_Design_and_Implementation_Plan_v1.md). The free standard attack is now defined exclusively by [Flicker v1.1](Underworld_Flicker_Weapon_Spec_v1_1.md); its earlier temporary attack brief is superseded.

We want to take the current TypeScript experiment far enough that we can run, jump, fight undead enemies, and replay a short level in the browser. That gives us something concrete to play before we discuss the detailed game mechanics.

The direction is a platformer inspired by Jazz Jackrabbit, set in the underworld. The player is undead and is trying to find their soulmate, while everyone else seems determined to ruin their happiness. Undead powers, bosses, and a shared, recoverable ectoplasm resource with a maximum cap belong to the wider concept.

This roadmap gets us to the first playable action stage. Any attack or enemy behavior used to reach that point is a temporary test fixture. Its presence does not settle the final design.

## Progress as of 4 November 2026

The first implementation now covers all six stages below. The playable build has fixed simulation updates, a scrolling camera, explicit player movement states, a temporary projectile attack, six patrolling opponents, damage feedback, and a short level with defeat, completion, and restart flows. The original character frames and wall artwork are reused.

Verification includes simulation tests and browser tests in Chromium and Firefox. These cover a complete run to the exit, replay after completion and defeat, pause and focus loss, resizing, and asset loading failure. The README describes how to run the build and repeat the checks.

The next review is a hands-on playtest together, followed by the detailed mechanics discussion described at the end of this document. The stages below remain the reference for what the foundation was intended to provide.

## Where we are starting

The project already has a canvas renderer, a tile map, a controllable character, gravity, jumping, and wall collisions. Recent fixes provide a working starting point for movement. TypeScript is compiled with Webpack, and the page loads the generated bundle.

There are a few limits that matter before adding combat:

- Movement happens inside rendering and depends on how often the timer runs.
- The canvas expands to fit the map, so there is no scrolling camera yet.
- Every other entity is treated as a solid obstacle by the actor collision code.
- There is no combat, enemy lifecycle, damage handling, or complete restart flow.
- The project has no automated test suite or documented local play workflow.

## What we should have at the end

A player can open the game in a desktop browser, understand the controls, move through a short scrolling level, attack undead enemies, see both sides take damage, and restart after defeat or reaching the end. Movement and combat work together without stuck input, missed collisions, or leftover entities between attempts.

The level should be useful for repeated playtesting. It needs enough space to test movement and combat together, with simple presentation that makes actions and hits easy to read.

## Stage 1 Establish a reliable game loop

Build this first because every later system depends on predictable updates.

- Separate simulation updates from drawing. Rendering should display the current state without changing it.
- Use an animation frame loop with a fixed simulation step. Bound catch-up work so returning from a background tab does not advance the game through a long backlog.
- Centralize input state and distinguish held actions from newly pressed actions.
- Clear held input when the window loses focus. Prevent game keys from scrolling the page while the game has focus.
- Wait for required assets before starting, and display a useful message if loading fails.
- Document how to install dependencies, build, serve, and play locally. Add a repeatable way to run focused checks.

**Complete when:** movement behaves consistently under different rendering rates, switching tabs does not leave the character moving, and a fresh checkout can be built and played from the documented steps.

## Stage 2 Support a scrolling world

Give the game a world larger than the browser viewport and establish how objects interact within it.

- Separate map dimensions from canvas display dimensions. Keep physics in world coordinates and apply camera offsets only when drawing.
- Add a camera that follows the player and stays within the level bounds. Scale the canvas to fit the page without changing collision coordinates.
- Define tile size once, independently of sprite dimensions, and use explicit collision bounds for moving objects.
- Distinguish solid terrain from actors, attacks, and effects. Adding an enemy must not automatically make it behave like a wall.
- Create one place to spawn and remove entities safely, including removal during updates.
- Keep small collision fixtures for floors, ceilings, corners, and fast movement. Use movement limits or collision handling that prevents objects from skipping through thin obstacles.

**Complete when:** the player can traverse a level wider than the viewport, the camera stays within its bounds, and collisions remain correct regardless of camera position or sprite size.

## Stage 3 Make the player ready for combat

The player needs a clear, dependable response to input before attacks are added.

- Represent facing direction and basic movement states explicitly, including standing, moving, and being airborne.
- Keep movement settings together so we can adjust them during playtesting without rewriting physics.
- Connect the available artwork to those states where practical. Use clear placeholders where animation frames are missing.
- Add a fresh-level reset that restores the player, camera, input, and world to their starting state.
- Add an optional development view for collision bounds and movement state.

**Complete when:** repeated runs through a small movement course behave consistently, facing and airborne states are readable, and restarting produces the same starting conditions every time.

## Stage 4 Add the first combat interaction

Prove the full path from player input to an enemy being hit. The concrete starting attack, tuning, visuals and sound are now defined by Flicker v1.1.

- Add an attack action that can be used while moving or jumping.
- Spawn Flicker from the player using the current directional-aim convention, with collision bounds and lifetime independent of its visual flame.
- Handle attack interactions with terrain and valid targets separately from movement collisions.
- Give a stationary test enemy health, damage reception, and a defeated state. Remove defeated targets safely.
- Keep weapon tuning in its concrete definition and use the Flicker spec as its design authority.
- Ensure each attack applies damage only as intended and cannot hit its owner.

**Complete when:** the player can attack in both directions while moving and jumping, hits affect the intended target, terrain blocks the test projectile, and expired attacks leave no active objects behind.

## Stage 5 Turn targets into opponents

Add one basic undead opponent with a predictable temporary behavior so the player has something to fight.

- Give it a small state model for acting, taking damage, and being defeated.
- Make its movement respect terrain and level boundaries.
- Let it threaten the player through one simple test interaction.
- Add player health, visible damage feedback, a defeated state, and restart handling.
- Handle repeated overlap deliberately so a single contact does not consume all health in one simulation burst. Keep the timing adjustable for testing.
- Show enough feedback to distinguish an attack, a successful hit, damage to the player, and an enemy defeat. Use simple animation or effects and a small amount of sound, with mute available.

**Complete when:** the player and enemy can damage and defeat each other, the result is readable, and restarting clears enemies, attacks, effects, and combat state from the previous attempt.

## Stage 6 Build one complete action level

Bring the systems together in a short level built for testing rather than content volume.

- Provide a clear starting area, a movement section, and a few enemy encounters with room to move and attack.
- Place opponents through level data rather than adding special cases to the game loop.
- Include a clear end marker and a completion state so each run has a beginning and an end.
- Show controls, player health, pause, and restart. Pause and focus changes must freeze the simulation cleanly.
- Test repeated runs in at least two desktop browser engines, including resizing the page and switching tabs during combat.
- Fix failures in movement, combat, camera behavior, and restart before expanding the content.

**Complete when:** someone can start without a verbal explanation, play through the level, understand what happened in combat, and immediately try again after either outcome.

## How we should work through it

Finish each stage with a playable build and a short check against its completion criteria. Keep the existing TypeScript and Canvas setup unless a concrete limitation warrants a change. Extend the current classes where that stays clear, and separate responsibilities when the next feature requires it.

Automate checks for timing, collision, damage, and reset behavior. Use browser playtests to judge responsiveness, camera movement, and whether combat is readable. Keep temporary tuning values in one place, and record reproducible bugs as we find them.

There are no calendar estimates yet. The stages describe dependency order and review points, so we can fit the work around the project being a fun experiment.

## Where this roadmap stops

Once the short action level is playable, we pause feature expansion and discuss the detailed mechanics with the build in front of us. Final powers, ectoplasm behavior, progression, and boss encounters come after that review. The earlier suggestion of an attack that restores ectoplasm is not a settled requirement.

Until then, combat fixtures use independent test settings and do not impose a resource economy. The confirmed ectoplasm concept remains part of the game's direction without blocking the movement and combat foundation.

The next planning document should follow that playtest. At that point we will have a shared reference for what feels good, what is missing, and which mechanics are worth building next.
