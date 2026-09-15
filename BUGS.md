# Bugs

Simple in-repo bug list. Keep one entry per reproducible problem.
Reports prefixed with `Xバグ` (`Aバグ`, `Bバグ`, `Cバグ`, etc.) are added here and addressed on `develop`.

## Open

### Known issue — Timed GO prompt does not live-update after language switch
- Status: Known / not fixed in submitted build
- Reported: 2026-09-15
- Symptom: If the timed GO prompt is already visible and the player switches the UI language between JA and EN, the currently displayed prompt may remain in the previous language until it is regenerated.
- Expected initial-language behavior: JA browser language starts in Japanese; EN starts in English; other browser languages fall back to English.
- Expected manual behavior: Selecting JA uses Japanese; selecting EN uses English.
- Examples: JA selected before the GO prompt appears -> Japanese prompt. EN selected before the GO prompt appears -> English prompt. Switching language while the GO prompt is already visible may leave that prompt unchanged.
- Impact: Display-only. Gameplay, scoring, timing, and progression are unaffected.
- Code change: None. Documented only; submitted game code remains unchanged.

## Fixed

### BUG-001 — Rainbow connection/shape can look broken
- Status: Fixed
- Reported: 2026-09-09
- Fixed: 2026-09-09
- Seed: `3205971344`
- Symptom: A high-twist rainbow could make neighboring color bands collapse/overlap enough to look disconnected.
- Fix: Removed per-band phase displacement and made width/twist deformation scale all band offsets coherently, preserving band order while keeping seeded variation.
- Regression: Seed `3205971344` is now in the default logic-test set with an adjacent-band separation check.
- Commit: `806ab6d2dc6b52545d5aa9733be5178c745645b0`

### BUG-002 — Moving the window between monitors resets the current sky
- Status: Fixed
- Reported: 2026-09-09
- Fixed: 2026-09-09
- Symptom: Moving/resizing the browser could recreate clouds and erase the current reveal state.
- Cause: `resize()` recreated the current stage with `startStage()`.
- Fix: Resize now preserves/scales clouds, rain, reveal mask, and revealed-point state; DPR-only changes with the same CSS size are ignored.
- Regression: Logic tests verify that resize keeps the current-stage state path instead of rebuilding it.
- Commit: `50b2ab378aca4f0631ba23aeea167069b6886107`

### BUG-003 — No game cursor before Start
- Status: Fixed
- Severity: S
- Reported: 2026-09-10
- Fixed: 2026-09-10
- Symptom: Before pressing Start, the pointer disappears inside the game canvas, making it unclear where the cursor is.
- Cause: The canvas hid the native cursor before gameplay began.
- Fix: Before Start (and after GOAL/TIME UP), the normal browser cursor is shown. During gameplay, the native cursor is hidden and the existing circular scrub cursor is used.
- Regression: Logic test verifies native cursor before Start, scrub cursor while running, and normal cursor restoration after gameplay.
- Final fix commit: `92a39eabc3a71e27db2048b5f1414a01d379d7ad`
- Regression commit: `a5cec6c5392d603d0fbcecf001c4fd3e6d66b13e`

### BUG-004 — Rainbow width deformation can create gaps between colors
- Status: Fixed
- Severity: C
- Reported: 2026-09-11
- Fixed: 2026-09-11
- Symptom: When the rainbow changes thickness, gaps can appear between neighboring color bands instead of keeping the rainbow visually continuous.
- Cause: Band center offsets were scaled dynamically along the rainbow, while each color was still rendered with one fixed stroke width.
- Fix: The same seeded width-deformation factor now scales both band offsets and per-segment stroke widths. A minimum base band width keeps neighboring colors overlapping slightly even with strong color-width variation. Overview rendering preserves the same variable widths.
- Logic commit: `3856cb3cb8fb79472c907db1d7a612afc49909b2`
- Rendering commit: `68be1b771542834dd85bf3e54cfcca78b7a46844`
