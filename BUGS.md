# Bugs

Simple in-repo bug list. Keep one entry per reproducible problem.
Reports prefixed with `Sバグ` are added here and addressed on `develop`.

## Open

- None.

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
- Cause: The native canvas cursor is hidden and the custom scrub cursor was also suppressed while `running` was false.
- Fix: The custom game cursor is now drawn before Start as well; scrubbing still remains disabled until Start.
- Regression: Logic test verifies that `cursor()` is not gated by `running`.
- Fix commit: `68c8c12aab96aecd568d411076063dd052c3e135`
- Regression commit: `d059ebc4f5362c05998d088904be8f25bd7c209f`
