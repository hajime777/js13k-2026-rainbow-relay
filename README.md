# Rainbow Relay

Experimental game project for **js13kGames 2026**.

Theme: **Unicorns and Rainbows**

Current prototype idea:

- A pastel cloudy/rainy sky hides a blue sky and a completed rainbow behind it.
- The player scrubs the overcast layer to reveal the rainbow.
- Clouds do not need to disappear completely; progress is based on how much of the rainbow is revealed.
- The game must remain **offline-first**. Online features, if used, will be optional and should add a surprising ambient/social effect rather than being required for basic play.
- A later goal is to connect the revealed sky/rainbow to a unicorn constellation at night.

## Development policy

Readable source comes first. The 13,312-byte submission build is generated from the development source.

```powershell
npm install
npm run dev
npm run build
```

`npm run build` creates `dist/index.html` and `dist/game.zip`, prints the byte budget, and shows a warning when the ZIP exceeds **13,312 bytes**. The build still completes so oversized development versions can be tested normally.

## Repository layout

```text
src/       game source / current prototype
tools/     build and size-budget tools
docs/      design notes, build notes, experiments
dist/      generated build output (not committed)
```

## Licensing

The game source and artwork/code specific to Rainbow Relay are not licensed for reuse at this stage; copyright is retained by the author.

Build utilities under `tools/` are intended to be reusable and are licensed separately under the MIT License in `tools/LICENSE`.
