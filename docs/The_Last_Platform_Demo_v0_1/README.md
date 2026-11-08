# Underworld — The Last Platform (design pack v0.1)

**Files:**

- `Last_Platform_Level_Design_v0_1.md` — complete level brief, visual/audio direction, encounter beats, dialogue draft, secrets, implementation gaps, test plan
- `last-platform-demo.json` — first-pass schema-v1 playable layout using already registered NPC, dialogue and interaction content
- `Last_Platform_Blockout_Map.png` — topological side-view of the JSON placement, enemies, key interactables and gate

**Status:** Proposed design and static-checked blockout; not a verified playtest nor final art or dialogue. No changes were made to the GitHub repository.

Copy the JSON to the repository's `public/levels/last-platform-demo.json`, then run:

```bash
npm run level -- validate public/levels/last-platform-demo.json
npm run dev
```

Visit `http://127.0.0.1:3000/?level=last-platform-demo&preview=1`, or import the JSON into the Level workshop and use Playtest.

**Important:** The current narrative campaign catalog only persists the existing `narrative-study` and `departure-study` IDs. This **new** level ID runs its inspect/collect/operate/conditional talk flow in-memory but is not registered for Journey/persistent progression; the art and dialogue writing are also proposed, not installed. See section 7 of the design document for specifics.
