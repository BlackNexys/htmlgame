# UNDERWORLD — 01: THE LAST PLATFORM
## A Lead, Not an Answer

**Document:** Level Design v0.1 — complete first-pass vertical slice  
**Region:** The Confluence / peripheral arrivals and registry district  
**Status:** Proposed level design, **not locked story canon**  
**Implementation reference:** BlackNexys/htmlgame, `master` at `1058cb32` (7 Nov 2026)  
**Companion file:** [`last-platform-demo.json`](last-platform-demo.json)  
**Format:** 2D side-scrolling arcade platformer, 48 px grid, 960 × 576 camera, 120 Hz simulation  
**Target first-time duration:** 8–12 minutes (playtest target, not measured)  
**Target repeat duration:** 4–6 minutes (playtest target)

> **Level thesis:** Arrive in a place where the dead have built an ordinary life around an extraordinary landscape. Ask for a person you love. Find evidence that she passed through. Leave knowing where to search next—and wanting to know who intervened.

### What is fixed versus proposed

**Established game:** The hero is a magenta soul-flamed cyberundead searching for his girlfriend. Underworld is fast, stage-based, movement-first action. Flicker is free. Existing enemies include zombie, skeleton, ghoul, ghost, wight and necromancer. NPC talk, expressive dialogue, inspect/collect/operate objects, conditional scene selection, evidence flags, and persistent story study all exist.

**World direction (exploratory):** Spectral rivers are primordial; railway Deadways are the dead's built response. Civilized stations contrast with vast, alien geography. The Confluence and the Last Platform are proposed atlas regions/locations, not fully committed geography.

**Level proposals:** This sequence, station personnel, signs, evidence presentation, encounter placement, mood, visual styling and dialogue are authored candidates. The script below is **proposed writing**; the downloadable JSON deliberately references the **existing noncanonical test dialogue and inspection catalog** so it can load without adding unregistered scene IDs.

---

## 1. Player experience: beginning to end

The player begins alone on an arrivals platform, not in immediate combat. The vast city across the river and the indifference of the station's routines establish the world before anyone explains it. A helpful but world-weary railway attendant mentions the Registry. The player can ask, or simply walk east and discover it independently.

On the way the station expands from familiar to alien: rooftops and luggage lifts give way to an enormous cyan river below the rails, then disused service towers and freight halls, then a quiet, almost antiseptic records wing. Each traversal/combat beat teaches one or two mechanics. The Registry finally confirms the girlfriend's name on a **transfer entry**. An adjacent route index resolves the next line, S-17. At the exit a guarded shutter blocks the departure platform; the player opens it and continues.

The evidence establishes **a recorded transfer, not coercion, consent, authorization, or who is responsible**. The protagonist is entitled to suspect wrongdoing; the story does not require that suspicion to be correct. His determination to punish those responsible is emotional motivation, not a verdict delivered by the level.

**Emotional trajectory:** Disorientation → wary curiosity → physical confidence → danger → respite → recognition → suspicion → resolve.

**Critical rule:** No mandatory backtracking. The attendant is helpful but optional; the ledger and index lie on the forward route. Optional return dialogue is a bonus, not a progression gate.

---

## 2. Spatial composition and encounter route

**Map prototype:** 9,216 × 864 world pixels (192 × 18 cells), divided here into eight 1,152-pixel design beats. The camera covers 960 × 576 world pixels; the eight beats are pacing regions, **not sealed rooms**. Coordinates use level JSON conventions: enemy/NPC anchors at their feet, interactables at top-left, terrain aligned to 48 px.

