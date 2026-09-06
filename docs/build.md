# Build Workflow

## Goal

Keep the development source readable, then generate and measure the js13k submission artifact automatically.

The hard size gate is:

```text
13,312 bytes ZIP maximum
```

## Windows setup

Install a current Node.js LTS release, then from PowerShell:

```powershell
npm install
npm run dev
```

The development server serves `src/`.

## Submission build

```powershell
npm run build
```

Current pipeline:

```text
src/index.html
  -> html-minifier-terser
  -> dist/index.html
  -> DEFLATE ZIP (fflate)
  -> dist/game.zip
  -> byte budget check
```

The build prints:

- development source size
- minified HTML size
- final ZIP size
- remaining bytes or overflow bytes

The command exits with an error when `game.zip` exceeds 13,312 bytes.

## Why the first build pipeline is intentionally simple

This is only the initial baseline. The project should not spend development time on maximum compression while the game itself is still changing rapidly.

Possible later stages, only when needed:

```text
split readable HTML/CSS/JS
  -> esbuild bundle
  -> Terser
  -> optional Roadroller
  -> inline into HTML
  -> try multiple ZIP strategies
  -> keep the smallest artifact
```

A slow maximum-compression build may be added near submission time, but everyday iteration must stay fast.

## Generated files

`dist/` is generated and ignored by Git. Do not hand-edit files under `dist/`.

The readable source in `src/` is the source of truth.
