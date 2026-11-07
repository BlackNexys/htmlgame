# Dialogue system · first playable slice

**Implemented:** 7 November 2026. The preferred experiment is now a centered kinetic exchange with gameplay suspended. The earlier travelling overlay and cinematic version remain for comparison. This extends [the design plan](Underworld_Game_Design_and_Implementation_Plan_v1.md#10-dialogue-and-cutscenes), not the full cutscene or campaign system.

## Try it

Run `npm run dev`, then open [the dialogue demo](http://127.0.0.1:3000/dialogue.html), also linked from the title footer. **Play kinetic exchange** stages an eight-line exchange over the station artwork. **Try with gameplay paused** opens `/?dialogueDemo=kinetic`; after Play, it appears over the frozen Lower Passage. Gameplay and the HUD give the exchange center stage. Completing or skipping restores control and clears held/buffered game inputs; restart creates a fresh per-run scene.

The active speaker has one large portrait and prominent text. Speaker turns switch left/right composition, with short directional entries and different expressions/delivery. A faint previous-line echo connects the response. There is no full-width text panel or permanent pair of facing portraits. Portraits stack above text in tall narrow windows; short landscape windows keep the side composition. Reduced motion keeps the composition and expressions without animated handoffs.

**Play conversation** and `/?dialogueDemo=1` retain the original cinematic study. **Earlier travelling overlay** (`/?dialogueDemo=action`) retains the compact card over the small `dialogue-course` traversal/combat fixture; movement continues there. These remain comparison tools, not the preferred direction. Ordinary game URLs have no intro.

The dialogue, attendant, and portrait interpretations are noncanonical test material. They explore the atlas's idea of ordinary people with their own concerns. They do not settle the protagonist's voice, the Last Platform's location, or the soulmate story. This isolated system demo does not select or begin the larger demo level.

## Expression and interaction

- Up to 16 authored speakers. Kinetic and overlay presentations show the current speaker. Kinetic turns stage the large portrait and text according to the speaker's side; cinematic presentation retains its earlier two-slot arrangement.
- Four portrait expressions: neutral, amused, worried, and fierce. The attendant's final expression reads as stern. The current generated atlas has four columns and two rows.
- Speaker names, role subtitles, accent colours, and normal, soft, or urgent delivery.
- Text beats with strong/soft emphasis and optional pauses. Reveal uses grapheme clusters, preserving combined accents and emoji. No authored text is interpreted as HTML.
- Thoughtful, Normal, Quick, and Instant text speeds. Reduced motion starts at Instant and disables portrait motion and backdrop transitions; text speed can still be chosen explicitly. Speed choices currently last for one scene session.
- Overlay lines advance automatically after full reveal plus a reading hold, defaulting to 2.2–7 seconds according to word count. An authored `holdSeconds` overrides that time (1–30 seconds). Autoplay can be disabled. N reveals/advances without taking movement keys; holding N never skips multiple lines. Space/Enter are not global dialogue commands in this mode.
- **Log** or L holds both scene and gameplay while reading. Options reveal text speed, autoplay, hold, and skip. Pointer clicks preserve canvas focus; tabbing into controls holds gameplay, and Escape returns to the canvas. Moving focus outside both canvas and dialogue pauses the game normally.
- Game pause, window blur, hidden documents and return to the title menu hold/hide an overlay. Resume/Continue restores it without catch-up. Overlay completion does not clear held movement or fire. Defeat or stage completion cancels remaining dialogue; restart starts a fresh scene.
- Kinetic and cinematic presentations suspend gameplay for the entire exchange. Enter/Space reveals/advances, Escape holds/resumes or closes the log, and a native modal dialog contains focus. Kinetic autoplay has explicit short reading holds per line; Hold or disabling Autoplay lets the player take their time. Window blur/hidden documents hold scene time and handoff animation until an explicit resume.

All three presentations use Blacklight controls and the existing theme tokens. Kinetic and cinematic views use native modal focus containment and optional badges; the compact overlay is an ordinary nonmodal section anchored to the game stage. The kinetic view animates the complete portrait and text group during turn entry, without deforming the portrait artwork. Ongoing animations pause with the scene, cancel immediately when reduced motion is enabled, and are released on disposal. Speaker/text announcements are separate from decorative portraits and visual text reveal, so assistive technology receives a complete line once when a new line begins. Missing portraits show a fallback silhouette. No speech audio or voice acting is implemented.

## Ownership

| File/class | Responsibility |
| --- | --- |
| `src/dialogue/DialogueScene.ts` | Data contracts and runtime validation; clones accepted data |
| `DialogueController` | One line's graphemes, reveal timing, authored pauses, and reveal-all |
| `CutsceneDirector` | Command sequence, transcript, wait/cue state, terminal outcome, and completion-effect deduplication |
| `DialogueSession` | Browser frame clock, presentation selection, pause/log/input actions, host suspension and disposal |
| `ui/DialoguePresentation` | Shared view/actions contract |
| `ui/KineticDialogueView` | Centered single-speaker staging, directional handoffs, previous-line echo, modal controls and animation lifecycle |
| `ui/ActionDialogueView` | Earlier compact single-speaker nonmodal card, discreet options and log |
| `ui/DialogueView` | Earlier cinematic portraits, modal controls, announcements and cue events |
| `kineticDemo.ts`, `stationDemo.ts`, `actionDemo.ts` | Separate authored versions of the exchange; not logic or canon |
| `demo.ts` | Standalone host, replay, background focus response, and a visible completion-effect counter |
| `Game` | Optional intro trigger, simulation suspension, gameplay input clearing, restart and focus restoration |

Controllers and the director do not import the DOM, `World`, audio, or renderers. Each runtime class has its own file. Presentation never writes combat state. Overlay playback leaves the game active; the host handles explicit read/focus holds. Session disposal cancels its frame chain and removes its listeners and view. The modal version blocks underlying game controls only when that presentation is selected.

## Authoring contract

Scenes are plain serializable data. The demo is a typed TypeScript fixture; `parseDialogueScene(unknown)` can validate JSON data too. Neutral NPC interaction now uses an optional level `npcs` collection, workshop placement and registered scene IDs from `SceneCatalog`; see [the NPC system](npc-system.md). Scene-file fetching and arbitrary environmental triggers remain future work. Invalid references, portrait paths, command kinds, expressions and timings are rejected before playback; asset paths use local `./assets/*.png` descendants.

```ts
{
  id: 'station-demo',
  title: 'The next departure',
  description: 'Fictional test exchange',
  label: 'NONCANONICAL DEMO', // optional presentation badge
  presentation: 'kinetic',   // 'cinematic' remains the backwards-compatible default
  pacing: 'auto',            // explicit for kinetic; overlay defaults to auto
  speakers: {
    traveller: {
      name: 'Traveller', role: 'A long way from home',
      side: 'left', accent: '#ff52ab',
      portrait: { image: './assets/dialogue/portraits-v1.png', row: 0 }
    }
  },
  commands: [
    { kind: 'cue', focus: 'left', caption: 'The little flame lifts.' },
    { kind: 'line', speaker: 'traveller', expression: 'worried', delivery: 'soft',
      beats: [{ text: 'I am looking for someone. ', pauseAfter: 0.35 },
              { text: 'I cannot stay here.', emphasis: 'strong' }] },
    { kind: 'wait', seconds: 0.6 }
  ],
  completionEffects: ['demo-heard']
}
```

The first slice supports `line`, `cue`, and `wait`. A cue provides a caption and focus side. The view emits a `dialoguecue` event when the cue changes; the standalone demo responds with a subtle backdrop pan/zoom. The gameplay demo retains its real camera position. This does not implement arbitrary world camera control, actor choreography, spawning, or boss commands.

`presentation` selects kinetic, cinematic or overlay; `pacing` independently selects auto or manual. Kinetic uses explicit auto pacing in its demo data; without a pacing setting it defaults to manual. The unmarked presentation still defaults to cinematic for existing scene compatibility. `holdSeconds` on a line sets its reading hold after reveal. The action fixture uses shortened lines for reading while moving, rather than dropping a full cinematic script into a smaller box. No voice acting, positional NPC trigger, or radio fiction is implied.

Limits: 16 speakers, 300 commands, 40 beats and 4,000 text characters per line, a maximum three-second authored beat pause and ten-second wait. Stable scene/effect IDs use lowercase letters, digits and hyphens. Portrait row keys are 0 and 1 for the current atlas contract.

## Completion, cancellation and effects

The director has three terminal results: `completed`, `skipped`, and `cancelled`. Normal completion and skip resolve the same explicit `completionEffects`, keyed by scene ID and effect ID in a host-owned set. Replaying with the same set does not repeat effects; a fresh run uses a fresh set. Calls after a terminal result do nothing. Cancellation runs no completion effects. Cosmetic cues and waits are not executed while skipping.

The standalone demo increments a visible counter once per page visit; ordinary gameplay demo effects set a harmless `data-dialogue-demo="heard"` marker. Narrative scenes now use `NarrativeSession` and `EffectApplier`: the host defers the whole narrative effect batch until successful completion or skip, validates before mutation, and immediately saves discoveries. Cancellation grants nothing. Physical evidence is bound to its matching world interaction and cannot be awarded by an unrelated skipped conversation. `SaveStore` reports persistence failure while retaining session progress. The director's per-run set remains presentation bookkeeping, separate from campaign idempotence. See [narrative systems](narrative-system.md).

Boss victory must be committed by encounter logic before its optional outro starts. A future scene's completion list must not include starting a fight or granting an unearned victory merely because its text was skipped. Define required completion effects explicitly rather than replaying arbitrary cutscene commands.

Kinetic/cinematic entry clears held keys and movement buffers, pauses simulation, hides the gameplay HUD, and enters `dialogue` mode; completion clears input, restores the HUD and resumes. Overlay entry stays in `playing` mode and leaves the simulation/input alone. Read/focus holds notify the host, which clears input and pauses the loop; closing the hold resumes only if the host is still playing. Finishing an unheld overlay preserves movement and does not resume a paused or terminal game. Game pause/title transitions suspend the session; stage defeat/completion cancels it without effects. Restart cancels the old scene and constructs a fresh run. Disposal abandons the scene without rewards or resuming anything.

## Verification and remaining design

`npm run check` covers full-source typing/build and browser-free dialogue tests. `npm run test:browser` includes Chromium/Firefox checks for reveal/advance, expression selection, emphasis, transcript, speed, skip/replay effects, focus loss, missing art, reduced motion, small screens, and real-game input/simulation isolation.

Still open: final portrait finish/layout, character voices, additional expressions and atlas formats, speech audio, localization, persisted dialogue preferences, controller bindings, broader environmental triggers, scene loading and full world choreography. The narrative prototype now selects NPC scenes by saved facts; discoveries save immediately and survive restart/death. Dialogue choices and an RPG conversation graph remain outside the initial design. Future scenes can be richer without expanding `World` or embedding narrative decisions in the view.