| Beat / world X | Location and purpose | Main play and implemented content | Visual promise |
|---|---|---|---|
| **A. 0–1152** | **Arrival Platform**: orientation and first social contact | Spawn at x192; attendant x624; optional letter on a 96px plinth x864 | Empty near platform, warm windows, slow cyan trains far below; the alien skyline dominates |
| **B. 1152–2304** | **Abandoned Concourse**: first motion/combat | Zombie at x1344, crates ascending 96/144px, skeleton at x2280 | Old departure boards and overbuilt station architecture; movement teaching without combat saturation |
| **C. 2304–3456** | **River Viaduct**: spectacle and exposed traversal | Ghoul at x2616; safe lower catch shelf beneath a three-part bridge; phased ghost near x3408 | Cyan spectral torrent, enormous translucent ribs, train bridge above and below |
| **D. 3456–4608** | **Service Spine**: vertical traversal and ranged fire | Zombie atop first service step at x3630/y624; 192px tower approached by steps; skeleton at x4416 | Hanging cables, clockwork, signal lamps; glimpses of workers in the distance |
| **E. 4608–5760** | **Freight Sorting**: pace and evasion | Ghoul x4656; stacked cargo; skeleton x5520 | Luggage cages, cargo stamped with destinations; a system that processes people and parcels alike |
| **F. 5760–6912** | **The Registry**: deliberate quiet and revelation | Traversal steps; transfer ledger x6504; **no hostiles** | Monastic filing halls, rose windows, amber lamps, cold cyan ledger interface |
| **G. 6912–8064** | **Archive Underworks**: necromancer ecology and second clue | Zombie x7200; necromancer x7512 can reanimate its corpse; route index x7824 | Unfinished archive tunnels, exposed conduit, cyan reactivation links and stacked record vaults |
| **H. 8064–9216** | **Departure Shutter**: final skill check and resolution | Shield-bearing wight x8232; operable shutter x8496; exit x9000 | Great locked transit portal and outgoing rail line disappearing toward the next region |

### Route geometry

- **Main floor:** y720 across most of the level. This is an *initial gameplay blockout*, not the final architectural profile.
- **River bridge:** gap in the high floor x2880–3312 with 48px island platforms at y672, a recovery ledge at y720, and a catch shelf at y816. Missing a jump is recoverable without a death pit. The shelf is **not spectral water simulation**.
- **Raised blocks:** the steps are solid tile clusters, not thin one-way platforms. 96px hops and 48px successive steps are consistent with the current jump. The high service stack deliberately invites wall-jump experimentation.
- **Final shutter:** solid interactable at x8496/y288, 48px wide × 432px high. `F` operates it after learning a destination. It is designed to obstruct the straightforward floor route; whether expert wall-jumping can circumvent it should be checked in the live build.
- **No unsupported environmental verbs:** trains do not move the player, water does not flow physically, and crates are not moving platforms. Those are art and later-system possibilities.

### Encounter placement and progression

| Encounter | Enemy | What it teaches | Fairness/readability note |
|---|---|---|---|
| 01 | Zombie, concourse | Flicker fire, distance and lunge tell | First hostile appears after interaction/tutorial space |
| 02 | Skeleton, concourse edge | React to charged horizontal shot | Raised crates permit a different line of sight |
| 03 | Ghoul, viaduct approach | Respect crouch/LEAP tell | Separate the enemy from the most difficult jump |
| 04 | Ghost, river exit | Wait for a solid vulnerability window | Its cyan tell must be distinguishable from scenic river glow |
| 05 | Zombie, service step | Aim upward while moving; spatial positioning | Enemy starts atop a step, not on the entrance floor |
| 06 | Skeleton, maintenance exit | Sprint, shoot and move through a ranged lane | Clear retreat area |
| 07 | Ghoul, freight | A leaper in an industrial cluttered space | Telegraph remains visible against geometry |
| 08 | Skeleton, freight exit | Ranged fire before a narrative respite | No enemy on the ledger itself |
| 09 | Zombie, archive | Create a corpse and observe reanimation threat | Necromancer is positioned within its corpse-search range |
| 10 | Necromancer, archive | Interrupt channel; corpse ecology | The cyan link shows the important relationship; avoid enemy stacking |
| 11 | Wight, departure | Flank or exploit shield-opening | Mini-climax without pretending this is a major boss |

**Balance caution:** Eleven enemies and only the existing five-health player may still be too punishing for an opening level. There is no implemented healing pickup or checkpoint. The stage should be tested with a new player and tuned downward, particularly at the viaduct and archive. No enemy defeat should be required to inspect records or pass the final shutter unless future authored gating says otherwise. The wight is a guarded-threshold enemy, **not** canonically responsible for the transfer.

