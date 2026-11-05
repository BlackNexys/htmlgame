# Blacklight UI snapshot

`blacklight-signal-soul-2.0.0-beta.1.tgz` is the installable snapshot supplied by the local `C:/Git/Blacklight_Lit_UI_v2` checkout. It contains the built components, declarations, theme, fonts, and original license notices. npm installs it as `@blacklight/signal-soul`; Lit is its peer dependency.

Keeping the archive in this repository makes `npm ci` work without a sibling checkout or a private registry. The game's custom theme lives in `src/ui/cyberundead-theme.css`.

To update the snapshot, build and pack a new version in the library checkout with `npm run pack:local`, copy the resulting archive here, and run `npm install ./vendor/<new-archive-name>.tgz` in the game. Use a new library version for changed snapshots so the package and lockfile identify them unambiguously. Remove the superseded archive after updating, then run the game checks and browser tests.
