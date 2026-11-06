# Phase 1: movement foundation

This is the first implementation slice of [Underworld's design plan](Underworld_Game_Design_and_Implementation_Plan_v1.md). It adds the starting movement kit and a JSON movement course. The original Lower Passage remains the combat and completion regression level. The workshop remains a separate application.

## Available now

Space jumps and Shift sprints. A/D or left/right supply horizontal direction. Holding Space gives a higher jump than tapping. Pushing toward a wall while falling slows the slide; Space jumps away, with a brief horizontal commitment before steering returns. Holding jump never repeatedly triggers that action.

Movement uses no resource and grants no damage immunity. The test palm attack remains usable during sprint, jump, and wall movement. W/Up aims up; horizontal combinations aim diagonally. S/Down crouches on the ground, lowers the collision body and firing origin, and allows a slow creep. In the air it aims downward. Release Down or press Jump to stand when there is sufficient headroom. Opposing keys cancel on each axis; without directional input, fire follows facing.

The HUD displays health, defeated enemies, and level progress. F2 shows position, velocity, movement state, aim direction, and wall side. A companion sprite atlas supplies crouch and directional firing poses.

The camera eases toward horizontal velocity look-ahead and follows vertical movement outside a dead zone. Pause, focus loss, and menu entry clear queued actions while preserving ordinary flight. A fresh run resets movement state.

## Provisional tuning and choices

Values live in `src/game/config.ts`; they are starting points for playtesting.

| Property | Value |
| --- | --- |
| Run / sprint speed | 330 / 440 px/s |
| Run / sprint acceleration | 2600 / 3200 px/s² |
| Deceleration | 2200 px/s² |
| Air acceleration scale | 0.8 |
| Gravity / terminal fall speed | 1800 px/s² / 850 px/s |
| Jump / release-cut speed | 700 / 420 px/s upward |
| Coyote time / jump buffer | 100 / 120 ms |
| Wall slide fall cap | 160 px/s |
| Wall jump | 340 px/s sideways, 650 px/s upward |
| Wall jump steering commitment | 110 ms |
| Standing / crouch height | 52 / 32 px |
| Crouched movement speed | 110 px/s |

Down on the ground fires horizontally from the lowered stance rather than into the floor. Diagonal shots retain the same speed as cardinal shots. The muzzle path is checked against thin terrain, and crouch release never expands into stone. These are implementation choices for the movement prototype; balance and feel still need playtesting.

## Playtest route

Choose **Movement course** from the title menu, or open `/?level=movement-course`. It loads `public/levels/movement-course.json` on demand. The route contains a low ceiling, a short step, a small gap with a recovery floor, a tall wall and shaft, upper landings, and two existing enemies. Signs introduce sprint, jump height, wall jumping, air steering, and firing while moving. Import the same JSON into the workshop to adjust it or collaborate through patches.

Compare tap and held jumps beneath the ceiling; sprint and fire through the opening lane; jump across the gap or recover from it; climb the wall and shaft; reverse direction during camera movement. Pause midair, leave the window, then restart. Check whether the controls feel responsive and the camera preserves sight of landings. Feel and balance still need human playtesting before Phase 2.

## Verification and next phase

Automated checks cover fixed simulation at 30/60/144 render FPS, jump windows and expiry, wall commitment, thin and diagonal terrain impacts, body contact and projectile damage, pause cancellation, firing cadence, camera bounds, input edges and aliases, and complete movement course and Lower Passage runs. Browser checks exercise the movement course, sprint, pause/resume, and restart alongside the existing game and workshop flows.

Phase 2 remains Soul Spark, Grave Hopper, ectoplasm, and harvesting. Modifiers, progression, authored stages, bosses, and narrative are also outside this slice.