---

## 3. Art direction: 'civilization against the incomprehensible'

### Shared visual grammar

1. **Foreground readability:** solid walkable blocks dark graphite/blue-green with thin light edge; combat actors and magenta Flicker remain the highest-contrast moving elements.
2. **Middle ground tells a lived-in story:** warm lamplight, ticket booths, old staircases, bundled luggage, service hatches, quietly occupied windows.
3. **Background reveals alien scale:** cyan spectral river; colossal translucent rib structures; impossible far bridges; tiny moving train lights. It should look ancient and indifferent, not automatically evil.
4. **Emissive hierarchy:** magenta belongs predominantly to the traveller and their flame; cyan to rivers, navigation and strange phenomena; amber to signs of habitation. Do not use cyan alone to indicate hostility.
5. **No metaphysical certainty:** the rib formations are not definitively 'bones'; strange river reflections are not proof of an actual second world.

### Mood shifts by beat

| Environment | Key palette | Scene construction | Sound ambience |
|---|---|---|---|
| Arrival | charcoal `#111822`, warm amber `#e4ad68`, cyan `#56bbce` | Sparse platform, abandoned benches, departing rail lines, sleeping cat motif | Distant rail rumble, ticking clock, one lonely station bell |
| Concourse | teal slate `#243943`, pale stone `#8998a0` | Window grids, stacked crates, broken signboards | Soft steel clicks, murmured passengers |
| Viaduct | near-black `#0a1925`, luminous cyan `#61e6e2` | Greatest negative space: canyon, immense rib silhouette, waterfall-like spectral flow | River hum, distant wind and train whistle |
| Service/Freight | iron `#39414a`, oxidation `#9b674b`, amber `#f0ad63` | Tight machinery framing, cranes, pipes, viaduct pylons | Rhythmic mechanism ticks; low grinding pressure |
| Registry | ink `#18212d`, dusty gold `#ba9967`, bone `#d2ccc0` | Calm symmetrical interior, rose window, small ledger light, deliberate visual hush | Clock and page turns; music drops back |
| Archive | desaturated cyan `#378b99`, black-green `#192b2c` | Broken records conveyors, shadowed archive bays, exposed cables | Eerie electrical crackle; channel telegraph audible |
| Departure | violet-black `#242139`, amber `#e5a75c`, magenta accents | Giant vertical shutter, far line leaving into darkness | Bell toll, pressure release when gate opens |

**Current engine limitation:** Gameplay renders one procedural scrolling background and one wall/decor art set. The JSON blockout **will not magically display** these regional paintings, rail animations or music. Production requires a level-specific art manifest, parallax layers/atlases, environmental ambience, and perhaps a small regional lighting pass. The existing title screen is a *style reference*, not a level-ready background texture.

### Four signature compositions

- **First controllable frame:** Small magenta traveller, an almost empty platform, and an immense inhabited river city in the distance. No enemy on screen.
- **First river overlook:** One fragile iron bridge against a gorge so wide that enormous rib-like forms read as geological features. Tiny train lights traverse a far arch.
- **Registry reveal:** A bright ledger rectangle occupies a dark hall. The protagonist's flame casts magenta across cold official records. The environment itself seems to pause.
- **Last frame:** After the shutter rises, a pale track continues into a tunnel whose silhouette resembles the inside of something enormous—not necessarily a creature.

---

## 4. Dialogue: proposed production writing

**Writing policy:** Short and characterful. The player should infer the world from what people assume is ordinary. The protagonist is capable of humour and sharpness but their definitive personality has **not** been locked. Text below is candidate voice to test with the expressive kinetic portrait presentation.

### Scene 01 — Platform Attendant (first interaction)

**Presentation:** kinetic, gameplay paused. **Target:** around 25–35 seconds of readable exchange, shorten if repetitive. **Outcome:** learn that the Registry is east. Can be skipped without blocking the stage.

