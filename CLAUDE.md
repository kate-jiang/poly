# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A browser-based polyrhythm visualizer and synthesizer. Nodes orbit a central circle at different beat frequencies (node i has i+2 beats per cycle), producing sound when they "bounce." Built with React 19, TypeScript, Canvas 2D rendering, and Tone.js for audio.

## Commands

- `bun install` — install dependencies
- `bun run dev` — dev server with file watching and auto-rebuild (default port 3000, override with `PORT` env var)
- `bun run build` — production build (minified, linked sourcemaps) to `dist/`

No test framework or linter is configured.

## Build System

Bun is both the runtime and bundler. `build.ts` bundles from `src/index.html` (Bun auto-discovers the `main.tsx` entry), outputs minified builds with linked sourcemaps to `dist/`, and runs Sharp to optimize the OG image. `dev-server.ts` serves on port 3000 (or `PORT` env var) using Bun's built-in HTTP server.

## Architecture

React 19 app with state in the root `App` component via `useState`/`useRef` — no Redux or Context. The Renderer runs outside React's lifecycle via refs for animation performance.

- **main.tsx** — React DOM entry point
- **App.tsx** — root component; owns `config` and `playing` state, holds `AudioEngine` in a ref, passes props/callbacks to children
- **Canvas.tsx** — canvas element wrapper; manages `Renderer` instance via ref, bridges React state to the imperative animation loop
- **Controls.tsx** — control panel with sliders (nodes 2–50, speed, reverb), selects (scale, key), bounce mode toggle, randomize button; renders as a bottom sheet on mobile
- **LabelsPanel.tsx** — collapsible top-right panel showing each node's note name and color
- **types.ts** — shared types (`AppConfig`, `PolyNode`, `Ripple`, `Trail`, scale/bounce enums)
- **audio.ts** — `AudioEngine` class wrapping Tone.js; signal chain: synth-per-node → compressor (-24dB, 8:1) → reverb (decay 2.5s) → limiter (-2dB) → destination; logarithmic volume scaling per node count
- **music.ts** — scale interval definitions and `getNoteForNode()` mapping node index to note name via MIDI math
- **renderer.ts** — `Renderer` class running `requestAnimationFrame`; DPR-aware canvas sizing, draws background/circle/tracks/trails/ripples/nodes; **bounce detection** via sin/triangle wave sign changes triggers `onBounce` callback; mobile optimizations (reduced ripple caps, no node glow, batched track lines, disabled trails)
- **utils.ts** — `getNodeColors()` HSL color generation
- **styles.css** — single CSS file with design tokens (dark theme, accent #c8b8ff), backdrop blur panels, custom range/toggle/select styling, responsive breakpoint at 640px with mobile bottom sheet and safe-area-inset support

### Data flow

```
App (config, playing state)
  ├→ Canvas → Renderer (rAF loop) → onBounce → AudioEngine.triggerNote
  ├→ Controls → onConfigChange → setConfig + AudioEngine.rebuild/setReverb
  └→ LabelsPanel (read-only config display)
```

The animation-to-audio coupling is the core design: the Renderer computes each node's position via sin-based oscillation and detects direction changes (`lastBounceDir`). Two bounce modes exist: "center" (nodes bounce from center outward using `|sin|`) and "edge" (nodes traverse full diameter using a triangle wave).
