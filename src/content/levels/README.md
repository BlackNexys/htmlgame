# Level source directory

The first source-authored slice after the reset is `lantern-quay.level.ts`: **A Light Left On**. It is the default Play destination and remains standalone from campaign progression.

Add a `<slug>.level.ts` module with a default `defineLevel(...)` export. Vite discovers it automatically; `/?level=<slug>` loads it. Use separate modules for reusable room/bridge/water assemblies. See [source-first authoring](../../../docs/level-source-authoring.md).

The workshop exports a valid TypeScript starting point into this directory. Its import path is relative to this location. Compiled JSON remains an interchange snapshot, not the authoring source of record.

A matching `<slug>.layout.ts` companion is automatically applied by the game, workshop, CLI and source audit. Export it from a source-bound workshop session to preserve assembly instances, parameters and child overrides. See [the shared workflow](../../../docs/source-editor-workflow.md).
