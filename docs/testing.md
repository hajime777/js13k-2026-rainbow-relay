# Testing Strategy

Testing is split into two independent layers.

## 1. Logic tests

Location:

```text
tests/logic/
```

These tests must not depend on the browser or Canvas UI. They will cover pure game rules and calculations after the current single-file prototype is split into importable modules.

Planned targets include:

- geometry calculations
- rainbow reveal percentage
- clear threshold
- reset / initial state
- viewport/world coordinate conversion
- online state rules

The first test pass does not refactor the working prototype just to make logic tests possible.

## 2. UI / browser tests

Location:

```text
tests/ui/
```

Playwright opens the actual development build in Chromium and performs basic player-like actions.

Current automated checks:

- page starts without JavaScript page errors
- title, Canvas, Restart button and `Rainbow Revealed 0%` are visible
- automated mouse dragging along the hidden rainbow increases reveal progress
- Restart resets progress to 0%
- a 390x844 portrait viewport does not create horizontal/vertical page overflow
- the basic game remains playable when external network requests are blocked (offline-first smoke check)

These checks do not replace human play testing, visual judgment, or final device testing.

## Setup

After pulling changes:

```powershell
npm install
npm run test:setup
```

`test:setup` installs Playwright Chromium once.

## Run UI tests

Headless:

```powershell
npm run test:ui
```

Visible browser:

```powershell
npm run test:ui:headed
```

Interactive Playwright debugger:

```powershell
npm run test:ui:debug
```

## Next test stages

Later additions should be separate commands rather than silently changing the meaning of the existing UI test command:

```text
test:logic     pure logic tests
test:ui        source UI tests
test:ui:dist   minified dist/index.html tests
test:ui:zip    extracted submission ZIP tests
test:all       all layers
```

The final submission should always receive manual testing even if all automated tests pass.
