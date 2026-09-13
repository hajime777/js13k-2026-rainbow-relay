# Changes

This file records every intentional game change from now on, not only bugs. Keep one short entry per change, including fixes, compatibility work, performance changes, UI tweaks, gameplay adjustments, build/submission changes, and diagnostics.

`BUGS.md` remains the reproducible bug list. Reports prefixed with `Xバグ` are still added there as before.

## 2026-09-13

### v0.15 — Show Section progress on clear
- Type: UI / clarity
- Status: Implemented
- Change: The Section Clear message now includes the current and total Section count, e.g. `SECTION CLEAR 1/5`.
- Version: Bumped the visible/build version from `v0.14` to `v0.15`.

### v0.14 — Simplify GAME OVER score and show current Stage
- Type: Scoring / UI
- Status: Implemented
- Change: Removed the special GAME OVER final-score formula (`x100 + STAGES`). GAME OVER now uses the same score value shown in the fixed top-right SCORE display.
- Change: Completed Sections in the current unfinished Stage remain included through `stageScore`; the GAME OVER summary lists that current Stage partial score when non-zero, so the displayed Stage values add up to the same SCORE shown at the top right.
- Change: Added the current Stage number to the bottom HUD, arranged as `TIME ...  STAGE ...  [rainbow meter]  xx%`.
- Size cleanup: Removed the now-unused `finalScore()` runtime function.
- Version: Bumped the visible/build version from `v0.13` to `v0.14`.

### v0.13 — Restore direct cloud drawing for Firefox compatibility
- Type: Compatibility / rendering
- Status: Implemented
- Change: Removed the offscreen-canvas cloud sprite caches introduced in v0.2/v0.3 and restored direct cloud-path drawing for both gameplay clouds and the six tutorial clouds.
- Reason: Windows Firefox reproduced corrupted cloud/rainbow-adjacent rectangles and unstable cloud rendering, making the cached `drawImage()` path unsafe across browsers.
- Change: Cloud positions, floating motion, depth shading, tutorial-cloud color, and gameplay behavior are preserved; only the rendering path changed.
- Version: Bumped the visible/build version from `v0.12` to `v0.13`.

### v0.12 — Hide the Seed bar when play starts
- Type: UI / safety
- Status: Implemented
- Change: If the Seed input bar is open when `Start` is pressed, it is automatically hidden as gameplay begins so it is less likely to be pressed accidentally during play.
- Version: Bumped the visible/build version from `v0.11` to `v0.12`.

### v0.11 — Simplify Goal and overview score layout
- Type: UI / clarity
- Status: Implemented
- Change: Removed `TOTAL SCORE` from the delayed Goal result panel; that panel now keeps the Stage result details without repeating the total.
- Change: On the full Stage overview, the bottom TIME/progress display is hidden and replaced by one opaque white row containing `TOTAL SCORE xxx` and the `Next Stage` / `EXTRA` button.
- Change: The normal TIME/progress display is restored when the next Stage starts.
- Version: Bumped the visible/build version from `v0.10` to `v0.11`.

### v0.10 — Delay and lighten the goal result panel
- Type: UI / presentation
- Status: Implemented
- Change: After reaching the Goal, the result panel now appears about 2 seconds later so the Goal animation remains visible before the summary covers the playfield.
- Change: The white result-panel background is more transparent (`rgba(255,255,255,.52)`) so the completed rainbow remains easier to see behind it.
- Change: The fixed SCORE display is refreshed when the final Section is scored, before the delayed result panel appears.
- Version: Bumped the visible/build version from `v0.9` to `v0.10`.

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
