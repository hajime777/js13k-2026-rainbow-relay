# Logic tests

Logic tests are kept separate from browser/UI tests.

The first production logic extracted from `src/index.html` now lives in `src/logic.js`. The browser game uses that exact file, and the Node logic tests load the same production code. Tests do not keep a duplicate implementation.

Current logic coverage:

- point-to-segment distance, including endpoint and zero-length cases
- rainbow reveal percentage and its floor rounding
- the current 62% clear threshold
- reveal-point marking inside the scrub radius
- already-revealed points are not counted twice

Run:

```powershell
npm run test:logic
```

These tests use Node's built-in `node:test`, so no additional test framework is required.

Future pure logic should be added here as the game grows, especially:

- reset / initial state
- viewport/world coordinate conversion
- level progression
- offline/online state merge and synchronization rules

UI behavior remains covered separately by Playwright under `tests/ui/`.
