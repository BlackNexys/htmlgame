// Prototype tuning only. No final power or resource rules are implied.
export const tuning = {
    tile: 48, viewportWidth: 960, viewportHeight: 576,
    step: 1 / 120, maxCatchUp: 8,
    acceleration: 2600, friction: 2200, speed: 330,
    sprintSpeed: 440, sprintAcceleration: 3200, airAccelerationScale: .8,
    standingHeight: 52, crouchHeight: 32, crouchSpeed: 110,
    gravity: 1800, jump: 700, jumpCutSpeed: 420, maxFall: 850,
    coyoteTime: .1, jumpBuffer: .12,
    wallSlideSpeed: 160, wallJumpX: 340, wallJumpY: 650, wallJumpLock: .11,
    cameraLookAheadTime: .28, cameraMaxLookAhead: 160,
    cameraFollowRate: 8, cameraVerticalRate: 6, cameraLookRate: 6,
    playerHealth: 5, enemyHealth: 3, enemySpeed: 65,
    invulnerability: 1, attackInterval: 0.2, projectileSpeed: 800, playerShotOffsetY: 9,
    projectileLifetime: 0.9,
    enemyProjectileSpeed: 340, enemyProjectileLifetime: 2.2,
    ghostPhase: 1.15, reviveRange: 440, reviveBudget: 2,
};

// Attack timings are in seconds. Tells and recovery are deliberately generous
// for the first combat pass; tune these here after playing the encounters.
export const enemyTuning = {
    zombie: {health: 3, width: 32, height: 50, walk: 35, reach: 150, windup: .55, attack: .3, recovery: .8, cooldown: 1.2, rush: 260, size: 76},
    skeleton: {health: 3, width: 30, height: 50, walk: 28, reach: 490, windup: .75, attack: .16, recovery: .85, cooldown: 1.1, rush: 0, size: 76},
    ghoul: {health: 3, width: 46, height: 30, walk: 65, reach: 270, windup: .55, attack: .55, recovery: .95, cooldown: 1.2, rush: 430, size: 80},
    ghost: {health: 3, width: 32, height: 46, walk: 110, reach: 520, windup: .8, attack: .16, recovery: 1.2, cooldown: 0, rush: 0, size: 76},
    wight: {health: 5, width: 38, height: 52, walk: 38, reach: 145, windup: .7, attack: .32, recovery: 1.1, cooldown: 1, rush: 215, size: 80},
    necromancer: {health: 4, width: 30, height: 52, walk: 65, reach: 540, windup: 1.6, attack: .15, recovery: .7, cooldown: 2.5, rush: 0, size: 80},
};
