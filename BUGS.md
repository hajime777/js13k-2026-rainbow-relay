# Bugs

Simple in-repo bug list. Keep one entry per reproducible problem.

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