> **ATTENDANT** *(neutral)*: You came in on the late line. That doesn't happen often.
>
> **TRAVELLER** *(worried)*: Where am I?
>
> **ATTENDANT** *(neutral)*: Last Platform. Confluence side. Please keep clear of the tracks.
>
> **TRAVELLER** *(urgent)*: I'm looking for my girlfriend. I think she came through here.
>
> **ATTENDANT** *(soft)*: Then try the Registry. Arrivals and transfers. East of the old viaduct.
>
> **TRAVELLER** *(neutral)*: You sound like this happens all the time.
>
> **ATTENDANT** *(amused)*: People losing things? Constantly. People finding them? Less often.
>
> **TRAVELLER** *(fierce)*: I'll improve the statistics.

**Notes:** This is the one deliberate staging scene before the main combat. The attendant is dry, not cruel. Don't invent the girlfriend's name here.

### Scene 01b — Repeat before finding the record

> **ATTENDANT** *(neutral)*: East. Follow the lamps. The river crossing comes first.
>
> **ATTENDANT** *(amused)*: And don't ask a ghoul for directions. They'll follow you home.

Use the short repeat only once the protagonist already knows the Registry location.

### Scene 02 — Transfer Ledger (inspection card)

**Presentation:** a concise inspection card, **not** a full-screen kinetic exchange. The clue belongs to the physical ledger. A separate button records the discovery; closing does not award it.

> **ARRIVALS / TRANSFER LEDGER**  
> The name is there. Her name.  
> **ROUTE:** S-17  
> **TRANSFER:** RECORDED  
> **AUTHORIZATION:** REDACTED  
> The entry confirms a transfer. It does **not** establish who ordered it, why, or whether she agreed.

*The flame at the traveller's head contracts. The first certain thing he has found is an administrative entry.*

**Candidate micro-line:** **TRAVELLER:** There you are. ... Where did they take you?

The last question can express suspicion without confirming the transfer was forced.

### Scene 03 — Attendant after the ledger (optional revisit)

> **TRAVELLER** *(worried)*: Her name's in the transfer book. Route S-17.
>
> **ATTENDANT** *(worried)*: They keep the destinations in the lower index.
>
> **TRAVELLER** *(fierce)*: Who signed the transfer?
>
> **ATTENDANT** *(neutral)*: The ledger doesn't say. Don't make a villain out of a missing signature.
>
> **TRAVELLER** *(fierce)*: Someone knows. I'll find out who.

This conversation is *optional*. It can offer the destination directly once the ledger is discovered, consistent with the existing fact-driven resolver. It must not require a kilometre of backtracking to progress.

### Scene 04 — Route Index (inspection card)

> **DEADWAYS ROUTE INDEX**  
> **S-17:** Transfer corridor, outbound.  
> Destination registered beyond the Last Platform.  
> Local departure shutter: **RELEASE AUTHORIZED**.

The level establishes a direction but leaves the exact destination and the circumstances of the transfer open for the next stage.

### Scene 05 — Departure Shutter (inspection card)

> **STATION CONTROL:** ROUTE KNOWN  
> Release the shutter for outbound access?

Operating it is a *physical* action. Dialogue skip does not open a gate; confirming the object action does.

### Optional Keepsake — An Unfinished Letter

> *I kept your seat. I still do.*
>
> The rest is unwritten. Whoever folded the page did so carefully.

This has nothing to do with the girlfriend. It is a small piece of somebody else's afterlife. It establishes that the world contains stories independent of the protagonist. Collecting is optional and persistent in the prototype study when campaign state is registered.

### Scene and effect mapping in the existing engine

| Design beat | Current registered content referenced by the JSON | Implemented effect |
|---|---|---|
| Attendant intro/repeat/reaction/farewell | NPC `scene: registry-attendant` → `SceneResolver` | Facts for meeting/Registry/destination |
| Letter | `letter-card` / `collect-letter` | `lost-letter` Keepsake and hide the object |
| Ledger | `transfer-record-card` / `inspect-transfer-record` | `found-transfer-record` fact |
| Route index | `route-key-card` / `decode-route`, condition `has-record` | `learned-next-destination` fact |
| Shutter | `gate-card` / `open-gate`, condition `knows-destination`, solid | Removes its physical collision wall |

