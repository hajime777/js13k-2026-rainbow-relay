# Bugs

Simple in-repo bug list. Keep one entry per reproducible problem.

## Open

### BUG-001 — Rainbow connection/shape can look broken
- Status: Open
- Reported: 2026-09-09
- Seed: `3205971344`
- Symptom: A rainbow segment can fold/overlap in a way that looks like the bands are not connected correctly.
- Repro: Run the seed above and follow the rainbow until the problematic screen.
- Note: Preserve this seed as a regression case when fixing the geometry.

### BUG-002 — Moving the window between monitors resets the current sky
- Status: Open
- Reported: 2026-09-09
- Symptom: Moving the browser window to another monitor can reset clouds in the currently displayed screen.
- Likely cause: the browser fires `resize`/DPR changes when changing monitors, and `resize()` currently calls `startStage()`, which recreates clouds/rain and clears current-stage runtime state.
- Expected: resizing or moving monitors must preserve the current screen's cloud/reveal state.

## Fixed

- None yet.
