# Changes

This file records every intentional game change from now on, not only bugs. Keep one short entry per change, including fixes, compatibility work, performance changes, UI tweaks, gameplay adjustments, build/submission changes, and diagnostics.

`BUGS.md` remains the reproducible bug list. Reports prefixed with `Xバグ` are still added there as before.

## 2026-09-13

### v0.9 — Simplify score presentation
- Type: UI / clarity
- Status: Implemented
- Change: Removed the `PREVIOUS` line from the Stage Clear summary. It represented the cumulative score before the current Stage, not only the immediately previous Stage, and is no longer shown.
- Change: The fixed top-right `SCORE` display now has a stable minimum width and right-aligned text so growing score values remain visually anchored to the right.
- Version: Bumped the visible/build version from `v0.8` to `v0.9`.

### v0.8 — Keep only SCORE fixed at the top right
- Type: UI / clarity
- Status: Implemented
- Change: Restored a fixed top-right score display as `SCORE n` while keeping TIME in the bottom progress bar.
- Change: Removed the detailed per-Section score flash from the top display; the top-right area now shows score only.
- Change: The displayed score includes the current Stage's accumulated Section score, so it updates as Sections are completed.
- Version: Bumped the visible/build version from `v0.7` to `v0.8`.

### v0.7 — Move TIME into the bottom progress bar
- Type: UI / clarity
- Status: Implemented
- Change: Removed the top-right TIME display and fixed `TIME x.x` to the left side of the bottom rainbow progress bar, so Section score flashes no longer hide the remaining time after moving to the next Section.
- Change: Enlarged the bottom progress bar slightly by increasing its padding, meter height, and percentage text size.
- Change: The pre-game GO message now says `制限時間内に虹をたどって僕を見つけて！` so the time limit is clear before play starts.
- Version: Bumped the visible/build version from `v0.6` to `v0.7`.

### v0.6 — Stop redrawing the overview every frame
- Type: Performance / rendering
- Status: Implemented
- Change: The Stage Clear overview is now drawn when it is entered (and on resize) instead of being redrawn on every animation frame. This keeps the displayed result unchanged while reducing mobile Firefox Canvas load after a stage clear.
- Version: Bumped the visible/build version from `v0.5` to `v0.6`. This version includes the preceding runtime-integration size cleanup plus this overview redraw fix.

### v0.5 — Center the pre-game GO prompt
- Type: UI
- Status: Implemented
- Change: The `虹をたどって僕を見つけて！ / GO` prompt is displayed in the center of the game screen instead of in the bottom message area. The normal dialog layout is restored immediately after GO.
- Dev parity fix: Local `npm run dev` explicitly loads the repository `vite.config.js`, so local execution and the submission build use the same runtime transformation and both show `v0.5`.
- Size cleanup: Removed the runtime `compat.js` shim and its `MutationObserver`. The Firefox IME fix, centered GO prompt, and version marker are now integrated directly into the game runtime during dev/build transformation, reducing submitted runtime overhead while preserving behavior.

### v0.4 — Firefox Mobile IME seed input fix
- Type: Compatibility / input
- Status: Verified fixed
- Symptom: On Firefox Mobile, pressing Go while the IME is still composing can make the previous seed value be used instead of the text currently shown by the IME.
- Change: Commit IME composition before the existing Go click handler reads the seed. Enter while composing is deferred until composition finishes.
- Verification: Confirmed fixed on Firefox Mobile by user on 2026-09-13.

### v0.3 — Cache tutorial-cloud drawing
- Type: Performance / compatibility
- Status: Implemented
- Change: The six white clouds on the pre-game screen now use cached offscreen canvases instead of rebuilding their arc paths every frame. Floating motion is preserved.

### v0.2 — Cache gameplay-cloud drawing
- Type: Performance / compatibility
- Status: Implemented
- Change: Gameplay clouds are cached to offscreen canvases and rendered with `drawImage()`; cloud count, movement, hit behavior, and floating motion are unchanged.

### v0.1 — Visible build marker
- Type: Build / submission verification
- Status: Implemented
- Change: Added a visible version marker beside the seed UI and added the version to the build report so the uploaded ZIP can be identified visually.
