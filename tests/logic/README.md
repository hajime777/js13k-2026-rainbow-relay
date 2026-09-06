# Logic tests

Logic tests are intentionally kept separate from browser/UI tests.

The current prototype still keeps game logic inside `src/index.html`, so the first test pass focuses on Playwright UI smoke tests without refactoring the working prototype.

When the source is split, pure logic such as the following should move into importable modules and be tested here without a browser:

- point-to-segment distance
- rainbow reveal percentage
- clear threshold
- reset / initial state
- viewport/world coordinate conversion
- later online state merge/synchronization rules

Do not duplicate production logic inside tests just to make a test pass. Extract production logic first, then test the extracted functions here.
