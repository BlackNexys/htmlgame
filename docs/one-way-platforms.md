# One-way platforms

Terrain platforms and bridges accept `collision: 'one-way'`. They catch actors crossing their top face downward, including fast or diagonal motion. Their sides and underside do not block movement, wall jumps or standing up. Projectiles and sight checks pass through them; enemy ledge sensing still recognizes their top as support.

Press S or Down while standing on one to drop. The press takes priority over a simultaneous jump and clears buffered jumping and coyote time. Only that actor's supporting one-way colliders are ignored, until the actor clears their bounds. Holding Down does not automatically drop through the next floor; release and press again. On solid ground, Down still crouches. Solid support at a shared seam prevents dropping through that solid.

The Lamplight Court assembly owns `shelter-roof`, mounted to its quay. The canopy prop supplies its artwork; `appearance: 'none'` suppresses duplicate terrain art without removing collision. No approach route has been added.

Both settings are available in the editor inspector and survive compilation, source layouts, export and undo. Omitted settings retain solid collision and normal terrain rendering. One-way collision is limited to platforms and bridges, whose geometry has a clear top face.

Verification covers fast and diagonal landings, upward and sideways passage, held versus fresh Down input, stacked platforms, actor-specific drop state, solid-floor crouching, projectile/sight passage, enemy support queries, and moving/undoing the source-backed shelter assembly.
