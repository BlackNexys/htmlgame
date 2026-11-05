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

`src/ui/registerComponents.ts` imports Blacklight's supported `/atoms` entry. Start, pause, restart, and sound use `bl-button`; `GameMenu` owns their behavior and canvas focus. Canvas rendering and simulation remain separate from the UI theme. Components can be styled through public tokens and exposed `::part` hooks without reaching into shadow DOM.

The library snapshot is committed under `vendor/` and installed with Lit through npm. Builds use the archive recorded in `package.json`, including on CI. See [vendor notes](../vendor/README.md) for refreshing that snapshot.

Run `npm run check` and `npm run test:browser` after UI behavior changes. The browser suite covers clicking and keyboard activation through the shadow DOM, sound's accessible pressed state, returning focus to the canvas, and the normal game flows. Inspect desktop and narrow layouts with both the start panel and active gameplay visible when changing layout or typography.