**The JSON uses existing prototypes, not the proposed scene text above.** To get these exact lines in-game, edit `registryScenes.ts` and `InspectionCatalog.ts`, or register new production scenes and effect IDs. Do not make invented scene IDs in level JSON; the validator will reject them.

---

## 5. Secrets and replay value

The first level should teach that secrets are **readable**, not obtained by firing blindly at every wall.

**Implemented optional discovery:** The unfinished letter rests on a reachable elevated plinth at x864. Its warmer hue and an otherwise unnecessary block invite curiosity. Jumping onto the plinth brings it within the interaction range. It should not be collectable simply by standing below it.

**Art/level-design-only discovery candidates (not implemented as pickups):** A hidden high observation alcove above the service spine; a residential window that suggests a life outside the player's quest; an eccentric timetable with a branch-line name; a short optional elevated route that bypasses part of the freight fight. These need visual art or new interactive definitions before becoming rewards. Do **not** advertise them as present in the JSON.

**Reward philosophy:** Ectoplasm is currently earned on original enemy defeat (+1). There is no player weapon to spend it on yet. Do not promise caches, Gravehopper rewards, health pickups, or harvestables in this slice. Those mechanics belong to the next combat vertical slice.

**Replay:** The clear forward route encourages fast traversal, while the letter, upper platforms and optional attendant conversation reward curious players. Stage completion should never depend on the letter.

---

## 6. Audio and musical arc

The game's existing menu song *Mechanical Heartbeat* can establish a familiar return point. The prototype currently **does not play a gameplay music bed**; the descriptions below specify a future stage-audio implementation, not a shipped feature.

1. **Arrival:** A slow, fragile magenta-key melodic phrase over low rail ambience; the clock and a single bell are audible. Let the player stand still without an urgent musical demand.
2. **Concourse:** Introduce a muted breakbeat pulse as the player begins moving and fighting. Flicker's dry snap sits above the percussion.
3. **Viaduct:** Drop drums briefly and open the stereo space to immense spectral river noise. One distant train whistle acts as a geographic motif.
4. **Service/Freight:** Sync machinery and percussion, but never make hazards unclear because music is loud.
5. **Registry:** Bring back the arrival motif with sparse piano and a faint detuned choir; allow a moment for evidence to land.
6. **Archive/Departure:** Rhythmic return, urgent but not triumphant. The necromancer's channel and wight shield tell must remain prominent. After opening the shutter, let the music thin rather than swell into an unjustified victory.

**SFX priorities:** Protagonist hits, charged skeleton shot, ghoul windup, ghost SOLID tell, wight block, necromancer channel and gate release. Add less important rail ambience beneath these cues; speech remains legible.

---

## 7. Implementation reality and safe integration

### What this pack delivers today

- A complete schema-v1 level JSON with valid authored coordinate types, unique IDs, grid-aligned solids, all six implemented enemy kinds, a neutral attendant, a collectible, two information objects, a physical shutter, signs and an exit.
- A fully specified narrative beat sheet, dialogue draft, art/audio direction, encounter roles and test plan.
- An overhead schematic derived from the JSON (see `Last_Platform_Blockout_Map.png`).

### What still needs integration/polish

**A. Campaign registration:** The current `NarrativeSession` only marks `narrative-study` and `departure-study` as persistent campaign stages. `last-platform-demo` is a **new level ID**, so conversations, inspections and the shutter work within a run but **the Journey panel, story persistence, narrative stage unlock, and exit gating are not yet registered for it**. Keep the current narrative study intact as a regression fixture. To make this a production chapter, add `last-platform-demo` to `NarrativeCatalog`/`SaveStore` version policy, `NarrativeSession.active`, arrival and stage completion handling, and the objective rules; preserve compatibility with existing saved data. Do not alias this level to `narrative-study` merely to get saving to work.

