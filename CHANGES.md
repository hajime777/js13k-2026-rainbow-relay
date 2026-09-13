# Changes

This file records every intentional game change from now on, not only bugs. Keep one short entry per change, including fixes, compatibility work, performance changes, UI tweaks, gameplay adjustments, build/submission changes, and diagnostics.

`BUGS.md` remains the reproducible bug list. Reports prefixed with `Xバグ` are still added there as before.

## 2026-09-13

### v0.5 — Center the pre-game GO prompt
- Type: UI
- Status: Implemented
- Change: The `虹をたどって僕を見つけて！ / GO` prompt is displayed in the center of the game screen instead of in the bottom message area. The normal dialog layout is restored immediately after GO.

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
