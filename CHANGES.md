# Changes

This file records every intentional game change from now on, not only bugs. Keep one short entry per change, including fixes, compatibility work, performance changes, UI tweaks, gameplay adjustments, build/submission changes, and diagnostics.

`BUGS.md` remains the reproducible bug list. Reports prefixed with `Xバグ` are still added there as before.

## 2026-09-13

### v0.23 — Stabilize Android Firefox viewport rendering
- Type: Compatibility / rendering
- Status: Implemented for urgent Android Firefox playtest
- Change: When supported, the game viewport now uses stable small-viewport units (`svh`) instead of following the browser chrome's changing `vh` height while the Android Firefox address/tool bars move.
- Change: Resize handling is debounced by 120ms so repeated mobile-browser resize events do not continuously reallocate the main and helper canvases.
- Reason: Android Firefox was showing visible screen flicker during play; repeated viewport/canvas resizes are the primary suspected cause.
- Version: Bumped the visible/build version from `v0.22` to `v0.23`.

### v0.22 — Tighten Stage 5+ timing
- Type: Gameplay / balance
- Status: Implemented for playtest
- Change: Stage 2–4 continue to add `2 seconds × total Sections` after cloud-rate-weighted carryover.
- Change: From Stage 5 onward, the new Stage allowance is reduced to `1.5 seconds × total Sections` after cloud-rate-weighted carryover.
- Change: The final Section now counts as 100% cloud clear for the Stage cloud-clear-rate calculation, matching the existing Goal scoring behavior.
- Version: Bumped the visible/build version from `v0.21` to `v0.22`.

### v0.21 — Weight carried time by Stage cloud clear rate
- Type: Gameplay / balance
- Status: Implemented for final playtest
- Change: Replaced the Stage rainbow-clear-rate multiplier used for time carryover with the Stage cloud-clear rate.
- Change: The Stage cloud-clear rate is calculated from total clouds actually cleared across all Sections divided by total clouds spawned across those Sections, so Sections with different cloud counts are weighted naturally.
- Change: The final Section records its actual cleared-cloud count for carryover before the existing Goal scoring path promotes `cloudScore` to the full cloud count.
- Change: Carried time is now `ceil(remaining time × Stage cloud clear rate)`, then the next Stage still adds `2 seconds × total Sections`.
- Version: Bumped the visible/build version from `v0.20` to `v0.21`.

### v0.20 — Weight carried time by Stage rainbow clear rate
- Type: Gameplay / balance
- Status: Implemented for final playtest
- Change: At Stage completion, each Section's rainbow clear percentage is accumulated and averaged across the Stage.
- Change: The remaining time carried into the next Stage is multiplied by that Stage-average rainbow clear rate before being rounded up to whole seconds. For example, 10.4s remaining with an 86% Stage rainbow average carries as 9s.
- Change: The next Stage still adds its normal `2 seconds × total Sections` allowance after the weighted carryover is calculated.
- Version: Bumped the visible/build version from `v0.19` to `v0.20`.

### v0.19 — Round carried time up to whole seconds
- Type: Gameplay / clarity
- Status: Implemented
- Change: When moving to the next Stage, the remaining time is rounded up with `Math.ceil()` before the new Stage allowance is added. For example, `19.7s` carries as `20s`, so the GO prompt and the actual available time agree.
- Version: Bumped the visible/build version from `v0.18` to `v0.19`.

### v0.18 — Carry remaining time into the next Stage
- Type: Gameplay / balance
- Status: Implemented for final playtest
- Change: Stage 1 now starts with 15 seconds total.
- Change: From Stage 2 onward, each Stage adds `2 seconds × total Sections` to the remaining time instead of resetting the timer, so unused time carries forward between Stages.
- Change: The GO prompt continues to show the actual available time after carryover and the new Stage allowance are combined.
- Version: Bumped the visible/build version from `v0.17` to `v0.18`.

### v0.17 — Show the Stage time limit in the GO prompt
- Type: UI / clarity
- Status: Implemented
- Change: The pre-game GO message now shows the actual Stage time budget, e.g. `20秒以内に虹をたどって僕を見つけて！`, using the current Stage's configured `timeLeft` value.
- Version: Bumped the visible/build version from `v0.16` to `v0.17`.

### v0.16 — Tighten Stage timing for playtest
- Type: Gameplay / balance
- Status: Implemented for playtest
- Change: Stage 1 now starts with a fixed 20-second total time budget.
- Change: From Stage 2 onward, the total time budget is fixed at 2 seconds per Section (`total Sections × 2s`).
- Version: Bumped the visible/build version from `v0.15` to `v0.16`.

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