**B. Authored dialogue:** The executable level references the existing **noncanonical** railway-attendant scenes and inspection cards. The proposed production writing above is a separate draft; it must be reviewed and registered before shipping.

**C. Art:** The current renderer has a common background and masonry wall tiles. The cinematic Confluence river, bespoke station scenery, spectral water, animated trains and parallax all require authored gameplay assets, not the title-screen poster stretched across the level.

**D. Music:** Gameplay currently has effects but no dedicated stage-music system. The sound arc is a production brief.

**E. Balancing:** No checkpoint, health-restoration pickup, corpse harvesting or weapon switching is currently available. Start with 11 enemies, then remove or redistribute if 5 HP proves too harsh. Test the river recovery path and the top of the shutter for bypasses. The intended experience is fast and capable, not attritional.

### How to try the JSON in a local clone

1. Copy `last-platform-demo.json` to `public/levels/last-platform-demo.json`.
2. Run `npm run level -- validate public/levels/last-platform-demo.json`.
3. Run `npm run dev` and open `http://127.0.0.1:3000/?level=last-platform-demo&preview=1`.
4. Alternatively, use **Level workshop → Open JSON → Playtest**. Workshop playtests run with isolated in-memory narrative state.
5. Importing a JSON level **does not install** new art or rewrite the dialogue catalog.

The file was statically checked for IDs, bounds, terrain overlap and enemy spawn overlap. **It has not been run through the repository's TypeScript validator or hands-on playtested**, since this environment has no local checkout of the repository. Treat geometry and difficulty as the initial playable blockout.

---

## 8. First playtest acceptance gates

| Test | Desired result |
|---|---|
| Arrival clarity | Player has at least one screen of safety and can notice the attendant without requiring dialogue |
| Conversation bypass | Player can reach and inspect the Registry even if they never press F on the attendant |
| First enemy | Zombie can be defeated or escaped without being forced into the next enemy immediately |
| Jump/aim | Crates and service tower have reliable reachable top surfaces; firing doesn't halt motion |
| River crossing | Missing a bridge jump leads to recoverable lower shelf, not softlock or surprise death |
| Enemy readability | Each enemy's tell is intelligible against its background; ghost vulnerability obvious |
| Necromancer | It can attempt to revive the archive zombie after an original defeat, and a hit can interrupt it |
| Evidence | Inspection card must be confirmed before the fact is added; closing must not grant it |
| Nonlinear clues | Ledger → route index works without attendant; ledger → attendant is an optional alternative |
| Locked route | Gate cannot be operated before destination known; after confirmation the collision wall disappears |
| Narrative discipline | Transfer clue does not assert consent, motive, abduction, or a final culprit |
| Character | Player perceives a stubborn traveller, but no unapproved name, backstory or immutable voice is established |
| Finale | Wight is a fair late mini-encounter, not a fake boss or unexplained guilt verdict |
| Replay | Letter remains optional and never blocks exit; no unwanted mandatory backtracking |
| Performance | Fixed step remains stable; no duplicated dialogue loops or input leakage on pause/skip/restart |

### First pass notes to collect

Record the first enemy that causes damage, whether the bridge recovery is obvious, whether players find the raised letter unprompted, whether they understand the route-index dependency, and where they first feel tempted to stop playing. Then cut or move content before adding more systems. In particular, verify **actual level completion** and whether players can cross the gate from above.

---

## 9. Content that should remain deliberately unresolved

- How exactly the protagonist and his girlfriend were separated, and whether she knows he is searching.
- The girlfriend's name, voice, agency and reasons for any decisions she might have made.
- Who recorded or authorized the transfer, and whether the bureaucracy is complicit, misled or simply functional.
- Whether the rivers bring the dead into the world or only carry them through it.
- What body defeat, reactivation and permanent death actually mean in the fiction.
- Whether this world is part of Blacklight's Live Mausoleum; no reference is required.

**North star:** Level 01 begins as an arrival and ends with an accusation forming in the traveller's mind—not a verdict in the player's hands.

*The river keeps moving. The trains keep running. Someone recorded her passage. That is enough to begin.*
