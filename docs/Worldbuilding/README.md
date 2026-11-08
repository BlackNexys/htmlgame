# Worldbuilding and design alignment

**Reviewed:** 7 November 2026  
**Setting source:** [The Realms of the Deadways — atlas v0.1](Underworld_Deadways_World_Atlas_v0_1.md)  
**Status:** The atlas is an exploratory proposal. Linking it from the design docs does not establish its contents as canon.

## How the documents fit together

| Document | Responsibility and status |
| --- | --- |
| [Project README](../../README.md) | What is playable today and how to run it |
| [Game design and implementation plan](../Underworld_Game_Design_and_Implementation_Plan_v1.md) | Agreed game structure, provisional mechanics, future work, and open decisions |
| [Flicker v1.1](../Underworld_Flicker_Weapon_Spec_v1_1.md) | Starting weapon authority; setting proposals do not change its combat rules |
| [Deadways atlas](Underworld_Deadways_World_Atlas_v0_1.md) | Proposed geography, societies, ecology, visual direction, and unanswered setting questions |
| [Asset style guide](../../public/assets/STYLE.md) | Current sprite references and production treatment, with the proposed regional direction distinguished from those references |
| [Menu art plan](../Underworld_Main_Menu_Art_and_Animation_Plan_v1.md) | Existing station presentation; its place in the proposed geography remains provisional |
| [Dialogue system](../dialogue-system.md) | Implemented expressive scene prototype; demo dialogue and attendant remain noncanonical |
| [Enemy behavior](../enemy-behavior.md) | Implemented hostile actors and reactivation limits; no claim that all undead are hostile |
| [Neutral NPCs](../npc-system.md) | Implemented neutral actor and talk-interaction slice; the attendant remains prototype material |
| [Narrative and interaction proposal](Underworld_Narrative_Interaction_Proposal_v0_1.md) | Supplied architecture sketch, preserved as a proposal rather than canon |
| [Narrative systems](../narrative-system.md) | Implemented inspect/collect/operate, conditional scenes, discoveries, Journey and immediate saves; prototype story remains noncanonical |
| [The Last Platform demo](../last-platform-demo.md) | Playable revision-4 railway district with overlapping floors, balcony/freight and public Registry entrances, lower return, X/Y camera and separate draft story IDs; audio, balance and final setting remain provisional |
| [Confluence environment kit](../../public/assets/environment/confluence/v1/README.md) and [v2 architecture](../../public/assets/environment/confluence/v2/README.md) | Integrated terrain, station/freight/Registry/archive modules, props, landmarks and city/river backdrop; exact prompts, generated originals and alpha exports preserved |
| [Level authoring](../level-authoring.md) | Supported editor/runtime format; atlas interactions are possibilities, not existing editor features |
| [Foundation roadmap](../action-game-roadmap.md) | Historical development record; use the current design plan for later mechanics |

The atlas's **gameplay possibilities** are ideas to investigate. They are not an implementation backlog or acceptance criteria. Existing combat behavior demonstrates mechanics, not an explanation of souls, death, or the world's origins.

## Setting direction to evaluate

The central contrast is familiar civilization within an alien environment. The dead build stations, homes, cafés, industry, and customs; rivers, vast rib-like formations, strange ecologies, and unusual geometry precede or exceed their understanding. Communities have needs unrelated to the protagonist. Undeath does not determine morality or hostility.

The proposed Deadways are historical railways following, bridging, or bypassing primordial spectral rivers. They could connect discrete replayable stages and optional branches without requiring a continuous Metroidvania map or train travel at every stage boundary.

The Confluence, Drowned Wards, Bellworks, Pale Gardens, Ossuary Expanse, Inverted Reach, Mirror Tides, and Uncharted Verge are eight proposed regions. They are not eight ordered levels, stacked floors, homogeneous nations, or a committed campaign. The Last Platform is a proposed name/location for the familiar station in or near the Confluence; the menu artwork alone does not settle that geography.

Regional palettes and materials can vary. The protagonist keeps their established magenta flame and live gameplay design. Cyan rivers and lights are not automatically enemy indicators; gameplay feedback must stay readable within each environment.

The soulmate search remains the personal anchor. The atlas proposes treating the soulmate as a person with their own identity and opponents as inhabitants with motives. The relationship, separation, search clues, ending, and specific characters remain open.

## Boundaries for future work

- Keep run resources, permanent mechanical discoveries, and world Keepsakes distinct. One optional letter tests the collectible system; its story and the final Keepsake catalog remain open. Important discoveries and Keepsakes now save immediately and survive death/restart. They are not a currency or a mandatory completion checklist.
- Give proposed regional mechanics their own design and playtest review. Flooding, moving trains, responsive organisms, gravity changes, and reflected routes are not currently supported merely because the atlas describes them.
- Preserve dependable arcade controls and readable collision rules when exploring unusual environments. Regional spectacle must support traversal and combat readability.
- Keep immediate defeat rewards separate from future harvesting/caches. The current build has Flicker, capped ectoplasm, and first-defeat recovery; harvesting, other weapons, progression, and bosses remain future work.
- Keep body defeat and corpse reactivation rules separate from their unresolved fictional meaning. No rule yet establishes whether an undead person can permanently die.
- Keep the possible Blacklight / Live Mausoleum connection nonbinding. Underworld must make sense on its own. Use of the Blacklight UI library does not establish shared fictional continuity.
- The revision-4 Last Platform district now explores the supplied Confluence station brief. Its architectural routes, new station/Registry assets, draft dialogue and existing mechanics are playable; the atlas's wider geography, final art/audio and story canon remain open.

## Open decisions

The atlas's [question list](Underworld_Deadways_World_Atlas_v0_1.md#9-questions-to-investigate-before-committing-canon) remains open: river origins and arrival of the dead; the nature of undead people; defeat and reactivation; rail governance; stable environmental laws; earlier civilizations; and the protagonist's search and emotional destination. Also unresolved are which regions to keep, their campaign order, the Last Platform's location, final collectible content, and any outer continuity. The narrative-study loop uses the Last Platform as a labelled test setting; it does not settle those questions or establish why a transfer happened.

Resolve only the questions needed for the next playable slice when that discussion happens. A temporary level fixture should be labelled as such rather than silently deciding the wider world.

## Art available in this checkout

The supplied [railway-city painting](Underverdenens%20majest%C3%A6tiske%20jernbaneby.png) shows monumental rail infrastructure, cyan rivers, warm habitation, and enormous translucent rib-like formations. It is setting concept art, not a layered gameplay background or a fixed map. Text on its signs does not establish destinations, operators, or factions.

The atlas also refers to a directory named `Underworld_Deadways_Zone_Concepts/`, with six full landscapes, two panel studies, and an overview atlas. That directory and its nine images are absent from this checkout. Their intended filenames remain recorded in the atlas as pending references. Do not treat them as delivered assets.
