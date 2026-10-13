# Contributing

Keep changes focused and explain the user-visible behavior they affect.

## Local checks

Run the development commands in the README before submitting code. Add a regression test when fixing a reproducible defect. Never include personal Steam configuration, authentication data, game files or settings backups in a contribution.

## Device testing

Report the exact SteamOS, Steam client, Decky Loader and plugin versions. Check the stock carousel with the filter disabled, then test with the filter enabled. For visual issues, include the CSS Loader theme and other plugins that modify Home.

## Design principles

- Preserve native carousel styling and launch callbacks.
- Keep settings simple and use Decky's native components.
- Treat private Steam UI interfaces as unstable and handle missing data.
- Keep manual non-Steam selection predictable and persistent.
- Do not execute launch commands while checking installation state.

## Attribution

Preserve existing license notices and document the origin and license of any third-party code you add.
