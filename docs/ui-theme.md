# Cyberundead UI theme

The game uses Blacklight's Lit components with a theme derived from the [sprite art guide](../public/assets/STYLE.md). The visual rule is **dark remains animated by vivid energy**: dark surfaces, cool gray structure, bone text, and small areas of bright color.

The theme lives in [`src/ui/cyberundead-theme.css`](../src/ui/cyberundead-theme.css). It is enabled by `data-game-theme="cyberundead"` on the root HTML element. `style.css` imports Blacklight's base theme first, then the game theme. CSS custom properties inherit into the components' shadow roots.

## Palette and material

| Token | Default | Purpose |
| --- | --- | --- |
| `--game-void` | `#090c10` | Page background |
| `--game-charcoal` | `#11171d` | Menu and frame surfaces |
| `--game-slate` | `#1a232b` | Toolbar and raised planes |
| `--game-steel` | `#27343e` | Quiet boundaries and tracks |
| `--game-stone` | `#54636e` | Control and frame outlines |
| `--game-bone` | `#e0e6df` | Primary text |
| `--game-ash` / `--game-dust` | `#b1bebf` / `#929fa7` | Supporting text |
| `--game-magenta` | `#ff52ab` | Player actions, vitality marker, journey progress |
| `--game-magenta-core` / `--game-magenta-edge` | `#ffb5da` / `#8c285c` | Bright and dark steps around the energy accent |
| `--game-cyan` / `--game-cyan-core` | `#63dfeb` / `#b9f5fa` | Secondary information and keyboard focus |

The colors interpret the references rather than sampling every shaded sprite pixel. Magenta follows the protagonist's flame; cyan follows the skeletal technology. These UI roles do not add gameplay rules. Success, warning, and danger retain separate semantic tokens.

Blacklight's public `--bl-*` tokens map to this palette. Primary controls use `--bl-action-brand`, body text uses `--bl-text-primary`, and so on. Adjust a `--game-*` value to update both the page and the components. For example:

```css
:root[data-game-theme="cyberundead"] {
    --game-magenta: #ff62b3;
    --game-magenta-hover: #ff91ca;
}
```

Keep the bright primary-button fill paired with its dark `--game-on-energy` text. Check normal text contrast, focus visibility, and muted text against the actual surface when changing the palette.

Frames and controls use square corners, two-pixel outlines, and hard offset shadows. Shading uses a few distinct material values. Bright color stays concentrated around actions; large surfaces remain quiet beside the sprites. UI feedback is brief and stepped, with reduced motion following the system preference. Signal remains the display font; Voice Sans carries readable body text.

## Components and package

`src/ui/registerComponents.ts` imports Blacklight's supported `/atoms` entry. Start, pause, restart, and sound use `bl-button`. `GameMenu` presents session menus, `MainMenu` owns title navigation and auxiliary dialogs, and `MenuNavigation` adds arrow-key navigation to native Tab/Enter behavior. Native dialogs contain keyboard focus; gameplay resumes by explicitly returning focus to the canvas. `GamePreferences` stores sound and encounter-hint choices independently of level/editor drafts.

`style.css` contains the shared theme and typography used by both applications. `src/ui/game.css` owns the game-only full-window layout, title screen, dialogs, and HUD. The canvas keeps its 5:3 aspect ratio and uses the largest rectangle that fits the window, with letterboxing for other shapes. The HUD overlays that rectangle. Editor layout stays in `src/editor/editor.css`; the game layout does not affect its canvas.

The title screen uses the new illustrated PNG layers in `public/assets/mainmenu/v3/production`, derived from the approved rich pixel-art studies. The complete 1672×941 scene fits uniformly within the browser with a dark surround for other ratios. Background and platform are stationary images; a transparent canvas draws the separate animated parts. The logo and real menu controls sit over the dark area on the left, with magenta pointers and underlines for hover and keyboard focus. Narrow windows place the fitted scene below the menu actions. Returning to the title menu preserves a live run; New game explicitly resets it. Components can be styled through public tokens and exposed `::part` hooks without reaching into shadow DOM.

The [Main Menu Art & Animation Plan](Underworld_Main_Menu_Art_and_Animation_Plan_v1.md) records the intended finish and first integrated production pass. Earlier paintings and sprite studies remain preserved for reference. [Production artwork and exact prompts](../public/assets/mainmenu/v3/production/README.md) describe the new sources and exports.

`MenuScene.ts` defines the Watcher, Patient Traveller, Restless Flame, and Absent Traveller. Standing reuses the live gameplay idle atlas. Seated and leaning have new complete character frames based only on that reference; the fourth preset leaves the platform empty. `scene-v1.json` records frame timing, optional per-frame roots, shared character scale and prop placement. A preset stays fixed for a menu visit. Preview a particular one with `?menuScene=watcher`, `patient-traveller`, `restless-flame`, or `absent-traveller`.

Each pose defines a ground contact, including the seated pose's boots. The cyan lantern supplies the cast direction; a faint projected ellipse and tighter contact ellipse darken the paving. Both scale with the shared station frame, and the empty-platform preset has no hero shadow.

`TitleScene` selects the preset and owns motion policy and the presentation clock. `TitleArtRenderer` draws each hero as one whole frame, including face, fire, clothing and cloak. Standing retains its actual six gameplay idle frames, 8 fps timing and foot anchors. New seated/leaning sequences match that same character, and the seated cloak stays folded beneath the hips/thighs. Four resting cat drawings and foliage/spirit clips provide other motion. The lantern turns around its real link, while clock hands, local light and sleep marks use independent timing. No painted layer is deformed. The [production viewer](../menu-production.html) supports pose selection, pause, frame stepping and time scrubbing, with a gameplay-reference gallery.

Options provides Automatic, On, and Off. Automatic respects reduced motion, including the Windows animation setting. When that prevents motion, the title footer offers an explicit Enable animation button. On enables animation despite the system setting; Off immediately draws the still pose and stops updates. Hidden tabs and gameplay freeze the clock; resume has no catch-up jump and preserves the selected pose. Matching complete posters remain the fallback if decorative rendering fails. A visible menu keeps animating beside another focused window. Menu animation is independent of `GameLoop` and never advances gameplay.

The library snapshot is committed under `vendor/` and installed with Lit through npm. Builds use the archive recorded in `package.json`, including on CI. See [vendor notes](../vendor/README.md) for refreshing that snapshot.

Run `npm run check` and `npm run test:browser` after UI behavior changes. The browser suite covers clicking and keyboard activation through the shadow DOM, sound's accessible pressed state, returning focus to the canvas, and the normal game flows. Inspect desktop and narrow layouts with both the start panel and active gameplay visible when changing layout or typography.
