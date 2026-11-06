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

The title screen uses the supplied animated GIFs in `public/assets/mainmenu`. `station_background_ambient.gif` fills the browser. `station_foreground.gif` provides a clean platform without the protagonist; it shares a responsive 1003×565 stage with a separate character slot and clipped foreground details. The logo and real menu controls sit over the dark area on the left, with magenta pointers and underlines for hover and keyboard focus. Short and narrow windows use compact layouts. Returning to the title menu preserves a live run; New game explicitly resets it. Components can be styled through public tokens and exposed `::part` hooks without reaching into shadow DOM.

`MenuScene.ts` defines the Watcher, Patient Traveller, Restless Flame, and Absent Traveller. The first three use `hero_standing.gif`, `hero_sitting.gif`, and `hero_leaning.gif`; the fourth leaves the clean platform empty. Character placements and anchors are measured against the supplied 520×620 pose images. A preset stays fixed for a menu visit. Preview a particular one with `?menuScene=watcher`, `patient-traveller`, `restless-flame`, or `absent-traveller`.

Each pose defines a soft ground shadow relative to its character anchor and scale. A separate floor anchor keeps the seated shadow under the boots. The cyan lantern supplies the cast direction; a faint projected ellipse and a tighter contact ellipse darken the paving without covering the hero or foreground details. Both scale with the shared station frame, and the empty-platform preset hides the shadow.

`TitleScene` changes native image sources rather than warping a flattened painting. GIFs retain their authored frame timing. The mist and three cropped spirits from `wandering_souls.gif` have independent CSS schedules. The foreground is drawn behind the character with a clipped detail pass above, allowing the sitting pose to overlap the bench while the cat and clock remain in front. Campaign-specific changes and ghost-train events can be added later through scene assets and event handlers; the current rare event is a wandering soul.

Static first frames of the same six assets are stored under `mainmenu/stills`; regenerate the corresponding PNG when replacing a GIF. Options provides Automatic, On, and Off for menu animation. Automatic respects reduced motion; On explicitly enables the GIFs. Hidden tabs and gameplay switch to these stills and stop the CSS ambience. GIF failures fall back per layer. A visible menu keeps animating beside another focused window; no extra canvas renderer or simulation loop is involved.

The library snapshot is committed under `vendor/` and installed with Lit through npm. Builds use the archive recorded in `package.json`, including on CI. See [vendor notes](../vendor/README.md) for refreshing that snapshot.

Run `npm run check` and `npm run test:browser` after UI behavior changes. The browser suite covers clicking and keyboard activation through the shadow DOM, sound's accessible pressed state, returning focus to the canvas, and the normal game flows. Inspect desktop and narrow layouts with both the start panel and active gameplay visible when changing layout or typography.
